const LeafletChartBuilderService = require('./leafletChartBuilderService')

class MigrationMapChartBuilderService extends LeafletChartBuilderService {
  constructor () {
    super()
    this.radius = { multiplier: 1600000, base: 5000 }
    this.fCircleSize = this.d3.scaleLog().range([1, 4001])
  }

  fillLayers (dataset, options) {
    // Sets the bubbles size handlers
    if (options && options.radius && options.radius.multiplier) { this.radius.multiplier = options.radius.multiplier }
    if (options && options.radius && options.radius.base) { this.radius.base = options.radius.base }

    // if (boundsZoom == null) { boundsZoom = this.chart.getZoom() }
    // const zoomIndex = boundsZoom > 5 ? Math.pow(boundsZoom / 4, 4) : 1

    // const multiplier = this.radius.multiplier / zoomIndex

    // const CircleDataPoint = L.Circle.extend({ rowData: null })

    const value_field = options.value_field ? options.value_field : 'api_calc_ln_norm_pos_part'
    // const loc_size_field = options.loc_size_field ? options.loc_size_field : 'api_calc_ln_norm_pos_part'
    const id_field = options.id_field ? options.id_field : 'cd_indicador'

    for (const ident of options.indicadores) {
      const group = new this.L.FeatureGroup()
      group.addTo(this.chart)
      this.layers[ident] = group
    }

    if (options.legendArray) {
      const legend = this.L.control({ position: 'topright' })

      legend.onAdd = function (map) {
        const div = this.L.DomUtil.create('div', 'legend')
        const grades = options.colorArray
        const labels = options.legendArray

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
          div.innerHTML +=
                        '<span style="display:flex">' +
                        '<div style="width:18px;height:18px;display:inline-block;margin:3px;background:' +
                        grades[i] + '"></div> ' + labels[i] + '</span>'
        }

        div.style.padding = '6px 8px'
        div.style.background = 'rgba(255,255,255,0.8)'
        div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)'
        div.style.borderRadius = '5px'

        return div
      }

      legend.addTo(this.chart)
    }

    // let builtCircles = {};
    const builtMarkers = []
    const defaultIcon = new this.L.Icon({
      iconUrl: '/markers/marker-icon-blue.png',
      shadowUrl: '/markers/marker-shadow.png',
      iconSize: [15, 25],
      iconAnchor: [7, 25],
      popupAnchor: [1, -21],
      shadowSize: [25, 25]
    })

    const locIcon = new this.L.Icon({
      iconUrl: '/markers/marker-icon-black.png',
      shadowUrl: '/markers/marker-shadow.png',
      iconSize: [15, 25],
      iconAnchor: [7, 25],
      popupAnchor: [1, -21],
      shadowSize: [25, 25]
    })

    const limits = {}

    // Iterates over the dataset, to build each circle and apply to the respective layer
    for (const each_row of dataset) {
      // get limits to normalize values
      if (limits[each_row[id_field]]) { // Alerady exists
        if (limits[each_row[id_field]].min > each_row[value_field]) { limits[each_row[id_field]].min = each_row[value_field] }
        if (limits[each_row[id_field]].max < each_row[value_field]) { limits[each_row[id_field]].max = each_row[value_field] }
      } else {
        limits[each_row[id_field]] = { min: each_row[value_field], max: each_row[value_field] }
      }

      // Evaluate and draw points
      if (options.show_markers) {
        const markers_options = Object.assign({}, options)
        markers_options.tooltipFunction = options.targetTooltipFunction
        markers_options.headers = options.target.tooltip_items
        markers_options.removed_text_list = []
        if (each_row[options.target.lat] && each_row[options.target.long] &&
                    each_row[options.target.lat] != 0 && each_row[options.target.long] != 0) {
          // Iterates over the layers
          for (const [, ident] of options.indicadores.entries()) {
            // Checks if the row is for the layer (moves to next if different)
            if (ident != each_row[id_field]) { continue }

            // Gets the value for each layer
            // const value = each_row[loc_size_field]

            // Builds the marker (if not already built)
            if (!(builtMarkers.includes(each_row[options.target.id]))) {
              builtMarkers.push(each_row[options.target.id])
              let marker = {}
              if (((options.hide_place_marker == undefined || !options.hide_place_marker)) &&
                                options.idAU.length == 7 &&
                                each_row[options.target.id].toString().substring(0, 6) == options.idAU.substring(0, 6)) {
                marker = this.L.marker(
                  [each_row[options.target.lat], each_row[options.target.long]],
                  {
                    rowData: each_row,
                    icon: locIcon,
                    customOptions: markers_options,
                    zIndexOffset: 1000
                  }
                )
              } else {
                marker = this.L.marker(
                  [each_row[options.target.lat], each_row[options.target.long]],
                  {
                    rowData: each_row,
                    icon: (options.markerIcons && options.markerIcons[each_row[id_field]] && typeof options.markerIcons[each_row[id_field]] !== 'string') ? options.markerIcons[each_row[id_field]] : defaultIcon,
                    customOptions: markers_options
                  }
                )
              }
              marker.on('click', this.circleClick)// marker.bindPopup(each_row[options.target.name]).openPopup())
              marker.addTo(this.layers[ident])
            }
            // Builds the circle (if not already built)
            // let alreadyBuilt = false;

            // for (let eachLayer in builtCircles) {
            //     if (eachLayer == each_row[id_field] && builtCircles[eachLayer].includes(each_row[options.source.id])) {
            //         alreadyBuilt = true;
            //         break;
            //     }
            // }

            // if(!alreadyBuilt) {
            //     if (builtCircles[each_row[id_field]]) {
            //         builtCircles[each_row[id_field]].push(each_row[options.source.id]);
            //     } else {
            //         builtCircles[each_row[id_field]] = [each_row[options.source.id]];
            //     }

            //     let eachCircle = new circleDataPoint(
            //         [each_row[options.source.lat], each_row[options.source.long]],
            //         { rowData: each_row,
            //             color: options.color != null ?
            //                     options.color :
            //                     ( options.colorArray != null ?
            //                         options.colorArray[pos] :
            //                         ( each_row.color != null ? each_row.color : '#4A148C' )
            //                     ),
            //             weight: options.weight != null ? options.weight : (each_row.weight != null ? each_row.weight : 0),
            //             fillColor: options.fillColor != null ?
            //                         options.fillColor :
            //                         ( options.colorArray != null ?
            //                             options.colorArray[pos] :
            //                             ( each_row.fillColor != null ? each_row.fillColor : '#4A148C' )
            //                         ),
            //             fillOpacity: options.fillOpacity != null ?
            //                             options.fillOpacity :
            //                             ( each_row.fillOpacity != null ? each_row.fillOpacity : 0.5 ),
            //             radius: value != null ? value > 0 ? value * multiplier + this.radius.base : this.radius.base : 0,
            //             customOptions: options
            //         }
            //     ).on("click", this.circleClick);

            //     eachCircle.addTo(this.layers[ident]);
            // }
          }
        }
      }
    }

    // Iterates over the dataset, to build connections to the circles
    const thetaOffset = (3.14 / 10)
    // const durationBase = (options && options.path && options.path.animation && options.path.animation.base_duration) ? options.path.animation.base_duration : 2000

    for (const each_row of dataset) {
      if (each_row[options.source.lat] && each_row[options.source.long] &&
                each_row[options.source.lat] != 0 && each_row[options.source.long] != 0 &&
                each_row[options.target.lat] && each_row[options.target.long] &&
                each_row[options.target.lat] != 0 && each_row[options.target.long] != 0) {
        // Iterates over the layers
        for (const [pos, ident] of options.indicadores.entries()) {
          // Checks if the row is for the layer (moves to next if different)
          if (ident != each_row[id_field]) { continue }

          // Gets normalized value for each layer
          if (limits[each_row[id_field]]) {
            let value
            if (limits[each_row[id_field]].min == limits[each_row[id_field]].max) {
              value = 4
            } else {
              value = (((each_row[value_field] - limits[each_row[id_field]].min) / (limits[each_row[id_field]].max - limits[each_row[id_field]].min)) + 1) * ((options.path && options.path.multiplier) ? options.path.multiplier : 1)
            }

            // Calculating the curve
            const latlng1 = [each_row[options.source.lat], each_row[options.source.long]]
            const latlng2 = [each_row[options.target.lat], each_row[options.target.long]]

            const offsetX = latlng2[1] - latlng1[1]
            const offsetY = latlng2[0] - latlng1[0]

            const r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2))
            const theta = Math.atan2(offsetY, offsetX)

            const theta2 = theta + thetaOffset
            const r2 = (r / 2) / (Math.cos(thetaOffset))
            // const duration = Math.round(Math.sqrt(Math.log(r + 1)) * durationBase)

            const midpointX = (r2 * Math.cos(theta2)) + latlng1[1]
            const midpointY = (r2 * Math.sin(theta2)) + latlng1[0]

            const midpointLatLng = [midpointY, midpointX]

            const eachCurve = this.L.curve(
              [
                'M', latlng1,
                'Q', midpointLatLng,
                latlng2
              ],
              {
                rowData: each_row,
                color: options.color != null
                  ? options.color
                  : (options.colorArray != null
                      ? options.colorArray[pos]
                      : (each_row.color != null ? each_row.color : '#4A148C')
                    ),
                opacity: 0.3,
                weight: value,
                customOptions: options,
                className: 'migration-path'

              }
            ).on('click', this.circleClick)

            eachCurve.addTo(this.layers[ident])

            const eachPulseCurve = this.L.curve(
              [
                'M', latlng1,
                'Q', midpointLatLng,
                latlng2
              ],
              {
                rowData: each_row,
                color: options.color != null
                  ? options.color
                  : (options.colorArray != null
                      ? options.colorArray[pos]
                      : (each_row.color != null ? each_row.color : '#4A148C')
                    ),
                opacity: 0.7,
                weight: value,
                customOptions: options,
                className: 'migration-animate-path',
                dashArray: '10, 20',
                dashOffset: '100%'
              }
            ).on('click', this.circleClick)

            // eachPulseCurve.on('mouseover', function (e) {
            //     e.target.setStyle({
            //         opacity: 1
            //     });
            // })
            // eachPulseCurve.on('mouseout', function (e) {
            //     e.target.setStyle({
            //         opacity: 0.7
            //     });
            // })

            eachPulseCurve.addTo(this.layers[ident])
          }
        }
      }
    }

    this.adjustVisibleLayers(options.visibleLayers)
  }

  adjustVisibleLayers (enabled) {
    this.additionalOptions.visibleLayers = enabled
    const bounds = this.L.latLngBounds()
    for (const indx in enabled) {
      if (enabled[indx]) {
        this.chart.addLayer(this.layers[indx])
        bounds.extend(this.layers[indx].getBounds())
      } else {
        this.chart.removeLayer(this.layers[indx])
      }
      // this.visibleLayers[indx] = options.enabled[indx];
    }
    this.fitBounds(bounds)
  }
}

module.exports = MigrationMapChartBuilderService

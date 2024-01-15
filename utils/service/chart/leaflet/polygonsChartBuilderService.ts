import { LeafletChartBuilderService } from "./leafletChartBuilderService"

class PolygonsChartBuilderService extends LeafletChartBuilderService {
  topojson: any
  range: number[]
  constructor () {
    super()
    this.topojson = require('topojson-client/dist/topojson-client.min.js')
    this.range = []
  }

  fillLayers (dataset: any, options: any) {
    // https://blog.webkid.io/maps-with-leaflet-and-topojson/
    // Gera o range
    let range: number[] = []
    if (options.colorScale && options.colorScale.range && options.colorScale.range.min_value) {
      range[0] = options.colorScale.range.min_value
    }
    if (options.colorScale && options.colorScale.range && options.colorScale.range.max_value) {
      range[1] = options.colorScale.range.max_value
    }

    for (const each_row of dataset) {
      if (range[0] === null || range[0] > each_row[options.value_field]) { range[0] = each_row[options.value_field] }
      if (range[1] === null || range[1] < each_row[options.value_field]) { range[1] = each_row[options.value_field] }
    }

    if (options.colorScale && options.colorScale.range && options.colorScale.range.mid_value !== undefined) {
      if (range[0] && range[1]) {
        if ((range[1] - options.colorScale.range.mid_value) > (options.colorScale.range.mid_value - range[0])) {
          range[0] = options.colorScale.range.mid_value - (range[1] - options.colorScale.range.mid_value)
        } else if ((range[1] - options.colorScale.range.mid_value) < (options.colorScale.range.mid_value - range[0])) {
          range[1] = options.colorScale.range.mid_value + (options.colorScale.range.mid_value - range[0])
        }    
      }
    }

    this.range = range

    const this_ = this
    const TopoJSON = this.L.GeoJSON.extend({
      addData: function (jsonData) {
        if (jsonData.type === 'Topology') {
          for (const key in jsonData.objects) {
            const geojson = this_.topojson.feature(jsonData, jsonData.objects[key])
            this_.L.GeoJSON.prototype.addData.call(this, geojson)
          }
        } else {
          this_.L.GeoJSON.prototype.addData.call(this, jsonData)
        }
      }
    })

    try {
      const layer = new TopoJSON()
      layer.addData(options.topology)
      layer.addTo(this.chart)
      layer.eachLayer(this.handlePolygon, this)

      if (options.show_legend && range[0] !== range[1]) {
        let scaleName = 'RdYlBu'
        if (options.colorScale && options.colorScale.name) {
          scaleName = options.colorScale.name
        }
        if (options.colorScaleSelectedName) {
          scaleName = options.colorScaleSelectedName
        }

        if (this.d3chrom['interpolate' + scaleName] == null || this.d3chrom['interpolate' + scaleName] == undefined) {
          scaleName = 'RdYlBu'
        }

        const legend = new this.L.Control({ position: 'topright' })
        const d3chrom = this.d3chrom

        legend.onAdd = function (map) {
          const div = this.L.DomUtil.create('div', 'legend')
          let value = 0
          for (let i = range[0]; i <= range[1]; i = i + (range[1] - range[0]) / 20) {
            if (options.scale_order === undefined || options.scale_order === 'ASC') {
              value = (i - range[0]) / (range[1] - range[0])
            } else {
              value = 1 - (i - range[0]) / (range[1] - range[0])
            }

            div.innerHTML +=
              '<span style="display:inline-flex">' +
              '<div style="width:9px;height:18px;display:inline-block;background:' +
              d3chrom['interpolate' + scaleName](value) + '"></div></span>'
          }

          div.style.padding = '6px 8px'
          div.style.background = 'rgba(255,255,255,0.8)'
          div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)'
          div.style.borderRadius = '5px'

          return div
        }
        if (this.chart){
          legend.addTo(this.chart)
        }
        
      }
    } catch (err) {
      options.fnSendError(err)
    }
  }

  handlePolygon (layer) {
    const dataset = this.dataset
    const range = this.range
    const options = this.options
    let value: number
    let row = dataset.filter(function (obj) { if (obj[options.id_field] == layer.feature.properties[options.topo_key]) { return obj } else { return null } })
    if (row.length !== 0) {
      row = row[0]
      if (range && (range[0] !== range[1])) {
        if (options.scale_order === undefined || options.scale_order === 'ASC') {
          value = (row[options.value_field] - range[0]) / (range[1] - range[0])
        } else {
          value = 1 - (row[options.value_field] - range[0]) / (range[1] - range[0])
        }
      } else {
        value = row[options.value_field]
      }

      let scaleName = 'RdYlBu'
      if (options.colorScale && options.colorScale.name) {
        scaleName = options.colorScale.name
      }
      if (options.colorScaleSelectedName) {
        scaleName = options.colorScaleSelectedName
      }

      let fillColor = ''
      if (this.d3chrom['interpolate' + scaleName]) {
        fillColor = (value != null ? this.d3chrom['interpolate' + scaleName](value) : 'transparent')
      } else {
        fillColor = (value != null ? this.d3chrom.interpolateRdYlBu(value) : 'transparent')
      }

      layer.options.rowData = row
      layer.options.customOptions = options

      layer.setStyle({
        fillColor,
        fillOpacity: 0.8,
        color: 'black',
        weight: 0.2,
        opacity: 1
      })
      layer.on({
        mouseover: function (event) { this.setStyle({ weight: 4, opacity: 1, fillOpacity: 1 }) },
        mouseout: function (event) { this.setStyle({ weight: 0.2, opacity: 1, fillOpacity: 0.8 }) },
        click: this.circleClick
      })
    } else {
      layer.setStyle({
        fillColor: 'transparent',
        fillOpacity: 0,
        color: 'black',
        weight: 0.2,
        opacity: 1
      })
    }
  }
}

module.exports = PolygonsChartBuilderService

const D3PlusChartBuilderService = require('./d3plusChartBuilderService')

class TopoJsonChartBuilderService extends D3PlusChartBuilderService {
  constructor () {
    super()
    this._tilesUrl = 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
  }

  prepareChart (viz, slicedDS, containerId, options, additionalOptions) {
    if (!options.colorScale) { // default
      options.colorScale = {}
      options.colorScale.type = 'singleHue'
      options.colorScale.order = 'asc'
    } else if (options.colorScale.type == null || options.colorScale.type == undefined) {
      options.colorScale.type = 'singleHue'
    }

    const dataset = JSON.parse(JSON.stringify(slicedDS))
    if (options.colorScale.range && options.colorScale.range.min_value) {
      const regMinValue = Object.assign({}, dataset[0])
      regMinValue[options.id_field] = 'min_value'
      regMinValue[options.value_field] = options.colorScale.range.min_value
      dataset.push(regMinValue)
    }

    if (options.colorScale.range && options.colorScale.range.max_value) {
      const regMaxValue = Object.assign({}, dataset[0])
      regMaxValue[options.id_field] = 'max_value'
      regMaxValue[options.value_field] = options.colorScale.range.max_value
      dataset.push(regMaxValue)
    }

    if (options.colorScale.type == 'fixed') {
      viz = viz.shapeConfig({
        Path: {
          fill: function (d) {
            const color = options.colorScale.color_array[d[options.value_field]]
            return color || 'transparent'
          }
        }
      }).legend(false)
    } else if (options.colorScale.type == 'bipolar' || additionalOptions.colorScaleSelectedName == 'bipolar') {
      viz = viz.shapeConfig({
        Path: {
          fill: function (d) {
            let color = (options.colorScale.color_array.zero, options.colorScale.color_array.zero, '#ffffff')
            if (d[options.value_field] > 0) {
              color = (options.colorScale.color_array.positive, options.colorScale.color_array.positive, '#6CB1D9')
            } else if (d[options.value_field] < 0) {
              color = (options.colorScale.color_array.negative, options.colorScale.color_array.negative, '#DB6565')
            }
            return color
          }
        }
      }).legend(false)
    } else {
      if (additionalOptions.colorScaleSelectedName) {
        options.colorScale.name = additionalOptions.colorScaleSelectedName
      }
      let aColorScale = additionalOptions.colorHandlers.getColorScale(options.colorScale.name, options.colorScale.type, options.colorScale.order, 9)

      const distValues = []
      let zeroValue = false
      for (const reg of dataset) {
        if ((reg[options.value_field] !== null) && (!distValues.includes(reg[options.value_field]))) {
          distValues.push(reg[options.value_field])
        }
        if (reg[options.value_field] === 0 || reg[options.value_field] == Math.log(0.01)) {
          zeroValue = true
        }
        // if (distValues.length > 2){
        //     break;
        // }
      }

      // if (distValues.length == 2){
      if (distValues.length > 1) {
        aColorScale = zeroValue ? aColorScale.slice(0, -1) : aColorScale.slice(1, -1)
      } else if (distValues.length == 1) {
        if (options.single_data_color && options.single_data_color[distValues[0]]) {
          aColorScale = options.single_data_color[distValues[0]]
        } else if (options.single_data_color && options.single_data_color.default) {
          aColorScale = options.single_data_color.default
        } else if (distValues[0] === 0 || distValues[0] == Math.log(0.01)) {
          aColorScale = aColorScale[0]
        } else {
          aColorScale = aColorScale[4]
        }
      }

      const objAxisConfig = TopoJsonChartBuilderService.getTransparentXYConfig()

      if (options.colorScale && options.colorScale.inv_function) {
        const inv_tickFn = additionalOptions[options.colorScale.inv_function.name]
        const inv_args = []
        for (const indxInvArg in options.colorScale.inv_function.args) {
          if (options.colorScale.inv_function.args[indxInvArg].fixed) {
            inv_args.push(options.colorScale.inv_function.args[indxInvArg].fixed)
          } else if (options.colorScale.inv_function.args[indxInvArg].first_row_prop) {
            inv_args.push(dataset[0][options.colorScale.inv_function.args[indxInvArg].first_row_prop])
          }
        }
        objAxisConfig.tickFormat = (t) => {
          const t_args = inv_args.slice()
          t_args.unshift(t)
          return inv_tickFn.apply(null, t_args)
        }
      }

      if (distValues.length > 1) {
        viz = viz.colorScaleConfig({
          color: aColorScale,
          axisConfig: objAxisConfig,
          rectConfig: { stroke: additionalOptions.colorHandlers.assessZebraTitleColor(additionalOptions.sectionIndex, null, additionalOptions.theme) }
        })
        viz = viz.colorScale(options.value_field)
      } else {
        viz = viz.shapeConfig({
          Path: {
            fill: function (d) { return d[options.value_field] ? aColorScale : 'transparent' }
          }
        }).legend(false)
      }
    }

    const grafico = viz
      .select(containerId) // container DIV to hold the visualization
      .data(dataset) // data to use with the visualization
      .groupBy(options.id_field) // key for which our data is unique on
      .topojsonId((t) => { return t.properties[options.topo_key] })
      .detectResize(true)

    let clickedPlace = ''
    const hasTouch = this.hasTouch
    if (options.clickable) {
      viz = viz.on('click', function (d) {
        if (clickedPlace == d[options.id_field] || !hasTouch()) {
          if (this._tooltip) { this._tooltipClass.data([]).render() }
          if (additionalOptions.navigate) {
            const args = additionalOptions.navigate.openingArgs ? additionalOptions.navigate.openingArgs : []
            args.push(String(d[options.id_field]))
            if (additionalOptions.navigate.fnNav) { additionalOptions.navigate.fnNav.apply(additionalOptions.context, args) }
          }
        }
        clickedPlace = d[options.id_field]
      })
    }
    return grafico
  }

  hasTouch () { // identify touchable devices (mobile and tablet)
    return (('ontouchstart' in window) || // html5 browsers
            (navigator.maxTouchPoints > 0) || // future IE
            (navigator.msMaxTouchPoints > 0)) // current IE10
  }

  generateViz (options, additionalOptions) {
    const tooltip_function = additionalOptions.tooltipFunction
    const tooltip_context = additionalOptions.context ? additionalOptions.context : null
    options.clickable = !!(options.clickable == true || options.clickable == undefined)
    const removed_text_list = options.removed_text_list

    const viz = new this.d3plus.Geomap()
      .loadingHTML(this.loadingMessage)
      .shapeConfig({
        labelConfig: { fontFamily: additionalOptions.fontFamily ? additionalOptions.fontFamily : this._fontFamily },
        Path: {
          fillOpacity: 0.9,
          strokeWidth: function (d) { return (additionalOptions.idAU !== null && additionalOptions.idAU !== undefined && (d[options.id_field] == additionalOptions.idAU || (d.properties && d.properties[options.topo_key] == additionalOptions.idAU))) ? 5 : 0.2 },
          stroke: 'black'
        }
      })
      .tileUrl(options.tiles_url ? options.tiles_url : this._tilesUrl)
      .topojson(additionalOptions.topology)
      .tooltipConfig({
        body: function (d) {
          if (tooltip_function instanceof String) {
            return tooltip_context[tooltip_function].apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options])
          } else {
            return tooltip_function.apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options])
          }
        },
        title: function (d) { return '' }
      })
      .colorScalePosition('right')

    return viz
  }
}

module.exports = TopoJsonChartBuilderService

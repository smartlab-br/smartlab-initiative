import { D3PlusChartBuilderService } from "./d3plusChartBuilder"

export class TopoJsonChartBuilderService extends D3PlusChartBuilderService {
  private _tilesUrl: string

  constructor () {
    super()
    this._tilesUrl = "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
  }

  prepareChart (viz: any, slicedDS: any, containerId: string, options: any, additionalOptions: any = {}) {
    if (!options.colorScale) { // default
      options.colorScale = {}
      options.colorScale.type = "singleHue"
      options.colorScale.order = "asc"
    } else if (options.colorScale.type == null || options.colorScale.type == undefined) {
      options.colorScale.type = "singleHue"
    }

    const dataset = JSON.parse(JSON.stringify(slicedDS))
    if (options.colorScale.range && options.colorScale.range.min_value) {
      const regMinValue = Object.assign({}, dataset[0])
      regMinValue[options.id_field] = "min_value"
      regMinValue[options.value_field] = options.colorScale.range.min_value
      dataset.push(regMinValue)
    }

    if (options.colorScale.range && options.colorScale.range.max_value) {
      const regMaxValue = Object.assign({}, dataset[0])
      regMaxValue[options.id_field] = "max_value"
      regMaxValue[options.value_field] = options.colorScale.range.max_value
      dataset.push(regMaxValue)
    }

    if (options.colorScale.type == "fixed") {
      viz = viz.shapeConfig({
        Path: {
          fill: (d: any) => {
            const color: string = options.colorScale.color_array[d[options.value_field]]
            return color || "transparent"
          }
        }
      }).legend(false)
    } else if (options.colorScale.type == "bipolar" || additionalOptions.colorScaleSelectedName == "bipolar") {
      viz = viz.shapeConfig({
        Path: {
          fill: function (d: any) {
            let color = (options.colorScale.color_array.zero, options.colorScale.color_array.zero, "#ffffff")
            if (d[options.value_field] > 0) {
              color = (options.colorScale.color_array.positive, options.colorScale.color_array.positive, "#6CB1D9")
            } else if (d[options.value_field] < 0) {
              color = (options.colorScale.color_array.negative, options.colorScale.color_array.negative, "#DB6565")
            }
            return color
          }
        }
      }).legend(false)
    } else {
      if (additionalOptions.colorScaleSelectedName) {
        options.colorScale.name = additionalOptions.colorScaleSelectedName
      }
      let aColorScale: string | string[] | string[][] = additionalOptions.colorHandlers.getColorScale(options.colorScale.name, options.colorScale.type, options.colorScale.order, 9)

      const distValues: any[] = []
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

      const objAxisConfig: any = TopoJsonChartBuilderService.getTransparentXYConfig()

      if (options.colorScale && options.colorScale.inv_function) {
        const inv_tickFn = additionalOptions[options.colorScale.inv_function.name]
        const inv_args: any[] = []
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
          return inv_tickFn(...t_args)
        }
      }

      if (distValues.length > 1) {
        viz = viz.colorScaleConfig({
          scale: "linear",
          color: aColorScale,
          axisConfig: objAxisConfig,
          rectConfig: { stroke: additionalOptions.colorHandlers.assessZebraTitleColor(additionalOptions.sectionIndex, null, additionalOptions.theme) }
        })
        viz = viz.colorScale(options.value_field)
      } else {
        viz = viz.shapeConfig({
          Path: {
            fill: (d: any) => { return d[options.value_field] ? aColorScale : "transparent" }
          }
        }).legend(false)
      }
    }

    const grafico = viz
      .select(containerId) // container DIV to hold the visualization
      .data(dataset) // data to use with the visualization
      .groupBy(options.id_field) // key for which our data is unique on
      .topojsonId((t: any) => { return t.properties[options.topo_key] })
      .detectResize(true)

    let currentPlace = ""
    const hasTouch = this.hasTouch
    if (options.clickable) {
      viz = viz.on("click", function (d: any) {
        const clickedKey = d[options.id_field] !== undefined ? d[options.id_field] : d.properties[options.topo_key]
        if (currentPlace == clickedKey || !hasTouch()) {
          if (this._tooltip) { this._tooltipClass.data([]).render() }
          if (additionalOptions.navigate) {
            const args = additionalOptions.navigate.openingArgs ? additionalOptions.navigate.openingArgs : []
            args.push(String(clickedKey))
            if (additionalOptions.navigate.fnNav) { additionalOptions.navigate.fnNav.apply(additionalOptions.context, args) }
          }
        }
        currentPlace = clickedKey
      })
    }
    return grafico
  }

  hasTouch () { // identify touchable devices (mobile and tablet)
    return (("ontouchstart" in window) || // html5 browsers
    (navigator.maxTouchPoints > 0)) // future IE
    //||  (navigator.msMaxTouchPoints > 0)) // current IE10
  }

  generateViz (options: any, additionalOptions: any) {
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
          strokeWidth: function (d: any) {
            if (additionalOptions.idAU !== null && additionalOptions.idAU !== undefined &&
                (
                  (d[options.id_field] && d[options.id_field].toString() == additionalOptions.idAU.substring(0, d[options.id_field].toString().length)) ||
                  (d.properties && d.properties[options.topo_key].toString() == additionalOptions.idAU.substring(0, d.properties[options.topo_key].toString().length))
                )
            ) {
              return 5
            } else {
              return 0.2
            }
          },
          stroke: "black"
        }
      })
      .tileUrl(options.tiles_url ? options.tiles_url : this._tilesUrl)
      .topojson(additionalOptions.topology)
      .tooltipConfig({
        body: (d: any) => {
          if (typeof tooltip_function === "string") {
            return tooltip_context[tooltip_function as keyof typeof tooltip_context].apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options])
          } else {
            return tooltip_function.apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options])
          }
        },
        title: () => ""
      })
      .colorScalePosition("right")

    return viz
  }
}


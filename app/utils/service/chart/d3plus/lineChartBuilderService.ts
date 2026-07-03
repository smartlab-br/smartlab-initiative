import { GeneralChartBuilderService } from "../generalChartBuilder"
import { D3PlusChartBuilderService } from "./d3plusChartBuilder"

export class LineChartBuilderService extends D3PlusChartBuilderService {
  prepareChart (viz: any, slicedDS: any, containerId: string, options: any, additionalOptions: any = {}) {
    const colorCat: Record<string, string> = {}
    const colorField: string = options.color_id_field || options.id

    // Collect unique colorField values, sorted alphabetically for deterministic color assignment
    // (independent of the order data arrives from the API)
    const uniqueKeys: string[] = []
    for (const row of slicedDS) {
      const key = row[colorField]
      if (key != null && !uniqueKeys.includes(key)) uniqueKeys.push(key)
    }
    uniqueKeys.sort()

    const fallbackArray: string[] | null = options.colorArray ?? null

    if (options.colorScale) {
      if (options.colorScale.type === "fixed" && options.colorScale.color_array) {
        const fixedMap = options.colorScale.color_array
        let autoIdx = 0
        for (const key of uniqueKeys) {
          if (fixedMap[key] != null) {
            colorCat[key] = fixedMap[key]
          } else {
            // Case-insensitive fallback within the fixed map
            const ciKey = Object.keys(fixedMap).find((k: string) => k.toLowerCase() === key.toLowerCase())
            if (ciKey) {
              colorCat[key] = fixedMap[ciKey]
            } else if (fallbackArray && autoIdx < fallbackArray.length) {
              colorCat[key] = fallbackArray[autoIdx++]
            }
          }
        }
      } else {
        const namedArray: string[] | null = additionalOptions.colorHandlers.getColorScale(options.colorScale.name)
        if (namedArray) {
          uniqueKeys.forEach((key, idx) => {
            colorCat[key] = namedArray[idx < namedArray.length ? idx : namedArray.length - 1]
          })
        }
      }
    } else if (fallbackArray) {
      uniqueKeys.forEach((key, idx) => {
        colorCat[key] = fallbackArray[idx < fallbackArray.length ? idx : fallbackArray.length - 1]
      })
    }

    const lineConfig: any = { strokeWidth: options.stroke ? options.stroke : 3, curve: "catmullRom" }
    if (options.colorScale || options.colorArray) {
      lineConfig.stroke = (d: any) => { return colorCat[d[colorField]] }
    } else if (options.color !== null && options.color !== undefined) {
      lineConfig.stroke = options.color
    }

    const labelConfig: any = { fontFamily: additionalOptions.fontFamily ? additionalOptions.fontFamily : this._fontFamily }
    if (options.show_y_axis !== null && options.show_y_axis !== undefined && options.show_y_axis) {
      const container = document.getElementById(containerId)
      viz.shapeConfig().labelConfig.width = container?.offsetWidth
    }

    if (options.order_field) {
      slicedDS = [...slicedDS].sort((a: any, b: any) => a[options.order_field] - b[options.order_field])
    }

    const xConfig: any = {}
    if (options.x_options && (options.x_options.labelInterval || options.x_options.labelMaxNumber)) {
      const uniqueXValues: string[] = []
      for (const row of slicedDS) {
        if (!uniqueXValues.includes(row[options.x])) {
          uniqueXValues.push(row[options.x])
        }
      }
      const labels: string[] = []
      const interval: number = options.x_options.labelInterval ? options.x_options.labelInterval : Math.ceil(uniqueXValues.length / options.x_options.labelMaxNumber)
      if (interval > 1) {
        let index: number = 1
        for (const xVal of uniqueXValues) {
          if (index == 1 || index % interval == 0) {
            labels.push(xVal)
          }
          index++
        }
        xConfig.labels = labels
      }
    }
    const yConfig: any = {}
    if (options.y_options && (options.y_options.labelInterval || options.y_options.labelMaxNumber)) {
      const labels: string[] = []
      const interval: number = options.y_options.labelInterval ? options.y_options.labelInterval : Math.ceil(slicedDS.length / options.y_options.labelMaxNumber)
      if (interval > 1) {
        let index: number = 1
        for (const row of slicedDS) {
          if (index == 1 || index % interval == 0) {
            labels.push(row[options.y])
          }
          index++
        }
        yConfig.labels = labels
      }
    }

    const grafico = viz
      .shapeConfig({
        labelConfig,
        Line: lineConfig
      })
      .select(containerId) // container DIV to hold the visualization
      .data(slicedDS) // data to use with the visualization
      .groupBy(options.id) // key for which our data is unique on
      .label((d: any) => { return additionalOptions.cleanLabel(d[options.text], options.removed_text_list) })
      .y(options.y) // key to use for y-axis
      .x(options.x) // key to use for x-axis
      .xConfig(xConfig)
      .yConfig(yConfig)
      .detectResize(true)

    return grafico
  }

  generateViz (options: any, additionalOptions: any) {
    const tooltip_function = additionalOptions.tooltipFunction
    const tooltip_context = additionalOptions.context ? additionalOptions.context : null
    const removed_text_list = options.removed_text_list

    let xConfig: any = GeneralChartBuilderService.getDefaultXYConfig(additionalOptions.axesStrokeClass)
    let yConfig: any = GeneralChartBuilderService.getDefaultXYConfig(additionalOptions.axesStrokeClass)

    if (options.x_options && options.x_options.axis === false) { xConfig = GeneralChartBuilderService.getTransparentXYConfig() }
    if (options.y_options && options.y_options.axis === false) { yConfig = GeneralChartBuilderService.getTransparentXYConfig() }

    const viz = new this.d3plus.LinePlot()
      .noDataHTML(this.noDataMessage)
      .loadingHTML(this.loadingMessage)
    // .legendConfig({
    //     shapeConfig:{
    //         labelConfig: { fontColor: additionalOptions.colorHandlers.assessZebraTitleColor(additionalOptions.sectionIndex, null, additionalOptions.theme) }
    //     }
    // })
      .legendConfig({
        label: (d: any) => { return options.legend_field ? d[options.legend_field] : d[options.id] },
        shapeConfig: {
          labelConfig: {
            fontSize: 14,
            fontColor: additionalOptions.colorHandlers.assessZebraTitleColor(additionalOptions.sectionIndex, null, additionalOptions.theme)
          }
        }
      })
      .legendPosition("top")
      .xConfig(xConfig)
      .yConfig(yConfig)
      .tooltipConfig({
        body: (d: any) => {
          if (tooltip_function instanceof String) {
            return tooltip_context[tooltip_function as keyof typeof tooltip_context].apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options])
          } else {
            return tooltip_function.apply(tooltip_context, [d, additionalOptions.route, additionalOptions.store, additionalOptions.headers, removed_text_list, options])
          }
        },
        title: () => ""
      })

    return viz
  }
}

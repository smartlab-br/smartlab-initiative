import { GeneralChartBuilderService } from "../generalChartBuilder"
import { D3PlusChartBuilderService } from "./d3plusChartBuilder"

export class LineChartBuilderService extends D3PlusChartBuilderService {
  prepareChart (viz: any, slicedDS: any, containerId: string, options: any, additionalOptions: any = {}) {
    const colorCat: string[] = []
    let colorArray: string[] | null = null
    if (options.colorScale) {
      colorArray = additionalOptions.colorHandlers.getColorScale(options.colorScale.name)
    } else if (options.colorArray) {
      colorArray = options.colorArray
    }
    if (colorArray != null) {
      let colorIndx: number = 0
      for (const row of slicedDS) {
        if (colorCat[row[options.id]] === null ||
                    colorCat[row[options.id]] === undefined) {
          colorCat[row[options.id]] = colorArray[colorIndx]
          colorIndx++
        }
      }
    }

    const lineConfig: any = { strokeWidth: options.stroke ? options.stroke : 3, curve: 'catmullRom' }
    if (options.colorScale || options.colorArray) {
      lineConfig.stroke = (d: any) => { return colorCat[d[options.id]] }
    } else if (options.color !== null && options.color !== undefined) {
      lineConfig.stroke = options.color
    }

    const labelConfig: any = { fontFamily: additionalOptions.fontFamily ? additionalOptions.fontFamily : this._fontFamily }
    if (options.show_y_axis !== null && options.show_y_axis !== undefined && options.show_y_axis) {
      const container = document.getElementById(containerId)
      viz.shapeConfig().labelConfig.width = container?.offsetWidth
    }

    const xConfig: any = {}
    if (options.x_options && (options.x_options.labelInterval || options.x_options.labelMaxNumber)) {
      const labels: string[] = []
      const interval: number = options.x_options.labelInterval ? options.x_options.labelInterval : Math.ceil(slicedDS.length / options.x_options.labelMaxNumber)
      if (interval > 1) {
        let index: number = 1
        for (const row of slicedDS) {
          if (index == 1 || index % interval == 0) {
            labels.push(row[options.x])
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
      .legendPosition('top')
      .xConfig(xConfig)
      .yConfig(yConfig)
      .tooltipConfig({
        body: (d: any) => {
          if (tooltip_function instanceof String) {
            return tooltip_context[tooltip_function as keyof typeof tooltip_context].apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options])
          } else {
            return tooltip_function.apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options])
          }
        },
        title: () => ""
      })

    return viz
  }
}

import { GeneralChartBuilderService } from "../generalChartBuilder"
import { D3PlusChartBuilderService } from "./d3plusChartBuilder"

export class TreemapChartBuilderService extends D3PlusChartBuilderService {
  prepareChart (viz: any, slicedDS: any, containerId: string, options: any, additionalOptions: any = {}) {
    if (!options.colorScale && !options.color) { // default
      options.colorScale = {}
      options.colorScale.type = "divergent"
    }

    if (options.colorScale && (options.colorScale.type == null || options.colorScale.type == undefined)) { options.colorScale.type = "divergent" }

    if (options.colorArray) {
      const colorCat: string[] = []
      let colorIndx: number = 0
      const field_id: string = options.parent ? options.parent : options.id
      for (const row of slicedDS) {
        if (colorCat[row[field_id]]) {
          row.color = colorCat[row[field_id]]
        } else {
          colorCat[row[field_id]] = options.colorArray[colorIndx]
          row.color = options.colorArray[colorIndx]
          colorIndx++
        }
      }
      viz = viz.shapeConfig({
        fill: (d: any) => d.color
      })
    } else if (options.colorScale) {
      const levels: number = options.colorScale.levels ? options.colorScale.levels : 9
      let aColorScale: string | string[] | string[][] 
      if (options.colorScale.colorArray) {
        aColorScale = options.colorScale.colorArray
        viz = viz.colorScale(options.size)
        viz = viz.colorScaleConfig({
          scale: "linear",
          color: aColorScale,
          axisConfig: GeneralChartBuilderService.getTransparentXYConfig(),
          rectConfig: { stroke: additionalOptions.colorHandlers.assessZebraTitleColor(additionalOptions.sectionIndex, null, additionalOptions.theme) }
        })
      } else if (options.colorScale.color_array) {
        viz = viz.color((d: any) => { return options.colorScale.color_array[d[options.id]] })
      } else {
        aColorScale = additionalOptions.colorHandlers.getColorScale(options.colorScale.name, options.colorScale.type, options.colorScale.order, levels)
        const distValues: any[] = []
        for (const reg of slicedDS) {
          if (!distValues.includes(reg[options.size])) { distValues.push(reg[options.size]) }
          if (distValues.length > 2) { break }
        }

        if (distValues.length > 1) {
          aColorScale = aColorScale.slice(1, -1)
        } else if (distValues.length == 1) {
          aColorScale = aColorScale[aColorScale.length - 1] // this.$vuetify.theme.accent;
        }

        if (distValues.length != 1) {
          if (options.colorScale) {
            if (options.colorScale.type == "categorical") {
              viz = viz.colorScale(options.id)
            } else if (options.last_categories_array) {
              viz = viz.colorScale((d: any) => {
                if (options.last_categories_array.includes(d[options.id])) {
                  return 0
                }
                return d[options.size]
              })
            } else {
              viz = viz.colorScale(options.size)
            }
            if (options.colorScale.type == null || options.colorScale.type == undefined) { options.colorScale.type = "divergent" }

            viz = viz.colorScaleConfig({
              scale: "linear",
              color: aColorScale,
              axisConfig: GeneralChartBuilderService.getTransparentXYConfig(),
              rectConfig: { stroke: additionalOptions.colorHandlers.assessZebraTitleColor(additionalOptions.sectionIndex, null, additionalOptions.theme) }
            })
          }
        } else {
          viz = viz.color(() => aColorScale )
        }
      }
    } else if (options.color) {
      viz = viz.color(() => options.color)
    }

    if (options.parent) {
      viz = viz.groupBy([options.parent, options.id])
      if (options.colorArray == undefined && options.colorScale.color_array == undefined) {
        viz = viz.colorScale(options.parent_size ? options.parent_size : options.parent)
      }
    } else {
      viz = viz.groupBy(options.id)
    }

    if (options.last_categories_array) {
      viz = viz.sort((a: any, b: any) => {
        if (options.last_categories_array.includes(a.data.key)) {
          return 1
        }
        if (options.last_categories_array.includes(b.data.key)) {
          return -1
        }
        return b.value - a.value
      })
    }

    viz = viz
      .select(containerId) // container DIV to hold the visualization
      .data(slicedDS) // data to use with the visualization
      .label((d: any) => {
        const label = additionalOptions.cleanLabel(d[options.text], options.removed_text_list)
        return (label == "null" && options.null_value) ? options.null_value : label
      })
      .detectResize(true)
      .sum(options.size) // key to use for x-axis
      .colorScalePosition(options.show_scale ? "right" : false)

    return viz
  }

  generateViz (options: any, additionalOptions: any) {
    const tooltip_function = additionalOptions.tooltipFunction
    const tooltip_context = additionalOptions.context ? additionalOptions.context : null
    const removed_text_list = options.removed_text_list

    const viz = new this.d3plus.Treemap()
      .noDataHTML(this.noDataMessage)
      .loadingHTML(this.loadingMessage)
      .data({ opacity: 0.8 }) // data to use with the visualization
      .detectResize(true)
      .shapeConfig({
        labelConfig: {
          fontFamily: additionalOptions.fontFamily ? additionalOptions.fontFamily : this._fontFamily,
          fontMin: 5,
          fontMax: 45,
          fontResize: true
        },
        Rect: {
          labelConfig: {
            fontFamily: additionalOptions.fontFamily ? additionalOptions.fontFamily : this._fontFamily,
            fontMin: 5,
            fontMax: 45,
            fontResize: true
            // fontOpacity: 0.7
          }
        }
      })
      .legendPosition("top")
      .legendConfig({
        label: (d: any) => {
          return options.legend_field ? d[options.legend_field] : options.parent ? d[options.parent] : d[options.id]
        },
        shapeConfig: {
          labelConfig: {
            fontSize: 14,
            fontColor: additionalOptions.colorHandlers.assessZebraTitleColor(additionalOptions.sectionIndex, null, additionalOptions.theme)
          }
        }
      })
      .tooltipConfig({
        body: (d: any) => {
          if (tooltip_function instanceof String) {
            return tooltip_context[tooltip_function as keyof typeof tooltip_context].apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options])
          } else {
            return tooltip_function.apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options])
          }
        },
        tbody: (d: any) => {
          const table: string[] = []
          return table
        },
        title: (d: any) => ""
      })

    return viz
  }
}

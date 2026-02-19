import { D3PlusChartBuilderService } from "./d3plusChartBuilder"

export class BoxplotChartBuilderService extends D3PlusChartBuilderService {
  prepareChart (viz: any, slicedDS: any, containerId: string, options: any, _additionalOptions: any = {}) {
    const grafico = viz
      .container(containerId) // container DIV to hold the visualization
      .data(slicedDS) // data to use with the visualization
      .id(options.id) // key for which our data is unique on
    // .text(this.options.text)
      .font({ family: "titulos-observatorio" })
      .y(options.y) // key to use for y-axis
      .x(options.x) // key to use for x-axis
      .detectResize(true)

    return grafico
  }

  generateViz (options: any, additionalOptions: any) {
    const tooltip_function: any = additionalOptions.tooltipFunction
    const tooltip_context: any = additionalOptions.context ? additionalOptions.context : null
    const removed_text_list: string[] = options.removed_text_list

    const viz = this.d3plus.viz()
      .noDataHTML(this.noDataMessage)
      .loadingHTML(this.loadingMessage)
      .type("box") // visualization type
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

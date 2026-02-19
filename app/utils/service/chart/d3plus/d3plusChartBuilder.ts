import { GeneralChartBuilderService } from "../generalChartBuilder"
import * as d3plus from "d3plus"

export abstract class D3PlusChartBuilderService extends GeneralChartBuilderService {
  d3plus: any
  abstract generateViz(options: any, additionalOptions: any): any
  abstract prepareChart(viz: any, slicedDS: any, containerId: string, options: any, additionalOptions: any): any

  constructor () {
    super()
    this.d3plus = d3plus
  }

  generateChart (containerId: string, dataset: any, options: any, additionalOptions: any) {
    if (containerId && document.getElementById(containerId)) {
      let viz = this.generateViz(options, additionalOptions)
      viz = this.refineViz(viz, options)
      const chart = this.prepareChart(
        viz,
        GeneralChartBuilderService.getSlicedDataset(dataset, options),
        "#" + containerId,
        options,
        additionalOptions
      )
      // Timeout para garantir que o tamanho do espaço onde o gráfico vai ficar já está definido.
      setTimeout(
        function (chart: any) {
          const container = document.getElementById(containerId)
          if (container) { 
            container.innerHTML = "" 
          }
          chart.render()
          return chart
        }, 0, chart)
    }
  }

  refineViz (viz: any, options: any) {
    // Definições da legenda
    if (options.hide_legend !== null && options.hide_legend !== undefined && options.hide_legend) {
      viz = viz.legend(false)
    } else if (options.legend !== null && options.legend !== undefined && options.legend) {
      viz = viz.legend({ value: true, filters: true })
    } else if (options.legend !== null && options.legend !== undefined && !options.legend) {
      viz = viz.legend({ value: false })
    }

    if (options.format !== null && options.format !== undefined) {
      viz = viz.format(options.format)
    }

    return viz
  }

  // download (containerId) {
  //   // var d3plusExport = require('d3plus-export/build/d3plus-export.min.js');
  //   // let svg = document.getElementById(containerId).getElementsByTagName('svg')[0];
  //   // d3plusExport.saveElement(svg, { filename: containerId });
  // }
}
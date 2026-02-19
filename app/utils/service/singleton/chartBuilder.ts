export class ChartBuilderService {

  generateChart (type: string, containerId: string, dataset: any, options: any, additionalOptions: any = {}) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const container: HTMLElement | null = document.getElementById(containerId)
        if (container) {
          let Builder
          container.innerHTML = ""
          switch (type) {
          // D3Plus based
          case "MAP_TOPOJSON":
            Builder = require("../chart/d3plus/topoJsonChartBuilderService")
            break
          case "LINE":
            Builder = require("../chart/d3plus/lineChartBuilderService")
            break
          case "STACKED": // Unused
            Builder = require("../chart/d3plus/stackedLineChartBuilderService")
            break
          case "BAR":
            Builder = require("../chart/d3plus/barChartBuilderService")
            break
          case "TREEMAP":
            Builder = require("../chart/d3plus/treemapChartBuilderService")
            break
          case "SCATTERPLOT": // Unused
            Builder = require("../chart/d3plus/scatterChartBuilderService")
            break
          case "BOXPLOT": // Unused
            Builder = require("../chart/d3plus/boxplotChartBuilderService")
            break
            // D3 based
          case "CALENDAR": // Unused
            Builder = require("../chart/d3/calendarChartBuilderService")
            break
          case "SANKEYD3": // Unused
            Builder = require("../chart/d3/sankeyChartBuilderService")
            break
            // Leaflet based
          case "MAP_BUBBLES":
            Builder = require("../chart/leaflet/bubblesChartBuilderService")
            break
          case "MAP_CLUSTER":
            Builder = require("../chart/leaflet/clusterChartBuilderService")
            break
          case "MAP_HEAT":
            Builder = require("../chart/leaflet/heatChartBuilderService")
            break
          case "MAP_POLYGON": // Unused
            Builder = require("../chart/leaflet/polygonsChartBuilderService")
            break
          case "MAP_MIGRATION": // New - untested
            Builder = require("../chart/leaflet/migrationMapChartBuilderService")
            break
          default:
            break
          }
          if (Builder) {
            try {
              const chart: any = (new Builder()).generateChart(containerId, dataset, options, additionalOptions)
              resolve(chart)
            } catch (err) {
              reject(err)
            }
          } else {
            reject(new Error("Falha ao gerar o gráfico"))
          }
        }
      }, 0)
    })
  }

  regenerateChart (chartHandler: any, type: string, containerId: string, dataset: any, options: any, additionalOptions: any = {}) {
    if (["MAP_TOPOJSON", "LINE", "STACKED", "BAR", "TREEMAP", "SCATTERPLOT", "BOXPLOT", "CALENDAR", "SANKEYD3"].includes(type)) {
      return this.generateChart(type, containerId, dataset, options, additionalOptions)
    } else if (["MAP_BUBBLES", "MAP_CLUSTER", "MAP_HEAT", "MAP_POLYGON", "MAP_MIGRATION"].includes(type)) {
      chartHandler.removeChart()
      return this.generateChart(type, containerId, dataset, options, additionalOptions)
    }
  }
}

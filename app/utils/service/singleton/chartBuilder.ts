export class ChartBuilderService {

  async generateChart (type: string, containerId: string, dataset: any, options: any, additionalOptions: any = {}) {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const container: HTMLElement | null = document.getElementById(containerId)
        if (container) {
          let BuilderClass: any
          container.innerHTML = ""
          try {
            switch (type) {
            // D3Plus based
            case "MAP_TOPOJSON":
              BuilderClass = (await import("../chart/d3plus/topoJsonChartBuilderService")).TopoJsonChartBuilderService
              break
            case "LINE":
              BuilderClass = (await import("../chart/d3plus/lineChartBuilderService")).LineChartBuilderService
              break
            case "STACKED": // Unused
              BuilderClass = (await import("../chart/d3plus/stackedLineChartBuilderService")).StackedLineChartBuilderService
              break
            case "BAR":
              BuilderClass = (await import("../chart/d3plus/barChartBuilderService")).BarChartBuilderService
              break
            case "TREEMAP":
              BuilderClass = (await import("../chart/d3plus/treemapChartBuilderService")).TreemapChartBuilderService
              break
            case "SCATTERPLOT": // Unused
              BuilderClass = (await import("../chart/d3plus/scatterChartBuilderService")).ScatterChartBuilderService
              break
            case "BOXPLOT": // Unused
              BuilderClass = (await import("../chart/d3plus/boxplotChartBuilderService")).BoxplotChartBuilderService
              break
              // D3 based
            case "CALENDAR": // Unused
              BuilderClass = (await import("../chart/d3/calendarChartBuilderService")).CalendarChartBuilderService
              break
            case "SANKEYD3": // Unused
              BuilderClass = (await import("../chart/d3/sankeyChartBuilderService")).SankeyChartBuilderService
              break
              // Leaflet based
            case "MAP_BUBBLES":
              BuilderClass = (await import("../chart/leaflet/bubblesChartBuilderService")).BubblesChartBuilderService
              break
            case "MAP_CLUSTER":
              BuilderClass = (await import("../chart/leaflet/clusterChartBuilderService")).ClusterChartBuilderService
              break
            case "MAP_HEAT":
              BuilderClass = (await import("../chart/leaflet/heatChartBuilderService")).HeatChartBuilderService
              break
            case "MAP_POLYGON": // Unused
              BuilderClass = (await import("../chart/leaflet/polygonsChartBuilderService")).PolygonsChartBuilderService
              break
            case "MAP_MIGRATION": // New - untested
              BuilderClass = (await import("../chart/leaflet/migrationMapChartBuilderService")).MigrationMapChartBuilderService
              break
            default:
              break
            }
          } catch (err) {
            reject(err)
            return
          }
          if (BuilderClass) {
            try {
              const chart: any = (new BuilderClass()).generateChart(containerId, dataset, options, additionalOptions)
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

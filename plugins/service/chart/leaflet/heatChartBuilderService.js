const LeafletChartBuilderService = require('./leafletChartBuilderService')

class HeatChartBuilderService extends LeafletChartBuilderService {
  fillLayers (dataset, options) {
    const heatPoints = []
    const id_field = options.id_field ? options.id_field : 'cd_indicador'
    const bounds = this.L.latLngBounds()
    for (const each_row of dataset) {
      if (options.visibleLayers[each_row[id_field]]) {
        heatPoints.push([
          each_row[options.lat],
          each_row[options.long],
          each_row[options.value_field]
        ])
        bounds.extend([each_row[options.lat], each_row[options.long]])
      }
    }

    this.mapLayer = this.L.heatLayer(heatPoints, { radius: 25, maxZoom: 14 }).addTo(this.chart)
    this.chart.fitBounds(bounds, { padding: [10, 10] })
  }
}

module.exports = HeatChartBuilderService

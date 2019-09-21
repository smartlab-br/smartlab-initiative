import LeafletChartBuilderService from '../leafletChartBuilderService'

class HeatChartBuilderService extends LeafletChartBuilderService {
    constructor() {
        super();
    }

    fillLayers(dataset, options, boundsZoom = null) {
      if (this.visibleLayers[this.options.indicadores[0]] == null || this.visibleLayers[this.options.indicadores[0]] == undefined) {
        for (let indx in this.options.indicadores) {
          if (indx == 0 && (this.visibleLayers[this.options.indicadores[indx]] == null || this.visibleLayers[this.options.indicadores[indx]] == undefined)) {
            this.visibleLayers[this.options.indicadores[indx]] = true;
          } else {
            this.visibleLayers[this.options.indicadores[indx]] = false;
          }
        }
      }
      let heatPoints = [];
      let id_field = this.options.id_field ? this.options.id_field : 'cd_indicador';
      for (let each_row of dataset) {
        if (this.visibleLayers[each_row[id_field]]) {
          heatPoints.push([
            each_row[this.options.lat],
            each_row[this.options.long],
            each_row[this.options.value_field]
          ]);
        }
      }
      this.mapLayer = L.heatLayer(heatPoints, {radius: 25, maxZoom:14}).addTo(this.leafletMap);

      this.sendMapLoaded();
    }
}

export default HeatChartBuilderService
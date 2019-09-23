import LeafletChartBuilderService from './leafletChartBuilderService'

class HeatChartBuilderService extends LeafletChartBuilderService {
    constructor() {
        super();
    }

    fillLayers(map, dataset, options, boundsZoom = null) {
		if (this.visibleLayers[options.indicadores[0]] == null || this.visibleLayers[options.indicadores[0]] == undefined) {
			for (let indx in options.indicadores) {
				if (indx == 0 && (this.visibleLayers[options.indicadores[indx]] == null || this.visibleLayers[options.indicadores[indx]] == undefined)) {
					this.visibleLayers[options.indicadores[indx]] = true;
				} else {
					this.visibleLayers[options.indicadores[indx]] = false;
				}
			}
		}
		  
		let heatPoints = [];
      	let id_field = options.id_field ? options.id_field : 'cd_indicador';
	  
		for (let each_row of dataset) {
        	if (this.visibleLayers[each_row[id_field]]) {
				heatPoints.push([
					each_row[options.lat],
					each_row[options.long],
					each_row[options.value_field]
				]);
        	}
      	}
	  
		this.mapLayer = this.L.heatLayer(heatPoints, {radius: 25, maxZoom:14}).addTo(map);

		return map;
    }
}

export default HeatChartBuilderService
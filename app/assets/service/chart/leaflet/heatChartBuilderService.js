import LeafletChartBuilderService from './leafletChartBuilderService'

class HeatChartBuilderService extends LeafletChartBuilderService {
    constructor() {
        super();
    }

    fillLayers(dataset, options, boundsZoom = null) {
		let heatPoints = [];
      	let id_field = options.id_field ? options.id_field : 'cd_indicador';
	  
		for (let each_row of dataset) {
        	if (options.visibleLayers[each_row[id_field]]) {
				heatPoints.push([
					each_row[options.lat],
					each_row[options.long],
					each_row[options.value_field]
				]);
        	}
      	}
	  
		this.mapLayer = this.L.heatLayer(heatPoints, {radius: 25, maxZoom:14}).addTo(this.chart);
    }
}

export default HeatChartBuilderService
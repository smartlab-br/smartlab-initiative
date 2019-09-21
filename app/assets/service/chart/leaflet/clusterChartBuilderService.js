import LeafletChartBuilderService from '../leafletChartBuilderService'

class ClusterChartBuilderService extends LeafletChartBuilderService {
    constructor() {
        super();
    }

    fillLayers(dataset, options, boundsZoom = null) {
		//default icon = blue
		let defaultIcon = new L.Icon({
			iconUrl: '/static/markers/marker-icon-2x-blue.png',
			shadowUrl: '/static/markers/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		  });

		if (this.visibleLayers[this.options.indicadores[0]] == null || this.visibleLayers[this.options.indicadores[0]] == undefined) {
		for (let indx in this.options.indicadores) {
		let indicator = this.options.indicadores[indx];
		if(this.options.markerIcons && this.options.markerIcons[indicator]){
		this.options.markerIcons[indicator] = new L.Icon({
					iconUrl: '/static/markers/marker-icon-2x-'+ this.options.markerIcons[indicator].toString() +'.png',
					shadowUrl: '/static/markers/marker-shadow.png',
					iconSize: [25, 41],
					iconAnchor: [12, 41],
					popupAnchor: [1, -34],
					shadowSize: [41, 41]
				});
		} 

		if (this.options.show_all || (indx == 0 && (this.visibleLayers[indicator] == null || this.visibleLayers[indicator] == undefined))) {
		this.visibleLayers[indicator] = true;
		} else {
		this.visibleLayers[indicator] = false;
		}
		}
		}
		this.mapLayer = L.markerClusterGroup();
		let id_field = this.options.id_field ? this.options.id_field : 'cd_indicador';
		for (let each_row of dataset) {
		if (this.visibleLayers[each_row[id_field]]) {
		this.mapLayer.addLayer(
		L.marker([
		each_row[this.options.lat],
		each_row[this.options.long]
		],{rowData: each_row, icon: this.options.markerIcons ? this.options.markerIcons[each_row[id_field]]: defaultIcon}).on("click", this.circleClick)
		);
		}
		}
		this.leafletMap.addLayer(this.mapLayer);

		this.sendMapLoaded();
    }
}

export default ClusterChartBuilderService
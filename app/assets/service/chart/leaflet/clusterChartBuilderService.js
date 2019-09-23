import LeafletChartBuilderService from './leafletChartBuilderService'

class ClusterChartBuilderService extends LeafletChartBuilderService {
    constructor() {
        super();
    }

	fillLayers(map, dataset, options, boundsZoom = null) {
		//default icon = blue
		let defaultIcon = new this.L.Icon({
			iconUrl: '/static/markers/marker-icon-2x-blue.png',
			shadowUrl: '/static/markers/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});

		if (this.visibleLayers[options.indicadores[0]] == null || this.visibleLayers[options.indicadores[0]] == undefined) {
			for (let indx in options.indicadores) {
				let indicator = options.indicadores[indx];
				
				if(options.markerIcons && options.markerIcons[indicator]) {
					options.markerIcons[indicator] = new this.L.Icon({
						iconUrl: '/static/markers/marker-icon-2x-'+ options.markerIcons[indicator].toString() +'.png',
						shadowUrl: '/static/markers/marker-shadow.png',
						iconSize: [25, 41],
						iconAnchor: [12, 41],
						popupAnchor: [1, -34],
						shadowSize: [41, 41]
					});
				} 

				if (options.show_all || (indx == 0 && (this.visibleLayers[indicator] == null || this.visibleLayers[indicator] == undefined))) {
					this.visibleLayers[indicator] = true;
				} else {
					this.visibleLayers[indicator] = false;
				}
			}
		}
		
		let mapLayer = this.L.markerClusterGroup();
		let id_field = options.id_field ? options.id_field : 'cd_indicador';
		
		for (let each_row of dataset) {
			if (this.visibleLayers[each_row[id_field]]) {
				mapLayer.addLayer(
					this.L.marker(
						[ each_row[options.lat], each_row[options.long] ],
						{rowData: each_row, icon: options.markerIcons ? options.markerIcons[each_row[id_field]]: defaultIcon }
					).on("click", this.circleClick)
				);
			}
		}
		
		map.addLayer(mapLayer);

		return map;
    }
}

export default ClusterChartBuilderService
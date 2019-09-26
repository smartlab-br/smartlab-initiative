import LeafletChartBuilderService from './leafletChartBuilderService'

import * as d3chrom from 'd3-scale-chromatic'

class PolygonsChartBuilderService extends LeafletChartBuilderService {
    constructor() {
        super();
    }

    fillLayers(map, dataset, options, boundsZoom = null) {
      	// https://blog.webkid.io/maps-with-leaflet-and-topojson/
		// Gera o range
		let range = [null, null];

		for (let each_row of dataset) {
			if (range[0] === null || range[0] > each_row[options.value_field]) range[0] = each_row[options.value_field];
			if (range[1] === null || range[1] < each_row[options.value_field]) range[1] = each_row[options.value_field];
		}

		this.L.TopoJSON = this.L.GeoJSON.extend({  
			addData: function(jsonData) {    
				if (jsonData.type === 'Topology') {
					for (let key in jsonData.objects) {
						let geojson = topojson.feature(jsonData, jsonData.objects[key]);
						this.L.GeoJSON.prototype.addData.call(this, geojson);               
					}
				} else {
					this.L.GeoJSON.prototype.addData.call(this, jsonData);
				}
			}  
		});
		
		let layer = new this.L.TopoJSON();
		layer.addData(this.topology);
		layer.addTo(map);
		layer.eachLayer(this.handlePolygon); // TODO How to add args to function when called?
		  
		return map; 
	}
	
	handlePoligon(layer, dataset, range) {
        let value = null;
        for (let each_row of dataset) {
			if (each_row[options.id_field] == layer.feature.id) {
				if (options.scale_order !== null && options.scale_order === 'ASC') {
					value = (each_row[options.value_field] - range[0]) / (range[1] - range[0]);
				} else if (options.scale_order !== null) {
					value = 1 - (each_row[options.value_field] - range[0]) / (range[1] - range[0]);
				}
				
				let fillColor = (value != null ? d3chrom.interpolateRdYlBu(value) : 'transparent');
            
            	layer.setStyle({
					fillColor: fillColor,
					fillOpacity: 0.8,
					color: fillColor,
					weight: 1,
					opacity: 0.9
				});

				layer.on({ 
					mouseover: () => { this.setStyle({ weight: 4, opacity: 1, fillOpacity: 1 }); },
					mouseout: () => { this.setStyle({ weight: 1, opacity: 0.9, fillOpacity: 0.8 }); }
				});

            	break;
          	}
        }

        if (!value) {
			layer.setStyle({
				fillColor: 'transparent',
				fillOpacity: 0,
				color: 'transparent',
				weight: 0,
				opacity: 0
			});
        }
    }

}

export default PolygonsChartBuilderService
import LeafletChartBuilderService from './leafletChartBuilderService'

class PolygonsChartBuilderService extends LeafletChartBuilderService {
    constructor() {
        super();
    }

    fillLayers(dataset, options, boundsZoom = null) {
      // https://blog.webkid.io/maps-with-leaflet-and-topojson/
          // Gera o range
          let range = [null, null];
          for (let each_row of dataset) {
            if (range[0] === null || range[0] > each_row[this.options.value_field]) {
              range[0] = each_row[this.options.value_field];
            }
            if (range[1] === null || range[1] < each_row[this.options.value_field]) {
              range[1] = each_row[this.options.value_field];
            }
          }

          this.range = range;

          L.TopoJSON = L.GeoJSON.extend({  
            addData: function(jsonData) {    
              if (jsonData.type === 'Topology') {
                for (let key in jsonData.objects) {
                  let geojson = topojson.feature(jsonData, jsonData.objects[key]);
                  L.GeoJSON.prototype.addData.call(this, geojson);               
                }
              }    
              else {
                L.GeoJSON.prototype.addData.call(this, jsonData);
              }
            }  
          });
          
          let layer = new L.TopoJSON();
          layer.addData(this.topology);
          layer.addTo(this.leafletMap);
		  layer.eachLayer(this.handlePolygon);
		  
		  this.sendMapLoaded();
	}
	
	handlePoligon(layer) {
        //const randomValue = Math.random();
        // Se for usar polígonos no leaflet, verificar a necessidade de usar essas variáveis
        // var tooltip_function = this.options.tooltip_function ? this.options.tooltip_function : this.defaultTooltip;
        // var headers = this.headers;
        // var removed_text_list = this.options.removed_text_list;

        let value = null;
        for (let each_row of this.dataset) {
          if (each_row[this.options.id_field] == layer.feature.id) {
            if (this.options.scale_order !== null && this.options.scale_order === 'ASC') {
              value = (each_row[this.options.value_field] - this.range[0]) / (this.range[1] - this.range[0]);
            } else if (this.options.scale_order !== null) {
              value = 1 - (each_row[this.options.value_field] - this.range[0]) / (this.range[1] - this.range[0]);
            }
            let fillColor = (value != null ? this.d3chrom.interpolateRdYlBu(value) : 'transparent');

            //layer.bindPopup("Carregando...");
            // var rowData = each_row;
            
            // Se for usar polígonos no leaflet, verificar como instanciar a função fora do loop
            // layer.on('click', function(e) {
            //   let popup = e.target.getPopup();
            //   popup.setContent(tooltip_function(rowData, headers, removed_text_list));
            //   popup.update();
            // });
            
            layer.setStyle({
              fillColor: fillColor,
              fillOpacity: 0.8,
              color: fillColor,
              weight: 1,
              opacity: 0.9
            });

            layer.on({
              mouseover: function() {
                this.setStyle({
                  weight: 4,
                  opacity: 1,
                  fillOpacity: 1
                });
              },
              mouseout: function() {
                this.setStyle({
                  weight: 1,
                  opacity: 0.9,
                  fillOpacity: 0.8
                });
              },
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
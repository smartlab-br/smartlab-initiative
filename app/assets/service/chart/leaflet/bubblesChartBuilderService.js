import LeafletChartBuilderService from '../leafletChartBuilderService'

class BubblesChartBuilderService extends LeafletChartBuilderService {
    radius = { 
        multiplier: 1600000,
        base: 5000
    }
    constructor() {
        super();
    }

    fillLayers(dataset, options, boundsZoom = null) {
        // Sets the bubbles size handlers
        if (options && options.radius && options.radius.multiplier) this.radius.multiplier = options.radius.multiplier;
        if (options && options.radius && options.radius.base) this.radius.base = options.radius.base;
        
        // TODO Decouple
        if (boundsZoom == null) boundsZoom = this.leafletMap.getZoom();
        let zoomIndex = boundsZoom > 5 ? Math.pow(boundsZoom/4,4) : 1;
          
        let multiplier = this.radius.multiplier / zoomIndex;

        let circleDataPoint = L.Circle.extend({ rowData: null });

        let value_field = options.value_field ? options.value_field : 'api_calc_ln_norm_pos_part';
        let id_field = options.id_field ? options.id_field : 'cd_indicador';
        let min_field = options.min_field ? options.min_field : 'calc_min_part';

        // TODO - Analisar se é necessário getMinMaxEachIndicator
        // // Prepares the dataset, if the layers have no range
        if (min_field == 'minVal' || !value_field.includes('api_calc_')) {  
            dataset = this.$indicatorsModel.getMinMaxEachIndicator(dataset, value_field);
        }
          
        // TODO - decouple
        // Prepares the layers
        for (const ident of this.options.indicadores) {
            let group = L.layerGroup();
            group.addTo(this.leafletMap);
            this.layers[ident] = group;
            if (this.visibleLayers[ident] == null || this.visibleLayers[ident] == undefined) {
              this.visibleLayers[ident] = true;
            }
        }

        // Iterates over the dataset, to build each circle and apply to the respective layer
        for(let each_row of dataset) {
            if (each_row[this.options.lat] &&
                each_row[this.options.long] &&
                each_row[this.options.lat] != 0 &&
                each_row[this.options.long] != 0) {
                // Iterates over the layers
                for (const [pos, ident] of this.options.indicadores.entries()) {
                // Checks if the row is for the layer (moves to next if different)
                if (ident != each_row[id_field]) continue;

                // Gets the value for each layer
                let value = each_row[value_field];
                
                // Builds the circle
                let eachCircle = new circleDataPoint(
                  [each_row[this.options.lat], each_row[this.options.long]],
                  { rowData: each_row,
                    color: this.options.color != null ? 
                            this.options.color : 
                            (this.options.colorArray != null ? 
                              this.options.colorArray[pos] :
                              (each_row.color != null ? 
                                each_row.color : 
                                '#4A148C'
                              )
                            ),
                    weight: this.options.weight != null ? this.options.weight : (each_row.weight != null ? each_row.weight : 0),
                    fillColor: this.options.fillColor != null ?
                                this.options.fillColor : 
                                (this.options.colorArray != null ?
                                  this.options.colorArray[pos] :
                                  (each_row.fillColor != null ?
                                    each_row.fillColor :
                                    '#4A148C'
                                  )
                                ),
                    fillOpacity: this.options.fillOpacity != null ? 
                                  this.options.fillOpacity : 
                                  (each_row.fillOpacity != null ? 
                                    each_row.fillOpacity :
                                    0.5
                                  ),
                    radius: value != null ? value > 0 ? value * multiplier + base : base : 0
                  }
                ).on("click", this.circleClick);

                // if (this.visibleLayers[ident]) {
                eachCircle.addTo(this.layers[ident]);
                // }
              }
            }
          }
          this.adjustVisibleLayers();
        
        this.sendMapLoaded();
    }

    circleClick(e) {
        let tooltip_function = this.options.tooltip_function ? this[this.options.tooltip_function] : this.defaultLeafletTooltip;
        let tooltip_context = this.options.tooltip_function ? this : this.$tooltipBuildingService;
        tooltip_function.apply(tooltip_context, [e.target, this.$route, this.headers, this.options.removed_text_list, this.options]);
      }

    adjustVisibleLayers() {
        for (let indx in this.customParams.enabled) {
            // Verifica quais parâmetros mudaram
            // if (this.customParams.enabled[indx] != this.visibleLayers[indx]) {
            if (this.customParams.enabled[indx]) {
              this.leafletMap.addLayer(this.layers[indx]);
            } else {
              this.leafletMap.removeLayer(this.layers[indx]);
            }
            this.visibleLayers[indx] = this.customParams.enabled[indx];
            // }
        }
    }
      
}

export default BubblesChartBuilderService
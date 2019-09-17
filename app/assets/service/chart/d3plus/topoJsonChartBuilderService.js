import D3PlusChartBuilderService from './d3plusChartBuilderService'

class TopoJsonChartBuilderService extends D3PlusChartBuilderService {
    constructor() {
        super();
    }

    static prepareChart(viz, slicedDS, containerId, options) {        
        if(!options.colorScale){ //default
            options.colorScale = {};
            options.colorScale.type = 'singleHue';
            options.colorScale.order = 'asc';
        } else if(options.colorScale.type == null || options.colorScale.type == undefined){
            options.colorScale.type = 'singleHue';
        }
        
        if (options.colorScale.type == "fixed"){
            viz = viz.shapeConfig({ 
                Path: {
                    fill: function(d) { 
                        let color = options.colorScale.color_array[d[options.value_field]];
                        return color ? color : "transparent";
                    }
                }
            }).legend(false);
        } else if (options.colorScale.type == "bipolar"){
            viz = viz.shapeConfig({ 
                Path: {
                    fill: function(d) { 
                        let color = options.colorScale.color_array.zero;
                        if (d[options.value_field] > 0) {
                            color = options.colorScale.color_array.positive;
                        } else if (d[options.value_field] < 0) {
                            color = options.colorScale.color_array.negative;
                        }
                        return color;
                    }
                }
            }).legend(false);
        } else {
            let aColorScale = ColorsService.getColorScale(options.colorScale.name, options.colorScale.type, options.colorScale.order, 9);

            let distValues = [];
            for (let reg of slicedDS) {  
                if (!distValues.includes(reg[options.value_field])){
                    distValues.push(reg[options.value_field]);
                }
                if (distValues.length > 2){
                    break;
                }
            }

            // if (distValues.length == 2){
            if (distValues.length > 1){
                aColorScale = aColorScale.slice(1,-1);
            } else if (distValues.length == 1){
                if (options.single_data_color && options.single_data_color[distValues[0]]) {
                    aColorScale = options.single_data_color[distValues[0]];
                } else if (options.single_data_color && options.single_data_color.default) {
                    aColorScale = options.single_data_color.default;
                } else {
                    aColorScale = aColorScale[4];
                }
            }

            var objAxisConfig = TopoJsonChartBuilderService.getTransparentXYConfig();
            
            if (options.colorScale && options.colorScale.inv_function) {
                var inv_tickFn = this.customFunctions[options.colorScale.inv_function.name];
                var inv_args = [];
                for (var indxInvArg in options.colorScale.inv_function.args) {
                    if (options.colorScale.inv_function.args[indxInvArg].fixed) {
                        inv_args.push(options.colorScale.inv_function.args[indxInvArg].fixed);
                    } else if (options.colorScale.inv_function.args[indxInvArg].first_row_prop) {
                        inv_args.push(slicedDS[0][options.colorScale.inv_function.args[indxInvArg].first_row_prop]);
                    }
                }            
                objAxisConfig.tickFormat = (t) => {
                    let t_args = inv_args.slice();
                    t_args.unshift(t);
                    return inv_tickFn.apply(null, t_args);
                };
            }

            if (distValues.length != 1){
                viz = viz.colorScaleConfig({
                    color: aColorScale,
                    axisConfig: objAxisConfig,            
                    rectConfig: { stroke: ColorsService.assessZebraTitleColor(this.sectionIndex, null, this.$vuetify.theme) }
                });
                viz = viz.colorScale(options.value_field);
            } else {
                viz = viz.shapeConfig({ 
                    Path: {
                    fill: function(d) { return d[options.value_field] ? aColorScale: "transparent"; }
                    }
                }).legend(false);
            }
        }
        
        let grafico = viz
            .select(containerId)  // container DIV to hold the visualization
            .data(slicedDS)  // data to use with the visualization
            .groupBy(options.id_field)         // key for which our data is unique on
            .topojsonId((t) => { return t.properties[options.topo_key]; })
            .detectResize(true);
            
        let searchFunction = this.searchAnalysisUnit;
        let clickedPlace = "";
        let hasTouch = TopoJsonChartBuilderService.hasTouch;
        if (options.clickable){
            viz = viz.on("click", function(d) {
                if (clickedPlace == d[options.id_field] || !hasTouch()) {
                    let place = {};
                    place.id = String(d[options.id_field]);
                    place.to = '/localidade/' + d[options.id_field] + '?';
                    if (this._tooltip) {
                            this._tooltipClass.data([]).render();
                    }                
                    searchFunction(place);
                }
                clickedPlace = d[options.id_field];
                });     
        }  
        return grafico;
    }
    
    static hasTouch() { //identify touchable devices (mobile and tablet)
        return (('ontouchstart' in window) ||       // html5 browsers
            (navigator.maxTouchPoints > 0) ||   // future IE
            (navigator.msMaxTouchPoints > 0));  // current IE10
    }      
        
    static generateViz(options) {
        var tooltip_function = options.tooltip_function ? options.tooltip_function : this.tooltipBuildingService.defaultTooltip;
        let tooltip_context = options.tooltip_function ? this : this.tooltipBuildingService;
        options.clickable = options.clickable == true || options.clickable == undefined  ? true : false;
        var headers = this.headers;
        var route = this.$route;
        var removed_text_list = options.removed_text_list;

        var idLocalidade = this.selectedPlace ? this.selectedPlace : this.customParams.idLocalidade;
        
        var viz = new d3plus.Geomap()
            .shapeConfig({ 
                labelConfig: { fontFamily: "titulos-observatorio" },
                Path: {
                    fillOpacity: 0.9,
                    strokeWidth: function(d) { return (idLocalidade !== null && idLocalidade !== undefined && (d[options.id_field] == idLocalidade || (d.properties && d.properties[options.topo_key] == idLocalidade) ) )  ? 5 : 0.2 },
                    stroke: 'black'
                }
            })
            .tileUrl(options.tiles_url)
            .topojson(options.topology && options.topology == 'uf' ? this.topologyUf : this.topology) 
            .tooltipConfig({
                body: function(d) {
                    return tooltip_function.apply(tooltip_context, [d, route, headers, removed_text_list, options]);
                },
                title: function(d) { return ""; }
            })
            .colorScalePosition("right");

        return viz;
    }
}

export default TopoJsonChartBuilderService
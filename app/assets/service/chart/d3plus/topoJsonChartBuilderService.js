import ColorsService from '../../singleton/colorsService'

import D3PlusChartBuilderService from './d3plusChartBuilderService'
import TooltipBuildingService from '../../singleton/tooltipBuildingService'

import * as d3plus from 'd3plus'

class TopoJsonChartBuilderService extends D3PlusChartBuilderService {
    static _tilesUrl = 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

    constructor() {
        super();
    }

    prepareChart(viz, slicedDS, containerId, options, additionalOptions) { 
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
                var inv_tickFn = additionalOptions[options.colorScale.inv_function.name];
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
                    rectConfig: { stroke: ColorsService.assessZebraTitleColor(additionalOptions.sectionIndex, null, additionalOptions.theme) }
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
            
        let clickedPlace = "";
        let hasTouch = this.hasTouch;
        if (options.clickable){
            viz = viz.on("click", function(d) {
                if (clickedPlace == d[options.id_field] || !hasTouch()) {
                    // TODO Work on making it generic
                    let place = {};
                    place.id = String(d[options.id_field]);
                    place.to = '/localidade/' + d[options.id_field] + '?';
                    if (this._tooltip) {
                            this._tooltipClass.data([]).render();
                    }
                    try {         
                        additionalOptions.context['searchAnalysisUnit'](place);
                    } catch (err) {
                        additionalOptions.context['sendError'](err);
                    }
                }
                clickedPlace = d[options.id_field];
                });     
        }  
        return grafico;
    }
    
    hasTouch() { //identify touchable devices (mobile and tablet)
        return (('ontouchstart' in window) ||       // html5 browsers
            (navigator.maxTouchPoints > 0) ||   // future IE
            (navigator.msMaxTouchPoints > 0));  // current IE10
    }      
        
    generateViz(options, additionalOptions) {
        let tooltip_function = options.tooltip_function ? options.tooltip_function : TooltipBuildingService.defaultTooltip;
        let tooltip_context = additionalOptions.context ? additionalOptions.context : null;
        options.clickable = options.clickable == true || options.clickable == undefined  ? true : false;
        let removed_text_list = options.removed_text_list;

        let viz = new d3plus.Geomap()
            .shapeConfig({ 
                labelConfig: { fontFamily: additionalOptions.fontFamily ? additionalOptions.fontFamily : this._fontFamily },
                Path: {
                    fillOpacity: 0.9,
                    strokeWidth: function(d) { return (additionalOptions.idAU !== null && additionalOptions.idAU !== undefined && (d[options.id_field] == additionalOptions.idAU || (d.properties && d.properties[options.topo_key] == additionalOptions.idAU) ) )  ? 5 : 0.2 },
                    stroke: 'black'
                }
            })
            .tileUrl(options.tiles_url ? options.tiles_url : TopoJsonChartBuilderService._tilesUrl)
            .topojson(options.topology && options.topology == 'uf' ? additionalOptions.topologyUf : additionalOptions.topology) 
            .tooltipConfig({
                body: function(d) {
                    if (tooltip_function instanceof String) {
                        return tooltip_context[tooltip_function].apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options]);
                    } else {
                        return tooltip_function.apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options]);
                    }
                },
                title: function(d) { return ""; }
            })
            .colorScalePosition("right");

        return viz;
    }
}

export default TopoJsonChartBuilderService
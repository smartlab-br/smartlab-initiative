import D3PlusChartBuilderService from './d3plusChartBuilderService'

import * as d3plus from 'd3plus'

class LineChartBuilderService extends D3PlusChartBuilderService {
    constructor() {
        super();
    }

    prepareChart(viz, slicedDS, containerId, options, additionalOptions) {
        var colorCat = {};
        let colorArray = null;
        if (options.colorScale) {
            colorArray = additionalOptions.colorHandlers.getColorScale(options.colorScale.name);
        } else if (options.colorArray) {
            colorArray = options.colorArray;
        }
        if (colorArray != null) {
            let colorIndx = 0;
            for (let row of slicedDS) {
                if (colorCat[row[options.id]] === null ||
                    colorCat[row[options.id]] === undefined) {
                    colorCat[row[options.id]] = colorArray[colorIndx];
                    colorIndx++;
                }
            }
        }

        let lineConfig = { strokeWidth: options.stroke ? options.stroke : 4 };
        if (options.colorScale || options.colorArray) {
          lineConfig.stroke = (d) => { return colorCat[d[options.id]]; };
        } else if (options.color !== null && options.color !== undefined) {
          lineConfig.stroke = options.color;
        }

        let labelConfig = { fontFamily: additionalOptions.fontFamily ? additionalOptions.fontFamily : this._fontFamily };
        if (options.show_y_axis !== null && options.show_y_axis !== undefined && options.show_y_axis) {
            let container = document.getElementById(containerId);
            viz.shapeConfig().labelConfig.width = container.offsetWidth;
        }
          
        let grafico = viz
            .shapeConfig({ 
                "labelConfig": labelConfig,
                Line: lineConfig
            })
            .select(containerId)  // container DIV to hold the visualization
            .data(slicedDS)  // data to use with the visualization
            .groupBy(options.id)         // key for which our data is unique on
            .label((d) => { return additionalOptions.cleanLabel(d[options.text],options.removed_text_list); })
            .y(options.y)    // key to use for y-axis
            .x(options.x)         // key to use for x-axis
            .detectResize(true);
    
        return grafico;
    }
        
    generateViz(options, additionalOptions) {
        let tooltip_function = additionalOptions.tooltipFunction;
        let tooltip_context = additionalOptions.context ? additionalOptions.context : null;
        let removed_text_list = options.removed_text_list; 
        
        let xConfig = this.constructor.getDefaultXYConfig(additionalOptions.sectionIndex);
        let yConfig = this.constructor.getDefaultXYConfig(additionalOptions.sectionIndex);

        if (options.x_options && options.x_options.axis === false) xConfig= this.constructor.getTransparentXYConfig();
        if (options.y_options && options.y_options.axis === false) yConfig = this.constructor.getTransparentXYConfig();
        
        let viz = new d3plus.LinePlot() 
            .legendConfig({ 
                shapeConfig:{
                    labelConfig: { fontColor: additionalOptions.colorHandlers.assessZebraTitleColor(additionalOptions.sectionIndex, null, additionalOptions.theme) }
                }
            })
            .legendConfig({ 
                label: function (d) { return options.legend_field ? d[options.legend_field] : d[options.id] },
                shapeConfig:{
                    labelConfig: { fontColor: additionalOptions.colorHandlers.assessZebraTitleColor(additionalOptions.sectionIndex, null, additionalOptions.theme) }
                }
            })
            .legendPosition("top")
            .xConfig(xConfig)  
            .yConfig(yConfig)
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
        
        return viz; 
    }
}

export default LineChartBuilderService
import D3PlusChartBuilderService from './d3plusChartBuilderService'
import TooltipBuildingService from '../../singleton/tooltipBuildingService'

import * as d3plus from 'd3plus'

class StackedLineChartBuilderService extends D3PlusChartBuilderService {
    constructor() {
        super();
    }

    prepareChart(viz, slicedDS, containerId, options, additionalOptions) {
        if (options.id === null || options.id === undefined) {
            for (let row of slicedDS) {
                if (options.id === null || options.id === undefined) row.series_id = "1";
            }
        }

        let grafico = viz
            .select(containerId)  // container DIV to hold the visualization
            .data(slicedDS)  // data to use with the visualization
            .label((d) => { return TooltipBuildingService.removeFromLabel(d[options.text],options.removed_text_list); })
            .groupBy(options.id)         // key for which our data is unique on
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
        
        let areaConfig = {
          strokeWidth: options.stroke ? options.stroke : 2,
          labelConfig: { fontFamily: additionalOptions.fontFamily ? additionalOptions.fontFamily : this._fontFamily }
        };
        
        if (options.colorScale) {
          areaConfig.stroke = additionalOptions.colorHandlers.getColorScale(options.colorScale.name);
        } else if (options.color !== null && options.color !== undefined) {
          areaConfig.stroke = options.color;
        } 

        let viz = new d3plus.StackedArea()
          .shapeConfig({ 
            labelConfig: { fontFamily: additionalOptions.fontFamily ? additionalOptions.fontFamily : this._fontFamily },
            Area: areaConfig
          })
          .legendConfig({ 
            shapeConfig:{
              labelConfig: { fontColor: additionalOptions.colorHandlers.assessZebraTitleColor(additionalOptions.sectionIndex, null, additionalOptions.theme) }
            }
          })
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
            title: function(d) {
              return "";
            }
          });

        if (options.legend !== null && options.legend !== undefined && options.legend) {
          viz = viz.legend({ value: true, filters: true });
        }
        if (options.format !== null && options.format !== undefined) {
          viz = viz.format(options.format);
        }

        // Definições da legenda
        if (options.hide_legend !== null && options.hide_legend !== undefined && options.hide_legend) {
          viz = viz.legend(false);
        } else if (options.legend !== null && options.legend !== undefined && options.legend) {
          viz = viz.legend({ value: true, filters: true });
        } else if (options.legend !== null && options.legend !== undefined && !options.legend) {
          viz = viz.legend({ value: false});
        }

        return viz;  
    }
}

export default StackedLineChartBuilderService
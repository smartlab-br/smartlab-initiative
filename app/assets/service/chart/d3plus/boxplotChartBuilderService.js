import ColorsService from '../../singleton/colorsService'

import D3PlusChartBuilderService from './d3plusChartBuilderService'

import * as d3plus from 'd3plus'

class BoxplotChartBuilderService extends D3PlusChartBuilderService {
    constructor() {
        super();
    }

    prepareChart(viz, slicedDS, containerId, options, additionalOptions) {
        let grafico = viz
          .container(containerId)  // container DIV to hold the visualization
          .data(dataset)  // data to use with the visualization
          .id(options.id)         // key for which our data is unique on
          // .text(this.options.text)
          .font({ "family": "titulos-observatorio" })
          .y(options.y)    // key to use for y-axis
          .x(options.x)         // key to use for x-axis
          .detectResize(true);
  
        return grafico;
    }
        
    generateViz(options, additionalOptions) {
        let tooltip_function = additionalOptions.tooltipFunction;
        let tooltip_context = additionalOptions.context ? additionalOptions.context : null;
        let removed_text_list = options.removed_text_list; 
        
        var viz = new d3plus.viz()
            .type("box")        // visualization type
            .tooltipConfig({
                body: function(d) {
                    if (tooltip_function instanceof String) {
                        return tooltip_context[tooltip_function].apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options]);
                    } else {
                        return tooltip_function.apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options]);
                    }
                },
                title: function(d) { return ""; }
            });              

        return viz;
    }
}

export default BoxplotChartBuilderService
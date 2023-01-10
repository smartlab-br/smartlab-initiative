const D3PlusChartBuilderService = require('./d3plusChartBuilderService');

class ScatterChartBuilderService extends D3PlusChartBuilderService {
    constructor() {
        super();
    }

    prepareChart(viz, slicedDS, containerId, options, additionalOptions) {
        let grafico = viz
            .container(containerId)  // container DIV to hold the visualization
            .data(slicedDS)  // data to use with the visualization
            .id(options.id)         // key for which our data is unique on
            .text(options.text)
            .size(options.size)
            .y(options.y)    // key to use for y-axis
            .x(options.x)         // key to use for x-axis
            .detectResize(true);
  
        return grafico;
    }
        
    generateViz(options, additionalOptions) {
        let tooltip_function = additionalOptions.tooltipFunction;
        let tooltip_context = additionalOptions.context ? additionalOptions.context : null;
        let removed_text_list = options.removed_text_list; 
        
        var label = "";
        var viz = new this.d3plus.viz()
            .noDataHTML(this.noDataMessage)
            .loadingHTML(this.loadingMessage)
            .data({"opacity":0.7})  // data to use with the visualization
            .type("scatter")        // visualization type
            .font( { fontFamily: additionalOptions.fontFamily ? additionalOptions.fontFamily : this._fontFamily })        // visualization type
            .format({
                "text": (text, params) => {
                    for (let eachHeader of additionalOptions.headers){
                        if (text === eachHeader.value) return eachHeader.text;
                    }
                    label = text;
                    for(let eachRemoval of options.removeFromLabel){
                        label = label.replace(eachRemoval, "");
                    }
                    return label;
                }
            })
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

module.exports = ScatterChartBuilderService
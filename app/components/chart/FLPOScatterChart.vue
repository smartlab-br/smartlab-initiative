<script>
  import * as d3 from 'd3'
  import * as d3plus from 'd3plus';

  import FLPOBaseHighGranularityChart from '../FLPOBaseHighGranularityChart.vue';
  
  export default {
    extends: FLPOBaseHighGranularityChart,
    methods: {
      prepareChart(viz, slicedDS, containerId, options) {
        let grafico = viz
            .container(containerId)  // container DIV to hold the visualization
            .data(dataset)  // data to use with the visualization
            .id(options.id)         // key for which our data is unique on
            .text(options.text)
            .size(options.size)
            .y(options.y)    // key to use for y-axis
            .x(options.x)         // key to use for x-axis
            .detectResize(true);
  
        return grafico;
      },

      generateViz(options){
        var headers = this.headers;
        var removeFromLabel = options.removeFromLabel;
        var label = "";

        var viz = new d3plus.viz()
              .data({"opacity":0.7})  // data to use with the visualization
              .type("scatter")        // visualization type
              .font({"family":"titulos-observatorio"})        // visualization type
              .format({"text" : function(text ,params) {
                  for(var indxHeader in headers){
                    if(text === headers[indxHeader].value){
                      return headers[indxHeader].text;
                    }
                  }
                  label = text;
                  for(var indxLabel in removeFromLabel){
                    label = label.replace(removeFromLabel[indxLabel],"");
                  }
                  return label;
              }});              
              //.axes({"background": {"color": "#ffffff" }})
              //.labels({ "align": "left" });
        
        // if (options.color !== null && options.color !== undefined) {
        //   viz = viz.color(options.color);
        // } else {
        //   viz = viz.color(options.id);
        // }
        // if (options.legend !== null && options.legend !== undefined && options.legend) {
        //   viz = viz.legend({ value: true, filters: true });
        // }
        return viz;
      },
      generateChart(dataset){
        var viz = this.generateViz(this.options);
        var containerId = "#" + this.id;
        if ((this.dataset === null) || (this.dataset === undefined)) {
          this.chart = viz
              .container(containerId)  // container DIV to hold the visualization
              .data(dataset)  // data to use with the visualization
              .id(this.options.id)         // key for which our data is unique on
              .text(this.options.text)
              .size(this.options.size)
              .y(this.options.y)    // key to use for y-axis
              .x(this.options.x)         // key to use for x-axis
              .draw(); // This draws the visualization
        } else {
          this.redrawChart(dataset);
        }
      }
    }
  }
</script>

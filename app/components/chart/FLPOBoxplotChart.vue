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
          //.text(this.options.text)
          .font({ "family": "titulos-observatorio" })
          .y(options.y)    // key to use for y-axis
          .x(options.x)         // key to use for x-axis
          .detectResize(true);
  
        return grafico;
      },
      
      generateViz(options){
        var viz = new d3plus.viz()
              //.data({"opacity":0.7})  // data to use with the visualization
              .type("box")        // visualization type
              //.font({"family":"Roboto"})        // visualization type
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
      }
    }
  }
</script>

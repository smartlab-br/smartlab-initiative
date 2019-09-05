<script>
  import * as d3 from 'd3'
  import * as d3plus from 'd3plus';

  import FLPOBaseChart from '../FLPOBaseChart.vue';
  
  export default {
    extends: FLPOBaseChart,
    created() {
      if (this.options.id === null || this.options.id === undefined) {
        for (var row in this.dataset) {
          if (this.options.id === null || this.options.id === undefined) {
            this.dataset[row].series_id = "1";
          }
        }
      }
    },
    methods: {
      prepareChart(viz, slicedDS, containerId, options) {
        let grafico = viz
            .select(containerId)  // container DIV to hold the visualization
            .data(slicedDS)  // data to use with the visualization
            .label((d) => { return this.$tooltipBuildingService.removeFromLabel(d[this.options.text],this.options.removed_text_list); })
            .groupBy(this.options.id)         // key for which our data is unique on
            .y(this.options.y)    // key to use for y-axis
            .x(this.options.x)         // key to use for x-axis
            .detectResize(true);

        return grafico;
      },

      generateViz(options){
        let tooltip_function = options.tooltip_function ? options.tooltip_function : this.$tooltipBuildingService.defaultTooltip;
        let tooltip_context = options.tooltip_function ? this : this.$tooltipBuildingService;
        let headers = this.headers;
        let route = this.$route;
        let removed_text_list = options.removed_text_list;

        let areaConfig = {
          strokeWidth: options.stroke ? options.stroke : 2,
          labelConfig: {
            fontFamily: "titulos-observatorio"
          }
        };
        
        if (options.colorScale) {
          areaConfig.stroke = this.$colorsService.getColorScale(options.colorScale.name);
        } else if (options.color !== null && options.color !== undefined) {
          areaConfig.stroke = options.color;
        } 

        let xConfig = this.getDefaultXYConfig(this.sectionIndex);
        let yConfig = this.getDefaultXYConfig(this.sectionIndex);

        if (options.x_options && options.x_options.axis === false) {
          xConfig= this.getTransparentXYConfig();
        }
        if (options.y_options && options.y_options.axis === false) {
          yConfig = this.getTransparentXYConfig();
        }

        let viz = new d3plus.StackedArea()
          .shapeConfig({ 
            labelConfig: {
              fontFamily: "titulos-observatorio"
            },
            Area: areaConfig
          })
          .legendConfig({ 
            shapeConfig:{
              labelConfig: {
                fontColor: this.$colorsService.assessZebraTitleColor(this.sectionIndex, null, this.$vuetify.theme)
              }
            }
          })
          .xConfig(xConfig)  
          .yConfig(yConfig)
          .tooltipConfig({
            body: function(d) {
              return tooltip_function.apply(tooltip_context, [d, route, headers, removed_text_list,options]);
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
  }
</script>

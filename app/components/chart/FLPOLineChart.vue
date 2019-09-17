<script>
  import * as d3 from 'd3'
  import * as d3plus from 'd3plus';

  import FLPOBaseChart from '../FLPOBaseChart.vue';
  
  export default {
    extends: FLPOBaseChart,
    data () {
      return {
        colorCat: {}
      }
    },
    created() {
      let colorArray = null;
      if (this.options.colorScale) {
        colorArray = this.$colorsService.constructor.getColorScale(this.options.colorScale.name);
      } else if (this.options.colorArray) {
        colorArray = this.options.colorArray;
      }
      if (colorArray != null) {
        let colorIndx = 0;
        for (var indxDS in this.dataset) {
          if (this.colorCat[this.dataset[indxDS][this.options.id]] === null ||
              this.colorCat[this.dataset[indxDS][this.options.id]] === undefined) {
            this.colorCat[this.dataset[indxDS][this.options.id]] = colorArray[colorIndx];
            colorIndx++;
          }
        }
      }
    },
    methods: {
      prepareChart(viz, slicedDS, containerId, options) {
        if (options.show_y_axis !== null && options.show_y_axis !== undefined && options.show_y_axis) {
          viz.shapeConfig().labelConfig.width = chartContainer.offsetWidth;
          //viz.shapeConfig.labelConfig.width = chartContainer.offsetWidth;
        }
        
        let grafico = viz
            .select(containerId)  // container DIV to hold the visualization
            .data(slicedDS)  // data to use with the visualization
            .groupBy(this.options.id)         // key for which our data is unique on
            .label((d) => { return this.$tooltipBuildingService.constructor.removeFromLabel(d[this.options.text],this.options.removed_text_list); })
            //.text(this.options.text)
            .y(this.options.y)    // key to use for y-axis
            .x(this.options.x)         // key to use for x-axis
            .detectResize(true);
  
        return grafico;
      },

      generateViz(options){
        let tooltip_function = options.tooltip_function ? options.tooltip_function : this.$tooltipBuildingService.constructor.defaultTooltip;
        let tooltip_context = options.tooltip_function ? this : null;
        let headers = this.headers;
        let route = this.$route;
        let removed_text_list = options.removed_text_list;

        let lineConfig = { strokeWidth: options.stroke ? options.stroke : 4 };
        var colorCat = this.colorCat;

        if (options.colorScale || options.colorArray) {
          lineConfig.stroke = (d) => { return colorCat[d[options.id]]; };
          //lineConfig.stroke = this.$colorsService.constructor.getColorScale(options.colorScale.name);
        } else if (options.color !== null && options.color !== undefined) {
          lineConfig.stroke = options.color;
        } 
        
        let xConfig = this.getDefaultXYConfig(this.sectionIndex);
        let yConfig = this.getDefaultXYConfig(this.sectionIndex);

        if (options.x_options && options.x_options.axis === false) {
          xConfig= this.getTransparentXYConfig();
        }
        if (options.y_options && options.y_options.axis === false) {
          yConfig = this.getTransparentXYConfig();
        }
        
        let viz = new d3plus.LinePlot() 
              //.shape({"interpolate":"basis"})      
              .shapeConfig({ 
                labelConfig: {
                  fontFamily: "titulos-observatorio"
                },
                Line: lineConfig
              })
              .legendConfig({ 
                shapeConfig:{
                  labelConfig: {
                    fontColor: this.$colorsService.constructor.assessZebraTitleColor(this.sectionIndex, null, this.$vuetify.theme)
                  }
                }
              })
              .legendConfig({ 
                label: function (d) { return options.legend_field ? d[options.legend_field] : d[options.id] },
                shapeConfig:{
                  labelConfig: {
                    fontColor: this.$colorsService.constructor.assessZebraTitleColor(this.sectionIndex, null, this.$vuetify.theme)
                  }
                }
              })
              .legendPosition("top")
              .xConfig(xConfig)  
              .yConfig(yConfig)
              .tooltipConfig({
                              body: function(d) {
                                return tooltip_function.apply(tooltip_context, [d, route, headers, removed_text_list,options]);
                              },
                              title: function(d) {
                                return "";
                              }
                            })
        
        return viz; 
      }
    }
  }
</script>

<script>
  import * as d3 from 'd3'
  import * as d3plus from 'd3plus'

  import FLPOBaseChart from '../FLPOBaseChart.vue';

  export default {
    extends: FLPOBaseChart,
    methods: {
      prepareChart(viz, slicedDS, containerId, options) {

        if(!options.colorScale && !options.color){ //default
          options.colorScale = {};
          options.colorScale.type = 'divergent';
        }

        if (options.colorScale && (options.colorScale.type == null ||options.colorScale.type == undefined)){
          options.colorScale.type = 'divergent';
        }

        if (options.colorScale){
          let levels = options.colorScale.levels ? options.colorScale.levels : 9;
          let aColorScale
          if (options.colorArray){
            aColorScale = options.colorArray;
            viz = viz.colorScale(options.size);
            viz = viz.colorScaleConfig({
              color: aColorScale,
              axisConfig: this.getTransparentXYConfig(),
              rectConfig: { stroke: this.assessZebraTitleColor(this.sectionIndex) }
            });
            viz = viz.colorScalePosition(options.show_scale ? "right" : false);
          } else {
            if (options.colorScale.color_array){
              viz = viz.color((d) => { return options.colorScale.color_array[d[options.id]]; });
            } else {
              aColorScale = this.$colorsService.getColorScale(options.colorScale.name, options.colorScale.type, options.colorScale.order, levels);
              let distValues = [];
              for (let reg of slicedDS) {  
                if (!distValues.includes(reg[options.size])){
                  distValues.push(reg[options.size]);
                }
                if (distValues.length > 2){
                  break;
                }
              }
              
              // if (distValues.length == 2) {
              if (distValues.length > 1){
                aColorScale = aColorScale.slice(1,-1);
              } else if (distValues.length == 1){
                aColorScale = aColorScale[aColorScale.length-1]; //this.$vuetify.theme.accent;
              }

              if(distValues.length != 1){
                if (options.colorScale) {
                  viz = viz.colorScale(options.size);
                  if(options.colorScale.type == null || options.colorScale.type == undefined){
                    options.colorScale.type = 'divergent';
                  }
                  viz = viz.colorScaleConfig({
                    color: aColorScale,
                    axisConfig: this.getTransparentXYConfig(),
                    rectConfig: { stroke: this.assessZebraTitleColor(this.sectionIndex) }
                  });
                } 
                viz = viz.colorScalePosition(options.show_scale ? "right" : false);
              } else {
                  viz = viz.color((d) => {return aColorScale;});
              }
            }
          }
        } else if (options.color) {
              viz = viz.color((d) => {return options.color;});
        } 

        if (options.parent){
          viz = viz.groupBy([options.parent, options.id]);
          viz = viz.colorScale(options.parent_size ? options.parent_size : options.parent);
        } else {
          viz = viz.groupBy(options.id);
        }

      
        let grafico = viz
            .select(containerId)  // container DIV to hold the visualization
            .data(slicedDS)  // data to use with the visualization
            .label((d) => {
              var label = this.removeFromLabel(
                d[options.text],
                options.removed_text_list
              );
              label = (label == 'null' && options.null_value) ? options.null_value : label; 
              return label;
            })
            .detectResize(true)
            .sum(options.size);        // key to use for x-axis
            
        return grafico;
      },

      generateViz(options){
        let tooltip_function = options.tooltip_function ? options.tooltip_function : this.$tooltipBuildingService.defaultTooltip;
        let headers = this.headers;
        let route = this.$route;
        let removed_text_list = options.removed_text_list;
        
        let viz = new d3plus.Treemap()
              .data({"opacity":0.8})  // data to use with the visualization
              .detectResize(true)
              //.axes({"background": {"color": "transparent" }})
              //.background("transparent")
              .shapeConfig({ 
                labelConfig: {
                  fontFamily: "titulos-observatorio",
                  fontMin: 5,
                  fontMax: 45,
                  fontResize: true
                },
                Rect: {
                  labelConfig: {
                    fontFamily: "titulos-observatorio",
                    fontMin: 5,
                    fontMax: 45,
                    fontResize: true,
                    // fontOpacity: 0.7
                  }
                }
              })
              .legendConfig({ 
                shapeConfig:{
                  labelConfig: {
                    fontColor: this.assessZebraTitleColor(this.sectionIndex)
                  }
                }
              })
              .tooltipConfig({
                  body: function(d) {
                    return tooltip_function(d, route, headers, removed_text_list, options)
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

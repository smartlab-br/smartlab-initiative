<script>
  import * as d3 from 'd3'
  import * as d3plus from 'd3plus';

  import FLPOBaseChart from '../FLPOBaseChart.vue';

  export default {
    extends: FLPOBaseChart,
    created() {
      let colorArray = null;

      if(!this.options.colorScale && !this.options.color && !this.options.colorArray){ //default
        this.options.colorScale = {};
        this.options.colorScale.name = 'Set1';
      }

      if (this.options.colorScale && this.options.colorScale.name) {
        colorArray = this.$colorsService.getColorScale(this.options.colorScale.name, this.options.colorScale.type, this.options.colorScale.order, this.options.colorScale.levels);
      } else if (this.options.colorArray) {
        colorArray = this.options.colorArray;
      }
      
      if (colorArray != null) {
        let colorCat = {};
        let colorIndx = 0;
        for (var indxDS in this.dataset) {
          if (colorCat[this.dataset[indxDS][this.options.id]]) {
            this.dataset[indxDS].color = colorCat[this.dataset[indxDS][this.options.id]];
          } else {
            colorCat[this.dataset[indxDS][this.options.id]] = colorArray[colorIndx];
            this.dataset[indxDS].color = colorArray[colorIndx];
            colorIndx++;
          }
        }
      }
    },
    methods: {
      sortDataset(dataset){
        //array temporário que armazena o índice e o valor para ordenação
        var map = dataset.map(function(d, i) {
          return { index: i, value: parseInt(d.nu_competencia) };
        })
        
        //ordenação do array temporario
        map.sort(function(a, b) {
          return +(a.value > b.value) || +(a.value === b.value) - 1;
        });
        
        //ordenaçao do dataset baseado no array temporário ordenado
        var dataset = map.map(function(d){
          return dataset[d.index];
        });
        
        return(dataset);
      },

      prepareAccumData(dataset) {
        
        var accum = 0
        
        var originalLength = dataset.length;
        var accumIncluded = 0;

        var accumDataType = this.options.accumDataType ? this.options.accumDataType : "inteiro";
        var accumDataPrecision = this.options.accumDataPrecision ? this.options.accumDataPrecision : 1;
        var accumDataCollapse = this.options.accumDataCollapse ? this.options.accumDataCollapse : false;

        for (var i = 0; i < originalLength; i++) { 
          var d = {}; 
          dataset[i].id = 2;
          
          d.cd_indicador = dataset[i].cd_indicador;
          d.ds_indicador_radical = dataset[i].ds_indicador_radical + ' - Acumulado'
          d.ds_agreg_primaria = dataset[i].ds_agreg_primaria + ' - Acumulado'
          d.nu_competencia = dataset[i].nu_competencia;
          d.id = 1
          var vl_indicador = dataset[i].vl_indicador
          d.vl_indicador = accum;
          d.fmt_vl_indicador = this.$numberTransformService.formatNumber(accum, accumDataType, accumDataPrecision, 1, accumDataCollapse, true, false)
          accum = accum + vl_indicador;

          dataset.push(d);
        }
        return(dataset);
      },

      prepareChart(viz, slicedDS, containerId, options) {
        // if (options.show_y_axis !== null && options.show_y_axis !== undefined && options.show_y_axis) {
        //   viz.shapeConfig().labelConfig.width = chartContainer.offsetWidth;
        //   //viz.shapeConfig.labelConfig.width = chartContainer.offsetWidth;
        // }
        
        if (options.accum) {
          slicedDS = this.sortDataset(slicedDS);
          slicedDS = this.prepareAccumData(slicedDS);
        }

        let grafico = viz
            .select(containerId)  // container DIV to hold the visualization
            .data(slicedDS)  // data to use with the visualization
            .label((d) => { //retira label se x < 0 - utilizado na pirâmide
              return (d[options.x] < 0)? "" :  this.$tooltipBuildingService.removeFromLabel(
                d[options.text],
                options.removed_text_list
              );
            })
            .groupBy(options.id)
            .y(options.y)    // key to use for y-axis
            .x(options.x)         // key to use for x-axis
            .detectResize(true);
  
        return grafico;
      },

      generateViz(options){
        let tooltip_function = options.tooltip_function ? options.tooltip_function : this.$tooltipBuildingService.defaultTooltip;
        let tooltip_context = options.tooltip_function ? this : this.$tooltipBuildingService;
        let headers = this.headers;
        let route = this.$route;
        let removed_text_list = options.removed_text_list;

        let barConfig = {
          labelConfig: {
            textAnchor: "left",
            fontFamily: "titulos-observatorio",
            //fontSize: 20
            fontMin: 2,
            fontMax: 20,
            fontResize: true
          }
        };
        
        if (options.label_height !== undefined) {
          barConfig.labelConfig.fontSize = options.label_height
        }

        if (options.orientation != 'vertical') {
          //barConfig.labelConfig.width = document.getElementById(this.id).offsetWidth;
          barConfig.labelConfig.fontColor = "#fff";
        }

        let viz = new d3plus.BarChart()
              //.data({"opacity":0.7})  // data to use with the visualization
              .shapeConfig({ 
                labelConfig: {
                  fontFamily: "titulos-observatorio",
                },
                Bar: barConfig
              })
              .legendConfig({ 
                label: function (d) { return options.legend_field ? d[options.legend_field] : d[options.id] },
                shapeConfig:{
                  labelConfig: {
                    fontSize: 14,
                    fontColor: this.$colorsService.assessZebraTitleColor(this.sectionIndex)
                  }
                }
              })
              .legendPosition("top")
              .tooltipConfig({
                              body: function(d) {
                                return tooltip_function.apply(tooltip_context, [d, route, headers, removed_text_list, options]);
                              },
                              title: function(d) {
                                return "";
                              }
                            })
        
        if (options.color !== null && options.color !== undefined) {
          if(options.color == "accent"){
            let colorAccent = this.$vuetify.theme.accent;
            viz = viz.color(() => { return colorAccent; });
          } else{
            viz = viz.color(() => { return options.color; });
          }
        } else if (options.multi === null || options.multi === undefined || !options.multi) {
          viz = viz.color(function(d) { return (d.color !== null && d.color !== undefined) ? d.color : '#2196F3'; });
        } else {
          viz = viz.colorScaleConfig({
              color: this.$colorsService.getColorScale(options.colorScale.name)
          });           
          viz = viz.color("color");
        } 

        if(options.stacked){
          viz = viz.stacked(true);
        }

        let axisColorDefaultConfig = this.getDefaultXYConfig(this.sectionIndex);
        let axisTransparentConfig = this.getTransparentXYConfig();

        let xConfig = axisColorDefaultConfig;
        let yConfig = axisColorDefaultConfig;

        if (options.show_x_axis !== undefined && options.show_x_axis !== null){ 
          if(!options.show_x_axis) {
            xConfig= axisTransparentConfig;
          }
        } else if (options.orientation == 'vertical'){
          xConfig= axisTransparentConfig;
        }

        if (options.show_y_axis != undefined && options.show_y_axis != null) {
          if(!options.show_y_axis) {
            yConfig= axisTransparentConfig;
          }
        } else if (options.orientation != 'vertical'){
          yConfig= axisTransparentConfig;
        }

        if (options.orientation == 'vertical') {
          viz = viz
            .discrete("x")
            .xConfig(xConfig)
            .yConfig(yConfig)
        } else {
          viz = viz
            .discrete("y")
            .xConfig(xConfig)
            .yConfig(yConfig)
        }

        return viz;
      }
    }
  }
</script>

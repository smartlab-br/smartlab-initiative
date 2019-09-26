<template>
  <v-flex pa-0  fill-height>
    <div :id="id" :ref="id" fill-height style="display:block;">
    </div>
  </v-flex>
</template>

<script>
  import * as d3 from 'd3'

  export default {
    props: ['dataset', 'id', 'options', 'headers', 'sectionIndex',
            'chart_size', 'customParams', 'customFunctions',
            'topology', 'topologyUf', 'structure'],
    data() {
      return {
        generated: false
      }
    },
    mounted: function() {
      if (!this.generated) {
        this.generated = true;
        if (this.structure && this.structure.chart_type != 'MAP_TOPOJSON') {
          this.generateChart(this.dataset, this.options, this.id);
        }
      } 

      //window.addEventListener('resize', this.redrawResize);
    },
    destroyed() {
      if (document.getElementById(this.id)) document.getElementById(this.id).innerHTML = '';
    },
    computed: {
    },
    watch: {
      dataset: function(newVal, oldVal) {
        if (this.structure.chart_type != 'MAP_TOPOJSON') {
          this.generateChart(newVal, this.options, this.id);
        }
      }
    },
    beforeDestroy: function() {
      //window.removeEventListener('resize', this.redrawResize);
    },
    methods: {
      // redrawResize() {
      //   this.redrawChart(this.dataset, this.options, this.id);
      // },
      getSlicedDataset(dataset, options) {
        let slicedDS = dataset;
        if (options !== null && options !== undefined &&
            options.limit !== null && options.limit !== undefined &&
            dataset.length > options.limit) {
          slicedDS = dataset.slice(0, options.limit - 1);
        }
        return slicedDS;
      },

      generateChart(dataset, options, id) {
        if (id && document.getElementById(id)) {
          let chartContainer = document.getElementById(id);
          
          let viz = this.generateViz(this.options);
          viz = this.refineViz(viz, this.options);

          var chart = this.prepareChart(
            viz,
            this.getSlicedDataset(dataset, this.options),
            "#" + id,
            this.options
          );
          // Timeout para garantir que o tamanho do espaço onde o gráfico vai ficar já está definido.
          setTimeout(function(chart) {
                        if (document.getElementById(id)) document.getElementById(id).innerHTML = ''; 
                        chart.render(); 
                      }, 0, chart); 
        }
      },

      refineViz(viz, options) {
        // Definições da legenda
        if (options.hide_legend !== null && options.hide_legend !== undefined && options.hide_legend) {
          viz = viz.legend(false);
        } else if (options.legend !== null && options.legend !== undefined && options.legend) {
          viz = viz.legend({ value: true, filters: true });
        } else if (options.legend !== null && options.legend !== undefined && !options.legend) {
          viz = viz.legend({ value: false});
        }

        if (options.format !== null && options.format !== undefined) {
          viz = viz.format(options.format);
        }

        return viz;
      },

      download() {
        var d3plusExport = require('../node_modules/d3plus-export/build/d3plus-export.min.js');
        let svg = document.getElementById(this.id).getElementsByTagName('svg')[0];
        d3plusExport.saveElement(svg, { filename: this.id });
      },

      // redrawChart(dataset, options, id) {
      //   let slicedDS = this.getSlicedDataset(dataset, options);
      //   let viz = this.viz ? this.viz : this.generateViz(options);

      //   let containerId = "#" + id;
      //   let chartContainer = document.getElementById(id);

      //   setTimeout(function(viz, slicedDS, containerId, options, chartContainer, getSize, prepareChart) {
      //     let sizes = getSize(options, chartContainer);

      //     if (chartContainer !== null && options) {  
      //       chartContainer.innerHTML='';
            
      //       let grafico = prepareChart(viz, slicedDS, containerId, sizes, options);
      //       grafico.render();
            
      //       let vBox = "0 0 " + sizes.width + " " + sizes.height;
      //       setTimeout(function(containerId) {
      //         let svgSelect = containerId + " svg";
      //         let svg = d3.select(svgSelect);
      //         if (svg[0] !== null) {
      //           svg.attr("preserveAspectRatio", "xMinYMin meet")
      //             .attr("viewBox", vBox);
      //         }
      //       }, 50, containerId);
      //     }
      //   }, 50, viz, slicedDS, containerId, options, chartContainer, this.getSize, this.prepareChart);
      // },

      // getSize(options, chartContainer) {
      //   let width = chartContainer.offsetWidth;
      //   let height = chartContainer.offsetHeight;
        
      //   // Caso a altura delimitada pelo espaço disponível no card seja inferior a 300, usa 300.
      //   // if (height < 300) {
      //   //   height = 300;
      //   // }
      //   return { "height": height, "width": width };
      // },

      // Helper functions
      getDefaultXYConfig(sectionIndex) {
        return { 
          gridConfig: { stroke: "transparent" },
          barConfig:   { stroke: this.$colorsService.constructor.assessZebraAxesColor(sectionIndex, this.$vuetify.theme)},
          shapeConfig: {
            labelConfig: {
              fontColor: this.$colorsService.constructor.assessZebraAxesColor(sectionIndex, this.$vuetify.theme)
            },
            stroke: this.$colorsService.constructor.assessZebraAxesColor(sectionIndex, this.$vuetify.theme)
          }
        }
      },

      getTransparentXYConfig() {
        return {
          labels: [],
          gridConfig: {stroke: "transparent"},
          ticks: [],
          barConfig: {"stroke-width": 0}
        }
      },

      clearLabel(d, removed_text_list = [], desc_field = "ds_indicador_radical", year_field = "nu_competencia"){
        var label =  String(d[desc_field]).replace(", " + d[year_field],"").replace("," + d[year_field],"").replace(d[year_field],"").replace("  "," ");
        for(var indxText in removed_text_list){
            label = String(label).replace(removed_text_list[indxText],"");
        }
        return label;
      },
    }
  }
</script>

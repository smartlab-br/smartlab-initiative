<template>
  <v-layout pb-4 pt-2 class="flpo-bullet-ranking">
    <div pt-1 pb-3 :id="id" :ref="id" style="height:300px;width:100%">
    </div>
  </v-layout>
</template>

<script>
  import * as d3 from 'd3'
  import * as d3bullet from 'd3v4-bullet'
  
  export default {
    data () {
      return {
        dataset: {}
      }
    },
    created() {
      this.fillDataStructure(
        this.structure, this.customParams, 
        this.customFunctions, this.autoFillLayout,
        { innerProp: 'dataset' }
      );
    },
    props: ['structure', 'customParams', 'id'],
    mounted: function() {
      // require('../node_modules/d3v4-bullet/build/d3-bullet.min.js');
      this.generateChart(this.dataset);
      //this.redrawChart(this.dataset);

      //window.addEventListener('resize', this.redrawResize);
    },
    beforeDestroy: function() {
      //window.removeEventListener('resize', this.redrawResize);
    },
    methods: {
      sendError(message) {
        this.$emit('showSnackbar', { color : 'error', text: message });
      },
      redrawResize() {
        this.redrawChart(this.dataset);
      },
      
      generateChart(dataset){
        let containerId = "#" + this.id;

        let margin = {top: 0, right: 0, bottom: 0, left: 130};

        let chartContainer = document.getElementById(this.id);
        let width = chartContainer.offsetWidth - margin.left;

        let height = 20;

        chartContainer.style.height = height + "px";

        let grafico = d3bullet.bullet()
          .width(width)
          .height(height);
        
        let data = [
          { title: dataset.title,
            subtitle: dataset.subtitle,
            ranges: [dataset.max],
            measures: [dataset.value],
            markers: [0],
            ticks: [0, dataset.max]
          }
        ]
        
        let svg = d3.select(containerId).append("svg")
          .data(data)
          .attr("class", "bullet")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .call(grafico);

        let title = svg.append("g")
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + height / 2 + ")");

        title.append("text")
            .attr("class", "title")
            .text(function(d) { return d.title; });

        title.append("text")
            .attr("class", "subtitle")
            .attr("dy", "1em")
            .text(function(d) { return d.subtitle; });
      },

      download() {
        var d3plusExport = require('../../node_modules/d3plus-export/build/d3plus-export.min.js');
        let svg = document.getElementById(this.id).getElementsByTagName('svg')[0];
        d3plusExport.saveElement(svg, { filename: this.id });
      },

      redrawChart(dataset) {
        let containerId = this.id;
        let removeFromLabel = this.removeFromLabel;

        setTimeout(function(viz, dataset, containerId, options) {
          let chartContainer = document.getElementById(containerId);

          if (chartContainer !== null && options) {
            let slicedDS = dataset;
            if (options.limit && dataset.length > options.limit) {
              slicedDS = dataset.slice(0, options.limit - 1);
            }

            let width = chartContainer.offsetWidth;
            
            let multiplier = 1;
            if (options.chart_size !== undefined) {
              if (options.chart_size === "small") {
                multiplier = 2;
              }
            } 
            let divider = 1.618 * multiplier;

            let height = chartContainer.offsetWidth / divider;
            chartContainer.style.height = height + "px";
            //chartContainer.style.width = chartContainer.offsetWidth + "px";

            // Empty container
            chartContainer.style.height = height + "px";
            chartContainer.innerHTML='';
            
            let chart = viz
              .select("#" + containerId)  // container DIV to hold the visualization
              .data(slicedDS)  // data to use with the visualization
              .label((d) => { return removeFromLabel(d[options.text],options.removed_text_list); })
              .groupBy(options.id)
              .y(options.y)    // key to use for y-axis
              .x(options.x)         // key to use for x-axis
              .height(height)
              .width(width);

            chart.render();
                    
            setTimeout(function(containerId, width, height) {
              let svgSelect = "#" + containerId + " svg";
              let svg = d3.select(svgSelect);
              if (svg[0] !== null) {
                let vBox = "0 0 " + width + " " + height;
                svg.attr("preserveAspectRatio", "xMinYMin meet")
                  .attr("viewBox", vBox);
              }
            }, 50, containerId, width, height);
          }
        }, 50, this.generateViz(this.options), dataset, containerId, this.options);
      },
    }
  }
</script>

<style>
  .bullet { font: 10px sans-serif; }
  .bullet .marker { stroke: #000; stroke-width: 2px; }
  .flpo-bullet-ranking .bullet .marker { stroke: transparent !important }
  .bullet .tick line { stroke: #666; stroke-width: .5px; }
  .bullet .range.s0 { fill: #eee; }
  .bullet .range.s1 { fill: #ddd; }
  .bullet .range.s2 { fill: #ccc; }
  .bullet .measure.s0 { fill: steelblue; }
  .bullet .title { fill: white; font-size: 12px !important; font-weight: bold; }
  .bullet .subtitle { fill: #999; }
</style>
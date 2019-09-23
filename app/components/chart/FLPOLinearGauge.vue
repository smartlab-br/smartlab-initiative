<template>
  <v-layout column pb-4 px-2>
    <div :id="id" :ref="id" class="linear-gauge" style="width:100%">
    </div>
    <v-layout row wrap
      v-for="marker in markers"
      :key="marker.id">
      <v-flex style="max-width: 2rem">
        <div
          :class="'legend-dot '"
          :style="'background-color: ' + marker.color"
        ></div>
      </v-flex>
      <v-flex text-xs-left>
        {{ marker.legend + ": " + marker.formattedValue }}
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
  import * as d3 from 'd3';

  import FLPOBaseChart from '../FLPOBaseChart.vue';

  export default {
    extends: FLPOBaseChart,
    data () {
      return {
        markers: null,
        range: null,
        svg: null
      }
    },
    created() {
      this.fillDataStructure(
        this.structure, this.customParams,
        this.customFunctions, this.toMarkers
      );
    },
    methods: {
      redrawResize() {
        this.redrawChart(this.markers, this.range);
      },
      toMarkers(base_object_list, rules, structure, addedParams, metadata) {
        let markers = [];
        let maxVal = null;
        let minVal = null;

        for (var eachRow in base_object_list) {
          for (var markerIndx in rules) {
            let formatRules = rules[markerIndx];
            if (rules[markerIndx].format == 'auto') {
              formatRules = this.$textTransformService.getFormatRules(rules[markerIndx], base_object_list[eachRow]);
            }
            
            let marker = {
              id: rules[markerIndx].id,
              value: dataset[eachRow][rules[markerIndx].id],
              formattedValue: this.$numberTransformService.constructor.formatNumber(
                iterArg, formatRules.format, formatRules.precision,
                formatRules.multiplier, formatRules.collapse, formatRules.signed,
                formatRules.uiTags
              ),
              legend: rules[markerIndx].legend
            }

            if (rules[markerIndx].color) {
              marker.color = rules[markerIndx].color;
            } else {
              marker.color = this.$colorsService.constructor.getColorFromCategoricalScale('Set3', markerIndx);
            }
            markers.push(marker);

            if (maxVal === null || maxVal === undefined) {
              maxVal = dataset[eachRow][rules[markerIndx].id];
            } else if (maxVal < dataset[eachRow][rules[markerIndx].id]) {
              maxVal = dataset[eachRow][rules[markerIndx].id];
            }

            if (minVal === null || minVal === undefined) {
              minVal = dataset[eachRow][rules[markerIndx].id];
            } else if (minVal > dataset[eachRow][rules[markerIndx].id]) {
              minVal = dataset[eachRow][rules[markerIndx].id];
            }
          }
        }
          
        this.markers = markers;

        let range = [minVal, maxVal];
        this.range = range;

        this.generateChart(markers, range);
      },
      
      generateChart(markers, range){
        let containerId = "#" + this.id;
        let chartContainer = document.getElementById(this.id);

        let width = chartContainer.offsetWidth;
        let height = null;
        if (this.structure.height) {
          height = this.structure.height;
        } else {
          height = 30;
        }
        chartContainer.style.height = height + "px";

        let gauge_h = 25;

        let svg = d3.select(containerId).append("svg")
          .attr("width", '100%')
          .attr("height", '100%');

        let chart_y_pos = 0;

        svg.append("g")
          .append("rect")
          .attr("x", 0)
          .attr("y", chart_y_pos)
          .attr("width", "100%")
          .attr("height", gauge_h);

        let ticks = svg.append("g");
        for (var i = 0; i <= 20; i++) {
          let tickHeight = i % 5 === 0 ? 8 : 5;
          ticks.append("rect")
            .attr("x", i * (width / 20))
            .attr("y", gauge_h - tickHeight)
            .attr("width", 1)
            .attr("class", "tick")
            .attr("height", tickHeight);
        }

        /****************************************
         * Result
         *****************************************/
        for (var indxMarker in markers) {
          let marker = svg.append("g");
          let markerPos = width * markers[indxMarker].value / range[1];
          
          let xScale = d3.scaleLinear()
            .domain([0,20])
            .range([(markerPos - 15), (markerPos + 15)]);

          let yScale = d3.scaleLinear()
            .domain([0, 20])
            .range([10, 0]);

          let trianglePoints = xScale(1) + ' ' + yScale(20) + ', ' +
            xScale(20) + ' ' + yScale(20) + ', ' +
            xScale(10) + ' ' + yScale(1) + ', ' +
            xScale(10) + ' ' + yScale(1) + ', ' +
            xScale(1) + ' ' + yScale(20);

          marker.append("line")
            .attr("x1", markerPos)
            .attr("y1", chart_y_pos)
            .attr("x2", markerPos)
            .attr("y2", gauge_h + chart_y_pos)
            .attr("stroke-width", 3)
            .attr("stroke", markers[indxMarker].color);

          marker.append('polyline')
            .attr('points', trianglePoints)
            .style('fill', markers[indxMarker].color);

          // marker.append("g")
          //   .append("text")
          //   .attr("x", (markerPos - 5))
          //   .attr("y", text_margins.top)
          //   .attr("style", "font-size: 12;")
          //   .style("fill", this.$colorsService.constructor.assessZebraTitleColor(this.sectionIndex, null, $vuetify.theme))
          //   .text(Math.floor(markerPos));
        }

        this.svg = svg;
      },

      redrawChart(markers, range) {
        // let containerId = "#" + this.id;
        let chartContainer = document.getElementById(this.id);
        
        // Removendo conteúdo anterior
        chartContainer.innerHTML='';

        // Gerando novamente
        this.generateChart(markers, range);
      }
    }
  }
</script>

<style>
  .linear-gauge {
    width: 50%;
    height: 100%;
  }

  .linear-gauge .svg-container {
    display: inline-block;
    position: relative;
    width: 100%;
    padding-bottom: 30%;
    /* aspect ratio */
    vertical-align: bottom;
    overflow: hidden;
  }

  .linear-gauge .svg-content-responsive {
    display: inline-block;
    position: absolute;
    margin-top: 30px;
    left: 0;
  }

  .linear-gauge svg text {
    font-size: 1em;
    font-family: sans-serif;
  }

  .linear-gauge svg rect{
    stroke: gray;
    stroke-width: 1;
    fill: none;
  }

  .legend-dot {
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 0.75rem;
  }
</style>
<template>
  <v-flex pa-0  fill-height>
    <div :id="id" :ref="id" :class="cmpClass" :style="cmpStyle">
    </div>
  </v-flex>
</template>

<script>
  import * as d3 from 'd3'
  
  export default {
    data () {
      return {}
    },
    props: ['dataset', 'id', 'options', 'headers', 'sectionIndex',
            'chart_size', 'customParams', 'customFunctions',
            'structure'],
    computed: {
      cmpStyle: function() {
        if (this.$vuetify.breakpoint.smAndDown) {
          return "height:300px;display:block;width:100%;"
        }
        return "display:block;";
      },
      cmpClass: function() {
        if (this.$vuetify.breakpoint.smAndDown) {
          return "heat-calendar "
        }
        return "heat-calendar fill-height";
      }
    },
    watch: {
      dataset: function(newVal, oldVal) {
        document.getElementById(this.id).innerHTML = '';
        this.generateChart(newVal, this.options, this.id);
      }
    },
    mounted: function() {
      this.generateChart(this.dataset, this.options, this.id);
    },
    methods: {
      generateChart(dataset, options, id) {
        // Preparando os dados, pois o dataset vem quebrado por atributo.
        let df = [];
        let years = [];
        
        for (let eachRow in dataset) {
          let rowYear = parseInt(dataset[eachRow][options.date_field].toString().substring(0,4));
          if (!years.includes(rowYear)) years.push(rowYear);

          df.push({
            day: dataset[eachRow][options.date_field],
            qt: dataset[eachRow][options.value_field],
            sev: (options.colorScale && options.colorScale.order == 'desc') ? dataset[eachRow][options.scale_field] : (1 - dataset[eachRow][options.scale_field])
          });
        }

        let containerId = "#" + id;
        let svg = d3.select(containerId).selectAll("svg");
        svg.remove();

        let day = d3.timeFormat("%w"),
            week = d3.timeFormat("%U"),
            format = d3.timeFormat("%Y-%m-%d");

        var color = d3.scaleQuantize()
          .domain([0.00, 1.00])
          .range(d3.range(9).map(function(d) { return "q" + d + "-9"; }));
          
        //append a new one
        svg = d3.select(containerId).append("svg");

        this.$nextTick(() => {
          let width = document.getElementById(this.id).offsetWidth;
          let height = document.getElementById(this.id).offsetHeight;
          
          let yearHeight = height / years.length,
              cellSize = yearHeight / 8; // cell size

          // Se a largura for mais restritiva, inverte a lógica do
          // tamanho do ano e da célula
          if (width < cellSize * 53) {
            cellSize = width / 53;
            yearHeight = cellSize * 8;
          }

          let vBox = "0 0 " + width + " " + height;
          svg.attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", vBox)
            .classed("svg-content-responsive", true);

          let g = svg.selectAll(".yearG")
            .data(
              d3.range(
                Math.min.apply(null, years),
                Math.max.apply(null, years) + 1
              )
            )
            .enter()
            .append("g")
            .attr("class", "YlOrRd")
            .attr("transform", function(d, i) {
              return "translate(" + ((width - cellSize * 53) / 2) + "," + ((yearHeight - cellSize * 7 - 1) + (yearHeight * i)) + ")";
            });

          g.append("text")
            .attr("class", "yrLbl")
            .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
            .style("text-anchor", "middle")
            .text(function(d) { return d; });

          let rect = g.selectAll(".day")
            .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
            .enter()
            .append("rect")
            .attr("class", "day")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function(d) { return week(d) * cellSize; })
            .attr("y", function(d) { return day(d) * cellSize; })
            .datum(format);

          let rdata = d3.nest()
            .key(function(d) { return d.day; })
            .rollup(function(d) { return d[0]; })
            .map(df);

          rect.append("title").text(
            (d) => { return d + ": " + (rdata['$'+d] ? rdata['$'+d].qt : 0); }
          );

          g.selectAll(".month")
            .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
            .enter()
            .append("path")
            .attr("class", "month")
            .attr("d", function monthPath(t0) {
                        var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                          d0 = +day(t0), w0 = +week(t0),
                          d1 = +day(t1), w1 = +week(t1);
                        return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize +
                                "H" + w0 * cellSize + "V" + 7 * cellSize +
                                "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize +
                                "H" + (w1 + 1) * cellSize + "V" + 0 +
                                "H" + (w0 + 1) * cellSize + "Z";
                      });

          let rdata_keys = Object.keys(rdata);
          g.selectAll(".day")
            .filter(function(d) {
              return rdata_keys.includes('$'+d);
            })
            .attr("class", function(d) { return "day " + color(rdata['$'+d].sev); })
            .select("title")
            .text(
              (d) => { return d + ": " + (rdata['$'+d] ? rdata['$'+d].qt : 0); }
            );
        });
      }
    },
  }
</script>

<style>
  .heat-calendar .svg-content-responsive {
    display: inline-block;
    width: 100%;
  }

  .heat-calendar .day {
    fill: #fff;
    stroke: #ccc;
  }

  .heat-calendar .month {
    fill: none;
    stroke: #000;
    stroke-width: 2px;
  }
  .heat-calendar .YlOrRd .q0-9{fill:#800026}
  .heat-calendar .YlOrRd .q1-9{fill:#bd0026}
  .heat-calendar .YlOrRd .q2-9{fill:#e31a1c}
  .heat-calendar .YlOrRd .q3-9{fill:#fc4e2a}
  .heat-calendar .YlOrRd .q4-9{fill:#fd8d3c}
  .heat-calendar .YlOrRd .q5-9{fill:#feb24c}
  .heat-calendar .YlOrRd .q6-9{fill:#fed976}
  .heat-calendar .YlOrRd .q7-9{fill:#ffeda0}
  .heat-calendar .YlOrRd .q8-9{fill:#ffffcc}

</style>
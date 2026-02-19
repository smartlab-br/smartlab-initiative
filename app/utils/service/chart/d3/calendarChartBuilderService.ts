import * as d3 from "d3"

export class CalendarChartBuilderService {
  quantileStyles: { "q0-9": string; "q1-9": string; "q2-9": string; "q3-9": string; "q4-9": string; "q5-9": string; "q6-9": string; "q7-9": string; "q8-9": string }
  d3: any
  constructor () {
    this.quantileStyles = {
      "q0-9": "#800026",
      "q1-9": "#bd0026",
      "q2-9": "#e31a1c",
      "q3-9": "#fc4e2a",
      "q4-9": "#fd8d3c",
      "q5-9": "#feb24c",
      "q6-9": "#fed976",
      "q7-9": "#ffeda0",
      "q8-9": "#ffffcc"
    }
    this.d3 = d3
  }

  generateChart (containerId: string, dataset: any, options: any, _additionalOptions: any) {
    // Preparando os dados, pois o dataset vem quebrado por atributo.
    const df: {day:number, qt: number, sev: number}[] = []
    const years: number[] = []

    for (const eachRow of dataset) {
      const rowYear: number = parseInt(eachRow[options.date_field].toString().substring(0, 4))
      if (!years.includes(rowYear)) { years.push(rowYear) }

      df.push({
        day: eachRow[options.date_field],
        qt: eachRow[options.value_field],
        sev: (options.colorScale && options.colorScale.order == "desc") ? eachRow[options.scale_field] : (1 - eachRow[options.scale_field])
      })
    }

    const contId: string = "#" + containerId
    let svg = this.d3.select(contId).selectAll("svg")
    svg.remove()

    const day = this.d3.timeFormat("%w")
    const week = this.d3.timeFormat("%U")
    const format = this.d3.timeFormat("%Y-%m-%d")

    const color = this.d3.scaleQuantize()
      .domain([0.00, 1.00])
      .range(this.d3.range(9).map((d: any) => { return "q" + d + "-9" }))

    // append a new one
    svg = this.d3.select(contId).append("svg")

    setTimeout(() => {
      const width = document.getElementById(containerId)!.offsetWidth - 16
      const height = document.getElementById(containerId)!.offsetHeight

      let yearHeight: number = height / years.length
      let cellSize: number = yearHeight / 8 // cell size

      // Se a largura for mais restritiva, inverte a lógica do
      // tamanho do ano e da célula
      if (width < cellSize * 53) {
        cellSize = width / 53
        yearHeight = cellSize * 8
      }

      const vBox: string = "0 0 " + width + " " + height
      svg.attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", vBox)
      // .classed("svg-content-responsive", true);
        .style("display", "inline-block")
        .style("width", "100%")

      const g: any = svg.selectAll(".yearG")
        .data(this.d3.range(Math.min.apply(null, years), Math.max.apply(null, years) + 1))
        .enter()
        .append("g")
        .attr("class", "YlOrRd")
        .attr("transform", (d: any, i: number) => {
          return "translate(" + ((width - cellSize * 53) / 2) + "," + ((yearHeight - cellSize * 7 - 1) + (yearHeight * i)) + ")"
        })

      g.append("text")
        .attr("class", "yrLbl")
        .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
        .style("text-anchor", "middle")
        .text((d: any) => d )

      const timeDays = this.d3.timeDays
      const rect = g.selectAll(".day")
        .data((d: any)=> { return timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)) })
        .enter()
        .append("rect")
        .attr("class", "day")
      // ===== Day class style
        .attr("fill", "#fff")
        .style("stroke", "#ccc")
      // =====
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", (d: any) => { return week(d) * cellSize })
        .attr("y", (d: any) => { return day(d) * cellSize })
        .datum(format)

      const rdata = this.d3.nest()
        .key((d: any) => { return d.day })
        .rollup((d: any) => { return d[0] })
        .map(df)

      rect.append("title").text(
        (d: any) => { return d + ": " + (rdata["$" + d] ? rdata["$" + d].qt : 0) }
      )

      const timeMonths = this.d3.timeMonths
      g.selectAll(".month")
        .data((d: any) => { return timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)) })
        .enter()
        .append("path")
        .attr("class", "month")
      // ===== Month class style
        .attr("fill", "none")
        .style("stroke", "#000")
        .style("stroke-width", "2px")
      // ======
        .attr("d", (t0: any) => { //monthPath
          const t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0)
          const d0 = +day(t0); const w0 = +week(t0)
          const d1 = +day(t1); const w1 = +week(t1)
          return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize +
                                    "H" + w0 * cellSize + "V" + 7 * cellSize +
                                    "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize +
                                    "H" + (w1 + 1) * cellSize + "V" + 0 +
                                    "H" + (w0 + 1) * cellSize + "Z"
        })

      const rdata_keys = Object.keys(rdata)
      const quantileStyles = this.quantileStyles
      g.selectAll(".day")
        .filter((d: any) => { return rdata_keys.includes("$" + d) })
        .attr("class", (d: any) => { return "day " + color(rdata["$" + d].sev) })
      // ===== Day class style
        .attr("fill", (d: any) => { return quantileStyles[color(rdata["$" + d].sev) as keyof typeof quantileStyles] })
      // =====
        .select("title")
        .text((d: any) => { return d + ": " + (rdata["$" + d] ? rdata["$" + d].qt : 0) })
    })
  }
}

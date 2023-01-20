class CalendarChartBuilderService {
  constructor () {
    this.quantileStyles = {
      'q0-9': '#800026',
      'q1-9': '#bd0026',
      'q2-9': '#e31a1c',
      'q3-9': '#fc4e2a',
      'q4-9': '#fd8d3c',
      'q5-9': '#feb24c',
      'q6-9': '#fed976',
      'q7-9': '#ffeda0',
      'q8-9': '#ffffcc'
    }
    this.d3 = require('d3')
  }

  generateChart (containerId, dataset, options, additionalOptions) {
    // Preparando os dados, pois o dataset vem quebrado por atributo.
    const df = []
    const years = []

    for (const eachRow of dataset) {
      const rowYear = parseInt(eachRow[options.date_field].toString().substring(0, 4))
      if (!years.includes(rowYear)) { years.push(rowYear) }

      df.push({
        day: eachRow[options.date_field],
        qt: eachRow[options.value_field],
        sev: (options.colorScale && options.colorScale.order == 'desc') ? eachRow[options.scale_field] : (1 - eachRow[options.scale_field])
      })
    }

    const contId = '#' + containerId
    let svg = this.d3.select(contId).selectAll('svg')
    svg.remove()

    const day = this.d3.timeFormat('%w')
    const week = this.d3.timeFormat('%U')
    const format = this.d3.timeFormat('%Y-%m-%d')

    const color = this.d3.scaleQuantize()
      .domain([0.00, 1.00])
      .range(this.d3.range(9).map(function (d) { return 'q' + d + '-9' }))

    // append a new one
    svg = this.d3.select(contId).append('svg')

    setTimeout(() => {
      const width = document.getElementById(containerId).offsetWidth - 16
      const height = document.getElementById(containerId).offsetHeight

      let yearHeight = height / years.length
      let cellSize = yearHeight / 8 // cell size

      // Se a largura for mais restritiva, inverte a lógica do
      // tamanho do ano e da célula
      if (width < cellSize * 53) {
        cellSize = width / 53
        yearHeight = cellSize * 8
      }

      const vBox = '0 0 ' + width + ' ' + height
      svg.attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', vBox)
      // .classed("svg-content-responsive", true);
        .style('display', 'inline-block')
        .style('width', '100%')

      const g = svg.selectAll('.yearG')
        .data(this.d3.range(Math.min.apply(null, years), Math.max.apply(null, years) + 1))
        .enter()
        .append('g')
        .attr('class', 'YlOrRd')
        .attr('transform', function (d, i) {
          return 'translate(' + ((width - cellSize * 53) / 2) + ',' + ((yearHeight - cellSize * 7 - 1) + (yearHeight * i)) + ')'
        })

      g.append('text')
        .attr('class', 'yrLbl')
        .attr('transform', 'translate(-6,' + cellSize * 3.5 + ')rotate(-90)')
        .style('text-anchor', 'middle')
        .text(function (d) { return d })

      const timeDays = this.d3.timeDays
      const rect = g.selectAll('.day')
        .data(function (d) { return timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)) })
        .enter()
        .append('rect')
        .attr('class', 'day')
      // ===== Day class style
        .attr('fill', '#fff')
        .style('stroke', '#ccc')
      // =====
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('x', function (d) { return week(d) * cellSize })
        .attr('y', function (d) { return day(d) * cellSize })
        .datum(format)

      const rdata = this.d3.nest()
        .key(function (d) { return d.day })
        .rollup(function (d) { return d[0] })
        .map(df)

      rect.append('title').text(
        (d) => { return d + ': ' + (rdata['$' + d] ? rdata['$' + d].qt : 0) }
      )

      const timeMonths = this.d3.timeMonths
      g.selectAll('.month')
        .data(function (d) { return timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)) })
        .enter()
        .append('path')
        .attr('class', 'month')
      // ===== Month class style
        .attr('fill', 'none')
        .style('stroke', '#000')
        .style('stroke-width', '2px')
      // ======
        .attr('d', function monthPath (t0) {
          const t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0)
          const d0 = +day(t0); const w0 = +week(t0)
          const d1 = +day(t1); const w1 = +week(t1)
          return 'M' + (w0 + 1) * cellSize + ',' + d0 * cellSize +
                                    'H' + w0 * cellSize + 'V' + 7 * cellSize +
                                    'H' + w1 * cellSize + 'V' + (d1 + 1) * cellSize +
                                    'H' + (w1 + 1) * cellSize + 'V' + 0 +
                                    'H' + (w0 + 1) * cellSize + 'Z'
        })

      const rdata_keys = Object.keys(rdata)
      const quantileStyles = this.quantileStyles
      g.selectAll('.day')
        .filter(function (d) { return rdata_keys.includes('$' + d) })
        .attr('class', function (d) { return 'day ' + color(rdata['$' + d].sev) })
      // ===== Day class style
        .attr('fill', function (d) { return quantileStyles[color(rdata['$' + d].sev)] })
      // =====
        .select('title')
        .text((d) => { return d + ': ' + (rdata['$' + d] ? rdata['$' + d].qt : 0) })
    })
  }
}

module.exports = CalendarChartBuilderService

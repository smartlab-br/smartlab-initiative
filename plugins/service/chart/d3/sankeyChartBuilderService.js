class SankeyChartBuilderService {
  constructor () {
    this.d3 = require('d3')
    this.d3Sankey = require('d3-sankey')
    this.d3chrom = require('d3-scale-chromatic')
  }

  generateChart (containerId, dataset, options, additionalOptions) {
    const sankey_data = (additionalOptions.metadata && additionalOptions.metadata.sankey_data) ? additionalOptions.metadata.sankey_data : null
    let sankey_nodes = []
    let sankey_links = []
    const flags = []
    if (sankey_data === undefined || sankey_data === null) {
      const source_field = options.source_field ? options.source_field : 'source'
      const target_field = options.target_field ? options.target_field : 'target'
      const value_field = options.value_field ? options.value_field : 'agr_count'

      for (const reg of dataset) {
        sankey_links.push({ source: reg[source_field], target: reg[target_field], agr_count: reg[value_field] })
        if (flags[reg[source_field]] == undefined) {
          flags[reg[source_field]] = true
          sankey_nodes.push(reg[source_field])
        }
        if (flags[reg[target_field]] == undefined) {
          flags[reg[target_field]] = true
          sankey_nodes.push(reg[target_field])
        }
      }
    } else {
      sankey_nodes = sankey_data.nodes
      sankey_links = sankey_data.links
    }
    if (sankey_nodes.length > 0) {
      const lns = sankey_links.map((obj) => {
        const lnk = { source: obj.source, target: obj.target, value: obj.agr_count }
        return lnk
      })
      const nos = sankey_nodes.map((obj) => { return { id: obj, title: obj } })

      const color = this.d3.scaleOrdinal(this.d3chrom.schemeCategory10)

      const height = 700
      const width = document.getElementById(containerId).offsetWidth

      const contId = '#' + containerId
      let svg = this.d3.select(contId).selectAll('svg')
      svg.remove()

      svg = this.d3.select(contId).append('svg')
        .attr('width', width)
        .attr('height', height)

      const sankey = this.d3Sankey.sankey()
        .nodeId(d => d.id)
        .nodeAlign(this.d3Sankey.sankeyRight)
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[0, 5], [width, height - 5]])

      const { nodes, links } = sankey({
        nodes: nos.map(d => Object.assign({}, d)),
        links: lns.map(d => Object.assign({}, d)),
        layout: 32
      })

      svg.append('g')
        .selectAll('rect')
        .data(nodes)
        .join('rect')
        .attr('x', d => d.x0 + 1)
        .attr('y', d => d.y0)
        .attr('height', d => d.y1 - d.y0)
        .attr('width', d => d.x1 - d.x0 - 2)
        .attr('fill', d => color(d.id.replace(/ .*/, '')))
        .append('title')
        .text(d => `${d.title}`)

      const _color = this.d3.color
      const link = svg.append('g')
        .attr('fill', 'none')
        .selectAll('g')
        .data(links)
        .join('g')
        .attr('stroke', d => _color(d.color) || '#dddddd')
        .style('mix-blend-mode', 'multiply')

      link.append('path')
        .attr('d', this.d3Sankey.sankeyLinkHorizontal())
        .attr('stroke-width', d => Math.max(1, d.width))
        .attr('class', 'sankey-link')
        .style('fill', 'none')
        .style('stroke', '#000')
        .style('stroke-opacity', '.2')

      if (options.hide_value) {
        link.append('title')
          .text(d => `${d.source.id} → ${d.target.id}`)
      } else {
        link.append('title')
          .text(d => `${d.source.id} → ${d.target.id}\n${d.value.toLocaleString()}`)
      }

      svg.append('g')
        .style('font', '10px sans-serif')
        .selectAll('text')
        .data(nodes)
        .join('text')
        .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr('y', d => (d.y1 + d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
        .text(d => d.title)
    }
  }
}

module.exports = SankeyChartBuilderService

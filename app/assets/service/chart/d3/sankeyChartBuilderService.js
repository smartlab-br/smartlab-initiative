// import ColorsService from '../../singleton/colorsService'

// import TooltipBuildingService from '../../singleton/tooltipBuildingService'

import * as d3 from 'd3'
import * as d3Sankey from 'd3-sankey'

class SankeyChartBuilderService {
    constructor() {}

    generateChart(containerId, dataset, options, additionalOptions) {
        if (additionalOptions.metadata.sankey_data.nodes.length > 0) {
            let lns = additionalOptions.metadata.sankey_data.links.map(obj =>{ 
                var lnk = {source: obj.source, target: obj.target, value: obj.agr_count};
                return lnk;
            });
            let nos = additionalOptions.metadata.sankey_data.nodes.map(obj =>{ return {id: obj, title: obj}; });

            const color = d3.scaleOrdinal(d3.schemeCategory10);

            let height = 700;
            let width = document.getElementById(containerId).offsetWidth;

            let contId = "#" + containerId;
            let svg = d3.select(contId).selectAll("svg");
            svg.remove();

            svg = d3.select(contId).append("svg")
                .attr("width", width)
                .attr("height", height);

            const sankey = d3Sankey.sankey()
                .nodeId(d => d.id)
                .nodeAlign(d3Sankey.sankeyRight)
                .nodeWidth(15)
                .nodePadding(10)
                .extent([[0, 5], [width, height - 5]]);

            const {nodes, links} = sankey({
                nodes: nos.map(d => Object.assign({}, d)),
                links: lns.map(d => Object.assign({}, d)),
                layout: 32
            });

            svg.append("g")
                .selectAll("rect")
                .data(nodes)
                .join("rect")
                    .attr("x", d => d.x0 + 1)
                    .attr("y", d => d.y0)
                    .attr("height", d => d.y1 - d.y0)
                    .attr("width", d => d.x1 - d.x0 - 2)
                    .attr("fill", d => color(d.id.replace(/ .*/, "")))
                .append("title")
                    .text(d => `${d.title}`);

            const link = svg.append("g")
                .attr("fill", "none")
                .selectAll("g")
                .data(links)
                .join("g")
                .attr("stroke", d => d3.color(d.color) || "#dddddd")
                .style("mix-blend-mode", "multiply");

            link.append("path")
                .attr("d", d3Sankey.sankeyLinkHorizontal())
                .attr("stroke-width", d => Math.max(1, d.width))
                .attr("class", "link")
                .style("fill", "none")
                .style("stroke", "#000")
                .style("stroke-opacity", ".2")

            link.on("mouseover", d => d3.select(this.parentNode).select("path").style("stroke-opacity", ".5"))
                .on("mouseout", d => d3.select(this.parentNode).select("path").style("stroke-opacity", ".2"));

            link.append("title")
                .text(d => `${d.source.id} → ${d.target.id}\n${d.value.toLocaleString()}`);

            svg.append("g")
                .style("font", "10px sans-serif")
                .selectAll("text")
                .data(nodes)
                .join("text")
                .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
                .attr("y", d => (d.y1 + d.y0) / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
                .text(d => d.title);
        }
    }
}

export default SankeyChartBuilderService
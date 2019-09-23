// D3plus-based
import TopoJsonChartBuilderService from './d3plus/topoJsonChartBuilderService'
import LineChartBuilderService from './d3plus/lineChartBuilderService'
import StackedLineChartBuilderService from './d3plus/stackedLineChartBuilderService'
import BarChartBuilderService from './d3plus/barChartBuilderService'
import TreemapChartBuilderService from './d3plus/treemapChartBuilderService'
import ScatterChartBuilderService from './d3plus/scatterChartBuilderService'
import BoxplotChartBuilderService from './d3plus/boxplotChartBuilderService'

// D3-based
import SankeyChartBuilderService from './d3/sankeyChartBuilderService'
import CalendarChartBuilderService from './d3/calendarChartBuilderService'

// Leaflet-based
import BubblesChartBuilderService from './leaflet/bubblesChartBuilderService'
import ClusterChartBuilderService from './leaflet/clusterChartBuilderService'
import HeatChartBuilderService from './leaflet/heatChartBuilderService'
import PolygonsChartBuilderService from './leaflet/polygonsChartBuilderService'

class ChartBuilderService {
    constructor() {}

    static generateChart(type, containerId, dataset, options, additionalOptions = {}) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let container = document.getElementById(containerId);
                if (container) {
                    let builder;
                    container.innerHTML = '';
                    switch (type) {
                        // D3Plus based
                        case 'MAP_TOPOJSON':
                            builder = new TopoJsonChartBuilderService();
                            break;
                        case 'LINE':
                            builder = new LineChartBuilderService();
                            break;
                        case 'STACKED': // Unused
                            builder = new StackedLineChartBuilderService();
                            break;
                        case 'BAR':
                            builder = new BarChartBuilderService();
                            break;
                        case 'TREEMAP':
                            builder = new TreemapChartBuilderService();
                            break;
                        case 'SCATTERPLOT': // Unused
                            builder = new ScatterChartBuilderService();
                            break;
                        case 'BOXPLOT': // Unused
                            builder = new BoxplotChartBuilderService();
                            break;
                        // D3 based
                        case 'CALENDAR': // Unused
                            builder = new CalendarChartBuilderService();
                            break;
                        case 'SANKEYD3': // Unused
                            builder = new SankeyChartBuilderService();
                            break;
                        // Leaflet based
                        case 'MAP_BUBBLES':
                            builder = new BubblesChartBuilderService();
                            break;
                        case 'MAP_CLUSTER':
                            builder = new ClusterChartBuilderService();
                            break;
                        case 'MAP_HEAT':
                            builder = new HeatChartBuilderService();
                            break;
                        case 'MAP_POLYGON': // Unused
                            builder = new PolygonsChartBuilderService();
                            break;
                        default:
                            break;
                    }
                    if (builder) {
                        resolve(builder.generateChart(containerId, dataset, options, additionalOptions));
                    } else {
                        reject("Falha ao gerar o gráfico")
                    }
                }
            }, 0);
        })
    }
}

export default ChartBuilderService
import TopoJsonChartBuilderService from './d3plus/topoJsonChartBuilderService'
import LineChartBuilderService from './d3plus/lineChartBuilderService'
import StackedLineChartBuilderService from './d3plus/stackedLineChartBuilderService'
import BarChartBuilderService from './d3plus/barChartBuilderService'
import TreemapChartBuilderService from './d3plus/treemapChartBuilderService'
import ScatterChartBuilderService from './d3plus/scatterChartBuilderService'
import BoxplotChartBuilderService from './d3plus/boxplotChartBuilderService'

import SankeyChartBuilderService from './d3/sankeyChartBuilderService'
import CalendarChartBuilderService from './d3/calendarChartBuilderService'

class ChartBuilderService {
    constructor() {}

    static generateChart(type, containerId, dataset, options, additionalOptions = {}) {
        setTimeout(() => {
            let container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
                switch (type) {
                    // D3Plus based
                    case 'MAP_TOPOJSON':
                        (new TopoJsonChartBuilderService()).generateChart(containerId, dataset, options, additionalOptions);
                        break;
                    case 'LINE':
                        (new LineChartBuilderService()).generateChart(containerId, dataset, options, additionalOptions);
                        break;
                    case 'STACKED': // Unused
                        (new StackedLineChartBuilderService()).generateChart(containerId, dataset, options, additionalOptions);
                        break;
                    case 'BAR':
                        (new BarChartBuilderService()).generateChart(containerId, dataset, options, additionalOptions);
                        break;
                    case 'TREEMAP':
                        (new TreemapChartBuilderService()).generateChart(containerId, dataset, options, additionalOptions);
                        break;
                    case 'SCATTERPLOT': // Unused
                        (new ScatterChartBuilderService()).generateChart(containerId, dataset, options, additionalOptions);
                        break;
                    case 'BOXPLOT': // Unused
                        (new BoxplotChartBuilderService()).generateChart(containerId, dataset, options, additionalOptions);
                        break;
                    // D3 based
                    case 'CALENDAR': // Unused
                        (new CalendarChartBuilderService()).generateChart(containerId, dataset, options, additionalOptions);
                        break;
                    case 'SANKEYD3': // Unused
                        (new SankeyChartBuilderService()).generateChart(containerId, dataset, options, additionalOptions);
                        break;
                    default:
                        break;
                }
            }
        }, 0);
    }
}

export default ChartBuilderService
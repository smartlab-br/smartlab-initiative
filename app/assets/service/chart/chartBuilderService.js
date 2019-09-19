import TopoJsonChartBuilderService from './d3plus/topoJsonChartBuilderService'
import LineChartBuilderService from './d3plus/lineChartBuilderService'
import BarChartBuilderService from './d3plus/barChartBuilderService'

class ChartBuilderService {
    constructor() {}

    static generateChart(type, containerId, dataset, options, additionalOptions = {}) {
        setTimeout(() => {
            let container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
                switch (type) {
                    case 'MAP_TOPOJSON':
                        (new TopoJsonChartBuilderService()).generateChart(containerId, dataset, options, additionalOptions);
                        break;
                    case 'LINE':
                        (new LineChartBuilderService()).generateChart(containerId, dataset, options, additionalOptions);
                        break;
                    case 'BAR':
                        (new BarChartBuilderService()).generateChart(containerId, dataset, options, additionalOptions);
                        break;
                    default:
                        break;
                }
            }
        }, 0);
    }
}

export default ChartBuilderService
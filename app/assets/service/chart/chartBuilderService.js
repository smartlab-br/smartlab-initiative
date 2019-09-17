import TopoJsonChartBuilderService from './d3plus/topoJsonChartBuilderService'

class ChartBuilderService {
    constructor() {}

    static generateChart(type, containerId, dataset, options, additionalOptions = {}) {
        setTimeout(() => {
            let container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
                switch (type) {
                    case 'MAP_TOPOJSON_JS':
                        (new TopoJsonChartBuilderService()).generateChart(containerId, dataset, options, additionalOptions);
                        break;
                    default:
                        break;
                }
            }
        }, 0);
    }
}

export default ChartBuilderService
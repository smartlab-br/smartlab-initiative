import TopoJsonChartBuilderService from './d3plus/topoJsonChartBuilderService'

class ChartBuilderService {
    constructor() {}

    static generateChart(type, containerId, dataset, options) {
        let container = document.getElementById(containerId);
        if (container) container.innerHTML = '';
        switch (type) {
            case 'MAP_TOPOJSON_JS':
                TopoJsonChartBuilderService.generateChart(containerId, dataset, options);
                break;
            default:
                break;
        }
    }
}

export default ChartBuilderService
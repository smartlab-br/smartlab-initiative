import GeneralChartBuilderService from '../generalChartBuilderService'

class D3PlusChartBuilderService extends GeneralChartBuilderService{
    constructor() {
        super();
    }

    static generateChart(containerId, dataset, options) {
        let container = document.getElementById(containerId);

        if (container) {
            let viz = this.constructor.generateViz(options);
            viz = this.constructor.refineViz(viz, options);
  
            var chart = this.constructor.prepareChart(
              viz,
              this.constructor.getSlicedDataset(dataset, options),
              "#" + containerId,
              options
            );
            // Timeout para garantir que o tamanho do espaço onde o gráfico vai ficar já está definido.
            setTimeout(
                function(chart) {
                    if (document.getElementById(id)) document.getElementById(id).innerHTML = ''; 
                    chart.render(); 
                }, 0, chart); 
        }
    }

    static refineViz(viz, options) {
        // Definições da legenda
        if (options.hide_legend !== null && options.hide_legend !== undefined && options.hide_legend) {
            viz = viz.legend(false);
        } else if (options.legend !== null && options.legend !== undefined && options.legend) {
            viz = viz.legend({ value: true, filters: true });
        } else if (options.legend !== null && options.legend !== undefined && !options.legend) {
            viz = viz.legend({ value: false});
        }

        if (options.format !== null && options.format !== undefined) {
            viz = viz.format(options.format);
        }

        return viz;
    }

    static download(containerId) {
        var d3plusExport = require('../../../../node_modules/d3plus-export/build/d3plus-export.min.js');
        let svg = document.getElementById(containerId).getElementsByTagName('svg')[0];
        d3plusExport.saveElement(svg, { filename: containerId });
    }   
}

export default D3PlusChartBuilderService
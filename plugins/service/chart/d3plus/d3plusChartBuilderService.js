const GeneralChartBuilderService = require('~/plugins/service/chart/generalChartBuilderService');

class D3PlusChartBuilderService extends GeneralChartBuilderService{
    constructor() {
        super();
        this.d3plus = require('d3plus');
    }

    generateChart(containerId, dataset, options, additionalOptions) {
        if (containerId && document.getElementById(containerId)) {
            let viz = this.generateViz(options, additionalOptions);
            viz = this.refineViz(viz, options);
  
            var chart = this.prepareChart(
              viz,
              this.constructor.getSlicedDataset(dataset, options),
              "#" + containerId,
              options,
              additionalOptions
            );
            // Timeout para garantir que o tamanho do espaço onde o gráfico vai ficar já está definido.
            setTimeout(
                function(chart) {
                    if (document.getElementById(containerId)) document.getElementById(containerId).innerHTML = ''; 
                    chart.render(); 
                    return chart;
                }, 0, chart); 
        }
    }

    refineViz(viz, options) {
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

    download(containerId) {
        var d3plusExport = require('d3plus-export/build/d3plus-export.min.js');
        let svg = document.getElementById(containerId).getElementsByTagName('svg')[0];
        d3plusExport.saveElement(svg, { filename: containerId });
    }   
}

module.exports = D3PlusChartBuilderService
import D3PlusChartBuilderService from './d3plusChartBuilderService'

import * as d3plus from 'd3plus'

class BarChartBuilderService extends D3PlusChartBuilderService {
    constructor() {
        super();
    }

    prepareChart(viz, slicedDS, containerId, options, additionalOptions) {
        let colorArray = null;

        if(!options.colorScale && !options.color && !options.colorArray){ //default
            options.colorScale = {};
            options.colorScale.name = 'Set1';
        }

        if (options.colorScale && options.colorScale.name) {
            colorArray = additionalOptions.colorHandlers.getColorScale(options.colorScale.name, options.colorScale.type, options.colorScale.order, options.colorScale.levels);
        } else if (options.colorArray) {
            colorArray = options.colorArray;
        }
        
        if (colorArray != null) {
            let colorCat = {};
            let colorIndx = 0;
            for (let row of slicedDS) {
                if (colorCat[row[options.id]]) {
                    row.color = colorCat[row[options.id]];
                } else {
                    colorCat[row[options.id]] = colorArray[colorIndx];
                    row.color = colorArray[colorIndx];
                    colorIndx++;
                }
            }
        }

        if (options.accum) {
            slicedDS = this.sortDataset(slicedDS);
            slicedDS = this.prepareAccumData(slicedDS, options);
        }
  
        let grafico = viz
            .select(containerId)  // container DIV to hold the visualization
            .data(slicedDS)  // data to use with the visualization
            .label((d) => { //retira label se x < 0 - utilizado na pirâmide
                return (d[options.x] < 0)? "" :  additionalOptions.cleanLabel(d[options.text], options.removed_text_list);
            })
            .groupBy(options.id)
            .y(options.y)    // key to use for y-axis
            .x(options.x)         // key to use for x-axis
            .detectResize(true);

        return grafico;
    }
        
    generateViz(options, additionalOptions) {
        let tooltip_function = additionalOptions.tooltipFunction;
        let tooltip_context = additionalOptions.context ? additionalOptions.context : null;
        let removed_text_list = options.removed_text_list; 

        let barConfig = {
          labelConfig: {
            textAnchor: "left",
            fontFamily: additionalOptions.fontFamily ? additionalOptions.fontFamily : this._fontFamily,
            //fontSize: 20
            fontMin: 2,
            fontMax: 20,
            fontResize: true
          }
        };
        
        if (options.label_height !== undefined) barConfig.labelConfig.fontSize = options.label_height;
        if (options.orientation != 'vertical') barConfig.labelConfig.fontColor = "#fff";

        let viz = new d3plus.BarChart()
              //.data({"opacity":0.7})  // data to use with the visualization
            .shapeConfig({ 
                labelConfig: { fontFamily: additionalOptions.fontFamily ? additionalOptions.fontFamily : this._fontFamily },
                Bar: barConfig
            })
            .legendConfig({ 
                label: function (d) { return options.legend_field ? d[options.legend_field] : d[options.id] },
                shapeConfig:{
                    labelConfig: {
                        fontSize: 14,
                        fontColor: additionalOptions.colorHandlers.assessZebraTitleColor(additionalOptions.sectionIndex, additionalOptions.theme)
                    }
                }
            })
            .legendPosition("top")
            .tooltipConfig({
                body: function(d) {
                    if (tooltip_function instanceof String) {
                        return tooltip_context[tooltip_function].apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options]);
                    } else {
                        return tooltip_function.apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options]);
                    }
                },
                title: function(d) { return ""; }
            });
        
        if (options.color !== null && options.color !== undefined) {
            if(options.color == "accent"){
                let colorAccent = this.$vuetify.theme.accent;
                viz = viz.color(() => { return colorAccent; });
            } else{
                viz = viz.color(() => { return options.color; });
            }
        } else if (options.multi === null || options.multi === undefined || !options.multi) {
            viz = viz.color(function(d) { return (d.color !== null && d.color !== undefined) ? d.color : '#2196F3'; });
        } else {
            viz = viz.colorScaleConfig({
                color: additionalOptions.colorHandlers.getColorScale(options.colorScale.name)
            });           
            viz = viz.color("color");
        } 

        if(options.stacked) viz = viz.stacked(true);

        let xConfig = this.constructor.getDefaultXYConfig(additionalOptions.sectionIndex);
        let yConfig = this.constructor.getDefaultXYConfig(additionalOptions.sectionIndex);

        if (options.show_x_axis !== undefined && options.show_x_axis !== null){ 
            if (!options.show_x_axis) xConfig= this.constructor.getTransparentXYConfig();
        } else if (options.orientation == 'vertical') {
            xConfig= this.constructor.getTransparentXYConfig();
        }

        if (options.show_y_axis != undefined && options.show_y_axis != null) {
            if (!options.show_y_axis) yConfig = this.constructor.getTransparentXYConfig();
        } else if (options.orientation != 'vertical') {
            yConfig = this.constructor.getTransparentXYConfig();
        }

        if (options.orientation == 'vertical') {
          viz = viz
            .discrete("x")
            .xConfig(xConfig)
            .yConfig(yConfig);
        } else {
          viz = viz
            .discrete("y")
            .xConfig(xConfig)
            .yConfig(yConfig);
        }

        return viz;
    }

    // Custom functions
    sortDataset(dataset){
        //array temporário que armazena o índice e o valor para ordenação
        let map = dataset.map((d, i) => { return { index: i, value: parseInt(d.nu_competencia) }; });
        
        //ordenação do array temporario
        map.sort((a, b) => { return +(a.value > b.value) || +(a.value === b.value) - 1; });
        
        //ordenaçao do dataset baseado no array temporário ordenado
        let nuDataset = map.map((d) => { return dataset[d.index]; });
        
        return nuDataset;
    }

    prepareAccumData(dataset, options) {
        var accum = 0
        
        var originalLength = dataset.length;

        var accumDataType = options.accumDataType ? options.accumDataType : "inteiro";
        var accumDataPrecision = options.accumDataPrecision ? options.accumDataPrecision : 1;
        var accumDataCollapse = options.accumDataCollapse ? options.accumDataCollapse : false;

        for (var i = 0; i < originalLength; i++) { 
            var d = {}; 
            dataset[i].id = 2;
            
            d.cd_indicador = dataset[i].cd_indicador;
            d.ds_indicador_radical = dataset[i].ds_indicador_radical + ' - Acumulado'
            d.ds_agreg_primaria = dataset[i].ds_agreg_primaria + ' - Acumulado'
            d.nu_competencia = dataset[i].nu_competencia;
            d.id = 1
            var vl_indicador = dataset[i].vl_indicador
            d.vl_indicador = accum;
            d.fmt_vl_indicador = NumberTransformService.formatNumber(accum, accumDataType, accumDataPrecision, 1, accumDataCollapse, true, false)
            accum = accum + vl_indicador;

            dataset.push(d);
        }

        return dataset;
    }
}

export default BarChartBuilderService
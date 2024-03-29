class GeneralChartBuilderService {
  constructor () {
    this._fontFamily = 'titulos-observatorio'
    this.noDataMessage = 'Não há dados com esses critérios para a localidade selecionada'
    this.loadingMessage = 'Carregando...'
  }

  static getSlicedDataset (dataset, options) {
    let slicedDS = dataset
    if (options !== null && options !== undefined &&
            options.limit !== null && options.limit !== undefined &&
            dataset.length > options.limit) {
      slicedDS = dataset.slice(0, options.limit - 1)
    }
    return slicedDS
  }

  // Helper functions ( TODO move to services)
  static getDefaultXYConfig (axesStrokeClass = '') {
    return {
      title: '',
      gridConfig: { stroke: 'transparent' },
      barConfig: { stroke: axesStrokeClass },
      shapeConfig: {
        labelConfig: { fontColor: axesStrokeClass },
        stroke: axesStrokeClass
      }
    }
  }

  static getTransparentXYConfig () {
    return {
      title: '',
      labels: [],
      gridConfig: { stroke: 'transparent' },
      ticks: [],
      barConfig: { 'stroke-width': 0 }
    }
  }

  static clearLabel (d, removed_text_list = [], desc_field = 'ds_indicador_radical', year_field = 'nu_competencia') {
    let label = String(d[desc_field]).replace(', ' + d[year_field], '').replace(',' + d[year_field], '').replace(d[year_field], '').replace('  ', ' ')
    for (const indxText in removed_text_list) {
      label = String(label).replace(removed_text_list[indxText], '')
    }
    return label
  }
}

module.exports = GeneralChartBuilderService

import ChartBuilderService from '../../assets/service/chart/chartBuilderService'

const SnackbarManager = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        sendError(message) {
          this.$emit('showSnackbar', { color : 'error', text: message });
        },
        openBugDialog(cardTitle){
          this.$emit('showBugDialog', cardTitle);
        },
        chartGen(id, chartType, structure, chartOptions, dataset, metadata, sectionIndex = 0) {
          let validCharts = ['MAP_TOPOJSON', 'LINE', 'STACKED', 'BAR', 'TREEMAP', 'SCATTERPLOT', 'BOXPLOT', 'CALENDAR', 'SANKEYD3'];
          if (structure && chartOptions && validCharts.includes(chartType)) {
            let fnNavigation = this.$navigationManager.constructor.searchAnalysisUnit;
            let fnSendError = this.sendError;    
            let additionalOptions = { 
              idAU: this.selectedPlace ? this.selectedPlace : this.customParams.idLocalidade,
              theme: this.$vuetify.theme,
              sectionIndex: sectionIndex,
              topology: this.topology,
              topologyUf: this.topologyUf,
              headers: structure.headers,
              route: this.$route,
              context: this,
              navigate: {
                fnNav: (router, placeId) => {
                  try {         
                      fnNavigation(router, { id: placeId, to: '/localidade/' + placeId + '?' });
                  } catch (err) {
                      fnSendError(err);
                  }
                },
                openingArgs: [this.$router]
              }
            }
            if (chartType == 'SANKEYD3') additionalOptions.metadata = metadata;
  
            ChartBuilderService.generateChart(
              chartType, 
              id,
              dataset,
              chartOptions,
              additionalOptions
            );
          }
        }
      }
    })
  }
}

export default SnackbarManager;
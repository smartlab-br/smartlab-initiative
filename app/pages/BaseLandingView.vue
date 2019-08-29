<script>
  export default {
    data () {
      return {
        itemBusca: null,
        visibleTitle: true,
        dialog: null
      }
    },
    computed: {
      loadingStatusSearchOptions: function() {
        var minStatus = 'SUCCESS';
        for (var indx in this.statusOption) {
          if (this.statusOption[indx] == 'ERROR') {
            return 'ERROR';
          } else if (this.statusOption[indx] == 'LOADING') {
            minStatus = 'LOADING';
          }
        }
        return minStatus;
      }
    },
    mounted () {
      window.addEventListener('scroll', this.assessVisibleTitle);
    },
    beforeDestroy () {
      window.removeEventListener('scroll', this.assessVisibleTitle);
    },
    methods: {

      assessVisibleTitle() {
        // const vHeight = (window.innerHeight || document.documentElement.clientHeight);
        if (document.getElementById("screenTitle")) {
          var { top, bottom } = document.getElementById("screenTitle").getBoundingClientRect();
          if (top < 0 && bottom - 88 < 0) {
            this.visibleTitle = false;
          } else {
            this.visibleTitle = true;
          }
        } else {
          this.visibleTitle = false;
        }
      },
      
      showDialogContext() {
        this.dialog = true;
      },

      customFilter (item, queryText, itemText) {
        queryText = this.$textTransformService.replaceArgs(queryText).toLowerCase();
        itemText = this.$textTransformService.replaceArgs(itemText).toLowerCase();
        return itemText.indexOf(queryText) > -1 
      },

      openLinkFonte() {
        window.open(this.sourceLink, '_blank');
      },

      openLinkAnalysis() {
        window.open(this.analysisLink, '_blank');
      },

      getClientGeoCallback(info){
        var status = info.city;
        if (status === undefined) {
          this.$emit('showLocationDialog');
          // console.error(info.message);
          // this.sendError("Falha ao determinar a localidade. (Código 2)");
        } else {
          // this.infoGeoIp = info;
          this.$analysisUnitModel.getIdLocalidade(this, info.state, info.city)
            .then(
              (result) => {
                if (result != null) {
                  this.idLocalidade = result.cd_municipio_ibge_dv;
                  this.$analysisUnitModel.setCurrentAnalysisUnit(result.cd_municipio_ibge_dv);
                  this.$emit('alterMiddleToolbar', { "localidade": result });
                } else {
                  this.$emit('showLocationDialog');
                  // console.error("Falha ao consultar API de municípios.");
                  // this.sendError("Não foi possível determinar a localidade IBGE.");
                }
              }
            )
            .catch((error) => { this.$emit('showLocationDialog'); });
        }
      },

      checkCurrentAnalysisUnit() {
        let currAU = this.$analysisUnitModel.getCurrentAnalysisUnit();
        if (this.idObservatorio && this.idObservatorio == 'td' && currAU && currAU.toString().length != 7) {
          this.$emit('showLocationDialog');
        } else if (!currAU) { // Se não houver cookie, invoca o cliente geo_ip
          this.getClientGeo(this.getClientGeoCallback);
        } else {
          this.currentAnalysisUnit = currAU;
        }
      }
    }
  }
</script>

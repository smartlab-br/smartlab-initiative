<script>
  export default {
    data () {
      return {
        itemBusca: null,
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
    methods: {
      showDialogContext() {
        this.dialog = true;
      },

      customFilter (item, queryText, itemText) {
        queryText = this.replaceSpecialCharacters(queryText).toLowerCase();
        itemText = this.replaceSpecialCharacters(itemText).toLowerCase();
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
          this.$analysisUnitModel.getIdLocalidade(this, info.state, info.city, true, this.getIdLocalidadeCallback);
        }
      },

      getIdLocalidadeCallback(idLocalidade) {
        if (idLocalidade != null) {
          this.idLocalidade = idLocalidade.cd_municipio_ibge_dv;
          this.$emit('alterMiddleToolbar', { "localidade": idLocalidade });
        } else {
          this.$emit('showLocationDialog');
          // console.error("Falha ao consultar API de municípios.");
          // this.sendError("Não foi possível determinar a localidade IBGE.");
        }
      }
    }
  }
</script>

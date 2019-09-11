<script>
  import axios from 'axios';
  import BaseLandingView from './BaseLandingView.vue';

  export default {
    extends: BaseLandingView,
    data () {
      return {
        show: false,
        observatorio: null,
        idObservatorio: null,
        slicing: null,
        
        // infoGeoIp: null,
        idLocalidade: null,

        dataset: null,
        cmpTitle: null,
        cmpTitleComment: null,
        customParams: {},
        customFunctions: {
          calc_subtraction: function(a, b) {  return a - b; },
        },
        topology: null,

        dialogMapLoading: false,

        hasOdometers: true,
        loadedOdometers: false,
        reactiveFilter: null
      }
    },
    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      if (this.idObservatorio === null || this.idObservatorio === undefined) {
        this.idObservatorio = this.$observatories.identifyObservatory(this.$route.path.split('/')[1]);
      }

      if (this.idObservatorio) {
        this.loadYaml("br/observatorio/" + this.idObservatorio, this.setObservatorio);
      } else {
        this.setDimensionsArea();

        if (this.$vuetify.breakpoint.smAndDown) {
          this.obsMaxSlice = 11;
          this.obsSlice = 0;
          this.obsSliceSize = 1;
        }
      }
    },
    beforeDestroy: function() {
      window.removeEventListener('resize', this.resizeFirstSection);
    },
    computed: {
      currentParallax: function() {
        return 'background-image:url("/static/parallax/' + this.observatorio.imagem + '.jpg"); background-position: center center; background-size: cover;';
      },
      sourceDesc: function() {
        return this.getSourceDesc(this.observatorio.prevalencia, this.dataset, this.metadata);
      },
      sourceLink: function() {
        return this.getSourceLink(this.observatorio.prevalencia, this.dataset, this.metadata);
      },
      analysisDesc: function() {
        return this.getAnalysisDesc(this.observatorio.prevalencia, this.dataset, this.metadata);
      },
      analysisLink: function() {
        return this.getAnalysisLink(this.observatorio.prevalencia, this.dataset, this.metadata);
      },
      thematicLoaded: function(){
        if (this.observatorio && 
            (
              this.observatorio.tematicos == null || 
              this.observatorio.tematicos == undefined || 
              (
                this.$store.state.gDatasets[this.observatorio.tematicos[this.observatorio.tematicos.length - 1].dataset] &&
                this.$store.state.gDatasets[this.observatorio.tematicos[this.observatorio.tematicos.length - 1].dataset].ds
              )
            )
          ){
          return true;
        } else {
          return false;
        }
      }
    },
    methods: {
      setGroupingAndFiltering(observatorio) {},
      setDimensionsArea() {},
      disableMapTextLoadingInfo() {},
      
      setIdLocalidade(id){
        this.idLocalidade = id;
      },
      
      setObservatorio(content) {   
        let scope = 'brasil';
        let auId = 0;
        let msgErro = 'Falha ao carregar indicadores do Brasil';
      
        let observatorio = content;
        this.$emit('alterToolbar', observatorio.theme.toolbar);
        this.observatorio = observatorio;

        this.getGlobalDataset(
          'centralindicadores',
          'brasil',
          'Falha ao carregar indicadores do Brasil',
          null,
          this.keepLoading
        );

        if (observatorio.tematicos){
          for(let indxTematico in observatorio.tematicos){
            this.getGlobalDataset(observatorio.tematicos[indxTematico].dataset, 
                                  scope,
                                  msgErro,
                                  auId);
          }
        }

        if (observatorio.prevalencia && observatorio.prevalencia.odometers){
          this.hasOdometers = true;
          if (this.idObservatorio == "sst"){
            let url="/sst";
            axios(this.$axiosCallSetupService.getAxiosOdometrosOptions(url, 'ACIDENTOMETROS'))
              .then(result => {
                let odometros = JSON.parse(result.data);
                this.customParams.odometros = odometros;
                this.loadedOdometers = true;
            })
          }
        } else {
          this.hasOdometers = false;
        }

        this.setGroupingAndFiltering(observatorio);

        this.setDimensionsArea();

        if (this.$vuetify.breakpoint.smAndDown) {
          this.obsMaxSlice = 11;
          this.obsSlice = 0;
          this.obsSliceSize = 1;
        }
      },

      keepLoading() {
        if (this.observatorio.prevalencia) {
          this.fillDataStructure(
            this.observatorio.prevalencia.title,
            this.customParams, this.customFunctions,
            this.setComplexAttribute,
            { attribute: 'cmpTitle' }
          );
          this.fillDataStructure(
            this.observatorio.prevalencia.title_comment,
            this.customParams, this.customFunctions,
            this.setComplexAttribute,
            { attribute: 'cmpTitleComment' }
          );
        }
        this.disableMapTextLoadingInfo();
      },
      
      changeToGeoIP(parametro) {
        if (this.idLocalidade) {
          return this.$textTransformService.replaceArgs(parametro, [this.idLocalidade]);
        } else if (this.$analysisUnitModel.getCurrentAnalysisUnit()) {
          return this.$textTransformService.replaceArgs(parametro, [this.$analysisUnitModel.getCurrentAnalysisUnit()]);
        } else {
          return this.$textTransformService.replaceArgs(parametro, [0]);
        }
      },

      setComplexAttribute(base_object_list, rules, structure, addedParams = null, metadata = null) {
        if (typeof base_object_list == 'string') {
          this[addedParams.attribute] = base_object_list;
        } else {
          this[addedParams.attribute] = this.$textTransformService.applyInterpol(
            structure,
            this.customParams,
            this.customFunctions,
            base_object_list[0],
            this.sendInvalidInterpol
          );
          // this[addedParams.attribute] = this.$textTransformService.replaceArgs(
          //   structure.template,
          //   this.$indicatorsModel.indicatorsToValueArray(
          //     structure.args, 
          //     this.customFunctions, 
          //     base_object_list,
          //     this.sendInvalidInterpol
          //   ),
          //   this.sendInvalidInterpol
          // );
        }
      },
    }
  }
</script>

<style>
  .search-group .input-group {
    padding: 0;
  }

  .search-group .input-group__details {
    display: none;
  }
  
  .screen-busca {
    background-color: rgba(256, 256, 256, 0.4);
    border-color: transparent !important;
  }

  .screen-busca.v-select--is-menu-active {
    background-color: rgba(256,256,256,0.7) !important;
  }

  .screen-busca .v-input__slot {
    border-color: transparent !important;
  }

  .screen-busca .v-icon {
    transform: none !important;
    -webkit-transform: none !important;
  }
  .title-comment {
    display: block;
    font-family: Palanquin, Calibri, sans-serif !important;
    font-size: 0.857rem;
    font-weight: 200;
    line-height: 1rem;
    color: rgb(239,97,69);
  }

  .bg-black-transparent {
    background-color: rgba(0,0,0,0.2);
  }
</style>
  
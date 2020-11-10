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
          calc_proportion_ds: function(d,dividendo, divisor) { return divisor==0 ? null:dividendo / divisor; },
          calc_percentage: function(parte,total) { return parte / total * 100},
          calc_date_diff: function(dias, data = new Date()){
              dias = (24*60*60*1000) * dias;
              return new Date(data - dias).toISOString().substring(0,10).replace(/-/g,'\\-');
          },
          format_month_ds: function(d,month_ym){
            return month_ym.substr(4,2) + "/" + month_ym.substr(0,4);
          }
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
        this.idObservatorio = this.$observatories.constructor.identifyObservatory(this.$route.path.split('/')[1]);
      }

      if (this.idObservatorio) {
        this.$yamlFetcherService.loadYaml("br/observatorio/" + this.idObservatorio).then((result) => { 
          this.setObservatorio(result); 
          });
      } else {
        this.setDimensionsArea();

        if (this.$vuetify.breakpoint.smAndDown) {
          this.obsMaxSlice = 11;
          this.obsSlice = 0;
          this.obsSliceSize = 1;
        }
      }
      // let topoFile = "/static/topojson/br-municipio.json";
      // // this['topologyBrLoaded'+ suffix] = true;
      // axios.get(topoFile)
      //   .then(response => {
      //     this['topology'] = response.data;
      //   });
     
    },
    beforeDestroy: function() {
      window.removeEventListener('resize', this.resizeFirstSection);
    },
    computed: {
      currentParallaxMapFile: function() {
        return '/static/parallax/' + this.observatorio.map_image;
      },
      sourceDesc: function() {
        return this.$indicatorsModel.getSourceDesc(this.observatorio.prevalencia, this.dataset, this.metadata);
      },
      sourceLink: function() {
        return this.$indicatorsModel.getSourceLink(this.observatorio.prevalencia, this.dataset, this.metadata);
      },
      analysisDesc: function() {
        return this.$indicatorsModel.getAnalysisDesc(this.observatorio.prevalencia, this.dataset, this.metadata);
      },
      analysisLink: function() {
        return this.$indicatorsModel.getAnalysisLink(this.observatorio.prevalencia, this.dataset, this.metadata);
      },
      thematicLoaded: function(){
        if (this.observatorio && 
            (
              this.observatorio.tematicos == null || 
              this.observatorio.tematicos == undefined || 
              (
                this.$indicatorsModel.getGlobalDatasets()[this.observatorio.tematicos[this.observatorio.tematicos.length - 1].dataset] &&
                this.$indicatorsModel.getGlobalDatasets()[this.observatorio.tematicos[this.observatorio.tematicos.length - 1].dataset].ds
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

      setIdLocalidade(id){
        this.idLocalidade = id;
      },
      
      setObservatorio(content) {   
        let observatorio = content;
        this.$emit('alterToolbar', observatorio.theme.toolbar);
        this.observatorio = observatorio;

        let thematic = ['centralindicadores'];
        if (observatorio && observatorio.tematicos) {
          for(let indxTematico in observatorio.tematicos) {
            thematic.push(observatorio.tematicos[indxTematico].dataset);
          }
        }

        let indicadoresTematicos = this.$indicatorsModel.getMultipleGlobalDatasets(thematic, 'brasil', 0);
        if (indicadoresTematicos instanceof Promise || indicadoresTematicos.then) {
          indicadoresTematicos.then(
            (result) => { this.keepLoading(); },
            (error) => { this.sendError('Falha ao carregar indicadores do Brasil'); });
        } else {
          this.keepLoading();
        }

        if (observatorio.prevalencia && observatorio.prevalencia.odometers){
          this.hasOdometers = true;
          if (this.idObservatorio == "sst"){
            let url="/sst";
            axios(this.$axiosCallSetupService.getAxiosOptions(url, 'ACIDENTOMETROS'))
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
  
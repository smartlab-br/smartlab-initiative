<template>
  <v-layout row wrap class="pa-0">
    <!--   pt-5 px-0 pb-0 mt-2 map_geo_full
    <v-flex fluid grid-list-lg xs12 class="first-section pa-0">
      <v-layout xs12 class="bg-parallax" v-if="observatorio"
        height="auto" :style="currentParallax"></v-layout>
      <v-layout xs12 class="bg-parallax ma-0"></v-layout>
      <v-layout row wrap px-3 class="parallax-content">
        <v-flex id="screenTitle" xs12 class="pb-4 pt-5 my-5 display-2 white--text text-xs-center">
          {{ observatorio ? observatorio.title : '' }}
        </v-flex>
      </v-layout>
    </v-flex>
    -->
    <v-container v-if="observatorio && observatorio.prevalencia" fluid ma-0 pa-0
      :style="'background-color:' + $colorsService.assessZebraBG(0, vuetify.theme) + ';'">
      <v-layout row wrap>
        <v-layout pa-3 row wrap justify-center v-show="mapTextLoading || !thematicLoaded">
          <v-progress-circular
            :size="120"
            :width="8"
            color="primary"
            indeterminate>
            Carregando prevalência nacional
          </v-progress-circular>
        </v-layout>
        <v-flex xs12 md3 v-if="!mapTextLoading && thematicLoaded">
          <v-layout column wrap>
            <v-layout row align-end fill-height wrap pl-3 pt-3 pr-4 class="subheading mb-0">
              <v-flex class="display-1-obs card-title pl-3">
                SmartMap - Modo Avançado
                <v-tooltip v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.infomapa" bottom>
                  <v-icon color="accent"
                    class="pb-1"
                    slot="activator">
                    info
                  </v-icon>
                  <flpo-composite-text
                    :id = "'info_home_prevalencia_' + idObservatorio"
                    :structure="observatorio.prevalencia.infomapa"
                    :custom-params="customParams"
                    :custom-functions="customFunctions">
                  </flpo-composite-text>
                </v-tooltip>
                <div v-if="cmpTitleComment != null" class="title-comment" v-html="cmpTitleComment"></div>
              </v-flex>
              
              <flpo-composite-text
                v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.mapa_filtros"
                :section-class= "'px-2'"
                :id = "'story_home_prevalencia' + idObservatorio"
                :structure="observatorio.prevalencia.mapa_filtros"
                :custom-params="customParams"
                :custom-functions="customFunctions"
                :active-group="activeGroup"
                v-on:selection="triggerSelect">
              </flpo-composite-text>

              <v-layout column wrap>
                <div v-if="sourceDesc && !sourceLink" class="caption pt-2 px-2 pl-3 bottom-30 data-source">Fonte: {{ sourceDesc }}</div>
                <div v-else-if="sourceDesc && sourceLink" class="caption px-2 pt-3 pl-3 bottom-30 data-source">
                  Fonte: 
                  <a class="accent--text" v-on:click="openLinkFonte">{{ sourceDesc }}</a>
                </div>

                <div v-if="analysisDesc && !analysisLink" class="caption pb-3 px-2 pl-3 bottom-30 data-source">Tratamento e análise: {{ analysisDesc }}</div>
                <div v-else-if="analysisDesc && analysisLink" class="caption px-2 pt-3 bottom-30 data-source">
                  Tratamento e análise: 
                  <a class="accent--text" v-on:click="openLinkAnalysis">{{ analysisDesc }}</a>
                </div>
              </v-layout>
            </v-layout>
          </v-layout>
        </v-flex>
        <v-flex xs12 md9>
          <v-layout style="display:block;">
            <v-layout fill-height>
              <flpo-leaflet-map
                v-if="dataset !== null && observatorio && observatorio.prevalencia &&
                      observatorio.prevalencia.chart_type == 'MAP_LEAFLET' &&
                      observatorio.prevalencia.chart_options"
                ref = "chart"
                id = "observatorio_home_prevalencia_map"
                :topology = "topology"
                :dataset = "dataset"
                :options = "observatorio.prevalencia.chart_options"
                :customParams = "customParams"
                :headers = "observatorio.prevalencia.headers">
              </flpo-leaflet-map>
              <!--
              <v-layout pa-3 row wrap justify-center align-center fill-height
                v-show="mapDataLoading">
                <v-progress-circular
                  :size="120"
                  :width="8"
                  color="primary"
                  indeterminate>
                  Analisando municípios
                </v-progress-circular>
              </v-layout>
              -->
            </v-layout>
          </v-layout>
          <!--
          <v-flex xs12>
            <v-layout v-if="observatorio && observatorio.ranking_cards" row wrap pb-2>
              <flpo-ranking-list v-for="(ranking, index) in observatorio.ranking_cards" :key="index"
                :structure="ranking" :customFunctions="customFunctions"
                :customParams="customParams">
              </flpo-ranking-list>
            </v-layout>
          </v-flex>
        -->
        </v-flex>
      </v-layout>
    </v-container>
    <v-dialog :v-if="dialog" v-model="dialog">
      <v-card>
        <v-card-title class="headline-obs">Explicação</v-card-title>
        <v-card-text>
          Esta é uma explicação sobre a diferença entre Indic. PNAD e Municipais. Pode ser em tabs, explicação direta... qualquer layout.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click.native="dialog = false">
            <v-icon left>close</v-icon>
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialogMapLoading"
      hide-overlay
      persistent
      width="100">
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
          <v-layout column pa-0 ma-0 align-center>
          <v-flex class="pb-1">
          Carregando...
          </v-flex>
          <v-flex>
          <v-progress-circular
            indeterminate
            color="accent"
            class="mb-0"
          ></v-progress-circular>
          </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-dialog>    
  </v-layout>
</template>

<script>
  import BaseObservatorioView from './BaseObservatorioView.vue';
  
  export default {
    extends: BaseObservatorioView,
    data () {
      return {
        mapDataLoading: true,
        mapTextLoading: true,
        activeGroup: null
      }
    },
    mounted: function() {
      this.idLocalidade = this.$analysisUnitModel.getCurrentAnalysisUnit();
      this.checkCurrentAnalysisUnit();
    },
    methods: {
      setGroupingAndFiltering(observatorio) {
        if (observatorio.prevalencia) {
          this.fetchMapData();
        }
        if (observatorio.prevalencia && observatorio.prevalencia.default_group){
          this.activeGroup = observatorio.prevalencia.default_group;
        }
        this.customParams.filterUrl = "";
      },

      disableMapTextLoadingInfo() {
        this.mapTextLoading = false;
      },

      triggerSelect(payload) {
        if (payload.type && payload.type === 'switch-group') {
          this.customParams.enabled = payload.enabled;
          if (this.$refs.chart){
            this.$refs.chart.adjustVisibleLayers();
          }
          return;
        } else if (payload.type && payload.type === 'slider') {
          let suffix_params = ""
          if (payload.rules.suffix_params){
            suffix_params = "_" + payload.rules.suffix_params
          }
          if (Array.isArray(payload.value)){
            this.customParams["value_min"+ suffix_params] = payload.value[0];
            this.customParams["value_max"+ suffix_params] = payload.value[1];
          } else {
            this.customParams["value"+ suffix_params] = payload.value;
          }
        } else if (payload.type && payload.type === 'select') {

          //substitui a vírgula e hífen por '\,' '\-'
          let itemValue = null;
          if (payload.item){
            itemValue = payload.item[payload.rules.api.args[0].named_prop];
            if (typeof(itemValue) == "string"){
              itemValue = itemValue.replace(/,/g,"\\,");
              itemValue = itemValue.replace(/-/g,"\\-");
            }
          }

          if (payload.item == null || payload.item == undefined){
            this.customParams[payload.rules.api.args[0].named_prop] = null;
          } else {
            if (payload.rules.filter) {
              this.customParams[payload.rules.api.args[0].named_prop] = itemValue; //payloadItem[payload.rules.api.args[0].named_prop];
              this.customParams[payload.rules.api.args[0].named_prop + "_label"] = payload.item.label;
            }
            else {
              let item = {}
              item[payload.rules.api.args[0].named_prop] = itemValue;
              let grp = {}
              grp[payload.rules.group] = true;
              this.customParams.enabled = grp;
              this.customParams['baseApi'] = this.$textTransformService.applyInterpol(payload.rules.api, item, this.customFunctions, this.customFilters);
            }
          }
        } else if (payload.type && payload.type === 'radio') {
          if (payload.item == null || payload.item == undefined){
            this.customParams.baseApi = null;
          } else {
            this.customParams.baseApi = payload.item.api;
            this.customParams.filterUrl = "";
            this.activeGroup = payload.item.value;
          }
        } else {
          return;
        }
//        let endpoint = "";
//        if (payload.rules && payload.rules.api.template){
//          endpoint = this.$textTransformService.applyInterpol(payload.rules.api, this.customParams, this.customFunctions, this.customFilters);          
//        } else {
//          endpoint = this.applyFilters();
//        }
        let endpoint = this.applyFilters();
        this.fetchMapData(endpoint);
      },

      applyFilters() {

        let apiObject = this.observatorio.prevalencia.api;
        let apiUrl = ""
        if (Array.isArray(apiObject)){
          apiUrl = this.observatorio.prevalencia.api[0].fixed;
        } else {
          apiUrl = this.observatorio.prevalencia.api.fixed;
        }
        if (this.customParams.baseApi){
          apiUrl = this.customParams.baseApi;
        }

        let baseUrl = apiUrl;
        let filterText = "";
        for (let filter of this.observatorio.prevalencia.mapa_filtros) {
          if (filter.group == null || filter.group == undefined || filter.group == this.activeGroup){
            if (filter.type == "slider" || filter.type == "select"){
              if (this.customParams[filter.selection.rules.api.args[0].named_prop] && filter.selection.rules.filter){
                filter.selection.rules.api.template = apiUrl + filter.selection.rules.filter
                apiUrl = this.$textTransformService.applyInterpol(filter.selection.rules.api, {}, this.customFunctions, this.customParams);
                filterText += "<br/>" + (filter.title ? filter.title : filter.label) + ": ";
                if (filter.type == "slider"){
                  if (filter.selection.rules.api.args.length > 1){
                    if (this.customParams[filter.selection.rules.api.args[0].named_prop] != this.customParams[filter.selection.rules.api.args[1].named_prop]) {
                      filterText += this.customParams[filter.selection.rules.api.args[0].named_prop] + " a " + this.customParams[filter.selection.rules.api.args[1].named_prop];
                    }
                  } else {
                    filterText += this.customParams[filter.selection.rules.api.args[0].named_prop];
                  }
                } else {
                  filterText += this.customParams[filter.selection.rules.api.args[0].named_prop + "_label"];
                }
              }
            }
          }
        }

        this.customParams.filterUrl = apiUrl.replace(baseUrl,"");
        this.customParams.filterText = filterText;


        let aApiUrl = [apiUrl];
        if (Array.isArray(apiObject)){
          for (let i = 1; i < apiObject.length; i++){
            aApiUrl.push(apiObject[i].fixed + this.customParams.filterUrl);
          }
          return aApiUrl;
        } else {
          return apiUrl;
        }

      },

      fetchMapData(endpoint = null) {
        this.dialogMapLoading = true;
        this.fillDataStructure(
          this.observatorio.prevalencia,
          this.customParams, this.customFunctions,
          this.setDataset,
          { "endpoint": endpoint,
            "fnCallback": () => { this.mapDataLoading = false;  this.dialogMapLoading = false;}
          },
        );
      }
    }
  }
</script>
  
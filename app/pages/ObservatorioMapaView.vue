<template>
  <v-layout row wrap class="pa-0">
    <!--   pt-5 px-0 pb-0 mt-2 map_geo_full
    <v-flex fluid grid-list-lg xs12 overflow-hidden class="first-section pa-0">
      <v-layout xs12 class="bg-zoom bg-parallax" v-if="observatorio"
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
      :style="'background-color:' + $colorsService.constructor.assessZebraBG(0, $vuetify.theme) + ';'">
      <v-layout row wrap>
        <v-flex sm12 md4 lg3 >
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
                :custom-filters="customParams"
                :reactive-filter="reactiveFilter"
                :active-group="activeGroup"
                v-on:selection="triggerSelect"
                v-on:default-selection="triggerDefaultSelect"
                @showSnackbar="snackAlert">
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
        <v-flex sm12 md8 lg6>
          <v-layout style="display:block;">
            <v-layout fill-height>
              <v-layout fill-height
                v-if="dataset !== null && observatorio && observatorio.prevalencia &&
                  observatorio.prevalencia.chart_type == 'MAP_BUBBLES' && observatorio.prevalencia.chart_options"
                ref = "chartRef"
                :class = "leafletBasedCharts.includes(observatorio.prevalencia.chart_type) ? 'map_geo' : ''"
                id="observatorio_home_prevalencia_map">
              </v-layout>
            </v-layout>
          </v-layout>
        </v-flex>
        <v-flex sm12 md12 lg3>
          <flpo-composite-text
            v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.mapa_description_right"
            :id = "'story_home_prevalencia_desc_map_r_' + idObservatorio"
            :structure="observatorio.prevalencia.mapa_description_right"
            :custom-params="customParams"
            :custom-functions="customFunctions"
            :custom-filters="customParams"
            :reactive-filter="reactiveFilter"
            :active-group="activeGroup"
            v-on:selection="triggerSelect"
            v-on:default-selection="triggerDefaultSelect"
            @showSnackbar="snackAlert">
          </flpo-composite-text>
          <!--<v-layout px-4 v-if="customParams.filterText" v-html="'<b>Filtros:</b>' + customParams.filterText">
          </v-layout>-->
        </v-flex>
        
      </v-layout>
    </v-container>

    <!-- Sparklines -->
    <v-container v-if="observatorio && observatorio.sparklines" fluid ma-0 pa-0
      :style="'background-color:' + $colorsService.constructor.assessZebraBG(0, $vuetify.theme) + ';'">
      <v-flex class="display-1-obs card-title pa-4">
        {{ observatorio.sparklines.title }} 
      </v-flex>          
      <flpo-sparklines
        :dataset = "dataset"
        :structure = "observatorio.sparklines">
      </flpo-sparklines>
    </v-container>

    <!-- Dialogs -->
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
        activeGroup: null,
        chartHandler: null
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

      setFilter(payload) {

        //Limpa filtros dos selects que tem payload como pai (parent)
        for (let item of this.observatorio.prevalencia.mapa_filtros) {
          if (item.type &&  item.type == "select" && payload.id.includes(item.parent)){
            this.customParams[item.selection.rules.api.args[0].named_prop] = null;
          }
        }

        if (payload.type && payload.type === 'switch-group') {
          this.customParams.enabled = payload.enabled;
          if (this.chartHandler) this.chartHandler.adjustVisibleLayers(payload.enabled);
          return false;
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


          let item_value = "";
          let value = "";
          let value_label = "";
          if (payload.item == null || payload.item == undefined){
            this.customParams[payload.rules.api.args[0].named_prop] = null;
          } else {
            if (Array.isArray(payload.item)){
              let i = 0
              for (let item of payload.item){
                item_value = item[payload.rules.api.args[0].named_prop];
                if(typeof item_value === 'string'){
                  //substitui a vírgula e o hífen por '\,' e '\-'
                  item_value = item_value.replace(/,/g,"\\,"); 
                  item_value = item_value.replace(/-/g,"\\-"); 
                
                  if (i == 0) {
                    value += "'" + item_value + "'";
                    value_label += item.label;
                  } else {
                    value += "-'" + item_value + "'";
                    value_label += ", " + item.label;
                  }
                } else {
                  if (i == 0) {
                    value += item_value;
                    value_label += item.label;
                  } else {
                    value += "-" + item_value;
                    value_label += ", " + item.label;
                  }
                }
                i++;
              }
            } else {
              item_value = payload.item[payload.rules.api.args[0].named_prop];
              if(typeof item_value === 'string'){
                //substitui a vírgula e o hífen por '\,' e '\-'
                item_value = item_value.replace(/,/g,"\\,"); 
                item_value = item_value.replace(/-/g,"\\-"); 
              }
              value = item_value;
              value_label = payload.item.label;
            }
          }

          if (payload.rules.filter) {
              this.customParams[payload.rules.api.args[0].named_prop] = value;
              this.customParams[payload.rules.api.args[0].named_prop + "_label"] = value_label;
          }
          else {
            let item = {}
            item[payload.rules.api.args[0].named_prop] = value;
            this.customParams[payload.rules.api.args[0].named_prop] = value;
            let grp = {}
            grp[payload.rules.group] = true;
            this.customParams.enabled = grp;
            this.customParams.baseApi = this.$textTransformService.applyInterpol(payload.rules.api, item, this.customFunctions, this.customParams);
          }

        } else if (payload.type && payload.type === 'radio') {
          if (payload.item == null || payload.item == undefined){
            this.customParams.baseApi = null;
          } else {
            this.customParams.baseApi = payload.item.api;
            this.customParams.filterUrl = "";
            this.activeGroup = payload.item.value;
          }
        }
        return true;
//        let endpoint = "";
//        if (payload.rules && payload.rules.api.template){
//          endpoint = this.$textTransformService.applyInterpol(payload.rules.api, this.customParams, this.customFunctions, this.customParams);          
//        } else {
//          endpoint = this.applyFilters();
//        }
      },

      triggerSelect(payload) {
        if (this.setFilter(payload)){
          let endpoint = this.applyFilters();
          let payload_item = payload.item ? payload.item : payload.value;
          if (payload_item == undefined || payload_item == null){
            let empty_item = {}
            empty_item[payload.id] = 'empty';
            this.reactiveFilter = empty_item;
          } else {
            this.reactiveFilter = payload_item;
          }
          this.fetchMapData(endpoint);
        }
      },
      
      triggerDefaultSelect(payload) {
        this.setFilter(payload);
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
                    } else {
                      filterText += this.customParams[filter.selection.rules.api.args[0].named_prop];
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
        // this.reactiveFilter = apiUrl + this.customParams.filterUrl;


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
            "fnCallback": this.triggerChartUpdates
          },
        );
      },

      triggerChartUpdates() {
        if (this.chartHandler) {
          this.chartRegen(
            this.chartHandler,
            "observatorio_home_prevalencia_map",
            this.observatorio.prevalencia.chart_type,
            this.observatorio.prevalencia,
            this.observatorio.prevalencia.chart_options,
            this.dataset,
            this.metadata,
            this.sectionIndex
          ).then(
            (chartHandler) => { this.sendChartLoaded(chartHandler); },
            (reject) => { this.sendError(reject); }
          );
        } else {
          this.chartGen(
            "observatorio_home_prevalencia_map",
            this.observatorio.prevalencia.chart_type,
            this.observatorio.prevalencia,
            this.observatorio.prevalencia.chart_options,
            this.dataset,
            this.metadata
          ).then(
            (chartHandler) => { this.sendChartLoaded(chartHandler); },
            (reject) => { this.sendError(reject); }
          );
        }
      },

      sendChartLoaded(chartHandler) {
        this.chartHandler = chartHandler;
        this.mapDataLoading = false;
        this.dialogMapLoading = false;
      }
    }
  }
</script>
  
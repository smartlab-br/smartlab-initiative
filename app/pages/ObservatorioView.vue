<template>
  <v-layout row wrap class="pa-0">
    <v-flex fluid grid-list-lg xs12 class="first-section pa-0" :style="displayHeight">
      <v-layout xs12 class="bg-parallax" v-if="observatorio"
        height="auto" :style="currentParallax"></v-layout>
      <v-layout xs12 class="bg-parallax ma-0"></v-layout>
      <v-layout row wrap px-3 justify-center class="parallax-content">
        <v-flex shrink>
          <v-flex id="screenTitle">
            <!--
            <v-flex v-if="observatorio.new" xs12 class="pb-0 pt-0 mb-0 title ubuntu white--text text-xs-left">
              <span class="soon">Novo</span>
            </v-flex>
            {{ observatorio ? observatorio.title_sup : '' }}
          </v-flex>
          <v-flex id="screenTitle" xs12 class="pb-0 pt-0 my-0 display-title ubuntu screen-title white--text text-xs-center">
            {{ observatorio ? observatorio.title : '' }}
            -->
            <v-layout 
              :class="{'pa-1 ma-1': $vuetify.breakpoint.xsOnly, 
                       'pa-2 ma-2': $vuetify.breakpoint.smOnly, 
                       'pa-3 ma-3': $vuetify.breakpoint.mdOnly, 
                       'pa-4 ma-4': $vuetify.breakpoint.lgAndUp }">
              <img 
                  :src="'/static/smartlab/' + (observatorio ? observatorio.imagem.concat('.svg') : '')"
                  :alt="(observatorio ? observatorio.title : '')"
                  width="100%"
              />
            </v-layout>
          </v-flex>
          <!--
          <v-flex id="screenTitleSub" xs12 class="pb-4 pt-0 mb-3 headline ubuntu white--text text-xs-right">
            {{ observatorio ? observatorio.title_sub : '' }}
          </v-flex>
          -->
        </v-flex>
      </v-layout>
      <v-layout px-5 pb-5 mb-5
        :class="{'mx-5': $vuetify.breakpoint.smAndUp, 'mx-0': $vuetify.breakpoint.xsOnly}">
        <v-layout row wrap :v-if="dims && $store && $store.state && $store.state.favLocation" >
          <v-flex v-for="(dimension, indxDim) in dims" :key="dimension.id"
            :class="'pa-3 ' + slicing">
            <!--
              :media = "dimension.media"
              :icon = "dimension.icon"
              :app-icon = "dimension.appIcon"
              icon-color = "white"
              :bg-color = "$vuetify.theme.secondary"
            -->
            <flpo-linked-view-card
              :index-tab = "30 + indxDim"
              :tagColor = "dimension.tagColor"
              :ripple-color = "$vuetify.theme.primary"
              :status = "dimension.status"
              :to = "changeToGeoIP(dimension.to)"
              :external = "dimension.external"
              :title = "dimension.label"
              :title-color = "'white'"
              :detail = "dimension.sub">
            </flpo-linked-view-card>
          </v-flex>
        </v-layout>
      </v-layout>
    </v-flex>
    <!--
    <v-container fluid ma-0 pa-0 grey darken-4>
      <flpo-articles-highlights :show-title="true">
      </flpo-articles-highlights>
    </v-container>
    -->
    <v-container v-if="observatorio.prevalencia" fluid ma-0 pa-0
      :style="'background-color:' + assessZebraBG(0) + ';'">
      <v-layout row wrap>
        <!--
        <v-layout pa-3 row wrap justify-center v-show="mapTextLoading || !thematicLoaded">
          <v-progress-circular
            :size="120"
            :width="8"
            color="primary"
            indeterminate>
            Carregando prevalência nacional
          </v-progress-circular>
        </v-layout>
        -->
        <v-flex pt-0 sm12 v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.odometers">
          <v-layout column>
            <v-flex pa-0 class="headline-obs text-xs-center"
              :style="'background-color:' + (observatorio.prevalencia.odometers.bg_color ? observatorio.prevalencia.odometers.bg_color : 'black') + 
                      ';color:'+ (observatorio.prevalencia.odometers.title_font_color ? observatorio.prevalencia.odometers.title_font_color : 'white')">
              {{ observatorio.prevalencia.odometers.title }}
            </v-flex>
            <flpo-odometer 
              :odometer-items="observatorio.prevalencia.odometers.odometer_items"
              :comment-title="observatorio.prevalencia.odometers.comment_title"
              :title-font-color="observatorio.prevalencia.odometers.title_font_color"
              :bg-color="observatorio.prevalencia.odometers.bg_color">
            </flpo-odometer>
          </v-layout>
          <!--
          <flpo-composite-text
            v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.odometers"
            :id = "'story_home_prevalencia_desc_odo_' + idObservatorio"
            :structure="observatorio.prevalencia.odometers"
            :custom-params="customParams"
            :custom-functions="customFunctions">
          </flpo-composite-text>
          -->
        </v-flex>

        <v-flex sm12 md3>
          <v-layout column wrap>
            <v-layout row align-end fill-height wrap pl-3 pt-3 pr-4 class="subheading mb-0" 
              v-on:mousedown="!mapEnabled ? dialogMapLoading = true : dialogMapLoading = false"
              v-on:click="enableMap">
              <v-flex class="headline-obs card-title pb-0 pl-3">
                {{ cmpTitle ? cmpTitle : '' }}
                <v-tooltip v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.info" bottom>
                  <v-icon color="accent"
                    class="pb-1"
                    slot="activator">
                    info
                  </v-icon>
                  <flpo-composite-text
                    :id = "'info_home_prevalencia_' + idObservatorio"
                    :structure="observatorio.prevalencia.info"
                    :custom-params="customParams"
                    :custom-functions="customFunctions">
                  </flpo-composite-text>
                </v-tooltip>
                <div v-if="cmpTitleComment != null" class="title-comment" v-html="cmpTitleComment"></div>
              </v-flex>
              
              <flpo-composite-text
                v-if="observatorio && observatorio.prevalencia"
                :section-class= "'px-2 py-0'"
                :id = "'story_home_prevalencia' + idObservatorio"
                :structure="observatorio.prevalencia.description"
                :custom-params="customParams"
                :custom-functions="customFunctions"
                v-on:selection="triggerSelect">
              </flpo-composite-text>

              <v-layout column wrap pl-2>
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

              <flpo-composite-text
                v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.footer"
                :section-class= "'py-0'"
                :id = "'story_home_prevalencia_footer_' + idObservatorio"
                :structure="observatorio.prevalencia.footer"
                :custom-params="customParams"
                :custom-functions="customFunctions">
              </flpo-composite-text>

            </v-layout>
          </v-layout>
        </v-flex>

        <v-flex sm12 md6 pt-4 style="position:relative">
          <!--
          <v-layout justify-end ma-0 pa-0>
            <v-btn small flat
              v-on:click="pushRoute('/observatoriomapa/'+idObservatorio)">
              <span>SmartMap - Modo Avançado</span>
              <v-icon right>public</v-icon>
            </v-btn>
          </v-layout>
          -->
          <v-layout xs12 class="cursor-pointer" v-if="observatorio" v-on:mousedown="dialogMapLoading = true"
            height="auto" v-show="!mapEnabled">
              <v-img
              :src="currentParallaxFile"
              :aspect-ratio="observatorio.prevalencia.chart_options.height_proportion ? observatorio.prevalencia.chart_options.height_proportion : 1"
              >
              <v-layout class="bg-black-transparent pa-3 justify-end subheading fill-height" v-on:click="enableMap">
                Clique no mapa para ativá-lo
              </v-layout>
              </v-img>
          </v-layout>
          <v-layout v-show="mapEnabled" style="position:absolute;z-index:2;right:10px" class="cursor-pointer pa-3 justify-end subheading" v-on:click="pushRoute('/'+identifyObservatoryById(idObservatorio)+'/smartmap')">
            Clique para modo avançado - SmartMap
          </v-layout>
          <flpo-leaflet-map
            v-if="dataset !== null && observatorio && observatorio.prevalencia &&
                  observatorio.prevalencia.chart_type == 'MAP_LEAFLET' &&
                  observatorio.prevalencia.chart_options &&  mapEnabled"
            ref = "chart"
            id = "observatorio_home_prevalencia_map"
            :topology = "topology"
            :dataset = "dataset"
            :options = "observatorio.prevalencia.chart_options"
            :customParams = "customParams"
            :headers = "observatorio.prevalencia.headers"
            v-on:map-loaded="mapLoaded">
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
          <v-flex xs12>
            <v-layout v-if="observatorio && observatorio.ranking_cards" row wrap pb-2>
              <flpo-ranking-list v-for="(ranking, index) in observatorio.ranking_cards" :key="index"
                :structure="ranking" :customFunctions="customFunctions"
                :customParams="customParams">
              </flpo-ranking-list>
            </v-layout>
            <flpo-composite-text
              v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.description_bottom"
              :id = "'story_home_prevalencia_desc_b_' + idObservatorio"
              :structure="observatorio.prevalencia.description_bottom"
              section-class = 'pa-0'
              :custom-params="customParams"
              :custom-functions="customFunctions">
            </flpo-composite-text>
          </v-flex>
        </v-flex>

        <v-flex sm12 md3>
          <flpo-composite-text
            v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.description_right && 
                  (!hasOdometers || loadedOdometers)"
            :id = "'story_home_prevalencia_desc_r_' + idObservatorio"
            :structure="observatorio.prevalencia.description_right"
            :custom-params="customParams"
            :custom-functions="customFunctions">
          </flpo-composite-text>
        </v-flex>

      </v-layout>
    </v-container>

    <v-layout text-xs-center pa-0 ma-0
      class="footer-nav white--text">
      <v-layout row wrap caption class="cursor-pointer">
        <v-layout column scroll-menu v-if="!isPageBottom" pa-2
          v-on:click="scrollDown()">
          Leia mais
          <v-icon dark>keyboard_arrow_down</v-icon>
        </v-layout>
        <v-layout column scroll-menu v-if="isPageBottom" pa-2
          v-on:click="scrollTop()">
          <v-icon dark>keyboard_arrow_up</v-icon>
          Para o topo
        </v-layout>
       </v-layout>
    </v-layout>

    <!--
    <v-container fluid ma-0 pa-5 :style="'background-color:' + assessZebraBG(1) + ';'">
      <v-layout row wrap text-xs-center pb-5>
        <div class="flex display-1-obs">Realização</div>
      </v-layout>
      <v-layout row wrap align-center>
        <v-flex xs12 sm6 text-xs-center my-2>
          <img src="/static/orgs/mpt.png" alt="Ministério Público do Trabalho"/>
        </v-flex>
        <v-flex xs12 sm6 text-xs-center my-2>
          <img src="/static/orgs/smart_lab_barra_superior_letra_branca.png" alt="Smartlab"/>
        </v-flex>
      </v-layout>
    </v-container>
    -->
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
  import axios from 'axios';

  export default {
    extends: BaseObservatorioView,
    data () {
      return {
        displayHeight: "auto",
        dims: null,
        mapEnabled: false,
        isPageBottom: true,
        hasOdometers: true,
        loadedOdometers: false
      }
    },
    mounted: function() {
      this.resizeFirstSection();
      window.addEventListener('resize', this.resizeFirstSection);
      window.addEventListener('scroll', this.assessPageBottom);
      this.assessPageBottom();
      this.idLocalidade = this.$store.state.favLocation;
      this.mapEnabled = false;
      this.checkFavoriteAnalysisUnit();
      if (this.observatorio.prevalencia && this.observatorio.prevalencia.odometers){
        this.hasOdometers = true;
      } else {
         this.hasOdometers = false;
      }
      if (this.observatorio.prevalencia && this.observatorio.prevalencia.odometers){
        if (this.idObservatorio == "sst"){
          let url="/sst";
          axios(this.getAxiosOdometrosOptions(url))
            .then(result => {
              let odometros = JSON.parse(result.data);
              this.customParams.odometros = odometros;
              this.loadedOdometers = true;
          })
        }
      }
      
    },
    beforeDestroy () {
      window.removeEventListener('scroll', this.assessPageBottom);
    },
    computed: {
      currentParallaxFile: function() {
        return '/static/parallax/' + this.observatorio.imagem + '.jpg';
      }
    },
    methods: {
      assessPageBottom() {
        this.isPageBottom = false;
        if (window && document) {
          if (window.scrollY == 0){ //início
            this.isPageBottom = false;
          }
          else{
            this.isPageBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight-1;
          }
        } 
      },

      scrollDown(){
        window.scrollBy(0, window.innerHeight / 2);        
      },

      scrollTop(){
        window.scrollTo(0,0);
      },

      resizeFirstSection(){
        if (this.$vuetify.breakpoint.smAndDown){
          this.displayHeight = "auto";
        } else {
          this.displayHeight = "min-height:" + (window.innerHeight - 64) + "px";
        }
        
      },

      enableMap(){
        if (!this.mapEnabled){
          this.fetchMapData();        
        }
      },

      mapLoaded(){
        this.dialogMapLoading = false;
      },

      setDimensionsArea() {
        this.dims = this.getDimensions(this.idObservatorio);

        switch (this.dims.length) {
          case 12:
            this.slicing = "xs12 sm6 md4";
            break;
          case 10:
            this.slicing = "xs12 sm6 md4 xl3";
            break;
          case 9:
            this.slicing = "xs12 sm6 md4";
            break;
          case 8:
            this.slicing = "xs12 sm6 lg3";
            break;
          case 6:
            this.slicing = "xs12 sm6 md4";
            break;
          case 4:
            this.slicing = "xs12 sm6";
            break;
          case 3:
            this.slicing = "xs12 sm6 md4";
            break;
          case 2:
            this.slicing = "xs12 sm6";
            break;
          case 1:
            this.slicing = "xs12";
            break;
          default:
            this.slicing = "xs12 sm6 md4 xl2";
            break;
        }
      },

      triggerSelect(payload) {
        if (payload.type && payload.type === 'switch-group') {
          this.customParams.enabled = payload.enabled;
          if (this.$refs.chart){
            this.$refs.chart.adjustVisibleLayers();
          }
        } else if (payload.type && payload.type === 'radio') {
          if (payload.item == null || payload.item == undefined){
            this.customParams.radioApi = null;
          } else {
            this.customParams.radioApi = payload.item.api;
            this.activeGroup = payload.item.value;
            this.fetchMapData(payload.item.api);
          }
        } else {
          var endpoint = this.applyInterpol(payload.rules.api, this.customParams, this.customFunctions, payload.item);
          this.fetchData(endpoint);
        }
      },

      fetchMapData(endpoint = null) {
        this.fillDataStructure(
          this.observatorio.prevalencia,
          this.customParams, this.customFunctions,
          this.setDataset,
          { "endpoint": endpoint,
            "fnCallback": () => { this.mapEnabled = true}
          },
        );
      }
    }
  }
</script>
  

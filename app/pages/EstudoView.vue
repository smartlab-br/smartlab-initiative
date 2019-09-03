<template>
  <v-layout column wrap class="pa-0">
    <v-container fluid grid-list-lg xs12 class="pa-0" >
      <v-layout xs12 v-if="estudo"
        height="auto" :style="currentParallax"></v-layout>
      <v-layout xs12 class="ma-0"></v-layout>
      <v-layout row wrap justify-center pt-5 class="parallax-content">
        <v-flex id="screenTitle" xs12 class="pt-3 pb-0 display-2-obs white--text text-xs-center">
          {{ estudo ? estudo.title : '' }}
        </v-flex>
        <v-flex xs12 class="pt-0 mb-3 title-obs white--text text-xs-center"
          v-html="estudo ? estudo.subtitle : ''">
        </v-flex>
        <v-flex white--text subheading xs12 md4 lg3 :class="{'px-3': $vuetify.breakpoint.mdAndDown, 'px-4': $vuetify.breakpoint.lgAndUp}">
          <v-flex class="display-1-obs" v-html="estudo.titulo_texto"></v-flex>
          <v-flex v-html="estudo.texto"></v-flex>
        </v-flex>
        <v-flex text-xs-center xs12 md4 lg3 :class="{'px-3': $vuetify.breakpoint.mdAndDown, 'px-4 mt-5 pt-4': $vuetify.breakpoint.lgAndUp}" >
          <v-layout row wrap justify-center v-if="estudo.principais">
            <flpo-minicard              
              v-for="(miniCardPrincipal, indexMinicardsPrincipal) in estudo.principais"
              :key="'minicard_principal_'+indexMinicardsPrincipal"
              :structure="miniCardPrincipal" :row-class="miniCardPrincipal.rowClass">
            </flpo-minicard>
          </v-layout>
        </v-flex>
        <v-flex xs12 md4 lg3 :class="{'px-3': $vuetify.breakpoint.mdAndDown, 'px-4': $vuetify.breakpoint.lgAndUp}">
            <v-flex pt-0 pb-5 mb-5 column wrap v-if="cardLinks" > 
            <v-flex class="display-1-obs white--text" pl-2>Visualizações</v-flex>
            <v-flex v-for="(cardLink, cardLinkIndx) in cardLinks"
              :key="cardLink.id ? cardLink.id : ('sec' + cardLinkIndx)" py-0>
              <!--<v-icon color="accent">arrow_right</v-icon>-->
              <a v-if="cardLink.id" class="accent--text subheading"
                v-on:click="scrollTo(cardLink.id)">
                {{ cardLink.title }}
              </a>
              <div v-else :class="cardLinkIndx != 0 ? 'pt-2 title-obs white--text':'title-obs white--text'">
                {{ cardLink.title }}
              </div>
            </v-flex>
            <v-flex class="white--text" pl-2>
              Atualizado em 3/10/2018
            </v-flex>
          </v-flex>
        </v-flex>
      </v-layout>
      <v-layout class="bg-page grey lighten-2" column pa-0 ma-0 v-if="estudo.secoes">
        <v-layout 
          v-for="(secao, indexSecao) in estudo.secoes"  
          :key="secao.id"
          row wrap>
          <v-layout column :id="secao.id" :style="'background-color:' + $colorsService.assessZebraBG(indexSecao) + ';'">
            <v-flex xs12 v-if="secao.name !== null && secao.name !== undefined">
              <div
                :class="'display-2-obs text-xs-center pt-5 pb-3 font-weight-bold ' + $colorsService.assessZebraTitle(indexSecao)">
                {{ secao.name }}
              </div>
            </v-flex>
            <v-container fluid grid-list-lg py-2 px-1>
              <v-layout column
                v-if="estudo.secoes" >
                <v-flex xs12 
                  v-for="card in estudo.secoes[indexSecao].cards"
                  :key="card.id">
                  <v-layout v-if="card.type && card.type == 'text'"
                    pa-5 :id="card.id">
                    <v-layout row wrap justify-center pt-4 pb-5>
                    <v-flex xs12 lg9 pa-0>  
                    <flpo-composite-text
                      :structure="card.description"
                      :custom-params = "customParams"
                      :custom-functions = "custom_functions"
                      :section-index="indexSecao">
                    </flpo-composite-text>
                    </v-flex>
                    </v-layout>
                  </v-layout>
                  <v-layout v-else-if="card.type && card.type == 'headline'"
                    justify-center pt-5 pb-3
                    :class="'display-2-obs font-weight-bold ' + $colorsService.assessZebraTitle(indexSecao)"
                    v-html="card.title.fixed">
                  </v-layout>
                  <flpo-story-card-autofill
                    v-else-if="card.autoFill && topologyUfLoaded"
                    :structure="card"
                    :custom-params = "customParams"
                    :custom-functions = "custom_functions"
                    :topology = "topology"
                    :topology-uf = "topology_uf"
                    :section-index="indexSecao">
                  </flpo-story-card-autofill>
                  <flpo-story-card-multiple-charts
                    v-else-if="card.type && card.type == 'multiple-charts' && topologyUfLoaded"
                    :structure="card"
                    :custom-params = "customParams"
                    :custom-functions = "custom_functions"
                    :topology = "topology"
                    :topology-uf = "topology_uf"
                    :section-index="indexSecao">
                  </flpo-story-card-multiple-charts>
                  <flpo-story-card
                    v-else-if="topologyUfLoaded"
                    :structure="card"
                    :custom-params = "customParams"
                    :custom-functions = "custom_functions"
                    :topology = "topology"
                    :topology-uf = "topology_uf"
                    :section-index="indexSecao">
                  </flpo-story-card>
                </v-flex>
              </v-layout>
            </v-container>
          </v-layout>
        </v-layout>
      </v-layout>
    </v-container>
    <!-- Navegação lateral em dots pelos dimensoes e seções -->
    <flpo-dot-nav :sections="estudo.secoes"></flpo-dot-nav>
    <!-- <v-container fluid ma-0 pa-5 :style="'background-color:' + $colorsService.assessZebraBG(1) + ';'">
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
    </v-container> -->
  </v-layout>
</template>

<script>
  import BaseStoryView from './BaseStoryView.vue';
  
  export default {
    extends: BaseStoryView,
    data () {
      return {
        displayHeight: "auto",        
        show: false,
        endpoint: null,
        estudo: null,
        idEstudo: this.$route.params.idEstudo,        
        dims: null,
        slicing: null,
        
        infoGeoIp: null,
        idLocalidade: null,

        dataset: null,
        cmpTitle: null,
        cmpTitleComment: null,
        customParams: {},
        custom_functions: {},
        topology: null,
        topology_uf: null,
        topologyUfLoaded: false,

        mapDataLoading: true,
        mapTextLoading: true,
        cardLinks: []
      }
    },
    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      //this.getGlobalDataset(
      //  'centralindicadores',
      //  'brasil',
      //  'Falha ao carregar indicadores do Brasil',
      //  null,
      //  this.keepLoading
      //);
      // let scope = 'brasil';
      // let auId = 0;
      
      if (this.idEstudo) {
        let estudo = this.loadYaml("br/estudo/" + this.idEstudo);
        this.estudo = estudo;
        //this.selectCoords("br", "uf", 0);
        this.selectCoords("uf", "municipio", 23);
      }

      if (this.$vuetify.breakpoint.smAndDown) {
        this.obsMaxSlice = 11;
        this.obsSlice = 0;
        this.obsSliceSize = 1;
      }
      this.keepLoading();
    },
    computed: {
      currentParallax: function() {
        return 'background-image:url("/static/parallax/' + this.estudo.imagem + '.jpg"); background-position: center center; background-size: cover;';
      },
      sourceDesc: function() {
        return this.getSourceDesc(this.structure, this.dataset, this.metadata);
      },
      sourceLink: function() {
        return this.getSourceLink(this.structure, this.dataset, this.metadata);
      },
      analysisDesc: function() {
        return this.getAnalysisDesc(this.structure, this.dataset, this.metadata);
      },
      analysisLink: function() {
        return this.getAnalysisLink(this.structure, this.dataset, this.metadata);
      },
    },
    methods: {
      keepLoading() {
        let estudo = this.loadYaml("br/estudo/" + this.idEstudo);
        this.$emit('alterToolbar', estudo.theme.toolbar);
        this.estudo = estudo;

//        this.fillDataStructure(
//          this.estudo.secoes, null,
//          null, null
//        );

        this.fetchVizLinks(estudo.secoes);
      },

//      triggerSelect(payload) {
//        if (payload.type && payload.type === 'switch-group') {
//          this.customParams.enabled = payload.enabled;
//          this.$refs.chart.adjustVisibleLayers();
//        } else {
//          var endpoint = this.$textTransformService.applyInterpol(payload.rules.api, this.customParams, this.customFunctions, payload.item);
//          this.fetchData(endpoint);
//        }
//      },

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

      setCardLink(base_object_list, rules, structure, addedParams = null, metadata = null) {
        if (typeof base_object_list == 'string') {
          this.cardLinks[addedParams.pos] = {
            id: addedParams.id,
            title: base_object_list
          };
        } else {
          this.cardLinks[addedParams.pos] = {
            id: addedParams.id,
            title: this.$textTransformService.replaceArgs(
              this.structure.title.template,
              this.$indicatorsModel.indicatorsToValueArray(
                this.structure.title.preloaded, 
                this.customFunctions, 
                base_object_list,
                this.sendInvalidInterpol
              ),
              this.sendInvalidInterpol
            )
          };
        }
      },

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

      scrollTo(anchor) {
        var el = this.$el.querySelector("#" + anchor);
        el.scrollIntoView();
        window.scrollBy(0,-120);
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
</style>
  
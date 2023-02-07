<template>
  <v-layout column wrap class="pa-0">
    <v-container fluid grid-list-lg xs12 class="pa-0">
      <v-layout
        v-if="estudo"
        xs12
        height="auto"
        :style="currentParallax"
      />
      <v-layout xs12 class="ma-0" />
      <v-layout row wrap justify-center pt-5 class="parallax-content">
        <v-flex id="screenTitle" xs12 class="pt-3 pb-0 display-2-obs white--text text-xs-center">
          {{ estudo ? estudo.title : '' }}
        </v-flex>
        <v-flex
          xs12
          class="pt-0 mb-3 title-obs white--text text-xs-center"
          v-html="estudo ? estudo.subtitle : ''"
        />
        <v-flex
          white--text
          subheading
          xs12
          md4
          lg3
          :class="{'px-3': $vuetify.breakpoint.mdAndDown, 'px-4': $vuetify.breakpoint.lgAndUp}"
        >
          <v-flex class="display-1-obs" v-html="estudo.titulo_texto" />
          <v-flex v-html="estudo.texto" />
        </v-flex>
        <v-flex text-xs-center xs12 md4 lg3 :class="{'px-3': $vuetify.breakpoint.mdAndDown, 'px-4 mt-5 pt-4': $vuetify.breakpoint.lgAndUp}">
          <v-layout v-if="estudo.principais" row wrap justify-center>
            <FLPOMinicard
              v-for="(miniCardPrincipal, indexMinicardsPrincipal) in estudo.principais"
              :key="'minicard_principal_'+indexMinicardsPrincipal"
              :structure="miniCardPrincipal"
              :row-class="miniCardPrincipal.rowClass"
            />
          </v-layout>
        </v-flex>
        <v-flex xs12 md4 lg3 :class="{'px-3': $vuetify.breakpoint.mdAndDown, 'px-4': $vuetify.breakpoint.lgAndUp}">
          <v-flex
            v-if="cardLinks"
            pt-0
            pb-5
            mb-5
            column
            wrap
          >
            <v-flex class="display-1-obs white--text" pl-2>
              Visualizações
            </v-flex>
            <v-flex
              v-for="(cardLink, cardLinkIndx) in cardLinks"
              :key="cardLink.id ? cardLink.id : ('sec' + cardLinkIndx)"
              py-0
            >
              <!--<v-icon color="accent">arrow_right</v-icon>-->
              <a
                v-if="cardLink.id"
                class="accent--text subheading"
                @click="scrollTo(cardLink.id)"
              >
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
      <v-layout v-if="estudo.secoes" class="bg-page grey lighten-2" column pa-0 ma-0>
        <v-layout
          v-for="(secao, indexSecao) in estudo.secoes"
          :key="secao.id"
          row
          wrap
        >
          <v-layout :id="secao.id" column :style="'background-color:' + $colorsService.assessZebraBG(indexSecao, $vuetify.theme) + ';'">
            <v-flex v-if="secao.name !== null && secao.name !== undefined" xs12>
              <div
                :class="'display-2-obs text-xs-center pt-5 pb-3 font-weight-bold ' + $colorsService.assessZebraTitle(indexSecao, $vuetify.theme)"
              >
                {{ secao.name }}
              </div>
            </v-flex>
            <v-container fluid grid-list-lg py-2 px-1>
              <v-layout
                v-if="estudo.secoes"
                column
              >
                <v-flex
                  v-for="card in estudo.secoes[indexSecao].cards"
                  :key="card.id"
                  xs12
                >
                  <v-layout
                    v-if="card.type && card.type == 'text'"
                    :id="card.id"
                    pa-5
                  >
                    <v-layout row wrap justify-center pt-4 pb-5>
                      <v-flex xs12 lg9 pa-0>
                        <FLPOCompositeText
                          :structure="card.description"
                          :custom-params="customParams"
                          :custom-functions="custom_functions"
                          :section-index="indexSecao"
                        />
                      </v-flex>
                    </v-layout>
                  </v-layout>
                  <v-layout
                    v-else-if="card.type && card.type == 'headline'"
                    justify-center
                    pt-5
                    pb-3
                    :class="'display-2-obs font-weight-bold ' + $colorsService.assessZebraTitle(indexSecao, $vuetify.theme)"
                    v-html="card.title.fixed"
                  />
                  <FLPOStoryCardAutofill
                    v-else-if="card.autoFill"
                    :structure="card"
                    :custom-params="customParams"
                    :custom-functions="custom_functions"
                    :topology="topology"
                    :section-index="indexSecao"
                  />
                  <FLPOStoryCardMultipleCharts
                    v-else-if="card.type && card.type == 'multiple-charts'"
                    :structure="card"
                    :custom-params="customParams"
                    :custom-functions="custom_functions"
                    :topology="topology"
                    :section-index="indexSecao"
                  />
                  <FLPOStoryCard
                    v-else
                    :structure="card"
                    :custom-params="customParams"
                    :custom-functions="custom_functions"
                    :topology="topology"
                    :section-index="indexSecao"
                  />
                </v-flex>
              </v-layout>
            </v-container>
          </v-layout>
        </v-layout>
      </v-layout>
    </v-container>
    <!-- Navegação lateral em dots pelos dimensoes e seções -->
    <FLPODotNav :sections="estudo.secoes" />
    <!-- <v-container fluid ma-0 pa-5 :style="'background-color:' + $colorsService.assessZebraBG(1, $vuetify.theme) + ';'">
      <v-layout row wrap text-xs-center pb-5>
        <div class="flex display-1-obs">Realização</div>
      </v-layout>
      <v-layout row wrap align-center>
        <v-flex xs12 sm6 text-xs-center my-2>
          <img src="/orgs/mpt.png" alt="Ministério Público do Trabalho"/>
        </v-flex>
        <v-flex xs12 sm6 text-xs-center my-2>
          <img src="/orgs/smart_lab_barra_superior_letra_branca.png" alt="Smartlab"/>
        </v-flex>
      </v-layout>
    </v-container> -->
  </v-layout>
</template>

<script>
import BaseStoryView from './BaseStoryView.vue'

export default {
  extends: BaseStoryView,
  data () {
    return {
      displayHeight: 'auto',
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

      mapDataLoading: true,
      cardLinks: []
    }
  },
  computed: {
    currentParallax: function () {
      return this.estudo.imagem ? 'background-image:url("/parallax/' + this.estudo.imagem + '.jpg"); background-position: center center; background-size: cover;' : ''
    },
    sourceDesc: function () {
      return this.$indicatorsModel.getSourceDesc(this.structure, this.dataset, this.metadata)
    },
    sourceLink: function () {
      return this.$indicatorsModel.getSourceLink(this.structure, this.dataset, this.metadata)
    },
    analysisDesc: function () {
      return this.$indicatorsModel.getAnalysisDesc(this.structure, this.dataset, this.metadata)
    },
    analysisLink: function () {
      return this.$indicatorsModel.getAnalysisLink(this.structure, this.dataset, this.metadata)
    }
  },
  created () {
    // fetch the data when the view is created and the data is
    // already being observed
    // this.getGlobalDataset(
    //  'centralindicadores',
    //  'brasil',
    //  'Falha ao carregar indicadores do Brasil',
    //  null,
    //  this.keepLoading
    // );
    // let scope = 'brasil';
    // let auId = 0;

    if (this.idEstudo) {
      this.$yamlFetcherService.loadYaml('br/estudo/' + this.idEstudo).then((result) => { this.estudo = result })
      // this.selectCoords("br", "uf", 0);
      this.selectCoords('uf', 'municipio', 23)
    }

    if (this.$vuetify.breakpoint.smAndDown) {
      this.obsMaxSlice = 11
      this.obsSlice = 0
      this.obsSliceSize = 1
    }
    this.keepLoading()
  },
  methods: {
    keepLoading () {
      this.$yamlFetcherService.loadYaml('br/estudo/' + this.idEstudo)
        .then((result) => {
          this.$nuxt.$emit('alterToolbar', result.theme.toolbar)
          this.estudo = result
          this.fetchVizLinks(result.secoes)
        })

      //        this.fillDataStructure(
      //          this.estudo.secoes, null,
      //          null, null
      //        );
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

    setComplexAttribute (base_object_list, rules, structure, addedParams = null, metadata = null) {
      if (typeof base_object_list === 'string') {
        this[addedParams.attribute] = base_object_list
      } else {
        this[addedParams.attribute] = this.$textTransformService.applyInterpol(
          structure,
          this.customParams,
          this.customFunctions,
          base_object_list[0],
          this.sendInvalidInterpol
        )
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

    setCardLink (base_object_list, rules, structure, addedParams = null, metadata = null) {
      if (typeof base_object_list === 'string') {
        this.cardLinks[addedParams.pos] = {
          id: addedParams.id,
          title: base_object_list
        }
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
        }
      }
    },

    scrollTo (anchor) {
      const el = this.$el.querySelector('#' + anchor)
      el.scrollIntoView()
      window.scrollBy(0, -120)
    }
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

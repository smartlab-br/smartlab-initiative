<template>
  <v-layout row wrap class="pa-0">
    <!-- Nome do município + UF -->
    <v-container
      fluid
      grid-list-lg
      xs12
      overflow-hidden
      class="first-section pa-0"
      :style="displayHeight"
    >
      <v-layout v-if="customParams.cd_uf" xs12 class="bg-zoom" height="auto" :style="currentParallax" />
      <v-layout xs12 class="bg-shadow ma-0" />
      <v-layout v-if="dimensao_ativa" row wrap class="parallax-content">
        <!-- Menu para cada dimensao -->
        <!--
        <v-flex xs12 class="justify-bottom pa-0 dim-menu">
          <v-bottom-nav :value="true" :active.sync="dimensao_ativa.id"
            class="pa-3 toolbar" shift style="height:auto; opacity:0.75;">
            <v-layout row wrap justify-center>
              <v-flex text-xs-center column
                v-on:click="changeDim(dimensao.id, idLocalidade, idObservatorio)"
                :class="getGridPositionDimensao(dimensao, dimIndx)"
                v-for="(dimensao, dimIndx) in dimensoes" :key="dimensao.id">
                <v-tooltip bottom>
                  <v-layout pa-2 column slot="activator">
                    <v-icon dark
                      :color="dimensao.id == dimensao_ativa.id ? 'accent' : ''">
                      {{ dimensao.icon }}
                    </v-icon>
                  </v-layout>
                  {{ dimensao.short_desc }}
                </v-tooltip>
              </v-flex>
            </v-layout>
          </v-bottom-nav>
        </v-flex>
        -->
        <!-- Menu para cada dimensao - tabs -->
        <v-flex xs12 class="justify-bottom pa-0 dim-menu">
          <v-tabs
            v-if="dimensao_ativa"
            v-model="dimensao_ativa_id"
            color="primary"
            show-arrows
            grow
            dark
          >
            <v-tabs-slider />
            <!-- Headers -->
            <v-tab
              v-for="dimensao in dimensoes"
              :key="dimensao.id"
              :href="'#'+dimensao.id"
              ripple
              class="caption-obs px-3"
              @click="changeDim(dimensao.id, idLocalidade, idObservatorio)"
            >
              {{ dimensao.short_desc }}
            </v-tab>
          </v-tabs>
          <v-flex v-show="!visibleTitle" xs12 py-0>
            <v-layout
              v-if="idLocalidade && idLocalidade_compare && $route.path.includes('localidadecompare')"
              row
              wrap
              secondary
              text-xs-center
              display-1-obs
            >
              <v-flex v-if="localidade && localidade.nm_localidade" xs6 py-0>
                {{ localidade.nm_localidade }}
              </v-flex>
              <v-flex v-if="localidade_compare && localidade_compare.nm_localidade" xs6 py-0>
                {{ localidade_compare.nm_localidade }}
              </v-flex>
            </v-layout>
          </v-flex>
        </v-flex>
        <v-flex column pt-1 px-5 xs12>
          <v-flex v-if="ind_principais && ind_principais.length == 0 && localidade != null" class="text-xs-center pa-0">
            <v-progress-circular indeterminate color="primary" />
          </v-flex>
          <v-flex pt-5 />
          <v-flex id="screenTitle" white--text text-xs-center line-height-1 :class="{'py-5 px-0': $vuetify.breakpoint.xsOnly, 'pa-5': $vuetify.breakpoint.smAndUp}">
            <div class="display-3-obs py-3" v-html="dimensao_ativa != null ? (dimensao_ativa.title != null ? dimensao_ativa.title : dimensao_ativa.label) : ''" />
            <v-layout justify-center>
              <v-btn
                small
                class="accent--text"
                color="transparent"
                @click.native="removeCompare"
              >
                <v-icon left>
                  remove
                </v-icon>
                Remover comparação
              </v-btn>
            </v-layout>
            <v-layout pa-0 pt-4 row wrap>
              <v-flex xs12 sm6 md4 px-4>
                <div class="display-2-obs">
                  {{ localidade != null ? localidade.nm_localidade : '' }}
                  <v-tooltip v-if="presentation" bottom class="icon-vertical-align-middle">
                    <v-icon
                      slot="activator"
                      color="accent"
                      class="pb-1"
                    >
                      info
                    </v-icon>
                    <FLPOTextBuilder
                      :custom-params="customParams"
                      :custom-functions="custom_functions"
                      :structure="presentation"
                    />
                  </v-tooltip>
                  <!--
                    <span class="icon-vertical-align-middle">
                      <v-icon :color="isFavorite ? 'amber' : 'grey'"
                        class="pb-1"
                        v-on:click="toggleFavorite">
                        star
                      </v-icon>
                    </span>
                    -->
                </div>
                <v-layout
                  v-if="masterIndicator"
                  pa-1
                  justify-center
                  class="subheading master-indicator"
                  v-html="masterIndicator"
                />
                <v-layout v-if="dimParamsLoaded && ind_principais && unlockLoading" row wrap justify-center>
                  <FLPOMinicard
                    v-for="(miniCardPrincipal, indexMinicardsPrincipal) in ind_principais"
                    :key="'minicard_principal_'+indexMinicardsPrincipal"
                    :structure="miniCardPrincipal"
                    :custom-functions="custom_functions"
                    :custom-params="customParams"
                    :row-class="miniCardPrincipal.rowClass"
                    @showSnackbar="snackAlert"
                  />
                </v-layout>
              </v-flex>
              <v-flex xs12 sm6 md4 px-4>
                <div class="display-2-obs">
                  {{ localidade_compare != null ? localidade_compare.nm_localidade : '' }}
                  <v-tooltip v-if="presentation_compare" bottom class="icon-vertical-align-middle">
                    <v-icon
                      slot="activator"
                      color="accent"
                      class="pb-1"
                    >
                      info
                    </v-icon>
                    <FLPOTextBuilder
                      :custom-params="customParams"
                      :custom-functions="custom_functions"
                      :structure="presentation_compare"
                    />
                  </v-tooltip>
                  <!--
                    <span class="icon-vertical-align-middle">
                      <v-icon :color="isFavorite ? 'amber' : 'grey'"
                        class="pb-1"
                        v-on:click="toggleFavorite">
                        star
                      </v-icon>
                    </span>
                    -->
                </div>
                <v-layout
                  v-if="masterIndicator_compare"
                  pa-1
                  justify-center
                  class="subheading master-indicator"
                  v-html="masterIndicator_compare"
                />
                <v-layout v-if="dimParamsLoaded && ind_principais_compare && unlockLoading" row wrap justify-center>
                  <FLPOMinicard
                    v-for="(miniCardPrincipal, indexMinicardsPrincipal) in ind_principais_compare"
                    :key="'minicard_principal_'+indexMinicardsPrincipal"
                    :structure="miniCardPrincipal"
                    :custom-functions="custom_functions"
                    :custom-params="customParams"
                    :row-class="miniCardPrincipal.rowClass"
                    @showSnackbar="snackAlert"
                  />
                </v-layout>
              </v-flex>
              <v-flex xs12 md4 :class="{'pl-4': $vuetify.breakpoint.mdAndDown, 'pl-5': $vuetify.breakpoint.lgAndUp}">
                <v-flex v-if="sections && sections.length > 0" pt-0 column wrap>
                  <v-flex
                    v-for="(cardLink, cardLinkIndx) in cardLinks"
                    :key="cardLink.id ? cardLink.id : ('sec' + cardLinkIndx)"
                    py-1
                    text-xs-left
                  >
                    <!--<v-icon color="accent">arrow_right</v-icon>-->
                    <a
                      v-if="cardLink.id"
                      class="accent--text subheading"
                      @click="scrollTo('anchor_' + cardLink.id)"
                    >
                      <span class="card-title-bullet accent--text">&#9679;</span> {{ cardLink.title }}
                    </a>
                    <div v-else :class="cardLinkIndx != 0 ? 'pt-2 title-obs white--text':'title-obs white--text'">
                      {{ cardLink.title }}
                    </div>
                  </v-flex>
                </v-flex>
              </v-flex>
            </v-layout>
          </v-flex>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container fluid xs12 class="pa-0 ma-0">
      <v-layout v-if="dimParamsLoaded && sections && sections.length > 0" class="bg-page grey lighten-2" column pa-0 ma-0>
        <v-layout
          v-for="(secao, indexSecao) in sections"
          :key="secao.id"
          row
          wrap
        >
          <v-layout :id="secao.id" column :style="'background-color:' + $colorsService.assessZebraBG(indexSecao, $vuetify.theme) + ';'">
            <v-flex xs12>
              <div
                :class="'display-2-obs pt-5 pb-3  ml-5 pl-3 font-weight-bold ' + $colorsService.assessZebraTitle(indexSecao, $vuetify.theme)"
              >
                {{ secao.name }}
              </div>
            </v-flex>
            <!-- <v-container fluid grid-list-md py-0>
              <v-layout row wrap align-end justify-center>
                <flpo-leadcard v-if="secao.indicadores.length > 0"
                  v-for="(secindicador, indx) in secao.indicadores"
                  :key="indx"
                  :structure="secindicador"
                  :customParams="customParams"
                  :customFunctions="custom_functions">
                </flpo-leadcard>
              </v-layout>
            </v-container> -->
            <v-container fluid grid-list-lg py-2 px-1>
              <v-layout
                v-if="unlockLoading && secao.cards && secao.cards.length > 0 && customParams.localidade"
                row
                wrap
              >
                <v-flex xs12>
                  <v-layout
                    v-for="(card, cardIndex) in secao.cards"
                    :key="card.id"
                    row
                    wrap
                  >
                    <v-flex v-if="card.type == 'presentation'" xs12>
                      <v-layout :id="'anchor_' + card.id" ma-0 pa-0>
                        <v-layout :id="card.id" px-4 pb-4>
                          <FLPOCompositeText
                            :structure="card.description"
                            :custom-params="customParams"
                            :custom-functions="custom_functions"
                            :section-index="indexSecao"
                            @showSnackbar="snackAlert"
                          />
                        </v-layout>
                      </v-layout>
                    </v-flex>

                    <v-flex v-if="card.type != 'presentation'" xs12 sm6>
                      <v-layout
                        :id="'anchor_' + card.id"
                        ma-0
                        pa-0
                        :style="card.type != 'headline' && card.type != 'text' ? 'min-height:500px;': ''"
                      >
                        <v-layout
                          v-if="card.type && card.type == 'text'"
                          :id="card.id"
                          px-4
                          pb-4
                        >
                          <FLPOCompositeText
                            :structure="card.description"
                            :custom-params="customParams"
                            :custom-functions="custom_functions"
                            :section-index="indexSecao"
                            @showSnackbar="snackAlert"
                          />
                        </v-layout>
                        <v-layout
                          v-else-if="card.type && card.type == 'headline'"
                          pt-5
                          pb-3
                          ml-5
                          pl-2
                          :class="'display-2-obs font-weight-bold ' + $colorsService.assessZebraTitle(indexSecao, $vuetify.theme)"
                          v-html="card.title.fixed"
                        />
                        <FLPOStoryCardAutofill
                          v-else-if="card.autoFill && topology && ((indexSecao*100) + cardIndex <= visibleCardMaxIndex)"
                          :structure="card"
                          :custom-params="customParams"
                          :custom-functions="custom_functions"
                          :topology="topology"
                          :section-index="indexSecao"
                          @showSnackbar="snackAlert"
                        />
                        <FLPOStoryCardMultipleCharts
                          v-else-if="card.type && card.type == 'multiple-charts' && topology && ((indexSecao*100) + cardIndex <= visibleCardMaxIndex)"
                          :structure="card"
                          chart-position="bottom"
                          :custom-params="customParams"
                          :custom-functions="custom_functions"
                          :topology="topology"
                          :section-index="indexSecao"
                          @showBugDialog="openBugDialog"
                          @showSnackbar="snackAlert"
                        />
                        <FLPOStoryCard
                          v-else-if="topology && ((indexSecao*100) + cardIndex <= visibleCardMaxIndex)"
                          :structure="card"
                          chart-position="bottom"
                          :custom-params="customParams"
                          :custom-functions="custom_functions"
                          :topology="topology"
                          :section-index="indexSecao"
                          @showBugDialog="openBugDialog"
                          @showSnackbar="snackAlert"
                        />
                      </v-layout>
                    </v-flex>

                    <v-flex v-if="localidade_compare && card.type != 'presentation'" xs12 sm6>
                      <v-layout
                        ma-0
                        pa-0
                        :style="sections_compare[indexSecao].cards[cardIndex].type != 'headline' && sections_compare[indexSecao].cards[cardIndex].type != 'text' ? 'min-height:500px;': ''"
                      >
                        <v-layout
                          v-if="sections_compare[indexSecao].cards[cardIndex].type && sections_compare[indexSecao].cards[cardIndex].type == 'text'"
                          :id="sections_compare[indexSecao].cards[cardIndex].id"
                          px-4
                          pb-4
                        >
                          <FLPOCompositeText
                            :structure="sections_compare[indexSecao].cards[cardIndex].description"
                            :custom-params="customParams"
                            :custom-functions="custom_functions"
                            :section-index="indexSecao"
                            @showSnackbar="snackAlert"
                          />
                        </v-layout>
                        <v-layout
                          v-else-if="sections_compare[indexSecao].cards[cardIndex].type && sections_compare[indexSecao].cards[cardIndex].type == 'headline'"
                          pt-5
                          pb-3
                          ml-5
                          pl-2
                          :class="'display-2-obs font-weight-bold ' + $colorsService.assessZebraTitle(indexSecao, $vuetify.theme)"
                          v-html="sections_compare[indexSecao].cards[cardIndex].title.fixed"
                        />
                        <FLPOStoryCardAutofill
                          v-else-if="sections_compare[indexSecao].cards[cardIndex].autoFill && topology_compare && ((indexSecao*100) + cardIndex <= visibleCardMaxIndex)"
                          :structure="sections_compare[indexSecao].cards[cardIndex]"
                          :custom-params="customParams"
                          :custom-functions="custom_functions"
                          :topology="topology_compare"
                          :section-index="indexSecao"
                          @showSnackbar="snackAlert"
                        />
                        <FLPOStoryCardMultipleCharts
                          v-else-if="sections_compare[indexSecao].cards[cardIndex].type && sections_compare[indexSecao].cards[cardIndex].type == 'multiple-charts' && topology_compare && ((indexSecao*100) + cardIndex <= visibleCardMaxIndex)"
                          :structure="sections_compare[indexSecao].cards[cardIndex]"
                          chart-position="bottom"
                          :selected-place="customParams.idLocalidade_compare"
                          :custom-params="customParams"
                          :custom-functions="custom_functions"
                          :topology="topology_compare"
                          :section-index="indexSecao"
                          @showBugDialog="openBugDialog"
                          @showSnackbar="snackAlert"
                        />
                        <FLPOStoryCard
                          v-else-if="topology_compare && ((indexSecao*100) + cardIndex <= visibleCardMaxIndex)"
                          :structure="sections_compare[indexSecao].cards[cardIndex]"
                          chart-position="bottom"
                          :selected-place="customParams.idLocalidade_compare"
                          :custom-params="customParams"
                          :custom-functions="custom_functions"
                          :topology="topology_compare"
                          :section-index="indexSecao"
                          @showBugDialog="openBugDialog"
                          @showSnackbar="snackAlert"
                        />
                      </v-layout>
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-container>
          </v-layout>
        </v-layout>
      </v-layout>
    </v-container>
    <!-- Navegação lateral em dots pelos dimensoes e seções -->
    <FLPODotNav :sections="sections" />
    <v-layout
      v-if="!unlockLoading"
      align-center
      justify-center
      row
      fill-height
      class="loadingPanel"
    >
      <v-progress-circular
        :size="120"
        :width="8"
        color="grey lighten-1"
        indeterminate
      >
        Carregando dados
      </v-progress-circular>
    </v-layout>
  </v-layout>
</template>

<script>
import LocalidadeView from './LocalidadeView.vue'

export default {
  extends: LocalidadeView,
  computed: {
    currentCompareParallax: function () {
      return 'background-image:url("/parallax/uf/' + this.customParams.cd_uf_compare + '.jpg"); background-position: center center; background-size: cover;'
    }
  },
  methods: {
    changeToCompareStructure (struct) {
      let compareStruct = JSON.stringify(struct).replace(/idLocalidade/g, 'idLocalidade_compare').replace(/\"base_object\":\"localidade\"/g, '"base_object":"localidade_compare"')
      for (const dataset of this.thematicDatasets) {
        compareStruct = compareStruct.replace(new RegExp(dataset, 'g'), dataset + '_compare')
      }
      compareStruct = JSON.parse(compareStruct)
      for (const item of compareStruct) {
        if (item.cards) {
          for (const card of item.cards) {
            card.id = 'compare_' + card.id
            if (card.api) {
              if (!Array.isArray(card.api)) {
                if (card.api.args) {
                  for (const arg of card.api.args) {
                    if (arg.named_prop == 'cd_uf') {
                      arg.named_prop = 'cd_uf_compare'
                    }
                  }
                }
              } else {
                for (const api of card.api) {
                  if (api.args) {
                    for (const arg of api.args) {
                      if (arg.named_prop == 'cd_uf') {
                        arg.named_prop = 'cd_uf_compare'
                      }
                    }
                  }
                }
              }
            }
            if (card.apiBase) {
              if (!Array.isArray(card.apiBase)) {
                if (card.apiBase.args) {
                  for (const arg of card.apiBase.args) {
                    if (arg.named_prop == 'cd_uf') {
                      arg.named_prop = 'cd_uf_compare'
                    }
                  }
                }
              } else {
                for (const api of card.apiBase) {
                  if (api.args) {
                    for (const arg of api.args) {
                      if (arg.named_prop == 'cd_uf') {
                        arg.named_prop = 'cd_uf_compare'
                      }
                    }
                  }
                }
              }
            }
            if (card.charts) {
              for (const chart of card.charts) {
                chart.id = 'compare_' + chart.id
                if (chart.api && chart.api.args) {
                  for (const arg of chart.api.args) {
                    if (arg.named_prop == 'cd_uf') {
                      arg.named_prop = 'cd_uf_compare'
                    }
                  }
                }
              }
            }
            if (card.description) {
              for (const itemDesc of card.description) {
                if ((itemDesc.type == 'select' || itemDesc.type == 'radio') && itemDesc.selection) {
                  if (itemDesc.selection.rules.api && itemDesc.selection.rules.api.template) {
                    for (const argApiSelect of itemDesc.selection.rules.api.args) {
                      if (argApiSelect.named_prop == 'cd_uf') {
                        argApiSelect.named_prop = 'cd_uf_compare'
                      }
                    }
                  }
                  if (itemDesc.default && itemDesc.default.named_prop == 'cd_uf') {
                    itemDesc.default.named_prop = 'cd_uf_compare'
                  }
                } else if (itemDesc.cards) {
                  for (const itemDescCard of itemDesc.cards) {
                    if (itemDescCard.api && itemDescCard.api.args) {
                      for (const argApi of itemDescCard.api.args) {
                        if (argApi.named_prop == 'cd_uf') {
                          argApi.named_prop = 'cd_uf_compare'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (item.chart) {
          item.chart.id = 'compare_' + item.chart.id
        }
        if (item.api && item.api.args) {
          for (const argItem of item.api.args) {
            if (argItem.named_prop == 'cd_uf') {
              argItem.named_prop = 'cd_uf_compare'
            }
          }
        }
      }
      return compareStruct
    },

    removeCompare () {
      let url = this.$route.path.replace('/localidadecompare/', '/localidade/')
      if (this.$route.query.dimensao) {
        url += '?dimensao=' + this.$route.query.dimensao
      }
      this.$navigationManager.pushRoute(this.$router, url)
    }
  }
}
</script>

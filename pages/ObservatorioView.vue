<template>
  <v-layout row wrap class="pa-0">
    <v-flex
      v-if="observatorio"
      fluid
      grid-list-lg
      xs12
      overflow-hidden
      class="first-section pa-0"
      :style="displayHeight"
    >
      <transition name="fade">
        <v-layout v-show="backgroundVisible" xs12 class="bg-zoom" height="auto" :style="currentParallax" />
      </transition>
      <v-layout xs12 class="bg-home-shadow ma-0" />
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
              :class="{'px-1 pt-1 mx-1 mt-1': $vuetify.breakpoint.xsOnly,
                       'px-2 pt-2 mx-2 mt-2': $vuetify.breakpoint.smOnly,
                       'px-3 pt-3 mx-3 mt-3': $vuetify.breakpoint.mdOnly,
                       'px-4 pt-4 mx-4 mt-4': $vuetify.breakpoint.lgAndUp }"
            >
              <img
                :src="'/smartlab/' + (observatorio ? idObservatorio.concat('.svg') : '')"
                :alt="(observatorio ? observatorio.title : '')"
                width="100%"
              >
            </v-layout>
          </v-flex>
          <!--
          <v-flex id="screenTitleSub" xs12 class="pb-4 pt-0 mb-3 headline ubuntu white--text text-xs-right">
            {{ observatorio ? observatorio.title_sub : '' }}
          </v-flex>
          -->
        </v-flex>

        <v-flex xs12>
          <v-layout row align-center justify-center>
            <v-flex xs10 md4 pt-5 mt-3>
              <FLPOSearchBar />
            </v-flex>
          </v-layout>
        </v-flex>

        <v-flex xs12 text-xs-right px-5 mx-5 style="min-height:48px">
          <v-btn
            v-if="observatorio.prevalencia"
            icon
            class="ml-0"
            aria-label="SmartMap"
            @click="scrollTo('smartmap')"
          >
            <v-tooltip bottom>
              <v-icon slot="activator" color="white">
                public
              </v-icon>
              SmartMap
            </v-tooltip>
          </v-btn>
          <v-btn
            v-if="observatorio.sparklines"
            icon
            class="ml-0"
            aria-label="SmartLines"
            @click="scrollTo('sparklines')"
          >
            <v-tooltip bottom>
              <v-icon slot="activator" color="white">
                show_chart
              </v-icon>
              SmartLines
            </v-tooltip>
          </v-btn>
        </v-flex>
      </v-layout>
      <v-layout
        px-5
        pb-5
        mb-5
        :class="{'mx-5': $vuetify.breakpoint.smAndUp, 'mx-0': $vuetify.breakpoint.xsOnly}"
      >
        <v-layout v-if="dims && $analysisUnitModel.getCurrentAnalysisUnit()" row wrap>
          <v-flex
            v-for="(dimension, indxDim) in dims"
            :key="dimension.id"
            :class="'pa-3 ' + slicing"
          >
            <!--
              :media = "dimension.media"
              :icon = "dimension.icon"
              :AppIcon = "dimension.app_icon"
              icon-color = "white"
              :bg-color = "$vuetify.theme.secondary"
            -->
            <FLPOLinkedViewCard
              :index-tab="30 + indxDim"
              :tag-color="dimension.tagColor"
              :ripple-color="$vuetify.theme.primary"
              :status="dimension.status"
              :to="changeToGeoIP(dimension.to)"
              :external="dimension.external"
              :title="dimension.label"
              :title-color="'white'"
              :detail="dimension.sub"
              :blocked="dimension.blocked"
              @showSnackbar="snackAlert"
            />
          </v-flex>
        </v-layout>
      </v-layout>
    </v-flex>
    <!--
    <v-container fluid ma-0 pa-0 grey darken-4>
      <FLPOArticlesHighlights :show-title="true">
      </FLPOArticlesHighlights>
    </v-container>
    -->
    <v-container
      v-if="observatorio && observatorio.prevalencia"
      id="smartmap"
      fluid
      ma-0
      pa-0
      :style="'background-color:' + $colorsService.assessZebraBG(0, $vuetify.theme) + ';'"
    >
      <v-layout row wrap>
        <v-flex v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.odometers" pt-0 sm12>
          <v-layout column>
            <v-flex
              pa-0
              class="headline-obs text-xs-center"
              :style="'background-color:' + (observatorio.prevalencia.odometers.bg_color ? observatorio.prevalencia.odometers.bg_color : 'black') +
                ';color:'+ (observatorio.prevalencia.odometers.title_font_color ? observatorio.prevalencia.odometers.title_font_color : 'white')"
            >
              {{ observatorio.prevalencia.odometers.title }}
            </v-flex>
            <FLPOOdometer
              :odometer-items="observatorio.prevalencia.odometers.odometer_items"
              :comment-title="observatorio.prevalencia.odometers.comment_title"
              :title-font-color="observatorio.prevalencia.odometers.title_font_color"
              :bg-color="observatorio.prevalencia.odometers.bg_color"
            />
          </v-layout>
          <!--
          <FLPOCompositeText
            v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.odometers"
            :id = "'story_home_prevalencia_desc_odo_' + idObservatorio"
            :structure="observatorio.prevalencia.odometers"
            :custom-params="customParams"
            :custom-functions="customFunctions">
          </FLPOCompositeText>
          -->
        </v-flex>

        <v-flex v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.main_title" pt-0 sm12>
          <v-layout column>
            <v-flex
              pa-0
              class=""
              style="background-color:black;color:white"
            >
              <FLPOCompositeText
                :id="'story_home_prevalencia_main_title_' + idObservatorio"
                :structure="observatorio.prevalencia.main_title"
                :custom-params="customParams"
                :custom-functions="customFunctions"
              />
            </v-flex>
          </v-layout>
        </v-flex>

        <v-flex sm12 md4 lg3>
          <v-layout column>
            <v-layout
              row
              align-end
              fill-height
              wrap
              pl-3
              pt-3
              pr-2
              class="subheading mb-0"
              @mouseup="!mapEnabled ? dialogMapLoading = true : dialogMapLoading = false"
              @click="enableMap"
            >
              <v-flex class="headline-obs card-title pb-0 pl-3">
                {{ cmpTitle ? cmpTitle : '' }}
                <v-tooltip v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.info" bottom>
                  <v-icon
                    slot="activator"
                    color="accent"
                    class="pb-1"
                  >
                    info
                  </v-icon>
                  <FLPOCompositeText
                    :id="'info_home_prevalencia_' + idObservatorio"
                    :structure="observatorio.prevalencia.info"
                    :custom-params="customParams"
                    :custom-functions="customFunctions"
                  />
                </v-tooltip>
                <div v-if="cmpTitleComment != null" class="title-comment" v-html="cmpTitleComment" />
              </v-flex>

              <FLPOCompositeText
                v-if="observatorio && observatorio.prevalencia"
                :id="'story_home_prevalencia' + idObservatorio"
                :section-class="'px-2 py-0'"
                :structure="observatorio.prevalencia.description"
                :custom-params="customParams"
                :custom-functions="customFunctions"
                :reactive-filter="reactiveFilter"
                :custom-filters="customParams"
                @selection="triggerSelect"
                @showSnackbar="snackAlert"
              />

              <v-layout column wrap pl-2>
                <div v-if="sourceDesc && !sourceLink" class="caption pt-2 px-2 pl-3 bottom-30 data-source">
                  Fonte: {{ sourceDesc }}
                </div>
                <div v-else-if="sourceDesc && sourceLink" class="caption px-2 pt-3 pl-3 bottom-30 data-source">
                  Fonte:
                  <a class="accent--text" @click="openLinkFonte">{{ sourceDesc }}</a>
                </div>

                <div v-if="analysisDesc && !analysisLink" class="caption pb-3 px-2 pl-3 bottom-30 data-source">
                  Tratamento e análise: {{ analysisDesc }}
                </div>
                <div v-else-if="analysisDesc && analysisLink" class="caption px-2 pt-3 bottom-30 data-source">
                  Tratamento e análise:
                  <a class="accent--text" @click="openLinkAnalysis">{{ analysisDesc }}</a>
                </div>
              </v-layout>

              <FLPOCompositeText
                v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.footer"
                :id="'story_home_prevalencia_footer_' + idObservatorio"
                :section-class="'py-0'"
                :structure="observatorio.prevalencia.footer"
                :custom-params="customParams"
                :custom-functions="customFunctions"
                :custom-filters="customParams"
                @showSnackbar="snackAlert"
              />
            </v-layout>
          </v-layout>
        </v-flex>

        <v-flex sm12 md8 lg6 pt-4>
          <v-layout style="position:relative">
            <v-layout
              v-if="observatorio"
              xs12
              class="cursor-pointer"
              height="auto"
              @mousedown="dialogMapLoading = true"
            >
              <v-img
                :src="currentParallaxMapFile"
                :aspect-ratio="observatorio.prevalencia.chart_options.height_proportion ? observatorio.prevalencia.chart_options.height_proportion : 1"
              >
                <v-layout v-show="!mapEnabled" class="bg-black-transparent pa-3 justify-end subheading fill-height" @click="enableMap">
                  Clique no mapa para ativá-lo
                </v-layout>
              </v-img>
            </v-layout>
            <v-layout v-show="mapEnabled" style="position:absolute;z-index:2;right:10px" class="cursor-pointer pa-3 justify-end subheading" @click="$navigationManager.pushRoute($router,'/'+$observatories.identifyObservatoryById(idObservatorio)+'/smartmap')">
              Clique para modo avançado - SmartMap
            </v-layout>
            <v-layout
              v-if="dataset !== null && observatorio && observatorio.prevalencia &&
                observatorio.prevalencia.chart_options"
              id="observatorio_home_prevalencia_map"
              ref="chartRef"
              fill-height
              style="position: absolute"
              :class="leafletBasedCharts.includes(observatorio.prevalencia.chart_type) ? 'map_geo' : ''"
            />
          </v-layout>
          <v-flex xs12>
            <v-layout v-if="observatorio && observatorio.ranking_cards" row wrap pb-2>
              <FLPORankingList
                v-for="(ranking, index) in observatorio.ranking_cards"
                :key="index"
                :structure="ranking"
                :custom-functions="customFunctions"
                :custom-params="customParams"
                @showSnackbar="snackAlert"
              />
            </v-layout>
            <FLPOCompositeText
              v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.description_bottom"
              :id="'story_home_prevalencia_desc_b_' + idObservatorio"
              :structure="observatorio.prevalencia.description_bottom"
              section-class="pa-0"
              :custom-params="customParams"
              :custom-functions="customFunctions"
              @showSnackbar="snackAlert"
            />
          </v-flex>
        </v-flex>

        <v-flex sm12 md12 lg3>
          <FLPOCompositeText
            v-if="observatorio && observatorio.prevalencia && observatorio.prevalencia.description_right &&
              (!hasOdometers || loadedOdometers)"
            :id="'story_home_prevalencia_desc_r_' + idObservatorio"
            :structure="observatorio.prevalencia.description_right"
            :custom-params="customParams"
            :custom-functions="customFunctions"
            @showSnackbar="snackAlert"
          />
        </v-flex>
      </v-layout>
    </v-container>

    <!-- Sparklines -->
    <v-container
      v-if="observatorio && observatorio.sparklines"
      fluid
      ma-0
      pa-0
      :style="'background-color:' + $colorsService.assessZebraBG(0, $vuetify.theme) + ';'"
    >
      <v-layout row wrap>
        <v-flex v-if="observatorio.sparklines.title" xs12 px-2 py-0>
          <FLPOCompositeText
            :id="'desc_sparkline_' + idObservatorio"
            :structure="observatorio.sparklines.title"
            :custom-params="customParams"
            :custom-functions="customFunctions"
            :custom-filters="customParams"
            section-class="pa-0"
            @showSnackbar="snackAlert"
          />
        </v-flex>
        <v-flex id="sparklines" px-4 style="min-height:630px">
          <v-layout v-if="visibleSparklines" row wrap>
            <v-flex
              v-for="(strSparklines, index) in observatorio.sparklines.tables"
              :key="index"
              pt-3
              pb-0
              :class="strSparklines.cls?strSparklines.cls:'xs12'"
              text-xs-center
            >
              <FLPOSparklines
                :custom-params="customParams"
                :custom-functions="customFunctions"
                :dataset="dataset"
                :structure="strSparklines"
              />
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex v-if="observatorio.sparklines.footer" xs12 px-2 py-0>
          <FLPOCompositeText
            :id="'desc_sparkline_' + idObservatorio"
            :structure="observatorio.sparklines.footer"
            :custom-params="customParams"
            :custom-functions="customFunctions"
            :custom-filters="customParams"
            section-class="pa-0"
            @showSnackbar="snackAlert"
          />
        </v-flex>
      </v-layout>
    </v-container>

    <!--
    <v-container fluid ma-0 pa-5 :style="'background-color:' + $colorsService.assessZebraBG(1, $vuetify.theme) + ';'">
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
    </v-container>
    -->
    <v-dialog v-if="dialog" v-model="dialog">
      <v-card>
        <v-card-title class="headline-obs">
          Explicação
        </v-card-title>
        <v-card-text>
          Esta é uma explicação sobre a diferença entre Indic. PNAD e Municipais. Pode ser em tabs, explicação direta... qualquer layout.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click.native="dialog = false">
            <v-icon left>
              close
            </v-icon>
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialogMapLoading"
      hide-overlay
      persistent
      width="100"
    >
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
              />
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>

import BaseObservatorioView from './BaseObservatorioView.vue'

export default {
  extends: BaseObservatorioView,
  data () {
    return {
      displayHeight: 'auto',
      dims: null,
      mapEnabled: false,
      isPageBottom: true,
      chartHandler: null,

      parallaxFile: null,
      idParallaxfile: 0,
      backgroundVisible: true,
      visibleSparklines: false
    }
  },
  computed: {
    currentParallax: function () {
      return this.parallaxFile ? "background-image:url('/parallax/" + this.parallaxFile + "');" : ''
    }
  },
  created () {
    if (this.observatorio && this.observatorio.background_images) {
      this.parallaxFile = this.observatorio.background_images[this.idParallaxfile]
      if (this.observatorio.background_images.length > 1) {
        setInterval(this.setParallaxFile, 20000)
      }
    } else if (this.idObservatorio) {
      this.$yamlFetcherService.loadYaml('br/observatorio/' + this.idObservatorio).then((result) => {
        this.parallaxFile = result.background_images[this.idParallaxfile]
        if (result.background_images.length > 1) {
          setInterval(this.setParallaxFile, 20000)
        }
      })
    }
  },
  mounted: function () {
    this.resizeFirstSection()
    window.addEventListener('resize', this.resizeFirstSection)
    window.addEventListener('scroll', this.setVisibleSparklines)
    this.idLocalidade = this.$analysisUnitModel.getCurrentAnalysisUnit()
    this.mapEnabled = false
    this.checkCurrentAnalysisUnit()
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.setVisibleSparklines)
  },
  methods: {

    setVisibleSparklines () {
      if (this.observatorio && this.observatorio.sparklines && !this.visibleSparklines) {
        const vHeight = (window.innerHeight || document.documentElement.clientHeight)
        if (document.getElementById('sparklines') != null) {
          const { top, bottom } = document.getElementById('sparklines').getBoundingClientRect()
          if ((top > 0 || bottom > 0) && (top < vHeight)) {
            this.visibleSparklines = true
          }
        }
      }
    },

    setParallaxFile () {
      this.idParallaxfile++
      if (this.observatorio) {
        this.backgroundVisible = false
        if (this.idParallaxfile == this.observatorio.background_images.length) {
          this.idParallaxfile = 0
        }
        setTimeout(() => {
          this.parallaxFile = this.observatorio.background_images[this.idParallaxfile]
          this.backgroundVisible = true
        }, 2000)
      }
    },

    scrollTo (anchor) {
      const el = this.$el.querySelector('#' + anchor)
      el.scrollIntoView()
      window.scrollBy(0, -60)
    },

    resizeFirstSection () {
      if (this.$vuetify.breakpoint.smAndDown) {
        this.displayHeight = 'auto'
      } else {
        this.displayHeight = 'min-height:' + (window.innerHeight - 64) + 'px'
      }
    },

    enableMap () {
      if (!this.mapEnabled) { this.fetchMapData() }
    },

    setDimensionsArea () {
      this.$dimensions.getDimensions(this.idObservatorio, this.setDimensionsStyles)
    },

    setDimensionsStyles (content) {
      this.dims = content.dimensoes

      switch (content.dimensoes.length) {
        case 12:
          this.slicing = 'xs12 sm6 md4 xl3'
          break
        case 10:
          this.slicing = 'xs12 sm6 md4 xl3'
          break
        case 9:
          this.slicing = 'xs12 sm6 md4 xl3'
          break
        case 8:
          this.slicing = 'xs12 sm6 lg3'
          break
        case 6:
          this.slicing = 'xs12 sm6 md4'
          break
        case 5:
          this.slicing = 'xs12 sm6 md4'
          break
        case 4:
          this.slicing = 'xs12 sm6'
          break
        case 3:
          this.slicing = 'xs12 sm6 md4'
          break
        case 2:
          this.slicing = 'xs12 sm6 md4'
          break
        case 1:
          this.slicing = 'xs12'
          break
        default:
          this.slicing = 'xs12 sm6 md4 xl3'
          break
      }
    },

    triggerSelect (payload) {
      if (payload.type && payload.type === 'switch-group') {
        this.customParams.enabled = payload.enabled
        if (this.chartHandler) { this.chartHandler.adjustVisibleLayers(payload.enabled) }
      } else if (payload.type && payload.type === 'radio') {
        if (payload.item == null || payload.item == undefined) {
          this.customParams.radioApi = null
        } else {
          this.customParams.radioApi = payload.item.api
          this.activeGroup = payload.item.value
          this.fetchMapData(payload.item.api)
        }
      } else {
        const endpoint = this.$textTransformService.applyInterpol(payload.rules.api, this.customParams, this.customFunctions, payload.item)
        this.fetchMapData(endpoint)
      }
    },

    fetchMapData (endpoint = null) {
      this.mapEnabled = true
      this.fillDataStructure(
        this.observatorio.prevalencia,
        this.customParams, this.customFunctions,
        this.setDataset,
        {
          endpoint,
          fnCallback: this.triggerChartUpdates
        }
      )
    },

    triggerChartUpdates () {
      if (this.chartHandler) {
        this.chartRegen(
          this.chartHandler,
          'observatorio_home_prevalencia_map',
          this.observatorio.prevalencia.chart_type,
          this.observatorio.prevalencia,
          this.observatorio.prevalencia.chart_options,
          this.dataset,
          this.metadata,
          this.sectionIndex
        ).then(
          (chartHandler) => { this.sendChartLoaded(chartHandler) },
          (reject) => { this.sendError(reject) }
        )
      } else {
        this.chartGen(
          'observatorio_home_prevalencia_map',
          this.observatorio.prevalencia.chart_type,
          this.observatorio.prevalencia,
          this.observatorio.prevalencia.chart_options,
          this.dataset,
          this.metadata
        ).then(
          (chartHandler) => { this.sendChartLoaded(chartHandler) },
          (reject) => {
            console.log(reject)
            this.mapEnabled = false
            this.dialogMapLoading = false
            this.sendError('Falha ao carregar mapa.')
          }
        )
      }
    },

    sendChartLoaded (chartHandler) {
      this.chartHandler = chartHandler
      this.dialogMapLoading = false
    }
  }
}
</script>

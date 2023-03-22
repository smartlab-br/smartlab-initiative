<template>
  <v-layout row wrap class="pa-0">
    <v-flex
      fluid
      grid-list-lg
      xs12
      overflow-hidden
      class="first-section pa-0"
      :style="displayHeight"
    >
      <transition v-show="parallaxFile" name="fade">
        <v-layout v-show="backgroundVisible" xs12 class="bg-zoom" height="auto" :style="currentParallax" />
      </transition>
      <v-layout xs12 class="bg-home-shadow ma-0" />
      <v-layout
        row
        wrap
        fill-height
        align-center
        justify-center
        pa-0
        class="parallax-content-home"
      >
        <v-flex id="screenTitle" xs12 class="white--text text-xs-center py-4 my-5" style="line-height: normal;">
          <v-layout row wrap justify-center>
            <v-flex xs12>
              <div class="display-4-obs ubuntu">
                Iniciativa SmartLab
              </div>
            </v-flex>
            <v-flex xs12>
              <div class="display-1-obs ubuntu-condensed">
                Promoção do Trabalho Decente Guiada por Dados
              </div>
            </v-flex>
            <v-flex xs10 md4 pt-5 mt-3>
              <FLPOSearchBar />
            </v-flex>
          </v-layout>
        </v-flex>
        <v-layout v-show="observatorios" px-5 :class="{'justify-center': $vuetify.breakpoint.xlOnly }" row wrap>
          <v-flex
            v-for="(observatorio, indxObs) in observatorios"
            :key="'linked_card_obs_' + indxObs"
            :class="obsSliceClass"
            pa-3
          >
            <!--
              :icon = "observatorio.icon"
              :AppIcon = "observatorio.app_icon"
              :media = "observatorio.media"
              :bg-color = "$observatories.getTheme(observatorio.id).primary"
            -->
            <FLPOLinkedViewCard
              :index-tab="30 + indxObs"
              :tag-color="observatorio.tagColor"
              :status="observatorio.status"
              :to="observatorio.to"
              :external="observatorio.external"
              :title="observatorio.short_desc"
              :ripple-color="$observatories.getTheme(observatorio.id).primary"
              :title-color="'white'"
              :blocked="observatorio.blocked"
              @showSnackbar="snackAlert"
            />
          </v-flex>
        </v-layout>
      </v-layout>
    </v-flex>
    <v-flex class="black--background">
      <v-layout
        v-for="(secao, indxSctn) in secoes"
        v-show="secoes"
        :key="indxSctn"
        align-center
        section
        :style="'background-image:url(\'' + secao.section_background + '\');'"
      >
        <v-layout
          px-5
          row
          wrap
          class="white--text"
        >
          <v-flex v-if="!secao.complement" xs12>
            <div class="section-title">
              {{ secao.title }}
            </div>
            <div class="section-description" v-html="secao.description" />
          </v-flex>
          <v-flex v-if="secao.complement" :class="(secao.cls ? secao.cls : 'xs9')">
            <div class="section-title">
              {{ secao.title }}
            </div>
            <div class="section-description" v-html="secao.description" />
          </v-flex>
          <v-flex v-if="secao.complement" class="section-complement" :class="(secao.complement.cls ? secao.complement.cls : 'xs3')">
            <FLPOMinicard
              v-for="(miniCard, indexMinicard) in secao.complement.minicards"
              :key="'minicard_'+indexMinicard"
              :structure="miniCard"
              @showSnackbar="snackAlert"
            />

            <v-layout
              v-for="(image, indexImage) in secao.complement.images"
              :key="'img_'+indexImage"
              pa-0
              justify-center
            >
              <div
                class="image-container"
                :style="'width:' + (image.width ? image.width : '')"
              >
                <div v-if="image.tag" class="layout caption font-weight-bold pa-1 text-xs-center soon-tag warning black--text">
                  {{ image.tag.text }}
                </div>
                <v-img
                  :src="image.url"
                  :class="(image.link_disabled ? 'link_disabled' : '') + ' complement-image'"
                />
              </div>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-layout>

      <v-layout
        v-for="(observatorio, indxObs) in observatorios"
        :key="'obs_section_'+indxObs"
        obs_container
        :style="'background-image:url(\'' + observatorio.section_background + '\');'"
      >
        <v-layout
          v-if="!observatorio.blocked"
          px-5
          row
          wrap
          class="white--text"
          section
          align-center
        >
          <v-flex xs12>
            <div class="section-title nav_first_section" @click="$navigationManager.pushRoute($router, observatorio.to, observatorio.external)">
              {{ observatorio.title }}
            </div>
            <div class="section-description" v-html="observatorio.section_description" />
          </v-flex>
          <!-- <v-flex  class="section-complement" xs12 md6 px-3>
            <v-img :src="observatorio.section_image"
              class="complement-image"
              @click="$navigationManager.pushRoute($router, observatorio.to, observatorio.external)"
            ></v-img>
          </v-flex>   -->
        </v-layout>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
import BaseLandingView from './BaseLandingView.vue'

export default {
  extends: BaseLandingView,
  data () {
    return {
      show: false,
      displayHeight: 'auto',
      parceiros: null,
      conheca: null,
      history: null,
      isPageBottom: true,

      readMoreLimit: 437,

      observatorios: null,
      obsSlice: 0,
      obsSliceSize: 2,
      obsSliceClass: 'xs12 sm6 md4 xl2',
      obsMaxSlice: 3,

      secoes: null,

      parallaxFile: null,
      idParallaxfile: 0,
      background_images: [],
      backgroundVisible: true
    }
  },
  computed: {
    currentParallax: function () {
      return this.parallaxFile ? "background-image:url('/parallax/" + this.parallaxFile + "');" : ''
    }
  },
  created () {
    this.$observatories.getContent().then((content) => {
      this.observatorios = content.observatorios
      this.secoes = content.secoes
      this.background_images = content.background_images
      this.parallaxFile = this.background_images[this.idParallaxfile]
      setInterval(this.setParallaxFile, 20000)
    })

    if (this.$vuetify.breakpoint.smAndDown) {
      this.obsMaxSlice = 11
      this.obsSlice = 0
      this.obsSliceSize = 1
    }
  },
  mounted: function () {
    this.checkCurrentAnalysisUnit()

    this.$nuxt.$emit('alterToolbar', null)
    this.resizeFirstSection()
    window.addEventListener('resize', this.resizeFirstSection)
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.resizeFirstSection)
  },
  methods: {
    setParallaxFile () {
      this.idParallaxfile++
      this.backgroundVisible = false
      if (this.idParallaxfile == this.background_images.length) {
        this.idParallaxfile = 0
      }
      setTimeout(() => {
        this.parallaxFile = this.background_images[this.idParallaxfile]
        this.backgroundVisible = true
      }, 2000)
    },

    customFilter (item, queryText, itemText) {
      queryText = this.$textTransformService.replaceArgs(queryText).toLowerCase()
      itemText = this.$textTransformService.replaceArgs(itemText).toLowerCase()
      return itemText.includes(queryText)
    },
    buildShortText (fullText) {
      if (this.readMoreLimit) {
        if (fullText.length > parseInt(this.readMoreLimit)) {
          const endCharRegex = /[.,!?;& [:space:]](?!.*[.,!?;& [:space:]])/g
          endCharRegex.exec(fullText.substring(0, this.readMoreLimit))
          return fullText.substring(0, endCharRegex.lastIndex) + '...'
        }
      }
    },

    toggleCollapseExpand (item) {
      item.collapsed = !item.collapsed
    },

    cmpTextMoreLess (collapsed) {
      return collapsed ? 'Leia mais' : 'Leia menos'
    },
    assessMoreLess () {
      return this.collapsed ? 'more' : 'less'
    },

    resizeFirstSection () {
      if (this.$vuetify.breakpoint.smAndDown) {
        this.displayHeight = 'auto'
      } else {
        this.displayHeight = 'min-height:' + (window.innerHeight - 64) + 'px'
      }
    },

    swipeObs (direction) {
      if (direction == 'right' && this.obsSlice > 0) {
        this.obsSlice--
      } else if (direction == 'left' && this.obsSlice < this.obsMaxSlice) {
        this.obsSlice++
      }
    },

    shownObservatories () {
      if (this.$vuetify.breakpoint.smAndDown) {
        this.obsSliceClass = 'xs6'
        this.obsMaxSlice = 4
        this.obsSliceSize = 1
      } else {
        this.obsSliceClass = 'xs6 sm4 md3 lg2'
        this.obsMaxSlice = 3
        this.obsSliceSize = 2
      }

      if (this.obsSlice > this.obsMaxSlice) {
        this.obsSlice = this.obsMaxSlice
      }

      const start = this.obsSlice
      const stop = start + this.obsSliceSize
      return this.observatorios.slice(start, stop)
    },

    replaceBrOnSmAndDown (text) {
      if (this.$vuetify.breakpoint.smAndDown) {
        text = text.replace('<br/>', ' ')
      }
      return text
    }
  }
}
</script>

<style>
  .mainSearch .v-input__append-outer {
    z-index: 1 !important;
  }

  .search-group .input-group {
    padding: 0;
  }

  .search-group .input-group__details {
    display: none;
  }

  .radio label {
    font-family: titulos-observatorio, sans-serif !important;
    font-size: x-large;
  }

  .v-text-field.v-text-field--enclosed .v-text-field__details {
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

  .timeline-item {
    align-self: center;
  }

  .nav_first_section {
    cursor: pointer !important;
  }

  .anchor-cards .container{
    color: black;
  }

  .black--background {
    background-color: black;
  }
  .obs_container{
    background-size: cover;
    background-position: top;
  }
  .section {
    min-height: 95vh;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 30px;
    padding-top: 30px;
    padding-left: 8px;
    padding-right: 8px;
    background-size: cover;
    background-position: top;
  }
  .section-title {
    font-family: titulos-observatorio, sans-serif;
    font-size: 3rem;
    margin: 16px;
    line-height: 1.1;
    margin-bottom: 40px;
  }
  .section-description {
    font-size: 1.45rem;
     margin: 16px;
  }
  .section-complement {
    font-size: 1.3rem;
     margin-top: 22px;
  }
  .complement-image {
    border-color: rgba(255, 255, 255, 0.3);
    border-width: 1px;
    border-style: solid;
    cursor: pointer;
  }
  .link_disabled {
    cursor: default;
  }

  .section-complement .minicard-description {
    font-size: 1rem !important;
  }

  .section-complement .minicard-comment {
    font-size: 1rem !important;
  }

  .soon-tag {
    display: block;
    position: absolute;
    width: 136px;
    top: 24px;
    right: -32px;
    z-index: +1;
    transform: rotate(45deg);
  }
  .image-container {
    position: relative;
    overflow: hidden;
  }
</style>

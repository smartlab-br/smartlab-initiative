<template>
  <v-app>
    <v-app-bar v-if="currentObs && !isLayoutLoading" app dark clipped-left :color="theme.current.value.colors.primary">
      <v-app-bar-nav-icon aria-label="Menu Principal" @click.stop="drawer = !drawer" />

      <img 
        height="40" src="/icons/smartlab_labeled.png" class="cursor-pointer ml-2 d-none d-sm-block" alt="Smartlab"
        @click="pushRoute('/', false)" @keyup.enter="pushRoute('/', false)">
      <img 
        height="30" src="/icons/smartlab_icon.png" class="cursor-pointer ml-2 d-block d-sm-none" alt="Smartlab"
        @click="pushRoute('/', false)">

      <v-divider v-show="currentObs?.title" vertical class="mx-2" style="background-color:rgba(255,255,255,0.7)" />

      <div class="d-flex align-center flex-grow-1" style="min-width: 0;">
        <div 
          v-if="currentObs?.title"
          role="heading"
          aria-level="1"
          class="cursor-pointer line-height-1"
          style="min-width: 0;"
          @click="pushRoute((route && route.path.includes('localidade')) ? '../' : (route && (route.path.includes('estudo') || route.path.includes('smartmap'))) ? './' : '', false);">
          <div>{{ currentObs.title }}</div>
          <div v-if="currentObs?.hash_tag" class="text-caption text-right">
            <a @click.stop="pushRoute('https://www.instagram.com/smartlab_br/', true)">
              {{ "#" + currentObs.hash_tag }}
            </a>
          </div>
        </div>
        <template v-if="currentAnalysisUnit">
          <v-divider vertical class="mx-2" style="background-color:rgba(255,255,255,0.7)" />
          <!-- 
              @mousedown="seen = true" 
              @click="focusChangePlace()"
            -->
          <div class="cursor-pointer line-height-1" style="min-width: 0;" @click="focusChangePlace()">
            <div>{{ currentAnalysisUnit.nm_localidade }}</div>
            <div class="text-caption">{{ currentAnalysisUnit.nm_tipo }}</div>
          </div>
        </template>
      </div>

      <v-spacer />

      <div class="d-flex align-center">
        <v-autocomplete 
          v-if="auOptions.length > 0" v-show="seen" ref="autocompleteChangePlace" v-model="gsItemBusca"
          class="input-group--focused global-search pt-3 transparent-autocomplete" persistent-hint item-title="label"
          item-value="id" persistent-placeholder placeholder="Mudar localidade" return-object
          :custom-filter="customFilter" :items="auOptions" :menu-props="{ minWidth: '380px' }"
          :loading="gsLoadingStatusSearchOptions === 'LOADING'"
          :color="gsLoadingStatusSearchOptions === 'ERROR' ? 'error' : gsLoadingStatusSearchOptions === 'LOADING' ? 'warning' : 'accent'"
          @blur="gsItemBusca = ''">
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps" :title="undefined">
              <v-list-item-title v-if="auOptions.length < 2">
                <v-progress-circular :size="20" indeterminate color="primary" />
              </v-list-item-title>
              <v-row v-else no-gutters>
                <v-col>
                  <v-list-item-title @click="changeAnalysisUnit(router, item.raw)">
                    {{ item.raw.label + (item.raw.scope === 'uf' ? ' (UF)' : '') }}
                  </v-list-item-title>
                </v-col>
                <v-col class="d-flex justify-end">
                  <v-list-item-action style="min-width: 120px">
                    <v-row no-gutters>
                      <v-col 
                        v-for="(search_item, indxSearch) in (observatories || [])"
                        :key="'search_item_obs_' + indxSearch">
                        <v-col
                          v-if="!search_item.blocked && (!item.raw.exclude_from || !item.raw.exclude_from.includes(search_item.id))"
                          class="d-flex flex-column align-center pa-0"
                          @click="changeAnalysisUnit(router, item.raw, search_item.id)">
                          <v-tooltip location="bottom" :text="search_item.tooltip">
                            <template #activator="{ props }">
                              <svg 
                                v-if="search_item.app_icon" v-bind="props" viewBox="0 0 16 16" width="16"
                                height="16" role="img" :aria-label="search_item.short_title"
                                :fill="ColorsService.getThemeFromId(search_item.id).primary" class="icon--inline">
                                <use 
                                  xmlns:xlink="http://www.w3.org/1999/xlink"
                                  :xlink:href="'/icons/sprite/coord-sprites.svg#' + search_item.app_icon" />
                              </svg>
                            </template>
                          </v-tooltip>
                        </v-col>
                      </v-col>
                    </v-row>
                  </v-list-item-action>
                </v-col>
              </v-row>
            </v-list-item>
          </template>
        </v-autocomplete>

        <v-btn icon class="ml-0" aria-label="Alterar Localidade" @click="seen = !seen">
          <v-icon color="white">
            mdi-map-marker
          </v-icon>
          <v-tooltip activator="parent" location="bottom">Alterar Localidade</v-tooltip>
        </v-btn>
        <v-btn 
          icon class="ml-2" aria-label="Instagram" color="white"
          @click="pushRoute('https://www.instagram.com/smartlab_br/', true)">
          <v-icon color="white">
            <font-awesome-icon icon="fa-brands fa-instagram fa-sm" size="sm" />
          </v-icon>
          <v-tooltip activator="parent" location="bottom">
            Instagram
          </v-tooltip>
        </v-btn>
      </div>
    </v-app-bar>
    <v-navigation-drawer 
      v-if="observatories && !isLayoutLoading && menuItems.length > 0" v-model="drawer" :rail="rail"
      :scrim="false" :width="330">
      <v-list>
        <!-- Usando v-for para iterar sobre uma lista de itens -->
        <v-list-item 
          v-for="(item, index) in menuItems" :key="index" link :ripple="{ class: item.rippleColor }"
          :tabindex="drawer ? 10 + index : ''" @click="itemClick(item)" @keyup.enter="itemClick(item)">
          <template #prepend>
            <v-icon v-if="item.icon" :title="item.short_title" :color="ColorsService.getThemeFromId(item.id).primary">
              {{ item.icon }}
            </v-icon>
            <svg 
              v-else-if="item.app_icon" viewBox="0 0 24 24" width="24" height="24" role="presentation"
              :fill="ColorsService.getThemeFromId(item.id).primary" class="icon--inline" :title="item.short_title">
              <use 
                xmlns:xlink="http://www.w3.org/1999/xlink"
                :xlink:href="'/icons/sprite/coord-sprites.svg#' + item.app_icon" />
            </svg>
            <v-tooltip activator="parent" location="bottom">{{ item.short_title }}</v-tooltip>
          </template>
          <v-list-item-title class="pl-5">{{ item.short_title }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <v-divider />
      <v-list density="compact">
        <v-list-item link @click.stop="rail = !rail">
          <template #prepend>
            <v-icon>{{ rail ? 'mdi-chevron-right' : 'mdi-chevron-left' }} </v-icon>
          </template>
          <v-list-item-title class="pl-5">Apenas ícones</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container class="pa-0" fluid>
        <v-responsive class="d-flex align-center text-center fill-height">
          <v-row class="d-flex align-center justify-center">
            <v-col cols="auto">
              <slot />
            </v-col>
          </v-row>
        </v-responsive>
        <GlobalSnackbar />
      </v-container>
    </v-main>
    <client-only>
      <v-footer v-if="!isLayoutLoading" :color="theme.current.value.colors.primary" padless>
        <v-container 
          fluid :class="{
          'px-2 py-4': $vuetify.display.xs,
          'px-3 py-4': $vuetify.display.smAndDown,
          'px-5 py-5': $vuetify.display.mdAndUp,
          }"
        >
          <v-row wrap align="center">
            <v-col 
              class="text-xs-left text-lg-center" :class="{
              'pt-5 pb-3': $vuetify.display.smAndDown,
            }" cols="12" xs="2" sm="1">
              <a @click="pushRoute('/saibamais/smartlab', false)">
                <img src="/smartlab/smartlab-small.svg" alt="Smartlab" height="25px" style="margin-bottom: -5px;">
                <span class="ml-3">Sobre</span>
              </a>
            </v-col>

            <v-col 
              v-if="smartlab" class="text-xs-right text-md-center" :class="{
              'pt-5 pb-3': $vuetify.display.smAndDown,
            }" cols="12" xs="10" sm="11" lg="9">
              <v-row justify="center" wrap>
                <v-col v-if="smartlab?.footer?.title" class="footer-colab-text" cols="12" xs="12" xl="11" offset-xl="1">
                  {{ smartlab.footer.title }}
                </v-col>
                <v-col v-if="smartlab?.footer?.images" cols="12">
                  <img 
                    v-for="(footerImg, footerImgIndex) in smartlab.footer.images" :key="footerImgIndex"
                    :src="footerImg.src" :class="footerImg.class" :alt="footerImg.title"
                    :height="footerImg.height ? footerImg.height : ''"
                    :max-height="footerImg.maxHeight ? footerImg.maxHeight : ''"
                    :min-height="footerImg.minHeight ? footerImg.minHeight : ''"
                    @click="pushRoute(footerImg.url, true)">
                </v-col>
              </v-row>
            </v-col>

            <!-- <v-col>
            <v-row
              v-if="smartlab?.footer?.description"
              justify="center"
              class="footer-colab-text"
            >
              {{ smartlab.footer.description }}
            </v-row>
          </v-col> -->

            <v-col 
              class="text-md-left text-lg-center subheading" 
              :class="{
              'pt-5 pb-3': $vuetify.display.smAndDown,
              }" 
              cols="12" md="6" lg="1" sm="6">
              <a class="mr-2 cursor-pointer" @click="pushRoute('https://www.instagram.com/smartlab_br/', true)">
                <font-awesome-icon 
                  icon="fa-brands fa-instagram" :style="{ width: '20px', height: '20px' }"
                  title="Instagram" />
              </a>
              <a class="mr-2 cursor-pointer" @click="pushRoute('https://github.com/smartlab-br', true)">
                <font-awesome-icon 
                  icon="fa-brands fa-github" :style="{ width: '20px', height: '20px' }"
                  title="GitHub" />
              </a>
              <a class="mr-2 cursor-pointer" @click="pushRoute('https://hub.docker.com/u/mptrabalho', true)">
                <font-awesome-icon 
                  icon="fa-brands fa-docker" :style="{ width: '20px', height: '20px' }"
                  title="Docker" />
              </a>
            </v-col>

            <v-col 
              class="text-xs-right subheading text-lg-center" :class="{
              'pt-5 pb-3': $vuetify.display.smAndDown,
            }" cols="12" md="6" lg="1" sm="6">
              <div class="caption mr-1 mb-1">
                Licenças
              </div>
              <a class="mx-2 cursor-pointer" @click="pushRoute('https://creativecommons.org/licences/by-nc-sa/4.0/', true)">
                <font-awesome-icon 
                  icon="fa-brands fa-creative-commons" :style="{ width: '20px', height: '20px' }"
                  title="CC BY 4.0" />
              </a>
              <a class="cursor-pointer" @click="pushRoute('https://opensource.org/licenses/MIT', true)">
                <font-awesome-icon 
                  icon="fa-brands fa-osi" :style="{ width: '20px', height: '20px' }"
                  title="MIT - Open Source Initiative" />
              </a>
            </v-col>
          </v-row>
        </v-container>
      </v-footer>
    </client-only>
    <v-fade-transition>
      <v-btn
        v-show="isPageScrollable"
        position="fixed"
        location="bottom center"
        class="mb-0 btn-scroll-custom text-none px-3 py-2" 
        style="z-index: 100; opacity: 0.85; backdrop-filter: blur(4px);"
        :color="theme.current.value.colors.primary"
        rounded="0"
        elevation="6"
        height="auto"
        @click="executeScrollAction"
      >
        <div class="d-flex flex-column align-center justify-center line-height-1">
          
          <template v-if="isAtBottom">
            <v-icon size="small" class="mb-1">mdi-arrow-up</v-icon>
            <span>Para o topo</span>
          </template>

          <template v-else>
            <span>Leia mais</span>
            <v-icon size="small" class="mt-1">mdi-arrow-down</v-icon>
          </template>

        </div>
      </v-btn>
    </v-fade-transition>
  </v-app>

</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { useMainStore } from '~/store'
import { useSnackbarStore } from '~/store/snackbar'
import { TextTransformService } from "~/utils/service/singleton/textTransform"

// Stores (auto-importados no Nuxt 4)
const store = useMainStore()
const snackbar = useSnackbarStore()
const theme = useTheme()
const { getPlaces } = store
const { observatories, currentObs, currentAnalysisUnit, places, smartlab } = storeToRefs(store)
const textTransformService = new TextTransformService()

// Router (auto-importado)
const router = useRouter()
const route = useRoute()

// Reactive state
const isLayoutLoading = ref(true)
const menuItems = ref<Observatory[]>([])
const drawer = ref(false)
const rail = ref(false)
const seen = ref(false)
const auOptions = ref<Place[]>([])
const gsItemBusca = ref<string | null>(null)
const gsLoadingStatusSearchOptions = ref<"" | "LOADING" | "ERROR">("")
const isAtBottom = ref(false)
const isPageScrollable = ref(false)

// Template refs com tipagem correta para Vuetify 3
const autocompleteChangePlace = ref<any>(null) // ou use ComponentPublicInstance

// Watchers com tipagem
watch(
  () => observatories.value,
  async (newValue: Observatory[] | null | undefined) => {
    if (newValue) {
      menuItems.value = newValue.slice()
      if (menuItems.value) {
        menuItems.value.unshift({
          id: "default",
          blocked: false,
          title: "Início",
          short_title: "Início",
          short_desc: "Início",
          tooltip: "Início",
          hash_tag: "",
          external: false,
          rippleColor: "",
          dimensions: [],
          icon: "mdi-apps",
          to: "/"
        })
      }
    }
    checkLayoutReady()
  }
)

// Watcher para detectar mudanças na rota e atualizar currentObs
watch(
  () => route.fullPath,
  () => {
    if (observatories.value) {
      store.setCurrentObs(route)
    }
  },
  { immediate: true }
)

// Verifica se o layout está pronto para ser exibido
const checkLayoutReady = () => {
  if (observatories.value && currentObs.value && smartlab.value) {
    isLayoutLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await getPlaces()
  if (places.value) {
    auOptions.value = places.value.slice()
  }
  // Inicializa currentObs com base na rota atual
  if (observatories.value) {
    store.setCurrentObs(route)
  }
  checkLayoutReady()

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', checkScroll, { passive: true })
  setTimeout(checkScroll, 500)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', checkScroll)
})

// Methods
const customFilter = (
  itemText: string,
  queryText: string,
  _item?: any
): boolean => {
  queryText = textTransformService.replaceSpecialCharacters(queryText).toLowerCase()
  itemText = textTransformService.replaceSpecialCharacters(itemText).toLowerCase()
  return itemText.includes(queryText)
}

const changeAnalysisUnit = (
  router: ReturnType<typeof useRouter>,
  searchItem: Place,
  idObservatorio: string | null = null
) => {
  snackAlert({ color: "warning", text: `${idObservatorio} - ${searchItem.label}` })
  try {
    AnalysisUnit.searchAnalysisUnit(router, store, searchItem, idObservatorio, observatories.value)
  } catch (err) {
    console.error(err)
    snackAlert({ color: "error", text: String(err) })
  }
}

const snackAlert = (params: { color: string; text: any }) => {
  snackbar.showSnackbar(params)
}

const pushRoute = (link: string, external?: boolean) => {
  if (external) {
    window.open(link, '_blank')
  } else {
    navigateTo(link)
  }
}

const focusChangePlace = () => {
  if (autocompleteChangePlace.value) {
    seen.value = true
    autocompleteChangePlace.value.menu = true
    autocompleteChangePlace.value.focus()
  }
}

const itemClick = (item: Observatory) => {
  if (item.blocked) {
    snackAlert({
      color: "orange-darken-4",
      text: "Esse observatório estará disponível em breve."
    })
  } else {
    pushRoute(item.to, item.external)
    drawer.value = false
  }
}

const checkScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement
  isPageScrollable.value = scrollHeight > clientHeight
  isAtBottom.value = Math.ceil(scrollTop + clientHeight) >= (scrollHeight - 100)
}

let scrollTimeout: number | null = null
const onScroll = () => {
  if (scrollTimeout) return
  scrollTimeout = window.requestAnimationFrame(() => {
    checkScroll()
    scrollTimeout = null
  })
}

const executeScrollAction = () => {
  if (isAtBottom.value) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })
  }
}
</script>

<style>
.v-toolbar {
  z-index: 101 !important;
}

.first-section {
  position: relative;
  background-color: black;
}

.animated-background-row {
  min-height: 700px;
  height: 100%;
  background-color: black;
  position: relative;
  overflow: hidden;
}

.animated-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  transition: opacity 2s ease;
  animation: zoomBackground 40s ease-in-out infinite;
}

.fade-in {
  opacity: 0;
  /* Fade out */
}

@keyframes zoomBackground {
  0% {
    transform: scale(1);
    /* Tamanho inicial */
  }

  50% {
    transform: scale(1.2);
    /* Zoom In */
  }

  100% {
    transform: scale(1);
    /* Zoom Out */
  }
}

.animated-background-content {
  position: relative;
  /* Para garantir que o conteúdo esteja acima da imagem de fundo */
  z-index: 1;
  /* Z-index para sobrepor o conteúdo */
  color: white;
  /* Cor do texto para contrastar com o fundo */
}

.bg-shadow {
  background-color: rgba(0, 0, 0, 0.5) !important;
  position: absolute !important;
  top: 0;
  margin: 0 !important;
  width: 100%;
  min-height: 100% !important;
}

.bg-home-shadow {
  position: absolute !important;
  top: 0;
  margin: 0 !important;
  width: 100%;
  min-height: 100% !important;
}

a {
  text-decoration: none;
}

.bg-translucent {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.bg_blue {
  background-color: rgb(0, 171, 240, 0.5);
}

.bg_red {
  background-color: rgb(255, 124, 101, 0.5);
}

.bg_green {
  background-color: rgb(53, 246, 0, 0.5);
}

.parallax__content .bottom-nav {
  background-color: rgba(0, 0, 0, 0.6) !important;
}

.drawer_input label {
  top: 8px !important;
}

.v-navigation-drawer,
.toolbar {
  z-index: 101 !important;
}

.footer {
  z-index: 98 !important;
  box-shadow: 0px -2px 4px -1px rgba(0, 0, 0, 0.2), 0px -4px 5px 0px rgba(0, 0, 0, 0.14), 0px -1px 10px 0px rgba(0, 0, 0, 0.12);
}

.leaflet-pane {
  z-index: 1 !important;
}

.leaflet-top,
.leaflet-bottom {
  z-index: 2 !important;
}

.leaflet-control {
  z-index: 3 !important;
}

.leaflet-control-zoom-in,
.leaflet-control-zoom-out {
  z-index: 4 !important;
}

.btn-scroll-custom {
  font-family: 'Palanquin', Calibri, sans-serif !important; /* Puxa a sua fonte do projeto */
  font-size: 12px !important; /* Define o tamanho que você pediu */
  text-transform: none !important; /* Garante as maiúsculas e minúsculas corretas */
  letter-spacing: normal !important;
}

.map_geo {
  height: 400px;
  width: 100%;
  position: relative;
  /* border: 1px solid #BDBDBD; */
}

.map_geo_full {
  position: absolute;
  z-index: 1;
  background-color: white;
  width: 100%;
  height: 100%;
  padding-top: 64px;
  top: 0;
}

.migration-animate-path {
  animation-name: migration-path;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-duration: 80s;
  animation-direction: normal;
}

@keyframes migration-path {
  from {
    stroke-dashoffset: 100%
  }

  to {
    stroke-dashoffset: 0%
  }
}

/* @import url('https://fonts.googleapis.com/css?family=Palanquin');   */
/* @import url('https://fonts.googleapis.com/css?family=Lato:300');   */
/* @import url('https://fonts.googleapis.com/css?family=Roboto+Condensed'); */
/* @import url('https://fonts.googleapis.com/css?family=Ubuntu|Ubuntu+Condensed');   */

@font-face {
  font-family: titulos-observatorio;
  src: local('titulos-observatorio'),
    url('/fonts/PathwayGothicOne-Regular.woff') format('woff'),
    url('/fonts/PathwayGothicOne-Regular.eot') format('eot');
}

@font-face {
  font-family: Palanquin;
  src: local('Palanquin'),
    url('/fonts/Palanquin-Regular.woff') format('woff'),
    url('/fonts/Palanquin-Regular.eot') format('eot');
}

@font-face {
  font-family: Lato;
  src: local('Lato'),
    url('/fonts/Lato-Light.woff') format('woff'),
    url('/fonts/Lato-Light.eot') format('eot');
  font-weight: 300;
}

@font-face {
  font-family: 'Roboto Condensed';
  src: local('Roboto Condensed'),
    url('/fonts/Roboto-Condensed.woff') format('woff'),
    url('/fonts/Roboto-Condensed.eot') format('eot');
}

@font-face {
  font-family: Ubuntu;
  src: local('Ubuntu'),
    url('/fonts/Ubuntu-Regular.woff') format('woff'),
    url('/fonts/Ubuntu-Regular.eot') format('eot');
}

@font-face {
  font-family: 'Ubuntu Condensed';
  src: local('Ubuntu Condensed'),
    url('/fonts/Ubuntu-Condensed.woff') format('woff'),
    url('/fonts/Ubuntu-Condensed.eot') format('eot');
}

.display-4-obs,
.display-3-obs,
.display-2-obs,
.display-1-obs,
.headline-obs,
.title-obs,
.caption-obs {
  font-family: titulos-observatorio, Calibri, sans-serif !important;
}

.ubuntu {
  font-family: Ubuntu, Calibri, sans-serif !important;
}

.ubuntu-condensed {
  font-family: 'Ubuntu Condensed', Calibri, sans-serif !important;
}

.application,
.subheading,
.body-2,
.body-1,
.body,
.caption,
.title-obs-desc,
.link-obs,
.micro-caption,
.display-2,
.title,
.display-1,
.headline {
  font-family: Palanquin, Calibri, sans-serif !important;
}

.screen-title {
  line-height: 0.75em !important;
}

.link-obs {
  font-size: 1.429rem;
}

.micro-caption {
  font-size: 0.625rem;
  line-height: 0.6875rem;
}

.data-source {
  font-size: 0.857rem !important;
  /* position: absolute; */
  bottom: 30px;
}

.position-relative {
  position: relative;
}

/*
  .application {
    line-height: 1.1 !important;
  }
  .display-4-obs, .display-3-obs, .display-2-obs, .display-1-obs, .headline-obs, .title-obs {
    font-family: 'Roboto Condensed', sans-serif !important;
  } */

.line-height-1 {
  line-height: 1;
}

/*
  .body-obs {
    font-size: 1.143rem;
    text-align: justify;
    line-height: 1.429rem;
  }
  */
.display-title {
  font-size: 4rem;
}

.body-obs {
  font-size: 1rem;
  text-align: justify;
}

.display-4-obs {
  font-size: 6.7rem;
}

.display-3-obs {
  font-size: 4rem;
}

.display-2-obs {
  font-size: 3.214rem;
}

.display-1-obs {
  font-size: 2.214rem;
}

.headline-obs {
  font-size: 1.714rem !important;
}

.card-title-text {
  font-size: 1.5rem !important;
  font-weight: 400;
  line-height: 1.3;
}

.title-comment {
  font-size: 0.85rem;
  color: #e53935;
  font-weight: 400;
  margin-top: 2px;
}

.title-obs {
  font-size: 1.429rem;
}

.caption-obs {
  font-size: 0.9375rem;
}

.title-obs-desc {
  font-size: 1.429rem;
}

.minicard .title-obs-desc {
  font-size: 0.8rem;
  display: block;
  word-break: break-word;
  overflow-wrap: break-word;
}

.minicard .v-col .v-row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.ident-list {
  list-style-position: outside;
}

.blue-title {
  color: rgb(53, 94, 168, 1);
}

.bg-translucent .flex {
  align-self: stretch;
  color: white;
}

.bg-translucent .column {
  align-self: center;
}

.translucent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.85;
}

.btn-busca {
  border-radius: 4px;
  z-index: 1;
  color: white;
  font-family: titulos-observatorio, sans-serif !important;
  font-size: large;
  font-weight: bold;
}

.global-search .v-icon {
  transform: none !important;
  -webkit-transform: none !important;
}

.error-in-card {
  color: white !important;
}

.v-tooltip i {
  cursor: pointer;
}

.cursor-pointer {
  cursor: pointer;
}

.v-progress-circular__info {
  text-align: center;
}

.footer-nav {
  position: fixed;
  bottom: 0;
  margin-left: 47vw;
  z-index: 99;
  width: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-nav>.layout {
  flex: none;
  border-radius: 0.3rem 0.3rem 0 0;
  background-color: rgba(0, 0, 0, 0.6);
}

.soon {
  color: rgb(255, 230, 0) !important;
  font-weight: bold;
}

.v-dialog .v-tabs__container {
  flex: 1 0 auto;
  display: flex;
  height: 100%;
  min-height: 48px;
  list-style-type: none;
  transition: transform 0.6s cubic-bezier(0.86, 0, 0.07, 1);
  white-space: nowrap;
  position: relative;
}

.v-tabs__icon--next {
  background-color: var(--v-accent-base) !important;
  border-color: var(--v-accent-base) !important;
}

.v-tabs__icon--prev {
  background-color: var(--v-accent-base) !important;
  border-color: var(--v-accent-base) !important;
}

.footer-colab-text {
  font-size: x-small;
}

/*
  .v-btn--floating.v-btn--small {
      height: 25px;
      width: 25px;
  }
  -->
  */

.v-navigation-drawer .v-list-item__spacer {
  display: none !important;
}

.transparent-autocomplete .v-input__control,
.transparent-autocomplete .v-input {
  width: 20rem;
}

.transparent-autocomplete .v-field__overlay {
  background: transparent !important;
  box-shadow: none !important;
}
</style>

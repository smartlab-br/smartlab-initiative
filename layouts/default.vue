<template>
  <v-app>
      <v-app-bar 
        app
        v-if="currentObs"
        dark
        clipped-left
        :color="ColorsService.getCurrentTheme().primary"
      >
        <v-app-bar-nav-icon
          aria-label="Menu Principal"
          tabindex="1"
          @click.stop="drawer = !drawer"
        ></v-app-bar-nav-icon>

        <v-app-bar-title class="ml-2">
          <v-row
            class="pa-0"
            align="center"
          >
            <v-col
              class="flex-grow-0 flex-shrink-1 pr-2 pt-2 hidden-xs-only"
            >
              <img
                tabindex="20"
                src="/icons/smartlab_labeled-30.png"
                class="cursor-pointer pa-3"
                alt="Smartlab"
                @click="pushRoute('/', false)"
                @keyup.enter="pushRoute('/', false)"
              >
            </v-col>
            <v-col
              class="flex-grow-0 flex-shrink-1 pr-2 pt-2 hidden-sm-and-up"
            >
              <img
                tabindex="20"
                src="/icons/smartlab-icon-30x30.png"
                class="cursor-pointer"
                alt="Smartlab"
                @click="pushRoute('/', false)"
              >
            </v-col>
            <v-divider
              v-show="currentObs.title"
              vertical
              class="mx-2"
              style="background-color:rgba(255,255,255,0.7)"
            />
            <v-col
              v-show="currentObs.title"
              class="flex-grow-0 flex-shrink-1 line-height-1"
            >
              <v-row>
                <v-col
                  class="cursor-pointer pa-0 text-right"
                  @click="pushRoute((route && (route.path.indexOf('localidade') != -1)) ? '../' : (route && (route.path.indexOf('estudo') != -1 || route.path.indexOf('smartmap') != -1)) ? './' : '', false);"
                >
                  {{ currentObs.title }}
                </v-col>
                <v-col
                  class="pa-0 text-caption text-right"
                >
                  <a
                    @click="pushRoute('https://www.instagram.com/smartlab_br/', true)"
                  >
                    {{ currentObs.hash_tag? "#"+currentObs.hash_tag: "" }}
                  </a>
                </v-col>
              </v-row>
            </v-col>
            <v-divider
              v-show="localidade"
              vertical
              class="mx-2"
              style="background-color:rgba(255,255,255,0.7)"
            />
            <!-- 
              @mousedown="seen = true" 
              @click="focusChangePlace()"
            -->
            <v-col
              v-if="localidade"
              class="line-height-1 pl-2 flex-grow-1 flex-shrink-0 "
            >
              <v-row 
                @click="focusChangePlace()"
              > 
                <v-col><span class="cursor-pointer">{{ localidade.nm_localidade }}</span></v-col>
                <v-col
                  class="pa-0 text-caption"
                >
                  {{ localidade.nm_tipo }}
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-app-bar-title>

        <v-spacer />

          <!-- 
            v-model="gsItemBusca"
            :filter="customFilter"
            :loading="gsLoadingStatusSearchOptions == 'LOADING' ? true : false"
            :color="gsLoadingStatusSearchOptions == 'ERROR' ? 'error' : (gsLoadingStatusSearchOptions == 'LOADING' ? 'warning' : 'accent')"
            @blur="gsItemBusca = null" 
          -->
          <v-autocomplete
            v-if="auOptions.length > 0"
            v-show="seen"
            ref="autocompleteChangePlace"
            v-model="gsItemBusca"
            tabindex="21"
            class="input-group--focused global-search"
            persistent-hint
            item-text="label"
            item-value="id"
            persistent-placeholder
            placeholder="Mudar localidade"
            return-object
            :items="auOptions"
            :menu-props="{ minWidth: '380px' }"
            :loading="gsLoadingStatusSearchOptions === 'LOADING'"
            :color="gsLoadingStatusSearchOptions === 'ERROR' ? 'error' : gsLoadingStatusSearchOptions === 'LOADING' ? 'warning' : 'accent'"
            @blur="gsItemBusca = ''"
          >
          <template v-slot:item="{ item }">
              <template v-if="auOptions.length < 2">
                <v-list-item>
                  <v-list-item-title>
                    <v-progress-circular
                      :size="20"
                      indeterminate
                      color="primary"
                    />
                  </v-list-item-title>
                </v-list-item>
              </template>
              <template v-else>
                <v-list-item>
                  <v-row no-gutters>
                    <v-col>
                      <v-list-item-title
                        @click="changeAnalysisUnit(router, item.raw)"
                      >
                      {{ item.raw.label + (item.raw.scope === 'uf' ? ' (UF)' : '') }}
                      </v-list-item-title>
                    </v-col>
                    <v-col class="d-flex justify-end">
                      <v-list-item-action style="min-width: 120px">
                        <v-row no-gutters>
                          <v-col
                            v-for="(search_item, indxSearch) in observatories"
                            :key="'search_item_obs_' + indxSearch"
                            @click="changeAnalysisUnit(router, item.raw, search_item.id)"
                          >
                            <v-col
                              v-if="!search_item.blocked && (!item.raw.exclude_from || !item.raw.exclude_from.includes(search_item.id))"
                              class="d-flex flex-column align-center"
                            >
                              <v-tooltip 
                                location="bottom"
                                :text="search_item.tooltip">
                                <template v-slot:activator="{ props }">
                                  <!-- <v-icon
                                    v-if="search_item.icon"
                                    v-bind="props"
                                    small
                                    :color="ColorsService.getThemeFromId(search_item.id).primary"
                                    :innerHTML="search_item.icon"
                                  /> -->
                                 <svg 
                                    v-if="search_item.app_icon"
                                    v-bind="props"
                                    viewBox="0 0 16 16" 
                                    width="16" 
                                    height="16" 
                                    role="presentation" 
                                    :fill="ColorsService.getThemeFromId(search_item.id).primary" 
                                    class="icon--inline" 
                                    :title="search_item.short_title">
                                    <use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="'/icons/sprite/coord-sprites.svg#' + search_item.app_icon" />
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
            </template>
          </v-autocomplete>
        
        <v-btn
          tabindex="22"
          icon
          class="ml-0"
          aria-label="Alterar Localidade"
          @click="seen = !seen"
        >
            <v-icon
              color="white"
            >
              mdi-map-marker
            </v-icon>
            <v-tooltip
            activator="parent"
            location="bottom"
            >Alterar Localidade</v-tooltip>
        </v-btn>
          <a
            class="mx-2"
            @click="pushRoute('https://www.instagram.com/smartlab_br/', true)"
          >
            <font-awesome-icon icon="fa-brands fa-instagram" class="fa-lg"/>
            <v-tooltip
                activator="parent"
                location="bottom"
              >Instagram</v-tooltip>
          </a>
      </v-app-bar>
      <v-navigation-drawer
        v-if="observatories"
        v-model="drawer"
        :rail="rail"
        :scrim="false"
        width="300px"
        temporary
      >
        <v-list>
        <!-- Usando v-for para iterar sobre uma lista de itens -->
          <v-list-item
            v-for="(item, index) in menuItems"
            :key="index"
            link
            :ripple="{ class: item.rippleColor }"
            :tabindex="drawer ? 10 + index : ''"
            @click="itemClick(item)"
            @keyup.enter="itemClick(item)"
          >
            <template v-slot:prepend>
              <v-icon
                  v-if="item.icon"
                  :title="item.short_title"
                  :color="ColorsService.getThemeFromId(item.id).primary"
                >
                  {{ item.icon }}
              </v-icon>
              <svg 
                v-else-if="item.app_icon"
                viewBox="0 0 24 24" 
                width="24" 
                height="24" 
                role="presentation" 
                :fill="ColorsService.getThemeFromId(item.id).primary" 
                class="icon--inline" 
                :title="item.short_title">
                <use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="'/icons/sprite/coord-sprites.svg#' + item.app_icon" />
              </svg>                
              <v-tooltip
                activator="parent"
                location="bottom"
              >{{ item.short_title}}</v-tooltip>
            </template>
            <v-list-item-title class="pl-3">{{ item.short_title }}</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-divider />
        <v-list>
          <v-list-item
            link
            @click.stop="rail = !rail"
          >
            <template v-slot:prepend>
              <v-icon>{{ rail ? 'mdi-chevron-right' : 'mdi-chevron-left' }} </v-icon>
            </template>
            <v-list-item-title class="pl-3">Apenas ícones</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main>
        <v-container class="pa-0" fluid >
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
      <v-footer 
        :color="ColorsService.getCurrentTheme().primary"
        padless
      >
        <v-container
          fluid 
          :class="{
            'px-2 py-4': $vuetify.display.xs,
            'px-3 py-4': $vuetify.display.smAndDown,
            'px-5 py-5': $vuetify.display.mdAndUp,
          }"
        >      
        <v-row wrap align="center">
          <v-col
            class="text-xs-left text-lg-center"
            :class="{
              'pt-5 pb-3': $vuetify.display.smAndDown,
            }"
            cols="12"
            xs="2"
            sm="1"
          >
            <a
              @click="pushRoute('/saibamais/smartlab', false)"
            >
              <img
                src="/smartlab/smartlab-small.svg"
                alt="Smartlab"
                height="25px"
                style="margin-bottom: -5px;"
              >
              <span class="ml-3">Sobre</span>
            </a>
          </v-col>

          <v-col
            v-if="smartlab"
            class="text-xs-right text-md-center"
            :class="{
              'pt-5 pb-3': $vuetify.display.smAndDown,
            }"
            cols="12"
            xs="10"
            sm="11"
            lg="9"
          >
            <v-row justify="center" wrap>
              <v-col
                class="footer-colab-text"
                cols="12"
                xs="12"
                xl="11"
                offset-xl="1"
              >
                {{ smartlab.footer.title }}
              </v-col>
              <v-col
                cols="12"
              >
                <img
                  v-for="(footerImg, footerImgIndex) in smartlab.footer.images"
                  :key="footerImgIndex"
                  :src="footerImg.src"
                  :class="footerImg.class"
                  :alt="footerImg.title"
                  :height="footerImg.height ? footerImg.height : ''"
                  :max-height="footerImg.maxHeight ? footerImg.maxHeight : ''"
                  :min-height="footerImg.minHeight ? footerImg.minHeight : ''"
                  @click="pushRoute(footerImg.url, true)"
                >
              </v-col>
            </v-row>
          </v-col>

          <!-- <v-col>
            <v-row
              v-if="smartlab"
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
            xs6 sm6 md6 lg1 
            cols="12"
            md="6"
            lg="1"
            sm="6"
          >
            <a
              class="mr-2"
              @click="pushRoute('https://www.instagram.com/smartlab_br/', true)"
            >
              <font-awesome-icon icon="fa-brands fa-instagram" class="fa-lg" title="Instagram" />
            </a>
            <a
              class="mr-2"
              @click="pushRoute('https://github.com/smartlab-br', true)"
            >
              <font-awesome-icon icon="fa-brands fa-github" class="fa-lg" title="GitHub" />
            </a>
            <a
              class="mr-2"
              @click="pushRoute('https://hub.docker.com/u/mptrabalho', true)"
            >
              <font-awesome-icon icon="fa-brands fa-docker" class="fa-lg" title="Docker" />
            </a>
          </v-col>

          <v-col
            class="text-xs-right subheading text-lg-center"
            :class="{
              'pt-5 pb-3': $vuetify.display.smAndDown,
            }"
            cols="12"
            md="6"
            lg="1"
            sm="6"
          >
            <div class="caption mr-1 mb-1">
              Licenças
            </div>
            <a
              class="mx-2"
              @click="pushRoute('https://creativecommons.org/licences/by-nc-sa/4.0/', true)"
            >
              <font-awesome-icon icon="fa-brands fa-creative-commons" class="fa-lg" title="CC BY 4.0" />
            </a>
            <a
              @click="pushRoute('https://opensource.org/licenses/MIT', true)"
            >
              <font-awesome-icon icon="fa-brands fa-osi" class="fa-lg" title="MIT - Open Source Initiative" />
            </a>
          </v-col>
        </v-row>
        </v-container>
      </v-footer>
    </client-only>

  </v-app>

</template>

<script lang="ts">
import { onMounted, watch, ref } from "vue"
import { useMainStore } from "~/store"
import { useSnackbarStore } from "~/store/snackbar"
import { ColorsService } from "~/utils/service/singleton/colors"
import { AnalysisUnit } from "~/utils/model/analysisUnit"
import { NavigationService } from "~/utils/service/singleton/navigation"
import { storeToRefs } from "pinia"
import { useRoute, useRouter, type Router } from "vue-router"
import type { VAutocomplete } from "vuetify/components"


export default {
  setup() {
    const store = useMainStore()
    const snackbar = useSnackbarStore()   
    const { getPlaces } = store
    const { observatories, currentObs, localidade, places, smartlab } = storeToRefs(store)
    const router = useRouter()
    const route = useRoute()
    const menuItems = ref<Observatory[]>([])
    const drawer = ref(false)
    let rail = ref(true)
    let seen = ref(false)
    let auOptions = ref<any[]>([])
    const gsItemBusca = ref<string|null>(null)
    const gsLoadingStatusSearchOptions = ref("") // ("LOADING")
    const autocompleteChangePlace = ref<VAutocomplete | null>(null)

    watch(
      () => observatories.value, // Função getter que retorna observatories.value
      async (newValue) => {
        if (newValue){
          menuItems.value = newValue.slice() // Atualiza o valor de menuItems
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
              to: "/"})
          }
        }
      }
    )
    
    // watch(
    //   () => currentObs.value, 
    //   async (newValue) => {
    //     console.log("Novo valor:", newValue)
    //     title.value = newValue.title
    //   }
    // )


    onMounted(() => {
      ColorsService.changeTheme(store.currentObsId)
      ColorsService.getThemeFromId("des")
      getPlaces().then(() => {
        if (places.value) {
          auOptions.value = places.value.slice()  
        }
      })   
    })

    const changeAnalysisUnit = (router: Router, searchItem: Place, idObservatorio:string|null = null) => {
      snackAlert({ color: "warning", text: `${idObservatorio} - ${searchItem.label}` })
      // try {
      //   AnalysisUnit.searchAnalysisUnit(router, store, searchItem, idObservatorio, observatories.value)
      // } catch (err) {
      //   console.log(err)
      //   snackAlert({ color: "error", text: err })
      // }
    }

    const snackAlert = (params:{color: string, text: any}) => {
      snackbar.showSnackbar(params)
    }

    const pushRoute = (link: string, external?: boolean) => {
      NavigationService.pushRoute(router, link, external)
    }

    const focusChangePlace = () => {
      if (autocompleteChangePlace.value) {
        seen.value = true
        autocompleteChangePlace.value .menu = true
        autocompleteChangePlace.value.focus()
      }
    }

    const itemClick = (item: any) => {
      if (!item.blocked) {
        NavigationService.pushRoute(router, item.to, item.external)
      } else {
        snackAlert({ color: "orange-darken-4", text: "Esse observatório estará disponível em breve." })
      }
    }

    return {
      observatories,
      menuItems,
      drawer,
      rail,
      seen,
      router,
      route,
      currentObs,
      localidade,
      auOptions,
      changeAnalysisUnit,
      gsItemBusca,
      gsLoadingStatusSearchOptions,
      pushRoute,
      smartlab,
      focusChangePlace,
      autocompleteChangePlace,
      itemClick
    }
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
    opacity: 0; /* Fade out */
  }

  @keyframes zoomBackground {
    0% {
      transform: scale(1); /* Tamanho inicial */
    }
    50% {
      transform: scale(1.2); /* Zoom In */
    }
    100% {
      transform: scale(1); /* Zoom Out */
    }
  }

  .animated-background-content {
    position: relative; /* Para garantir que o conteúdo esteja acima da imagem de fundo */
    z-index: 1; /* Z-index para sobrepor o conteúdo */
    color: white; /* Cor do texto para contrastar com o fundo */
  }

  .bg-shadow {
    background-color:rgba(0,0,0,0.5) !important;
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

  a{
    text-decoration: none;
  }
  .bg-translucent {
    background-color: rgba(0,0,0,0.5);
    z-index: 1;
  }
  .bg_blue {
    background-color:rgb(0,171,240,0.5);
  }
  .bg_red{
    background-color:rgb(255,124,101,0.5);
  }
  .bg_green{
    background-color:rgb(53,246,0,0.5);
  }
  .parallax__content .bottom-nav {
    background-color: rgba(0,0,0,0.6) !important;
  }
  .drawer_input label {
    top: 8px !important;
  }
  .v-navigation-drawer, .toolbar {
    z-index: 101 !important;
  }
  .footer {
    z-index: 98 !important;
    box-shadow: 0px -2px 4px -1px rgba(0,0,0,0.2), 0px -4px 5px 0px rgba(0,0,0,0.14), 0px -1px 10px 0px rgba(0,0,0,0.12);
  }
  .leaflet-pane {
    z-index: 1 !important;
  }
  .leaflet-top, .leaflet-bottom {
    z-index: 2 !important;
  }
  .leaflet-control {
    z-index: 3 !important;
  }
  .leaflet-control-zoom-in, .leaflet-control-zoom-out {
    z-index: 4 !important;
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
    top:0;
  }

  .migration-animate-path {
    animation-name: migration-path;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-duration: 80s;
    animation-direction: normal;
  }

  @keyframes migration-path {
    from{
      stroke-dashoffset: 100%
    }
    to{
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

  .display-4-obs, .display-3-obs, .display-2-obs, .display-1-obs, .headline-obs, .title-obs, .caption-obs {
    font-family: titulos-observatorio, Calibri, sans-serif !important;
  }

  .ubuntu {
    font-family: Ubuntu, Calibri, sans-serif !important;
  }
  .ubuntu-condensed {
    font-family: 'Ubuntu Condensed', Calibri, sans-serif !important;
  }
  .application, .subheading, .body-2, .body-1, .body, .caption, .title-obs-desc, .link-obs, .micro-caption, .display-2, .title, .display-1, .headline {
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

  .title-obs {
    font-size: 1.429rem;
  }

  .caption-obs {
    font-size: 0.9375rem;
  }

  .title-obs-desc {
    font-size: 1.429rem;
  }

  .ident-list {
    list-style-position: outside;
  }

  .blue-title {
    color: rgb(53,94,168,1);
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
    top:0;
    left:0;
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
    background-color: rgba(0,0,0,0.6);
  }

  .soon {
    color:rgb(255, 230, 0) !important;
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

  .v-tabs__icon--next{
    background-color:  var(--v-accent-base) !important;
    border-color:  var(--v-accent-base) !important;
  }

  .v-tabs__icon--prev{
    background-color:  var(--v-accent-base) !important;
    border-color:  var(--v-accent-base) !important;
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

</style>

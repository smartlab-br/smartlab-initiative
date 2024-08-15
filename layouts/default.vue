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
            class="pa-0 align-center"
          >
            <v-col
              class="pr-2 pt-2 hidden-xs-only"
            >
              <img
                tabindex="20"
                src="/icons/smartlab_labeled-30.png"
                class="cursor-pointer"
                alt="Smartlab"
                @click="pushRoute('/', false)"
                @keyup.enter="pushRoute('/', false)"
              >
            </v-col>
            <v-col
              class="pr-2 pt-2 hidden-sm-and-up"
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
              class="line-height-1"
            >
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
                  class="text-white"
                  @click="pushRoute('https://www.instagram.com/smartlab_br/', true)"
                >
                  {{ currentObs.hash_tag? "#"+currentObs.hash_tag: "" }}
                </a>
              </v-col>
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
              class="cursor-pointer line-height-1 pl-2"
            >
              <v-col>{{ localidade.nm_localidade }}</v-col>
              <v-col
                class="pa-0 text-caption"
              >
                {{ localidade.nm_tipo }}
              </v-col>
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
                        @click="changeAnalysisUnit(router, item)"
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
                            @click="changeAnalysisUnit(router, item, search_item.id)"
                          >
                            <v-col
                              v-if="!search_item.blocked && (!item.raw.exclude_from || !item.raw.exclude_from.includes(search_item.id))"
                              class="d-flex flex-column align-center"
                            >
                              <v-tooltip 
                                location="bottom"
                                :text="search_item.tooltip">
                                <template v-slot:activator="{ props }">
                                  <v-icon
                                    v-if="search_item.icon"
                                    v-bind="props"
                                    small
                                    :color="ColorsService.getThemeFromId(search_item.id).primary"
                                    :innerHTML="search_item.icon"
                                  />
                                 <svg 
                                    v-if="search_item.app_icon"
                                    v-bind="props"
                                    viewBox="0 0 16 16" 
                                    width="16" 
                                    height="16" 
                                    role="presentation" 
                                    :fill="ColorsService.getThemeFromId(search_item.id).primary" 
                                    class="icon--inline" 
                                    :title="search_item.shor_title">
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
            class="text-white mx-2"
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
                :title="item.shor_title">
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
        <v-container>
        <v-responsive class="d-flex align-center text-center fill-height">
          <v-row class="d-flex align-center justify-center">
            <v-col cols="auto"> <v-btn color="primary"> Primary </v-btn> </v-col>
            <v-col cols="auto">
              <v-btn color="secondary"> Secondary </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn color="accent"> Accent </v-btn>
            </v-col>
            <v-col cols="auto">
              <div>
              </div>
            </v-col>
          </v-row>
          <v-row class="d-flex align-center justify-center">
            <v-col cols="auto">
              <slot />
            </v-col>
          </v-row>
        </v-responsive>
      </v-container>
    </v-main>
    <v-footer 
      :color="ColorsService.getCurrentTheme().primary"
      class="white--text"
      padless
    >
      <v-container
        :class="{
          'px-2 py-4': $vuetify.display.xs,
          'px-3 py-4': $vuetify.display.smAndDown,
          'px-5 py-5': $vuetify.display.mdAndUp,
        }"
      >      
      <v-row wrap>
        <v-col
          class="text-xs-left"
          :class="{
            'pt-5 pb-3': $vuetify.display.smAndDown,
          }"
          cols="12"
          xs="2"
          sm="1"
        >
          <a
            class="white--text"
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
          cols="9"
          xs="10"
          sm="11"
          lg="9"
        >
          <v-row justify="center" wrap>
            <v-col
              class="footer-colab-text"
              xs="12"
            >
              {{ smartlab.rodape.titulo }}
            </v-col>
            <v-col>
              <img
                v-for="(footerImg, footerImgIndex) in smartlab.rodape.imagens"
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

        <v-col>
          <v-row
            v-if="smartlab"
            justify="center"
            class="footer-colab-text"
          >
            {{ smartlab.rodape.apoio }}
          </v-row>
        </v-col>

        <v-col
          class="text-md-left text-lg-center subheading"
          :class="{
            'pt-5 pb-3': $vuetify.display.smAndDown,
          }"
          cols="6"
          sm="2"
        >
          <a
            class="white--text mr-2"
            @click="pushRoute('https://www.instagram.com/smartlab_br/', true)"
          >
            <font-awesome-icon icon="fa-brands fa-instagram" class="fa-lg" title="Instagram" />
          </a>
          <a
            class="white--text mr-2"
            @click="pushRoute('https://github.com/smartlab-br', true)"
          >
            <font-awesome-icon icon="fa-brands fa-github" class="fa-lg" title="GitHub" />
          </a>
          <a
            class="white--text mr-2"
            @click="pushRoute('https://hub.docker.com/u/mptrabalho', true)"
          >
            <font-awesome-icon icon="fa-brands fa-docker" class="fa-lg" title="Docker" />
          </a>
        </v-col>

        <v-col
          class="text-xs-right subheading"
          :class="{
            'pt-5 pb-3': $vuetify.display.smAndDown,
          }"
          cols="6"
          sm="2"
        >
          <div class="caption mr-1 mb-1">
            Licenças
          </div>
          <a
            class="white--text mx-2"
            @click="pushRoute('https://creativecommons.org/licences/by-nc-sa/4.0/', true)"
          >
            <font-awesome-icon icon="fa-brands fa-creative-commons" class="fa-lg" title="CC BY 4.0" />
          </a>
          <a
            class="white--text"
            @click="pushRoute('https://opensource.org/licenses/MIT', true)"
          >
            <font-awesome-icon icon="fa-brands fa-osi" class="fa-lg" title="MIT - Open Source Initiative" />
          </a>
        </v-col>
      </v-row>
      </v-container>
    </v-footer>

  </v-app>

</template>

<script lang="ts">
import { onMounted, watch, ref } from "vue"
import { useMainStore } from "~/store"
import { ColorsService } from "~/utils/service/singleton/colors"
import { AnalysisUnit } from "~/utils/model/analysisUnit"
import { NavigationService } from "~/utils/service/singleton/navigation"
import { storeToRefs } from "pinia"
import { useRoute, useRouter } from "vue-router"

export default {
  setup() {
    const store = useMainStore()
    const { getPlaces } = store
    const { observatories, currentObs, localidade, places, smartlab } = storeToRefs(store)
    const router = useRouter()
    const route = useRoute()
    const menuItems = ref<any[]>([])
    const drawer = ref(false)
    let rail = ref(true)
    let seen = ref(false)
    let auOptions = ref<any[]>([])
    const gsItemBusca = ref<string|null>(null)
    const gsLoadingStatusSearchOptions = ref("") // ("LOADING")

    watch(
      () => observatories.value, // Função getter que retorna observatories.value
      async (newValue) => {
        menuItems.value = newValue.slice() // Atualiza o valor de menuItems
        if (menuItems.value) {
          menuItems.value.unshift({ icon: "mdi-apps", short_title: "Início", to: "/"})
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
        auOptions.value = places.value.slice()
      })   
    })

    const changeAnalysisUnit = (router: any, searchItem: any, idObservatorio:string|null = null) => {
      try {
        AnalysisUnit.searchAnalysisUnit(router, store, searchItem, idObservatorio, observatories)
      } catch (err) {
        console.log(err)
        // this.snackAlert({ color: 'error', text: err })
      }
    }

    const pushRoute = (link: string, external?: boolean) => {
      NavigationService.pushRoute(router, link, external)
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
      smartlab
    }
  }
}

</script>

<template>
  <v-app>
      <v-app-bar
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
                @click="NavigationService.pushRoute(router, '/', false)"
                @keyup.enter="NavigationService.pushRoute(router, '/', false)"
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
                @click="NavigationService.pushRoute(router, '/', false)"
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
                @click="NavigationService.pushRoute(router, (route && (route.path.indexOf('localidade') != -1)) ? '../' : (route && (route.path.indexOf('estudo') != -1 || route.path.indexOf('smartmap') != -1)) ? './' : '', false);"
              >
                {{ currentObs.title }}
              </v-col>
              <v-col
                class="pa-0 text-caption text-right"
              >
                <a
                  class="text-white"
                  @click="NavigationService.pushRoute(router, 'https://www.instagram.com/smartlab_br/', true)"
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

        <div width="20rem">
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
            tabindex="21"
            class="input-group--focused global-search"
            persistent-hint
            item-text="label"
            placeholder="Mudar localidade"
            item-value="id"
            return-object
            :items="auOptions"
            :menu-props="{minWidth:'380px'}"
          >
            <!-- <template #item="{ item }" >
              <template v-if="auOptions.length < 2">
                <v-list-tile-content>
                  <v-progress-circular
                    :size="20"
                    indeterminate
                    color="primary"
                  />
                </v-list-tile-content>
              </template>
              <template v-else>
                <v-list-tile-content>
                  <v-list-tile-title
                    @click="changeAnalysisUnit(router, item)"
                  >
                  {{ item.label + (item.scope == 'uf'? ' (UF)': '') }}
                  </v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action style="min-width: 120px">
                  <div row>
                    <div
                      v-for="(search_item, indxSearch) in observatorios"
                      :key="'search_item_obs_' + indxSearch"
                      @click="changeAnalysisUnit(router, data.item, search_item.id)"
                    >
                      <div
                        v-if="!search_item.blocked && (data.item.exclude_from == null || data.item.exclude_from == undefined || !data.item.exclude_from.includes(search_item.id))"
                        column
                        wrap
                        align-center
                      >
                        <v-tooltip bottom>
                          <v-icon
                            v-if="search_item.icon"
                            slot="activator"
                            small
                            :color="$observatories.getTheme(search_item.id).primary"
                            v-html="search_item.icon"
                          />
                          <AppIcon
                            v-else-if="search_item.app_icon"
                            slot="activator"
                            size="16"
                            :fill="$observatories.getTheme(search_item.id).primary"
                            :icon="search_item.app_icon"
                          />
                          <v-row v-html="search_item.tooltip" />
                        </v-tooltip>
                      </div>
                    </div>
                  </div>
                </v-list-tile-action>
              </template>
            </template> -->
          </v-autocomplete>
        </div>

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
            @click="NavigationService.pushRoute(router, 'https://www.instagram.com/smartlab_br/', true)"
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
    </v-app>

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
</template>

<script lang="ts">
import { onMounted, watch, ref } from "vue"
import { useMainStore } from "~/store"
import { ColorsService } from "~/utils/service/singleton/colors"
import { NavigationService } from "~/utils/service/singleton/navigation"
import { storeToRefs } from "pinia"
import { useRoute, useRouter } from "vue-router"

export default {
  setup() {
    const store = useMainStore()
    const { getPlaces } = store
    const { observatories, currentObs, localidade, places } = storeToRefs(store)
    const router = useRouter()
    const route = useRoute()
    const menuItems = ref<any[]>([])
    const drawer = ref(false)
    let rail = ref(true)
    let seen = ref(false)
    let auOptions = ref<any[]>([])

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
      auOptions
    }
  }
}

</script>

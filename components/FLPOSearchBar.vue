<template>
  <v-container>
    <v-row>
      <v-col>

        <v-menu 
          v-if="items_site.length > 0"
          allow-overflow 
          v-model="menu" 
        >
          <!-- Configurando o slot `activator` -->
          <template v-slot:activator="{ props }">
            <v-text-field 
              ref="searchText" 
              v-bind="props"
              v-model="search_site" 
              label="Pesquisa por Tema" 
              variant="outlined"
              density="compact" 
              class="search-text" 
              prepend-inner-icon="mdi-magnify" 
              @keyup.enter="menu = true" 
            />
          </template>

          <v-card class="treeview-card">
            <v-card-text>
              <v-treeview 
                v-if="items_site.length > 0"
                ref="tree" 
                :items="items_site" 
                :search="search_site" 
                :custom-filter="searchFilter"
                class="treeview-card-item"
              >
                <template v-slot:prepend="{ item }">
                  <svg 
                    v-if="item.item_type === 'observatorio'"
                    viewBox="0 0 24 24" 
                    width="24" 
                    height="24" 
                    role="presentation" 
                    :fill="'white'" 
                    class="icon--inline" 
                    :title="item.short_title">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="'/icons/sprite/coord-sprites.svg#' + item.app_icon" />
                  </svg>                
                  <v-icon 
                    v-else-if="item.item_type === 'dimensao'"
                    color="white"
                  >
                    mdi-view-list
                  </v-icon>
                  <v-icon 
                    v-else
                    color="white"
                  >
                    mdi-card-text-outline
                  </v-icon>
                </template>
                <template 
                  v-slot:content="{ item }"
                >
                    <a v-if="item.item_type === 'observatorio'" class="text-white pl-5" @click="goToItem(item.url)">
                    {{ $vuetify.display.smAndDown ? item.short_title : item.title }}
                  </a>
                  <a v-else class="text-white pl-5" @click="goToItem(item.url)">{{ item.title }}</a>
                </template>
              </v-treeview>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from "vue"
import { YamlFetcherService } from "~/utils/service/singleton/yamlFetcher"
import { TextTransformService } from "~/utils/service/singleton/textTransform"
import { NavigationService } from "~/utils/service/singleton/navigation"
import { useRouter } from "vue-router"
import { VTreeview } from "vuetify/labs/VTreeview"
import { useMainStore } from "~/store"

export default defineComponent({
  components: {
    VTreeview,
  },
  setup() {
    const store = useMainStore()
    const menu = ref(false)
    const search_site = ref("")
    const items_site = ref([])
    const treeRef = ref(null)
    const textTransformService = new TextTransformService()
    const router = useRouter()

    onMounted(() => {
      YamlFetcherService.loadYaml("br/mapa_site").then((result) => {
        items_site.value = result
      })
    })

    function searchFilter(_value: any, search: string, item: any) {
      const queryText = textTransformService.replaceSpecialCharacters(search).toLowerCase()
      const itemText = textTransformService.replaceSpecialCharacters(item.raw.search_text).toLowerCase()
      console.log("result: ", itemText.includes(queryText))
      return itemText.includes(queryText)
    }

    function handleSearch(input: string) {
      console.log("handleSearch", input)
      // if (input) {
      //   treeRef.value.updateAll(true)
      // } else {
      //   treeRef.value.updateAll(false)
      // }
    }

    function goToItem(url: string) {
      if (url.includes("{0}")) {
        url = textTransformService.replaceArgs(url, [store.currentPlace])
      }
      NavigationService.pushRoute(router, url)
    }

    return {
      menu,
      search_site,
      items_site,
      treeRef,
      searchFilter,
      handleSearch,
      goToItem,
    }
  },
})
</script>

<style scoped>
.search-text {
  border-radius: 100px !important;
  background-color: #212121 !important;
  opacity: 0.7;
  text-align: center;
  caret-color: auto;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
}

.search-text .v-icon {
  color: rgba(255, 255, 255, 0.4) !important;
}

.search-text .v-field__label {
  width: 100% !important;
}

.search-text input {
  max-width: 90% !important;
  text-align: center;
  color: white;
}

.treeview-card {
  border-radius: 20px;
  background-color: #212121 !important;
  opacity: 0.9;
  max-height: 400px;
  overflow-y: auto;
}

.treeview-card-item {
  background-color: #212121 !important;
  color: white;
}
</style>
<template>
  <v-container>
    <v-row>
      <v-col>

        <v-menu v-if="items_site.length > 0" v-model="menu" allow-overflow>
          <!-- Configurando o slot `activator` -->
          <template #activator="{ props }">
            <v-text-field v-bind="props" v-model="search_site" class="search-text" label="Pesquisa por Tema"
              variant="outlined" density="compact" prepend-inner-icon="mdi-magnify" @keyup.enter="menu = true" />
          </template>

          <v-card class="treeview-card">
            <v-card-text>
              <v-treeview v-if="items_site.length > 0" ref="treeRef" v-model:opened="open" :items="items_site"
                :search="search_site" :custom-filter="searchFilter" class="treeview-card-item" item-value="id"
                :open-all="openAll">
                <template #prepend="{ item }">
                  <svg v-if="item.item_type === 'observatorio'" viewBox="0 0 24 24" width="24" height="24"
                    role="presentation" :fill="'white'" class="icon--inline" :title="item.short_title">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink"
                      :xlink:href="'/icons/sprite/coord-sprites.svg#' + item.app_icon" />
                  </svg>
                  <v-icon v-else-if="item.item_type === 'dimensao'" color="white">
                    mdi-view-list
                  </v-icon>
                  <v-icon v-else color="white">
                    mdi-card-text-outline
                  </v-icon>
                </template>
                <template #title="{ item }">
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

<script setup lang="ts">
import { VTreeview } from "vuetify/components"
import { YamlFetcherService } from "~/utils/service/singleton/yamlFetcher"
import { TextTransformService } from "~/utils/service/singleton/textTransform"
import { NavigationService } from "~/utils/service/singleton/navigation"
import { useMainStore } from "~/store"

interface SiteMapReg {
  id: string
  item_type: string
  title: string
  url: string
  search_text: string
  children: SiteMapReg[]
  short_title?: string
  app_icon?: string
}

const store = useMainStore()
const router = useRouter()
const { $yamlPath } = useNuxtApp()

const menu = ref(false)
const search_site = ref("")
const items_site = ref<SiteMapReg[]>([])
const treeRef = ref<VTreeview | null>(null)
const open = ref<string[]>([])
const openAll = ref(false)

const textTransformService = new TextTransformService()

watch(search_site, (newSearch: string) => {
  if (treeRef.value) {
    if (!openAll.value) {
      openAll.value = true
      treeRef.value.$forceUpdate()
    }
  }
  if (treeRef.value && newSearch === "") {
    openAll.value = false
    treeRef.value.$forceUpdate()
  }
})

onMounted(async () => {
  const result = await YamlFetcherService.loadYaml<any>($yamlPath, "br/mapa_site")
  items_site.value = result
})

const searchFilter = (_value: string, search: string, item: any) => {
  const queryText = textTransformService.replaceSpecialCharacters(search).toLowerCase()
  const itemText = textTransformService.replaceSpecialCharacters(item.raw.search_text).toLowerCase()
  return itemText.includes(queryText)
}

const goToItem = (url: string) => {
  let targetUrl = url
  if (targetUrl.includes("{0}")) {
    targetUrl = textTransformService.replaceArgs(targetUrl, [store.currentAnalysisUnit])
  }
  NavigationService.pushRoute(router, targetUrl)
}
</script>

<style scoped>
.search-text :deep(.v-input__control .v-field) {
  border-radius: 100px !important;
  background-color: #212121 !important;
  opacity: 0.7;
  text-align: center;
  caret-color: auto;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
}

.search-text :deep(.v-input__control .v-field .v-field__prepend-inner) {
  color: rgba(255, 255, 255, 0.4) !important;
}

.search-text :deep(.v-input__control .v-field .v-label) {
  width: 100% !important;
}

.search-text :deep(.v-input__control .v-field input) {
  max-width: 90% !important;
  text-align: center;
  color: white
}

.search-text :deep(.v-input__control .v-field--focused) {
  border-radius: 100px !important;
  border: 2px solid #ffffff !important;
}

.search-text :deep(.v-input__control .v-field--focused .v-field__prepend-inner) {
  color: #ffffff !important;
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

.v-field--variant-outlined {
  border-radius: 100px !important;
  background-color: #212121 !important;
  opacity: 0.7;
  text-align: center;
  caret-color: auto;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
}
</style>
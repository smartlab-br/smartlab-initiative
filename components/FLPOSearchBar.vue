<template>
  <v-container>
    <v-row>
      <v-col>
        <v-text-field 
          ref="searchText" 
          v-model="search_site" 
          label="Pesquisa por Tema" 
          variant="outlined"
          density="compact" 
          class="search-text" 
          prepend-inner-icon="mdi-magnify" 
          @input="handleSearch"
          @keyup.enter="menu = true" 
        />
        <v-menu 
          v-if="items_site.length > 0"
          allow-overflow 
          offset 
          v-model="menu" 
          activator="parent"
        >
          <v-card class="treeview-card">
            <v-card-text>
              <v-treeview 
                ref="tree" 
                v-model:open="open"
                :items="items_site" 
                :search="search_site" 
                :filter="searchFilter"
                class="treeview-card-item">
                <template v-slot:prepend="{ item }">
                  <v-row>
                    <v-col class="d-flex" cols="1">
                      <svg 
                        v-if="item.type === 'observatorio'"
                        viewBox="0 0 24 24" 
                        width="24" 
                        height="24" 
                        role="presentation" 
                        :fill="'white'" 
                        class="icon--inline" 
                        :title="item.short_title">
                        <use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="'/icons/sprite/coord-sprites.svg#' + item.app_icon" />
                      </svg>                
                      <v-icon v-else-if="item.type === 'dimensao'">
                        mdi-view-list
                      </v-icon>
                      <v-icon v-else>
                        mdi-article
                      </v-icon>
                    </v-col>
                    <v-col v-if="item.type === 'observatorio'" class="d-flex align-center">
                      <a class="text-white" @click="goToItem(item.url)">
                        {{ $vuetify.display.smAndDown ? item.short_title : item.name }}
                      </a>
                    </v-col>
                    <v-col v-else class="d-flex align-center">
                      <a class="text-white" @click="goToItem(item.url)">{{ item.name }}</a>
                    </v-col>
                  </v-row>
                </template>
              </v-treeview>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { YamlFetcherService } from "~/utils/service/singleton/yamlFetcher"
import { TextTransformService } from "~/utils/service/singleton/textTransform"
import { NavigationService } from "~/utils/service/singleton/navigation"
import { useRouter } from "vue-router"
import { AnalysisUnit } from "~/utils/model/analysisUnit"
import { VTreeview } from "vuetify/labs/VTreeview"

const menu = ref(false)
const search_site = ref("")
const items_site = ref([])
const open = ref([1, 2])
const treeRef = ref(null)
const textTransformService = new TextTransformService()
const router = useRouter()

onMounted(() => {
  // Replace with your actual service calls
  YamlFetcherService.loadYaml("br/mapa_site").then(result => {
    items_site.value = result
  })
})

function searchFilter(item, search) {
  const queryText = textTransformService.replaceSpecialCharacters(search).toLowerCase()
  const itemText = textTransformService.replaceSpecialCharacters(item.search_text).toLowerCase()
  return itemText.includes(queryText)
}

function handleSearch(input) {
  // if (input) {
  //   treeRef.value.updateAll(true)
  // } else {
  //   treeRef.value.updateAll(false)
  // }
  console.log("handleSearch", input)
}

function goToItem(url) {
  if (url.includes("{0}")) {
    url = textTransformService.replaceArgs(url, [AnalysisUnit.getCurrentAnalysisUnit()])
  }
  NavigationService.pushRoute(router, url)
}

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
}
</style>
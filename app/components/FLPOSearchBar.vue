<template>
  <v-container>
    <v-row>
      <v-col>
        <div v-click-outside="closeMenu" class="position-relative" >     
          <v-text-field
            v-model="search_site"
            class="search-text"
            placeholder="Pesquisa por Tema"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            autocomplete="off"
            @focus="menu = true"
            @keyup.enter="menu = true"
          />
          
          <v-card v-show="menu && items_site.length > 0" class="treeview-card dropdown-menu">
            <v-card-text class="pa-2">
              <v-treeview 
                v-if="items_site.length > 0" 
                ref="treeRef" 
                v-model:opened="open" 
                :items="items_site"
                :search="search_site" 
                :custom-filter="searchFilter" 
                class="treeview-card-item" 
                item-value="id"
                density="compact"
              >
                <template #prepend="{ item }">
                  <svg 
                    v-if="item.item_type === 'observatorio'" viewBox="0 0 24 24" width="24" height="24"
                    role="presentation" :fill="'white'" class="icon--inline" :title="item.short_title">
                    <use 
                      xmlns:xlink="http://www.w3.org/1999/xlink"
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
                  <a v-if="item.item_type === 'observatorio'" class="text-white pl-2" @click="goToItem(item.url)">
                    {{ $vuetify.display.smAndDown ? item.short_title : item.title }}
                  </a>
                  <a v-else class="text-white pl-2" @click="goToItem(item.url)">
                    {{ item.title }}
                  </a>
                </template>
              </v-treeview>          
            </v-card-text>
          </v-card>
        </div>  
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

const textTransformService = new TextTransformService()
const closeMenu = () => {
  menu.value = false
}

// Helper function to get all item IDs recursively
const getAllItemIds = (items: SiteMapReg[]): string[] => {
  const ids: string[] = []
  const traverse = (item: SiteMapReg) => {
    ids.push(item.id)
    if (item.children && item.children.length > 0) {
      item.children.forEach(traverse)
    }
  }
  items.forEach(traverse)
  return ids
}

watch(search_site, (newSearch: string) => {
  if (newSearch && newSearch.trim() !== "") {
    // Open all nodes when searching
    open.value = getAllItemIds(items_site.value)
  } else {
    // Clear opened nodes when search is empty
    open.value = []
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
/* 1. Container Principal: Resolve arredondamento e bordas */
.search-text :deep(.v-field) {
  border-radius: 100px !important;
  overflow: hidden !important; 
  background-color: #212121 !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  transition: border 0.3s ease;
  height: 54px !important;
  min-height: 54px !important;
}

.search-text :deep(.v-field__field) {
  height: 54px !important;
}

.search-text :deep(.v-field__input) {
  min-height: 54px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* 2. Alinhamento do Input */
.search-text :deep(input) {
  text-align: center !important;
  color: white !important;
}

/* 3. Lupa */
.search-text :deep(.v-field__prepend-inner) {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  color: rgba(255, 255, 255, 0.4) !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 4. Resets */
.search-text :deep(.v-field--focused) {
  border: 2px solid #ffffff !important;
}

.search-text :deep(.v-field__outline) {
  display: none !important;
}

.search-text :deep(.v-field__overlay) {
  border-radius: 100px !important;
}

/* Remove o espaço extra do v-input__details */
.search-text :deep(.v-input__details) {
  display: none !important;
  min-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 5. Estilos do Card e Árvore */
.treeview-card {
  border-radius: 20px;
  background-color: #212121 !important;
  opacity: 0.95;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-height: 400px;
  
  /* Rolagem vertical e horizontal caso a lista seja muito longa ou muito larga */
  overflow-y: auto;
  overflow-x: auto; 
}

/* 6. Comportamento do Dropdown Customizado */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  
  /* Garante que o card nunca seja menor que a barra de pesquisa */
  min-width: 100%; 
  
  /* Permite que o card cresça na horizontal para caber a linha inteira do texto */
  width: max-content; 
  
  /* Limite de segurança para o card não estourar para fora do monitor/celular */
  max-width: 90vw; 
  
  z-index: 100;
}

.treeview-card-item {
  background-color: #212121 !important;
  color: white;
}

/* 1. Reduz o espaço gigante padrão entre o ícone (prepend) e o texto */
.treeview-card-item :deep(.v-list-item__prepend) {
  margin-inline-end: 5px !important; /* Você pode diminuir para 8px se quiser mais grudado */
}

/* 2. Força o bloco de texto a ficar alinhado totalmente à esquerda */
.treeview-card-item :deep(.v-list-item__content) {
  text-align: left !important;
  display: flex !important;
  align-items: center !important;
}

/* 3. Remove o espaço invisível reservado para a setinha de expandir em itens sem filhos */
.treeview-card-item :deep(.v-list-item__spacer) {
  display: none !important;
  width: 0 !important;
}

/* 4. Opcional: Ajusta a margem do ícone de expansão (setinha) para não empurrar o conteúdo */
.treeview-card-item :deep(.v-treeview-group__header .v-list-item__prepend) {
    margin-inline-end: 8px !important;
}
</style>
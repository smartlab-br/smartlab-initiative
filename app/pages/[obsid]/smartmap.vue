<template>
  <v-container fluid class="pa-0">
    <v-row v-if="currentObs?.obsPage?.prevalencia" class="mx-0">
      <!-- Coluna esquerda: título + filtros -->
      <v-col cols="12" md="4" lg="3">
        <v-row class="fill-height wrap pl-3 pt-3 pr-2 ma-0 mb-0">
          <v-col>
            <v-row>
              <v-col class="headline-obs card-title pb-0 pl-3">
                <div class="card-title-text">SmartMap - Modo Avançado</div>
                <v-tooltip
                  v-if="currentObs?.obsPage?.prevalencia?.infomapa"
                  location="bottom"
                >
                  <template #activator="{ props }">
                    <v-icon v-bind="props" color="accent" class="pb-1">info</v-icon>
                  </template>
                  <FLPOCompositeText
                    :id="'info_home_prevalencia_' + currentObsId"
                    :structure="[currentObs.obsPage.prevalencia.infomapa]"
                    :custom-params="customParams"
                  />
                </v-tooltip>
              </v-col>
            </v-row>

            <v-row class="mt-2">
              <v-col class="pl-0 pr-0 pb-0 pt-6">
                <FLPOCompositeText
                  v-if="currentObs?.obsPage?.prevalencia?.mapa_filtros"
                  :id="'story_smartmap_filtros_' + currentObsId"
                  :section-class="'px-2'"
                  :structure="currentObs.obsPage.prevalencia.mapa_filtros"
                  :custom-params="customParams"
                  :reactive-filter="reactiveFilter"
                  :custom-filters="customParams"
                  :active-group="activeGroup"
                  @selection="triggerSelect"
                  @default-selection="triggerDefaultSelect"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>

      <!-- Coluna central: mapa -->
      <v-col cols="12" md="8" lg="6">
        <v-container class="pa-0" style="position: relative;">
          <div
            v-if="mapEnabled"
            :id="'smartmap_' + currentObsId"
            class="map_geo"
          />
          <v-row v-else class="ma-0" justify="center" align="center" style="min-height: 300px;">
            <v-col class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <div class="mt-2">Carregando mapa...</div>
            </v-col>
          </v-row>
          <div v-if="mapLoading" class="map-loading-overlay">
            <v-progress-circular indeterminate color="primary" size="48" />
            <div class="mt-2 text-body-2">Carregando...</div>
          </div>
        </v-container>
      </v-col>

      <!-- Coluna direita: descrição -->
      <v-col
        v-if="currentObs?.obsPage?.prevalencia?.mapa_description_right"
        cols="12"
        lg="3"
        class="pt-4"
      >
        <div style="padding-top: 16px;">
        <FLPOCompositeText
          :id="'story_smartmap_desc_r_' + currentObsId"
          :structure="currentObs.obsPage.prevalencia.mapa_description_right"
          :custom-params="customParams"
          :reactive-filter="reactiveFilter"
          :custom-filters="customParams"
          :active-group="activeGroup"
          @selection="triggerSelect"
        />
        </div>
      </v-col>
    </v-row>

    <!-- Botão voltar flutuante -->
    <v-btn
      style="position:fixed;bottom:24px;right:24px;z-index:10;"
      color="primary"
      icon
      size="large"
      :to="'/' + currentObsId"
      aria-label="Voltar"
    >
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ColorsService } from '~/utils/service/singleton/colors.js'
import { useMainStore } from '~/store'

const store = useMainStore()
const route = useRoute()
const router = useRouter()
const { $fillDataStructure, $chartGen, $chartRegen } = useNuxtApp()

const { currentObs, currentObsId } = storeToRefs(store)

const customParams = ref<Record<string, any>>({})
const reactiveFilter = ref<any>(null)
const activeGroup = ref<string | null>(null)
const mapEnabled = ref(false)
const mapLoading = ref(false)
const chartHandler = ref<any>(null)
const pendingLayerPayload = ref<any>(null)
const pendingFilterReload = ref(false)

watch(chartHandler, (handler) => {
  if (handler && pendingLayerPayload.value) {
    try {
      handler.adjustVisibleLayers(pendingLayerPayload.value)
    } catch (e) {
      console.error('[smartmap adjustVisibleLayers] erro:', e)
    }
    pendingLayerPayload.value = null
  }
  if (handler && pendingFilterReload.value) {
    pendingFilterReload.value = false
    reloadMap(applyFilters())
  }
})

watch(pendingFilterReload, (isPending) => {
  if (isPending && chartHandler.value) {
    pendingFilterReload.value = false
    reloadMap(applyFilters())
  }
})

const initSwitchDefaults = () => {
  const filtros = currentObs.value?.obsPage?.prevalencia?.mapa_filtros
  if (!filtros) return
  const visibleLayers: Record<string, boolean> = {}
  for (const section of filtros) {
    if (section.type === 'switch-group' && section.switches) {
      for (const swt of section.switches) {
        visibleLayers[swt.id] = swt.default ?? true
      }
      break
    }
    if (section.type === 'radio' && section.items) {
      const defaultItem = section.items.find((item: any) => item.default) ?? section.items[0]
      for (const item of section.items) {
        visibleLayers[item.value] = item.value === defaultItem?.value
      }
      activeGroup.value = defaultItem?.id ?? defaultItem?.value ?? null
      break
    }
  }
  if (Object.keys(visibleLayers).length > 0) {
    customParams.value.enabled = visibleLayers
  }
}

const enableMap = async () => {
  if (mapEnabled.value) return

  const prevalencia = currentObs.value?.obsPage?.prevalencia
  if (!prevalencia) return

  initSwitchDefaults()

  const chartId = 'smartmap_' + currentObsId.value
  const chartType = prevalencia.chart_type
  const chartOptions = prevalencia.chart_options
  const compRefs = { customParams }

  $fillDataStructure(
    prevalencia,
    customParams.value,
    async (dataset: any[], _rules: any, _struct: any, _added: any, metadata: any) => {
      const cleanDataset = Array.isArray(dataset) ? dataset.filter((row) => row != null) : []
      if (!cleanDataset.length) {
        console.error('[smartmap enableMap] Dataset vazio após carregamento')
        return
      }

      mapEnabled.value = true
      await nextTick()

      if (chartHandler.value) return

      try {
        const handler = await $chartGen(
          compRefs,
          store,
          chartId,
          chartType,
          prevalencia,
          chartOptions,
          cleanDataset,
          metadata
        )
        chartHandler.value = handler
      } catch (err) {
        console.error('[smartmap enableMap] Erro ao gerar o mapa:', err)
        mapEnabled.value = false
      }
    }
  )
}

const applyFilters = (): string[] | string | null => {
  const prevalencia = currentObs.value?.obsPage?.prevalencia
  const filtros = prevalencia?.mapa_filtros
  if (!prevalencia) return null

  // Usa apiBase quando disponível (URLs limpas sem filtros default como max_competencia)
  const apiObject = (prevalencia as any).apiBase ?? prevalencia.api
  let filterUrl = ''

  for (const filter of (filtros || [])) {
    if (filter.group != null && filter.group !== activeGroup.value) continue
    if (filter.type !== 'select' && filter.type !== 'slider') continue

    const rulesApi = !Array.isArray(filter.selection?.rules?.api)
      ? filter.selection?.rules?.api
      : filter.selection?.rules?.api?.[0]
    const filterApiArgs: any[] = rulesApi?.args || []
    const filterTemplate: string = filter.selection?.rules?.filter
    if (!filterTemplate || !filterApiArgs.length) continue

    let filterPart = filterTemplate
    let allArgsPresent = true
    filterApiArgs.forEach((arg: any, i: number) => {
      const val = customParams.value[arg.named_prop]
      if (val != null) {
        filterPart = filterPart.replace(`{${i}}`, val)
      } else {
        allArgsPresent = false
      }
    })
    if (allArgsPresent) filterUrl += filterPart
  }

  // Armazena filterUrl em customParams para uso pelos minicards/rankings reativos
  customParams.value.filterUrl = filterUrl

  if (Array.isArray(apiObject)) {
    return apiObject.map((apiItem: any) => apiItem.fixed + filterUrl)
  } else if (apiObject?.fixed) {
    return (apiObject.fixed as string) + filterUrl
  }
  return null
}

const reloadMap = async (endpoints?: string[] | string | null, overrideParams?: Record<string, any>) => {
  const prevalencia = currentObs.value?.obsPage?.prevalencia
  if (!prevalencia) return

  const chartId = 'smartmap_' + currentObsId.value
  const chartType = prevalencia.chart_type
  const chartOptions = prevalencia.chart_options
  const params = { ...customParams.value, ...(overrideParams ?? {}) }
  const compRefs = { customParams: { value: params } as any }
  const addedParams = endpoints ? { endpoint: endpoints } : undefined

  mapLoading.value = true

  $fillDataStructure(
    prevalencia,
    params,
    async (dataset: any[], _rules: any, _struct: any, _added: any, metadata: any) => {
      const cleanDataset = Array.isArray(dataset) ? dataset.filter((row) => row != null) : []
      if (!cleanDataset.length) {
        mapLoading.value = false
        return
      }

      if (!chartHandler.value) {
        mapEnabled.value = true
        await nextTick()
        try {
          const handler = await $chartGen(compRefs, store, chartId, chartType, prevalencia, chartOptions, cleanDataset, metadata)
          if (handler) chartHandler.value = handler
        } catch (err) {
          console.error('[smartmap reloadMap] Erro ao gerar o mapa:', err)
        }
      } else {
        try {
          const handler = await $chartRegen(compRefs, store, chartHandler.value, chartId, chartType, prevalencia, chartOptions, cleanDataset, metadata)
          if (handler) chartHandler.value = handler
        } catch (err) {
          console.error('[smartmap reloadMap] Erro ao regenerar o mapa:', err)
        }
      }
      mapLoading.value = false
      // Atualiza reactiveFilter para acionar re-fetch nos minicards/rankings reativos
      reactiveFilter.value = { ...customParams.value }
    },
    addedParams
  )
}

const triggerSelect = async (payload: any) => {
  if (!payload.type) return

  if (payload.type === 'switch-group') {
    customParams.value.enabled = payload.enabled
    if (!chartHandler.value) {
      pendingLayerPayload.value = payload.enabled
      enableMap()
    } else {
      try {
        chartHandler.value.adjustVisibleLayers(payload.enabled)
      } catch (e) {
        console.error('[smartmap adjustVisibleLayers] erro:', e)
      }
    }
    return
  }

  if (payload.type === 'radio') {
    if (!payload.item) return
    const capturedEnabled = { ...payload.enabled }
    customParams.value.radioApi = payload.item.api
    if (capturedEnabled) customParams.value.enabled = capturedEnabled
    activeGroup.value = payload.item.id ?? payload.item.value ?? null

    const prevalencia = currentObs.value?.obsPage?.prevalencia
    if (!prevalencia) return
    const chartId = 'smartmap_' + currentObsId.value
    const chartType = prevalencia.chart_type
    const chartOptions = prevalencia.chart_options

    const radioParams = { ...customParams.value }
    $fillDataStructure(
      prevalencia,
      radioParams,
      async (dataset: any[], _rules: any, _struct: any, _added: any, metadata: any) => {
        const cleanDataset = Array.isArray(dataset) ? dataset.filter((row) => row != null) : []
        if (!cleanDataset.length) return

        if (capturedEnabled) customParams.value.enabled = capturedEnabled
        const frozenEnabled = capturedEnabled ? { ...capturedEnabled } : customParams.value.enabled
        const frozenCompRefs = { customParams: { value: { ...customParams.value, enabled: frozenEnabled } } as any }

        if (!chartHandler.value) {
          mapEnabled.value = true
          await nextTick()
          try {
            const handler = await $chartGen(frozenCompRefs, store, chartId, chartType, prevalencia, chartOptions, cleanDataset, metadata)
            if (handler) chartHandler.value = handler
          } catch (err) {
            console.error('[smartmap radio] Erro ao gerar o mapa:', err)
            mapEnabled.value = false
          }
        } else {
          try {
            const handler = await $chartRegen(frozenCompRefs, store, chartHandler.value, chartId, chartType, prevalencia, chartOptions, cleanDataset, metadata)
            if (handler) chartHandler.value = handler
          } catch (err) {
            console.error('[smartmap radio] Erro ao regenerar o mapa:', err)
          }
        }
      },
      { endpoint: payload.item.api, singleEndpoint: true, apiOptions: payload.item.api_options ?? null }
    )
    return
  }

  if (payload.type === 'select') {
    const itemCustomFilterName = !Array.isArray(payload.rules?.api)
      ? payload.rules?.api?.args?.[0]?.named_prop
      : payload.rules?.api?.[0]?.args?.[0]?.named_prop

    if (!itemCustomFilterName) return

    if (payload.item == null) {
      customParams.value[itemCustomFilterName] = null
    } else if (Array.isArray(payload.item)) {
      let value = ''
      for (let i = 0; i < payload.item.length; i++) {
        const item_value = payload.item[i][itemCustomFilterName]
        value += (i === 0 ? '' : '-') + (typeof item_value === 'string' ? `'${item_value}'` : item_value)
      }
      customParams.value[itemCustomFilterName] = value
    } else {
      customParams.value[itemCustomFilterName] = payload.item[itemCustomFilterName]
    }

    if (payload.rules?.group) {
      customParams.value.enabled = { [payload.rules.group]: true }
    }

    await reloadMap(applyFilters())
    return
  }

  if (payload.type === 'slider') {
    const suffix = payload.rules?.suffix_params ? '_' + payload.rules.suffix_params : ''
    if (Array.isArray(payload.value)) {
      customParams.value['value_min' + suffix] = payload.value[0]
      customParams.value['value_max' + suffix] = payload.value[1]
    } else {
      customParams.value['value' + suffix] = payload.value
    }
    await reloadMap(applyFilters())
  }
}

const triggerDefaultSelect = (payload: any) => {
  if (payload.type !== 'select' || payload.item == null) return

  const itemCustomFilterName = !Array.isArray(payload.rules?.api)
    ? payload.rules?.api?.args?.[0]?.named_prop
    : payload.rules?.api?.[0]?.args?.[0]?.named_prop
  if (!itemCustomFilterName) return

  customParams.value[itemCustomFilterName] = payload.item[itemCustomFilterName]

  if (chartHandler.value) {
    reloadMap(applyFilters())
  } else {
    pendingFilterReload.value = true
  }
}

onBeforeMount(async () => {
  if (store.smartlab == null) {
    await store.loadSmartlabData()
  }
  store.setCurrentObs(route)
})

onMounted(() => {
  ColorsService.changeTheme(currentObsId.value)
  if (currentObs.value?.obsPage?.prevalencia) {
    enableMap()
  }
})

watch(
  () => currentObs.value,
  (newValue) => {
    if (newValue?.obsPage?.prevalencia && !mapEnabled.value) {
      enableMap()
    }
  }
)
</script>

<style scoped>
.map_geo {
  min-height: 400px;
}

.map-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-radius: 4px;
}
</style>

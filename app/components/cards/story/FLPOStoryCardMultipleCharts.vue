<template>
  <v-row v-if="renderComponent">
    <v-col cols="12">
      <v-card :id="structure?.id" class="mx-4 mb-5 bg-card">
        <v-progress-linear
          v-show="loadingStatusDataset !== 'SUCCESS'"
          height="5"
          :indeterminate="loadingStatusDataset === 'LOADING'"
          :color="loadingStatusDataset === 'ERROR' ? 'error' : 'info'"
        />

        <!-- Estado de erro -->
        <div v-if="loadingStatusDataset === 'ERROR'" style="min-height:500px;" class="d-flex align-center justify-center">
          <div class="text-error text-center">
            {{ errorMessage }}
            <v-tooltip location="bottom">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  icon
                  size="small"
                  color="error"
                  @click="reloadComponent"
                >
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </template>
              Recarregar
            </v-tooltip>
          </div>
        </div>

        <v-card-text v-if="dataset" v-show="loadingStatusDataset === 'SUCCESS'">
          <v-col class="pa-0">

            <!-- Cabeçalho: título + botão de dados -->
            <v-row class="display-1-obs mb-0 pl-3 pt-3 pb-0 pr-0" align="end">
              <v-col cols="10" class="card-title">
                {{ cmpTitle ?? '' }}
                <v-tooltip
                  v-if="structure && structure.info"
                  location="bottom"
                  max-width="700px"
                  :close-delay="1000"
                >
                  <template #activator="{ props: tooltipProps }">
                    <v-icon v-bind="tooltipProps" color="accent" class="pb-1">mdi-information</v-icon>
                  </template>
                  <FLPOCompositeText
                    :id="'info_' + structure.id"
                    :structure="structure.info"
                    :custom-params="customParams"
                    :custom-functions="customFunctions"
                  />
                </v-tooltip>
                <div v-if="cmpTitleComment != null" class="title-comment" v-html="cmpTitleComment" />
              </v-col>
              <v-col cols="2" class="text-right pr-4">
                <v-btn
                  size="small"
                  variant="text"
                  class="btn-dados"
                  @click="dialog = true"
                >
                  <span :class="chartPosition === 'bottom' ? 'd-none d-lg-inline body' : 'd-none d-md-inline body'">Dados</span>
                  <v-icon end>mdi-table</v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Corpo: texto + gráficos -->
            <v-row style="min-height:500px;">

              <!-- Coluna de descrição / texto -->
              <v-col
                cols="12"
                :md="chartPosition !== 'bottom' ? 3 : 12"
                class="position-relative"
              >
                <div class="pt-0">
                  <FLPOCompositeText
                    v-if="!invalidInterpol"
                    :id="'story_' + structure?.id"
                    :structure="structure?.description"
                    :custom-params="customParams"
                    :custom-functions="customFunctions"
                    :custom-filters="customFilters"
                    :reactive-filter="reactiveFilter"
                    @selection="triggerSelect"
                    @default-selection="triggerDefaultSelect"
                    @resend-invalid-interpol="changeTextToInvalidInterpol"
                    @show-snackbar="snackAlert"
                    @show-authenticatio-dialog="onOpenAuthDialog"
                  />
                  <div
                    v-else
                    class="text-justify body-obs d-inline-block pa-2"
                    v-html="structure?.msgNoData?.desc"
                  />
                </div>

                <!-- Fonte -->
                <div v-if="cmpSources && cmpSources.length > 0" class="caption pb-0 pt-3 px-3 data-source">
                  Fonte:
                  <template v-for="(src, i) in cmpSources" :key="i">
                    <template v-if="src.desc && i > 0">,&nbsp;</template>
                    <span v-if="src.desc && !src.link">{{ src.desc }}</span>
                    <a
                      v-else-if="src.desc && src.link"
                      class="text-accent cursor-pointer"
                      @click="openLinkFonte(src.link)"
                    >{{ src.desc }}</a>
                  </template>
                </div>

                <!-- Tratamento e análise -->
                <div v-if="cmpAnalysis && cmpAnalysis.length > 0" class="caption pt-0 px-3 data-source">
                  Tratamento e análise:
                  <template v-for="(an, i) in cmpAnalysis" :key="i">
                    <template v-if="an.desc && i > 0">,&nbsp;</template>
                    <span v-if="an.desc && !an.link">{{ an.desc }}</span>
                    <a
                      v-else-if="an.desc && an.link"
                      class="text-accent cursor-pointer"
                      @click="openLinkFonte(an.link)"
                    >{{ an.desc }}</a>
                  </template>
                </div>
              </v-col>

              <!-- Coluna dos gráficos -->
              <v-col
                cols="12"
                :md="chartPosition !== 'bottom' ? 9 : 12"
                class="py-2"
              >
                <v-row :class="mdAndUp ? 'fill-height' : ''">
                  <v-col
                    v-for="chart in structure?.charts"
                    :key="chart.id"
                    :class="(chart.cls ?? '') + (mdAndUp ? ' fill-height' : '')"
                  >
                    <div
                      :style="cmpStyle"
                      :class="{
                        'px-3': smAndDown,
                        'px-0 mx-0 fill-height': mdAndUp
                      }"
                    >
                      <!-- Gráfico D3/Leaflet -->
                      <div
                        v-if="validCharts.includes(chart.type) && chart.options !== null"
                        :id="chartId[chart.id]"
                        class="fill-height"
                        :class="(leafletBasedCharts.includes(chart.type) || chart.type === 'MAP_TOPOJSON') ? 'map_geo' : ''"
                      />
                    </div>

                    <!-- Rodapé do gráfico -->
                    <div
                      v-if="chartFooter[chart.id] && datasetsComplete === structure?.charts?.length"
                      class="text-center chart-footer pb-0"
                    >
                      {{ chartFooter[chart.id] }}
                    </div>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-card-text>
      </v-card>

      <!-- Modal: Dataset com tabs por gráfico -->
      <v-dialog v-if="dataset && dialog" v-model="dialog" max-width="90vw">
        <v-card>
          <v-card-title class="headline-obs">Datasets</v-card-title>
          <v-card-text>
            <v-tabs v-model="activeTab" color="accent" class="elevation-1">
              <v-tab
                v-for="chart in structure?.charts"
                :key="chartId[chart.id]"
                :value="chart.id"
              >
                {{ chart.title ? chart.title : chartFooter[chart.id] }}
              </v-tab>
            </v-tabs>
            <v-window v-model="activeTab">
              <v-window-item
                v-for="chart in structure?.charts"
                :key="chartId[chart.id]"
                :value="chart.id"
              >
                <div v-if="dataset[chart.id] && chart.headers" class="content">
                  <v-data-table
                    :headers="removeFormatItems(chart.headers)"
                    :items="dataset[chart.id]"
                    :sort-by="sortByMap[chart.id] ?? []"
                    class="elevation-1"
                    items-per-page-text="Registros por página"
                    no-data-text="Sem registros"
                  >
                    <template #headers="{ columns }">
                      <tr>
                        <th
                          v-for="col in columns"
                          :key="col.key ?? col.title"
                          scope="colgroup"
                          :width="col.width"
                          class="text-start column sortable"
                          @click="changeSortForChart(chart.id, col.key)"
                        >
                          <span class="word-wrap" v-html="col.title" />
                          <v-icon size="small">mdi-arrow-up</v-icon>
                        </th>
                      </tr>
                    </template>
                    <template #item="{ item }">
                      <tr>
                        <td v-for="hdr in chart.headers" :key="hdr.value">
                          <div
                            v-if="typeof item[hdr.value] === 'string' && item[hdr.value].includes('</')"
                            :class="hdr.item_class ?? ''"
                            v-html="item[hdr.value]"
                          />
                          <div v-else :class="hdr.item_class ?? ''">
                            {{ item[hdr.value] }}
                          </div>
                        </td>
                      </tr>
                    </template>
                  </v-data-table>
                </div>
              </v-window-item>
            </v-window>
          </v-card-text>
          <v-card-actions class="px-3 pb-3">
            <v-spacer />
            <!-- <v-btn size="small" color="accent" @click="handleDownloadClick">
              <v-icon start>mdi-download</v-icon>
              Baixar
            </v-btn> -->
            <v-btn size="small" variant="flat" color="accent" @click="$openBugDialog(cmpTitle)">
              <v-icon start>mdi-bug</v-icon>
              Relate um problema
            </v-btn>
            <v-btn size="small" variant="flat" color="accent" @click="dialog = false">
              <v-icon start>mdi-close</v-icon>
              Fechar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Modal: Citações -->
      <v-dialog v-model="quotationDialog" width="500px">
        <v-card>
          <v-card-title class="headline-obs">Citações</v-card-title>
          <v-card-text>
            <p>As citações da plataforma, em regra, devem respeitar o formato ABNT para cada Observatório, incluindo-se, na consulta, a dimensão específica consultada.</p>
            <p>Exemplos:</p>
            <ul class="mention-examples">
              <li>Observatório do Trabalho Decente – Contexto Econômico e Social. SmartLab, 2021. Fonte original: (...). Disponível em: https://smartlabbr.org/trabalhodecente. Acesso em: 10 de ago. de 2021.</li>
              <li>Observatório de Segurança e Saúde no Trabalho – Covid 19. Fonte original: (...). SmartLab, 2021. Disponível em: https://smartlabbr.org/sst. Acesso em: 10 de ago. de 2021.</li>
              <li>Observatório da Erradicação do Trabalho Escravo e do Tráfico de Pessoas – Sinan/ Tráfico de Pessoas. Fonte original: (...). SmartLab, 2021. Disponível em: https://smartlabbr.org/trabalhoescravo. Acesso em: 10 de ago. de 2021.</li>
              <li>Observatório da Prevenção e da Erradicação do Trabalho Infantil – Áreas Prioritárias e Análise Comparativa. Fonte original: (...). SmartLab, 2021. Disponível em: https://smartlabbr.org/trabalhoinfantil. Acesso em: 10 de ago. de 2021.</li>
              <li>Observatório da Igualdade de Oportunidades no Trabalho – População em Situação de Rua. Fonte original: (...). SmartLab, 2021. Disponível em: https://smartlabbr.org/diversidade. Acesso em: 10 de ago. de 2021.</li>
            </ul>
          </v-card-text>
          <v-row align="center" justify="center" class="mb-3 mt-0">
            <v-btn color="accent" @click="downloadData">
              <v-icon start color="white">mdi-check</v-icon>
              OK
            </v-btn>
          </v-row>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { TextTransformService } from '~/utils/service/singleton/textTransform'
import { useSnackbarStore } from '~/store/snackbar'
import { useMainStore } from '~/store'
import { useAuthStore } from '~/store/auth'
import { useBaseLayout } from '~/composables/useBaseLayout'

defineOptions({ name: 'FLPOStoryCardMultipleCharts' })

interface Props {
  structure?: Record<string, any>
  customParams?: Record<string, any>
  customFunctions?: Record<string, any>
  topology?: Record<string, any>
  sectionIndex?: number
  selectedPlace?: string
  chartPosition?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['chart-loaded', 'sendInvalidInterpol', 'update'])

// ── Serviços / plugins ─────────────────────────────────────────────────────────
const { $fillDataStructure, $chartGen, $chartRegen, $validCharts, $leafletBasedCharts, $openBugDialog, $openAuthenticatioDialog } = useNuxtApp()
const textTransformService = new TextTransformService()
const snackbar = useSnackbarStore()
const mainStore = useMainStore()
const authStore = useAuthStore()
const { smAndDown, mdAndUp } = useDisplay()
const { setComplexAttribute } = useBaseLayout(computed(() => props.customParams), emit)

// ── Estado ─────────────────────────────────────────────────────────────────────
const renderComponent = ref(true)
const dialog = ref(false)
const quotationDialog = ref(false)
const activeTab = ref<string | null>(null)
const dataset = ref<Record<string, any> | null>(null)
const datasetsComplete = ref(0)
const metadata = ref<Record<string, any> | null>(null)
const errorMessage = ref<string | null>(null)
const cmpTitle = ref<string>('')
const cmpTitleComment = ref<string | null>(null)
const invalidInterpol = ref(false)
const chartFooter = ref<Record<string, string>>({})
const chartId = ref<Record<string, string>>({})
const chartHandlers = ref<Record<string, any>>({})
const selectedTopology = ref<any>(props.topology ?? null)
const customFilters = ref<Record<string, any>>({})
const reactiveFilter = ref<any>(null)
const sortByMap = ref<Record<string, any[]>>({})

// ── Computed ───────────────────────────────────────────────────────────────────
const loadingStatusDataset = computed(() => {
  if (errorMessage.value) return 'ERROR'
  if (datasetsComplete.value === props.structure?.charts?.length) return 'SUCCESS'
  return 'LOADING'
})

const validCharts = computed<string[]>(() => $validCharts as string[])
const leafletBasedCharts = computed<string[]>(() => $leafletBasedCharts as string[])

const cmpStyle = computed(() => {
  if (smAndDown.value || props.chartPosition === 'bottom') return 'height:313px;'
  return 'min-height:450px;'
})

const cmpSources = computed(() => {
  if (props.structure?.source) return [props.structure.source]
  if (!props.structure?.charts || datasetsComplete.value !== props.structure.charts.length) return null

  const sources: Array<{ desc?: string; link?: string }> = []
  outer: for (const chart of props.structure.charts) {
    const src: { desc?: string; link?: string } = {}

    if (dataset.value?.[chart.id] && chart.source?.desc_field && dataset.value[chart.id][0]) {
      src.desc = dataset.value[chart.id][0][chart.source.desc_field] ?? null
    } else if (metadata.value?.[chart.id]?.fonte) {
      src.desc = metadata.value[chart.id].fonte
    }

    if (dataset.value?.[chart.id] && chart.source?.link_field && dataset.value[chart.id][0]) {
      src.link = dataset.value[chart.id][0][chart.source.link_field] ?? null
    } else if (metadata.value?.[chart.id]?.link) {
      src.link = metadata.value[chart.id].link
    }

    for (const existing of sources) {
      if (existing.desc === src.desc && existing.link === src.link) continue outer
    }
    sources.push(src)
  }

  return sources.length > 0 ? sources : [{ desc: 'Sem Registros' }]
})

const cmpAnalysis = computed(() => {
  if (props.structure?.analysis) return [props.structure.analysis]
  if (!props.structure?.charts) return null

  const analyses: Array<{ desc?: string; link?: string }> = []
  outer: for (const chart of props.structure.charts) {
    const an: { desc?: string; link?: string } = {}

    if (dataset.value?.[chart.id] && chart.analysis?.desc_field && dataset.value[chart.id][0]) {
      an.desc = dataset.value[chart.id][0][chart.analysis.desc_field] ?? null
    } else if (metadata.value?.[chart.id]?.analysis) {
      an.desc = metadata.value[chart.id].analysis
    }

    if (dataset.value?.[chart.id] && chart.analysis?.link_field && dataset.value[chart.id][0]) {
      an.link = dataset.value[chart.id][0][chart.analysis.link_field] ?? null
    } else if (metadata.value?.[chart.id]?.link_analysis) {
      an.link = metadata.value[chart.id].link_analysis
    }

    for (const existing of analyses) {
      if (existing.desc === an.desc && existing.link === an.link) continue outer
    }
    if (an.desc) analyses.push(an)
  }

  return analyses.length > 0 ? analyses : [{ desc: 'SmartLab' }]
})

// ── Refs para uso nos plugins de gráficos ─────────────────────────────────────
const cmpRefs = computed(() => ({
  selectedTopology,
  customFilters,
  customParams: computed(() => props.customParams)
}))

// ── Helpers ────────────────────────────────────────────────────────────────────
const removeFormatItems = (headers: any[]) => {
  const items = JSON.parse(JSON.stringify(headers))
  for (const item in items) {
    items[item].value = String(items[item].value).replace('fmt_', '')
    if (!items[item].title && items[item].text) items[item].title = items[item].text
    if (!items[item].key) items[item].key = items[item].value
  }
  return items
}

const updateUrlFilters = (urlString: string, filters: string) => {
  const url = new URLSearchParams(urlString)
  const urlFiltros = url.get('filtros')
  if (filters !== '') {
    if (urlFiltros === null) url.append('filtros', filters.substring(5))
    else url.set('filtros', urlFiltros + filters)
  }
  return decodeURIComponent(url.toString())
}

const getDatatableData = (ds: any[], headers: any[]) =>
  ds.map((reg) => {
    const row: Record<string, any> = {}
    for (const hd of headers) {
      row[hd.text.replaceAll('<br/>', ' ')] = reg[hd.value]
    }
    return row
  })

const openLinkFonte = (link: string) => window.open(link, '_blank')

// ── Erros / reload ─────────────────────────────────────────────────────────────
const sendError = (msg: string) => snackbar.showSnackbar({ color: 'error', text: msg })

const reloadComponent = () => {
  errorMessage.value = null
  datasetsComplete.value = 0
  loadCardData()
}

// ── Filtros ────────────────────────────────────────────────────────────────────
const setFilter = (payload: Record<string, any>) => {
  const structure = props.structure
  if (!structure?.description) return

  for (const item of structure.description) {
    if (item.type === 'select' && payload.id.includes(item.parent)) {
      const itemCustomFilterName = !Array.isArray(item.selection.rules.api)
        ? item.selection.rules.api.args[0].named_prop
        : item.selection.rules.api[0].args[0].named_prop
      customFilters.value[itemCustomFilterName] = null
    }
  }

  if (payload.type === 'switch-group') {
    customFilters.value.enabled = payload.enabled
  } else if (payload.type === 'check') {
    customFilters.value[payload.id] = payload.value
  } else if (payload.type === 'radio') {
    customFilters.value.enabled = payload.enabled
    customFilters.value[payload.id] = payload.item.value
    customFilters.value[payload.id + '_label'] = payload.item.label
  } else if (payload.type === 'slider') {
    if (Array.isArray(payload.value)) {
      customFilters.value.value_min = payload.value[0]
      customFilters.value.value_max = payload.value[1]
    } else {
      customFilters.value.value = payload.value
    }
  } else {
    const itemCustomFilterName = !Array.isArray(payload.rules.api)
      ? payload.rules.api.args[0].named_prop
      : payload.rules.api[0].args[0].named_prop

    if (payload.item == null) {
      customFilters.value[itemCustomFilterName] = null
    } else if (Array.isArray(payload.item)) {
      let value = ''
      let value_label = ''
      payload.item.forEach((item: any, i: number) => {
        const v = item[itemCustomFilterName]
        value += i === 0 ? (typeof v === 'string' ? `'${v}'` : v) : (typeof v === 'string' ? `-'${v}'` : `-${v}`)
        value_label += i === 0 ? item.label : ', ' + item.label
      })
      customFilters.value[itemCustomFilterName] = value
      customFilters.value[itemCustomFilterName + '_label'] = value_label
    } else {
      customFilters.value[itemCustomFilterName] = payload.item[itemCustomFilterName]
      customFilters.value[itemCustomFilterName + '_label'] = payload.item.label
    }
  }
}

const getFilters = () => {
  const structure = props.structure
  if (!structure?.description) return ''

  let filterText = ''
  let filterUrl = ''

  for (const filter of structure.description) {
    if (filter.group == null || filter.group === (structure as any).activeGroup) {
      if (filter.type === 'slider' || filter.type === 'select') {
        if (filter.selection?.rules?.api) {
          const filterApiArgs = !Array.isArray(filter.selection.rules.api)
            ? filter.selection.rules.api.args
            : filter.selection.rules.api[0].args

          if (customFilters.value[filterApiArgs[0].named_prop]) {
            filter.selection.rules.api.template = filterUrl + filter.selection.rules.filter
            filterUrl = textTransformService.applyInterpol(filter.selection.rules.api, {}, customFilters.value)
            filterText += '<br/>' + (filter.title ? filter.title + ': ' : filter.label ? filter.label + ': ' : '')

            if (filter.type === 'slider') {
              if (filterApiArgs.length > 1) {
                filterText += customFilters.value[filterApiArgs[0].named_prop] !== customFilters.value[filterApiArgs[1].named_prop]
                  ? customFilters.value[filterApiArgs[0].named_prop] + ' a ' + customFilters.value[filterApiArgs[1].named_prop]
                  : customFilters.value[filterApiArgs[0].named_prop]
              } else {
                filterText += customFilters.value[filterApiArgs[0].named_prop]
              }
            } else {
              filterText += customFilters.value[filterApiArgs[0].named_prop + '_label']
            }
          }
        }
      } else if (filter.type === 'check' || filter.type === 'radio') {
        if (filter.selection?.rules?.filter && customFilters.value[filter.id]) {
          filterUrl += filter.selection.rules.filter
          filterText += '<br/>' + filter.selection.rules.filter_text
        }
      }
    }
  }

  customFilters.value.filterUrl = filterUrl
  customFilters.value.filterText = filterText
  return filterUrl
}

const triggerDefaultSelect = (payload: Record<string, any>) => {
  setFilter(payload)
  getFilters()
  reactiveFilter.value = payload.item ?? payload.value
}

const triggerSelect = (payload: Record<string, any>) => {
  setFilter(payload)
  reactiveFilter.value = payload.item ?? payload.value
  updateDataStructure(payload)
}

// ── Dataset / setDataset ───────────────────────────────────────────────────────
const setDataset = (ds: any, _rules: any, _structure: any, addedParams?: any, meta?: any) => {
  if (!dataset.value) dataset.value = {}
  if (!metadata.value) metadata.value = {}

  const id = addedParams?.id
  if (id) {
    dataset.value[id] = ds
    if (meta) metadata.value[id] = meta
    datasetsComplete.value++

    // Aguarda todos os datasets chegarem para que loadingStatusDataset === 'SUCCESS'
    // e o v-show seja removido antes de renderizar os gráficos.
    // nextTick garante que o Vue já atualizou o DOM (containers visíveis) antes do chartGen.
    if (datasetsComplete.value === props.structure?.charts?.length) {
      nextTick(() => {
        for (const chart of props.structure?.charts ?? []) {
          if (dataset.value?.[chart.id] !== undefined) {
            triggerChartUpdates(chart.id, dataset.value[chart.id], metadata.value?.[chart.id])
          }
        }
      })
    }
  }
}

// ── Completar estrutura ────────────────────────────────────────────────────────
const setReferenceInStructure = () => {
  const structure = props.structure
  if (!structure?.charts) return

  const getIndicators = (obj: any): string[] => {
    const inds: string[] = []
    for (const key in obj) {
      if (key === 'api') {
        const apis = Array.isArray(obj[key]) ? obj[key] : [obj[key]]
        for (const a of apis) {
          const url: string = a?.template ?? a?.fixed ?? ''
          for (const pat of ['-cd_indicador-', '-cd_indicador_spai-']) {
            let idx = url.indexOf(pat)
            if (idx !== -1) {
              idx += pat.length
              const seg = url.includes(',', idx) ? url.substring(idx, url.indexOf(',', idx))
                : url.includes('&', idx) ? url.substring(idx, url.indexOf('&', idx))
                : url.substring(idx)
              inds.push(...seg.replace(/'/g, '').split('-'))
            }
          }
        }
      }
    }
    return inds.filter((v, i, s) => s.indexOf(v) === i)
  }

  if (!structure.info || structure.info[structure.info.length - 1]?.title !== 'Referência') {
    const allInds: string[] = []
    for (const chart of structure.charts) {
      allInds.push(...getIndicators(chart))
    }
    const uniqueInds = allInds.filter((v, i, s) => s.indexOf(v) === i)
    if (uniqueInds.length > 0) {
      if (!structure.info) structure.info = []
      structure.info.push({ title: 'Referência', type: 'text', content: { fixed: 'Gráfico/Mapa: ' + uniqueInds.join(', ') } })
    }
  }
}

const completeStructure = () => {
  setReferenceInStructure()
  const charts = props.structure?.charts ?? []

  for (const chart of charts) {
    if (chart.options?.y_function != null) {
      chart.options.y = props.customFunctions?.[chart.options.y_function]
    }
    if (chart.options?.tooltip_function != null && chart.options.tooltip_function !== 'default_tooltip') {
      const fn = props.customFunctions?.[chart.options.tooltip_function]
      if (fn) chart.options.tooltip_function = fn
    }

    if (chart.footnote === null || chart.footnote === undefined) {
      chartFooter.value[chart.id] = chart.title
    } else if (typeof chart.footnote === 'string') {
      chartFooter.value[chart.id] = chart.footnote
    } else {
      $fillDataStructure(
        chart.footnote,
        props.customParams ?? {},
        setComplexAttribute,
        { attribute: 'chartFooter', attribRefs: { chartFooter }, key: chart.id, fallback: chart.title }
      )
    }

    chartId.value[chart.id] = 'chart_' + chart.type.toLowerCase() + '_' + chart.id
  }
}

// ── Geração / regeneração de gráfico ──────────────────────────────────────────
const triggerChartUpdates = (id: string, ds: any, meta: any) => {
  const chart = props.structure?.charts?.find((c: any) => c.id === id)
  if (!chart || !chartId.value[id]) return

  const title = chartFooter.value[id]

  if (chartHandlers.value[id]) {
    $chartRegen(
      cmpRefs.value,
      mainStore,
      chartHandlers.value[id],
      chartId.value[id],
      chart.type,
      chart,
      chart.options,
      ds,
      meta,
      props.sectionIndex ?? 0
    )?.then(
      (handler: any) => { chartHandlers.value[id] = handler; emit('chart-loaded') },
      (err: any) => { console.error(err); sendError(`Falha ao carregar gráfico '${title}'.`) }
    )
  } else {
    $chartGen(
      cmpRefs.value,
      mainStore,
      chartId.value[id],
      chart.type,
      chart,
      chart.options,
      ds,
      meta,
      props.sectionIndex ?? 0
    )?.then(
      (handler: any) => { chartHandlers.value[id] = handler; emit('chart-loaded') },
      (err: any) => { console.error(err); sendError(`Falha ao carregar dados do gráfico '${title}'.`) }
    )
  }
}

// ── fetchData ──────────────────────────────────────────────────────────────────
const fetchData = (endpoint: string | string[] | null = null) => {
  const structure = props.structure
  if (!structure?.charts) return

  dataset.value = {}
  datasetsComplete.value = 0
  metadata.value = {}

  for (const chart of structure.charts) {
    $fillDataStructure(
      chart,
      props.customParams ?? {},
      setDataset,
      {
        endpoint,
        msgError: 'Falha ao carregar dados do gráfico ' + (chartFooter.value[chart.id] ?? chart.id),
        id: chart.id
      }
    )
  }
}

// ── Atualização de dados via emitters ─────────────────────────────────────────
const updateDataStructure = (payload: Record<string, any>) => {
  if (!payload.rules) return

  dataset.value = {}
  datasetsComplete.value = 0
  metadata.value = {}

  for (const chart of props.structure?.charts ?? []) {
    let endpoint: string | string[]

    if (payload.rules.filter) {
      const apiUrl = chart.apiBase
        ? textTransformService.applyInterpol(chart.apiBase, props.customParams ?? {}, props.customFunctions ?? {})
        : textTransformService.applyInterpol(chart.api, props.customParams ?? {}, props.customFunctions ?? {})
      const filters = getFilters()
      endpoint = Array.isArray(apiUrl)
        ? apiUrl.map((u: string) => updateUrlFilters(u, filters))
        : updateUrlFilters(apiUrl, filters)
      if (chart.options) chart.options.filterText = customFilters.value.filterText
    } else {
      endpoint = textTransformService.applyInterpol(payload.rules.api, props.customParams ?? {}, props.customFunctions ?? {}, customFilters.value)
    }

    if (payload.type === 'slider' || payload.type === 'check') {
      $fillDataStructure(
        chart,
        props.customParams ?? {},
        setDataset,
        { endpoint, id: chart.id }
      )
    } else if (payload.target?.scope && payload.target?.range) {
      const topoFile = '/topojson/' + payload.target.scope + '/' + payload.target.range + '/' + payload.item.id + '.json'
      $fetch<any>(topoFile).then((response) => {
        selectedTopology.value = response
        $fillDataStructure(
          chart,
          props.customParams ?? {},
          setDataset,
          { endpoint, id: chart.id }
        )
      })
    } else {
      $fillDataStructure(
        chart,
        props.customParams ?? {},
        setDataset,
        { endpoint, id: chart.id }
      )
    }
  }
}

// ── Download ───────────────────────────────────────────────────────────────────
const snackAlert = (params: { text: string; color?: string; timeout?: number }) => {
  snackbar.showSnackbar(params)
}

const onOpenAuthDialog = () => {
  $openAuthenticatioDialog()
}

const handleDownloadClick = () => {
  if (!authStore.user) {
    $openAuthenticatioDialog()
  } else {
    quotationDialog.value = true
  }
}

const downloadData = () => {
  quotationDialog.value = false
  if (!dataset.value) return

  for (const indexDS in dataset.value) {
    const chart = props.structure?.charts?.find((c: any) => c.id === indexDS)
    if (!chart?.headers) continue

    const dtDownload = getDatatableData(dataset.value[indexDS], chart.headers)
    const csvFields = dtDownload.length > 0 ? Object.keys(dtDownload[0]) : []
    const csvRows = [
      csvFields.map(f => `"${String(f).replace(/"/g, '""')}"`).join(';'),
      ...dtDownload.map(row =>
        csvFields.map(f => {
          const val = row[f] ?? ''
          return `"${String(val).replace(/"/g, '""')}"`
        }).join(';')
      )
    ]
    let datasetCsv = '\uFEFF' + csvRows.join('\n')
    datasetCsv = datasetCsv.replace(/<span>/g, '').replace(/<\/span>/g, '')
    const csvBin = new Blob([datasetCsv])

    const dynaLink = document.createElement('a')
    dynaLink.setAttribute('download', indexDS + '.csv')
    dynaLink.href = URL.createObjectURL(csvBin)
    dynaLink.style.display = 'none'
    document.body.appendChild(dynaLink)
    dynaLink.click()
    document.body.removeChild(dynaLink)
  }
}

// ── Ordenação por gráfico ──────────────────────────────────────────────────────
const changeSortForChart = (id: string, column: string | null) => {
  const current = sortByMap.value[id] ?? []
  if (current.length > 0 && current[0].key === column) {
    sortByMap.value[id] = [{ key: column, order: current[0].order === 'asc' ? 'desc' : 'asc' }]
  } else {
    sortByMap.value[id] = [{ key: column, order: 'asc' }]
  }
}

// ── Interpol inválido ──────────────────────────────────────────────────────────
const changeTextToInvalidInterpol = () => { invalidInterpol.value = true }
const sendInvalidInterpol = () => emit('sendInvalidInterpol')

// ── Carregamento inicial ───────────────────────────────────────────────────────
const loadCardData = () => {
  const structure = props.structure
  if (!structure) return

  completeStructure()

  $fillDataStructure(
    structure.title,
    props.customParams ?? {},
    (data: any, _rules: any, struct: any) => {
      cmpTitle.value = typeof data === 'string'
        ? data
        : textTransformService.applyInterpol(struct, props.customParams ?? {}, Array.isArray(data) ? data[0] : data)
    },
    { attribute: 'cmpTitle', msgError: 'Falha ao carregar dados do título do card' }
  )

  $fillDataStructure(
    structure.title_comment,
    props.customParams ?? {},
    (data: any, _rules: any, struct: any) => {
      cmpTitleComment.value = typeof data === 'string'
        ? data
        : textTransformService.applyInterpol(struct, props.customParams ?? {}, Array.isArray(data) ? data[0] : data)
    },
    { attribute: 'cmpTitleComment', msgError: 'Falha ao carregar dados do comentário do card' }
  )

  fetchData()
}

// ── Inicialização de filtros (switch-group / radio) ────────────────────────────
const initFilters = () => {
  const structure = props.structure
  if (!structure?.description) return

  const visibleLayers: Record<string, boolean> = {}
  for (const struct of structure.description) {
    if (struct.type === 'switch-group') {
      for (const swt of struct.switches) {
        visibleLayers[swt.id] = !!swt.default
      }
      break
    }
    if (struct.type === 'radio') {
      struct.items.forEach((item: any, i: number) => {
        visibleLayers[item.id] = i === 0
      })
      customFilters.value[struct.id] = struct.items[0].value
      break
    }
  }
  if (Object.keys(visibleLayers).length > 0) {
    customFilters.value.enabled = visibleLayers
  }
}

onMounted(() => {
  initFilters()
  loadCardData()
})
</script>

<style>
.bg-card {
  background-color: transparent !important;
}

.btn-dados:hover {
  background-color: rgba(0, 0, 0, 0.08) !important;
}

.card-title {
  color: rgba(51, 51, 51, 1);
  line-height: 1em;
}

.chart-footer {
  font-size: 0.857rem !important;
}

table thead tr th span.word-wrap {
  word-wrap: break-word;
  white-space: normal;
}
</style>

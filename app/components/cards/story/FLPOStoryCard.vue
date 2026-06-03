<template>
  <v-row v-if="renderComponent">
    <v-col cols="12">
      <v-card
        :id="structure?.id"
        class="mx-4 mb-5 bg-card"
      >
        <v-progress-linear
          v-show="loadingStatusDataset !== 'SUCCESS'"
          height="5"
          :indeterminate="loadingStatusDataset === 'LOADING'"
          :color="loadingStatusDataset === 'ERROR' ? 'error' : 'info'"
        />

        <!-- Estado de erro -->
        <div v-show="loadingStatusDataset === 'ERROR'" style="min-height:500px;" class="d-flex align-center justify-center">
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
            <v-row class="display-1-obs mb-0 pl-3 pt-3 pb-0 pr-0" align="center">
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
                  color="accent"
                  style="margin: 0px;"
                  @click="dialog = true"
                >
                  <span :class="chartPosition === 'bottom' ? 'd-none d-lg-inline body' : 'd-none d-md-inline body'">Dados</span>
                  <v-icon end>mdi-format-list-bulleted</v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Corpo: texto + gráfico -->
            <v-row :style="structure?.type !== 'headline' && structure?.type !== 'text' ? 'min-height:500px;' : ''">

              <!-- Coluna de descrição / texto -->
              <v-col
                cols="12"
                :md="chartPosition !== 'bottom' ? 3 : 12"
                class="position-relative"
                :class="chartPosition !== 'bottom' ? 'pr-4' : ''"
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

                <!-- Fonte e análise -->
                <FLPODataSource
                  :source="dataSource"
                  :analysis="dataAnalysis"
                  class="pb-0 pt-3 px-2 pl-3"
                />
              </v-col>

              <!-- Coluna do gráfico / componente -->
              <v-col
                cols="12"
                :md="chartPosition !== 'bottom' ? 9 : 12"
                class="py-3"
              >
                <v-col class="fill-height pa-0 d-flex flex-column">
                  <div
                    class="flex-grow-1 fill-height"
                    :style="cmpStyle"
                    :class="{
                      'mx-0 px-3': (smAndDown || chartPosition === 'bottom'),
                      'mx-0 pt-2 pr-4 pb-0': (!smAndDown && chartPosition !== 'bottom')
                    }"
                  >
                    <!-- Gráfico D3/Leaflet -->
                    <div
                      v-if="structure && structure.chart_options !== null && validCharts.includes(structure.chart_type)"
                      :id="chartId"
                      ref="chartRef"
                      class="fill-height"
                      :class="(leafletBasedCharts.includes(structure.chart_type) || structure.chart_type === 'MAP_TOPOJSON') ? 'map_geo' : ''"
                                       />

                    <!-- Sparklines -->
                    <div
                      v-if="structure && structure.component_options !== null && structure.component_type === 'SPARKLINES'"
                      class="fill-height"
                    >
                      <FLPOSparklines
                        :custom-params="customParams"
                        :custom-functions="customFunctions"
                        :custom-filters="customFilters"
                        :refresh-component="refreshComponent"
                        :structure="Object.assign({}, structure.component_options, (({ api, apiBase, headers, api_options }) => ({ api, apiBase, headers, api_options }))(structure))"
                        @dataset-loaded="triggerDatasetUpdate"
                      />
                    </div>

                    <!-- Datatable -->
                    <div
                      v-if="structure && structure.component_options !== null && structure.component_type === 'DATATABLE'"
                      class="fill-height"
                    >
                      <FLPODatatable
                        :custom-params="customParams"
                        :custom-functions="customFunctions"
                        :custom-filters="customFilters"
                        :refresh-component="refreshComponent"
                        :structure="Object.assign({}, structure.component_options, (({ api, apiBase, headers, api_options }) => ({ api, apiBase, headers, api_options }))(structure))"
                        @dataset-loaded="triggerDatasetUpdate"
                      />
                    </div>

                    <!-- Texto como componente -->
                    <div
                      v-if="structure && structure.component_options !== null && structure.component_type === 'TEXT'"
                      class="fill-height"
                    >
                      <FLPOCompositeText
                        v-if="!invalidInterpol"
                        :id="'story_component_' + structure?.id"
                        :structure="structure.component_options"
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
                    </div>
                  </div>

                  <!-- Rodapé do gráfico -->
                  <div
                    v-if="chartFooter"
                    class="text-center chart-footer pt-0"
                  >
                    {{ chartFooter }}
                  </div>
                </v-col>
              </v-col>
            </v-row>
          </v-col>
        </v-card-text>
      </v-card>

      <!-- Modal: Dataset -->
      <v-dialog
        v-if="dataset && structure && structure.headers"
        v-model="dialog"
        max-width="90vw"
      >
        <v-card>
          <v-card-title class="headline-obs py-0">Dataset</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="removeFormatItems(structure.headers)"
              :items="dataset"
              :sort-by="sortBy"
              class="elevation-1"
              items-per-page-text="Registros por página"
              no-data-text="Sem registros"
            >
              <template #headers="{ columns }">
                <tr>
                  <th
                    v-for="col in columns"
                    :key="col.key"
                    scope="colgroup"
                    :width="col.width"
                    class="text-start column sortable"
                    @click="changeSort(col.key)"
                  >
                    <span class="word-wrap" v-html="col.title" />
                    <v-icon size="small">mdi-arrow-up</v-icon>
                  </th>
                </tr>
              </template>
              <template #item="{ item }">
                <tr>
                  <td v-for="hdr in structure.headers" :key="hdr.value">
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
          </v-card-text>
          <v-card-actions class="px-3 pb-3">
            <v-spacer />
            <v-btn
              size="small"
              color="accent"
              @click="handleDownloadClick"
            >
              <v-icon start>mdi-download</v-icon>
              Baixar
            </v-btn>
            <v-btn
              size="small"
              color="accent"
              @click="$openBugDialog(cmpTitle)"
            >
              <v-icon start>mdi-bug</v-icon>
              Relate um problema
            </v-btn>
            <v-btn
              size="small"
              color="accent"
              @click="dialog = false"
            >
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
import { Indicators } from '~/utils/model/indicators'
import { TextTransformService } from '~/utils/service/singleton/textTransform'
import { useSnackbarStore } from '~/store/snackbar'
import { useMainStore } from '~/store'
import { useAuthStore } from '~/store/auth'
import { useBaseLayout } from '~/composables/useBaseLayout'

defineOptions({ name: 'FLPOStoryCard' })

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
const indicators = new Indicators()
const snackbar = useSnackbarStore()
const mainStore = useMainStore()
const authStore = useAuthStore()
const { smAndDown } = useDisplay()
const { setComplexAttribute } = useBaseLayout(computed(() => props.customParams), emit)

// ── Estado ─────────────────────────────────────────────────────────────────────
const renderComponent = ref(true)
const refreshComponent = ref(true)
const dialog = ref(false)
const quotationDialog = ref(false)
const dataset = ref<any>(null)
const metadata = ref<any>(null)
const errorMessage = ref<string | null>(null)
const cmpTitle = ref<string>('')
const cmpTitleComment = ref<string | null>(null)
const invalidInterpol = ref(false)
const chartFooter = ref<string | null>(null)
const chartHandler = ref<any>(null)
const selectedTopology = ref<any>(props.topology ?? null)
const customFilters = ref<Record<string, any>>({})
const reactiveFilter = ref<any>(null)
const sortBy = ref<any[]>([])
const chartRef = ref<HTMLElement | null>(null)

// ── Computed ───────────────────────────────────────────────────────────────────
const loadingStatusDataset = computed(() => {
  if (errorMessage.value) return 'ERROR'
  if (dataset.value !== null && dataset.value !== undefined) return 'SUCCESS'
  return 'LOADING'
})

const validCharts = computed<string[]>(() => $validCharts as string[])
const leafletBasedCharts = computed<string[]>(() => $leafletBasedCharts as string[])

const chartId = computed(() =>
  props.structure?.chart_type
    ? 'chart_' + props.structure.chart_type.toLowerCase() + '_' + props.structure?.id
    : ''
)

const cmpStyle = computed(() => {
  if (smAndDown.value || props.chartPosition === 'bottom') return 'min-height:313px;'
  return 'min-height:450px;'
})

const sourceDesc = computed(() => indicators.getSourceDesc(props.structure, dataset.value, metadata.value))
const sourceLink = computed(() => indicators.getSourceLink(props.structure, dataset.value, metadata.value))
const analysisDesc = computed(() => indicators.getAnalysisDesc(props.structure, dataset.value, metadata.value))
const analysisLink = computed(() => indicators.getAnalysisLink(props.structure, dataset.value, metadata.value))

const dataSource = computed(() =>
  sourceDesc.value ? { desc: sourceDesc.value, link: sourceLink.value ?? undefined } : null
)
const dataAnalysis = computed(() =>
  analysisDesc.value ? { desc: analysisDesc.value, link: analysisLink.value ?? undefined } : null
)

// ── Helpers reutilizados do base ───────────────────────────────────────────────
const removeFormatItems = (headers: any[]) => {
  const items = JSON.parse(JSON.stringify(headers))
  for (const item in items) {
    items[item].value = String(items[item].value).replace('fmt_', '')
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

// ── Erros / reload ─────────────────────────────────────────────────────────────
const sendError = (msg: string) => snackbar.showSnackbar({ color: 'error', text: msg })

const reloadComponent = () => {
  errorMessage.value = null
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

// ── Referência p/ uso nos plugins de gráficos ──────────────────────────────────
const cmpRefs = computed(() => ({
  selectedTopology,
  customFilters,
  customParams: computed(() => props.customParams)
}))

// ── Dataset / setDataset ───────────────────────────────────────────────────────
const setDataset = (ds: any, _rules: any, _structure: any, _addedParams?: any, meta?: any) => {
  dataset.value = ds
  metadata.value = meta
}

// ── Completar estrutura (y_function, tooltip_function) ─────────────────────────
const setReferenceInStructure = () => {
  const structure = props.structure
  if (!structure) return
  if (!structure.info || structure.info[structure.info.length - 1]?.title !== 'Referência') {
    // lógica preservada do base (simplificada — indicadores de referência)
    let textReference = ''
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
                let seg = url.includes(',', idx) ? url.substring(idx, url.indexOf(',', idx))
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

    const indGrafico = getIndicators(structure)
    if (indGrafico.length > 0) textReference = 'Gráfico/Mapa: ' + indGrafico.join(', ')

    if (textReference.length > 0) {
      if (!structure.info) structure.info = []
      structure.info.push({ title: 'Referência', type: 'text', content: { fixed: textReference } })
    }
  }
}

const completeStructure = () => {
  setReferenceInStructure()
  if (props.structure?.chart_options?.y_function != null) {
    props.structure.chart_options.y = props.customFunctions?.[props.structure.chart_options.y_function]
  }
  if (
    props.structure?.chart_options?.tooltip_function != null &&
    props.structure.chart_options.tooltip_function !== 'default_tooltip'
  ) {
    const fn = props.customFunctions?.[props.structure.chart_options.tooltip_function]
    if (fn) props.structure.chart_options.tooltip_function = fn
  }
}

// ── Rodapé do gráfico ──────────────────────────────────────────────────────────
const assessChartFooter = () => {
  if (props.structure?.footnote) {
    if (typeof props.structure.footnote === 'string') {
      chartFooter.value = props.structure.footnote
    } else {
      $fillDataStructure(
        props.structure.footnote,
        props.customParams ?? {},
        setComplexAttribute,
        { attribute: 'chartFooter', attribRefs: { chartFooter } }
      )
    }
  } else {
    chartFooter.value = cmpTitle.value
  }
}

// ── Geração / regeneração de gráfico ──────────────────────────────────────────
const triggerChartUpdates = () => {
  const store = mainStore
  const title = chartFooter.value

  if (chartHandler.value) {
    $chartRegen(
      cmpRefs.value,
      store,
      chartHandler.value,
      chartId.value,
      props.structure?.chart_type,
      props.structure,
      props.structure?.chart_options,
      dataset.value,
      metadata.value,
      props.sectionIndex
    )?.then(
      (handler: any) => { chartHandler.value = handler; emit('chart-loaded') },
      (err: any) => { console.error(err); sendError(`Falha ao carregar gráfico '${title}'.`) }
    )
  } else {
    $chartGen(
      cmpRefs.value,
      store,
      chartId.value,
      props.structure?.chart_type,
      props.structure,
      props.structure?.chart_options,
      dataset.value,
      metadata.value,
      props.sectionIndex
    )?.then(
      (handler: any) => { chartHandler.value = handler; emit('chart-loaded') },
      (err: any) => { console.error(err); sendError(`Falha ao carregar gráfico do card '${title}'.`) }
    )
  }
}

const triggerComponentUpdates = () => {
  refreshComponent.value = !refreshComponent.value
}

// ── fetchData ──────────────────────────────────────────────────────────────────
const fetchData = (endpoint: string | string[] | null = null) => {
  assessChartFooter()
  const structure = props.structure
  if (!structure) return

  if (structure.chart_type && structure.chart_type !== 'MIXED_MAP') {
    $fillDataStructure(
      structure,
      props.customParams ?? {},
      (ds: any, rules: any, struct: any, addedParams: any, meta: any) => {
        setDataset(ds, rules, struct, addedParams, meta)
        nextTick(() => triggerChartUpdates())
      },
      {
        endpoint,
        msgError: 'Falha ao carregar dados do gráfico ' + chartFooter.value,
        customFunctions: props.customFunctions
      }
    )
  } else if (structure.component_options) {
    dataset.value = true
    triggerComponentUpdates()
  } else {
    for (const eachChart of structure.chart_options?.layers ?? []) {
      $fillDataStructure(
        eachChart,
        props.customParams ?? {},
        setDataset,
        { id: eachChart.id, customFunctions: props.customFunctions }
      )
    }
  }
}

// ── Atualização de dados via emitters ──────────────────────────────────────────
const handleDataStructure = (payload: Record<string, any>) => {
  const structure = props.structure
  if (!structure) return
  let apiUrl = structure.apiBase
    ? textTransformService.applyInterpol(structure.apiBase, props.customParams ?? {}, props.customFunctions ?? {})
    : textTransformService.applyInterpol(structure.api, props.customParams ?? {}, props.customFunctions ?? {})

  if (payload.rules?.filter) {
    const filters = getFilters()
    const endpoint = Array.isArray(apiUrl)
      ? apiUrl.map((u: string) => updateUrlFilters(u, filters))
      : updateUrlFilters(apiUrl, filters)
    if (structure.chart_options) structure.chart_options.filterText = customFilters.value.filterText
    fetchData(endpoint)
  } else if (payload.item) {
    const endpoint = textTransformService.applyInterpol(payload.rules.api, props.customParams ?? {}, props.customFunctions ?? {}, customFilters.value)
    fetchData(endpoint)
  } else {
    fetchData()
  }
}

const updateDataStructure = (payload: Record<string, any>) => {
  if (payload.type && chartHandler.value && !chartHandler.value.topojson &&
    (payload.type === 'switch-group' || payload.type === 'radio')) {
    chartHandler.value.adjustVisibleLayers(payload.enabled)
  }

  if (!payload.rules) return

  if (payload.type === 'slider' || payload.type === 'check' || payload.type === 'radio') {
    let endpoint: string | string[]
    if (payload.rules.filter) {
      let apiUrl = props.structure?.apiBase
        ? textTransformService.applyInterpol(props.structure.apiBase, props.customParams ?? {}, props.customFunctions ?? {})
        : textTransformService.applyInterpol(props.structure?.api, props.customParams ?? {}, props.customFunctions ?? {})
      const filters = getFilters()
      endpoint = Array.isArray(apiUrl)
        ? apiUrl.map((u: string) => updateUrlFilters(u, filters))
        : updateUrlFilters(apiUrl, filters)
      if (props.structure?.chart_options) props.structure.chart_options.filterText = customFilters.value.filterText
    } else {
      endpoint = textTransformService.applyInterpol(payload.rules.api, props.customParams ?? {}, props.customFunctions ?? {}, customFilters.value)
    }
    fetchData(endpoint)
  } else if (payload.type && payload.type !== 'switch-group') {
    if (payload.target?.scope && payload.target?.range) {
      const topoFile = '/topojson/' + payload.target.scope + '/' + payload.target.range + '/' + payload.item.id + '.json'
      $fetch<any>(topoFile).then((response) => {
        selectedTopology.value = response
        handleDataStructure(payload)
      })
    } else {
      handleDataStructure(payload)
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
  const dtDownload = getDatatableData(dataset.value, props.structure?.headers ?? [])
  const csvHeaders = dtDownload.length > 0 ? Object.keys(dtDownload[0]) : []
  const csvRows = dtDownload.map((row: Record<string, any>) =>
    csvHeaders.map((h) => JSON.stringify(row[h] ?? '')).join(';')
  )
  let datasetCsv = '\uFEFF' + [csvHeaders.join(';'), ...csvRows].join('\n')
  datasetCsv = datasetCsv.replace(/<span>/g, '').replace(/<\/span>/g, '')
  const csvBin = new Blob([datasetCsv])

  const dynaLink = document.createElement('a')
  dynaLink.setAttribute('download', 'dataset.csv')
  dynaLink.href = URL.createObjectURL(csvBin)
  dynaLink.style.display = 'none'
  document.body.appendChild(dynaLink)
  dynaLink.click()
  document.body.removeChild(dynaLink)
}

// ── Dataset update emitido por componentes filhos ──────────────────────────────
const triggerDatasetUpdate = (ds: any) => {
  dataset.value = ds
}

// ── Ordenação da tabela ────────────────────────────────────────────────────────
const changeSort = (column: string) => {
  if (sortBy.value.length > 0 && sortBy.value[0].key === column) {
    sortBy.value = [{ key: column, order: sortBy.value[0].order === 'asc' ? 'desc' : 'asc' }]
  } else {
    sortBy.value = [{ key: column, order: 'asc' }]
  }
}

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

<script setup lang="ts">
import { TextTransformService } from '~/utils/service/singleton/textTransform'
import { UrlTransformService } from '~/utils/service/singleton/urlTransform'
import { useBaseLayout } from '~/composables/useBaseLayout'

defineOptions({
  name: 'FLPOBaseStoryCard'
})

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
const emit = defineEmits(['sendInvalidInterpol', 'update'])

const { $fillDataStructure } = useNuxtApp()
const textTransformService = new TextTransformService()
const { setComplexAttribute } = useBaseLayout(computed(() => props.customParams), emit)

// State
const customFilters = ref<Record<string, any>>({})
const reactiveFilter = ref<any>(null)
const errorMessage = ref<string | null>(null)
const selectedTopology = ref<any>(props.topology ?? null)
const dataset = ref<any>(null)
const cmpTitle = ref<string>('')
const cmpTitleComment = ref<string>('')
const invalidInterpol = ref(false)

const cmpRefs = {
  selectedTopology,
  customFilters,
  customParams: computed(() => props.customParams)
}

// Computed
const loadingStatusDataset = computed(() => {
  if (errorMessage.value) return 'ERROR'
  if (dataset.value !== null && dataset.value !== undefined) return 'SUCCESS'
  return 'LOADING'
})

// Methods
const sendDataStructureError = (msg: string) => {
  errorMessage.value = msg
}

const triggerChartUpdates = () => {
  // Override in child components if needed
}

const reloadComponent = () => {
  errorMessage.value = null
  loadCardData()
}

const updateTopology = () => {
  const structure = props.structure
  if (
    (structure?.chart_type === 'MAP_TOPOJSON' || structure?.chart_type === 'MAP_POLYGON') &&
    structure?.chart_options?.topology
  ) {
    const scope = structure.chart_options.topology.scope
    const range = structure.chart_options.topology.range
    let id = structure.chart_options.topology.id
    if (id === undefined) {
      if (range === 'uf') {
        id = props.selectedPlace
          ? props.selectedPlace.substring(0, 2)
          : props.customParams?.idLocalidade?.substring(0, 2)
      } else {
        id = 0
      }
    }
    const topoFile = '/topojson/' + scope + '/' + range + '/' + id + '.json'
    $fetch<any>(topoFile)
      .then((response) => {
        selectedTopology.value = response
        if (loadingStatusDataset.value === 'SUCCESS') {
          triggerChartUpdates()
        }
      })
  }
}

const completeStructure = () => {
  // Override in child components if needed
}

const fetchData = () => {
  // Override in child components if needed
}

const loadCardData = () => {
  const structure = props.structure
  if (!structure) return

  if (structure.card_template) {
    // API Card
    let url = textTransformService.replaceArgs(
      "/cardtemplate/{0}?datasource={1}&cd_indicador='{2}'&cd_analysis_unit={3}",
      [
        structure.card_template,
        structure.datasource,
        structure.cd_indicador,
        props.selectedPlace ? props.selectedPlace : props.customParams?.idLocalidade
      ]
    )
    if (structure.coefficient) { url = url + '&coefficient=' + structure.coefficient }
    if (structure.term) {
      if (typeof structure.term === 'string') {
        url = url + '&term=' + structure.term
      } else if (structure.term.template) {
        url = url + '&term=' + textTransformService.applyInterpol(
          structure.term,
          props.customParams ?? {},
          {}
        )
      }
    }

    const cardTitle = structure.title?.fixed ?? ''

    $fetch<any>(UrlTransformService.getApiUrl(url))
      .then((result) => {
        Object.assign(structure, result)
        updateTopology()
        completeStructure()

        const titleAttribRefs = { cmpTitle }
        setComplexAttribute(
          null as any,
          {},
          structure.title,
          { attribute: 'cmpTitle', attribRefs: titleAttribRefs, msgError: 'Falha ao carregar dados do título do card' }
        )

        $fillDataStructure(
          structure.title_comment,
          props.customParams ?? {},
          (data: any, _rules: any, struct: any, addedParams: any) => {
            cmpTitleComment.value = typeof data === 'string'
              ? data
              : textTransformService.applyInterpol(struct, props.customParams ?? {}, Array.isArray(data) ? data[0] : data)
          },
          { attribute: 'cmpTitleComment', msgError: 'Falha ao carregar dados do card ' + cardTitle }
        )

        fetchData()
      })
      .catch(() => sendDataStructureError('Falha ao buscar dados do card ' + cardTitle))
  } else {
    updateTopology()
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
      { attribute: 'cmpTitleComment', msgError: 'Falha ao carregar dados do card ' + cmpTitle.value }
    )

    fetchData()
  }
}

const removeFormatItems = (headers: any[]) => {
  const items = JSON.parse(JSON.stringify(headers))
  for (const item in items) {
    items[item].value = String(items[item].value).replace('fmt_', '')
  }
  return items
}

const indicatorClass = (previous_class: string, _value: any, _target: any, _curve: any, _threshold: any = null) => {
  return previous_class + ' red'
}

const changeTextToInvalidInterpol = (_payload: any) => {
  invalidInterpol.value = true
}

const getIndicatorsFromStructure = (structItem: Record<string, any>): string[] => {
  let indicadores: string[] = []
  for (const item in structItem) {
    if (item === 'preloaded') {
      if (Array.isArray(structItem[item].id)) {
        indicadores.push(...structItem[item].id)
      } else {
        indicadores.push(structItem[item].id)
      }
    }
    if (item === 'api') {
      let structApi = structItem[item]
      if (!Array.isArray(structApi)) {
        structApi = [structApi]
      }
      for (const structApiItem of structApi) {
        const url: string = structApiItem.template ?? structApiItem.fixed ?? ''
        const patterns = ['-cd_indicador-', '-cd_indicador_spai-']
        for (const pattern of patterns) {
          let indexCdIndicador = url.indexOf(pattern)
          if (indexCdIndicador !== -1) {
            indexCdIndicador += pattern.length
            let urlIndicadores: string
            if (url.includes(',', indexCdIndicador)) {
              urlIndicadores = url.substring(indexCdIndicador, url.indexOf(',', indexCdIndicador))
            } else if (url.includes('&', indexCdIndicador)) {
              urlIndicadores = url.substring(indexCdIndicador, url.indexOf('&', indexCdIndicador))
            } else {
              urlIndicadores = url.substring(indexCdIndicador)
            }
            urlIndicadores = urlIndicadores.replace(/'/g, '')
            indicadores.push(...urlIndicadores.split('-'))
          }
        }
      }
    }
  }
  return indicadores.filter((value, index, self) => self.indexOf(value) === index)
}

const setReferenceInStructure = () => {
  const structure = props.structure
  if (!structure) return
  if (!structure.info || structure.info[structure.info.length - 1].title !== 'Referência') {
    let indTitle: string[] = []
    let indText: string[] = []
    let indMinicards: string[] = []
    let indGrafico: string[] = []
    let textReference = ''

    if (structure.type && structure.type === 'multiple-charts') {
      for (const chart in structure.charts) {
        indGrafico.push(...getIndicatorsFromStructure(structure.charts[chart]))
      }
      if (indGrafico.length > 0) {
        indGrafico = indGrafico.filter((v, i, s) => s.indexOf(v) === i)
        textReference = 'Gráfico/Mapa: ' + indGrafico.join(', ')
      }
    } else {
      indGrafico.push(...getIndicatorsFromStructure(structure))
      if (indGrafico.length > 0) {
        textReference = 'Gráfico/Mapa: ' + indGrafico.join(', ')
      }
    }

    if (structure.title) indTitle.push(...getIndicatorsFromStructure(structure.title))
    if (structure.title_comment) indTitle.push(...getIndicatorsFromStructure(structure.title_comment))
    if (indTitle.length > 0) {
      indTitle = indTitle.filter((v, i, s) => s.indexOf(v) === i)
      textReference += '<br/>Título/Subtítulo: ' + indTitle.join(', ')
    }

    for (const itemDescription in structure.description) {
      if (structure.description[itemDescription].type === 'text') {
        indText.push(...getIndicatorsFromStructure(structure.description[itemDescription].content))
      } else if (structure.description[itemDescription].type === 'minicards') {
        for (const minicard in structure.description[itemDescription].cards) {
          indMinicards.push(...getIndicatorsFromStructure(structure.description[itemDescription].cards[minicard]))
        }
      }
    }

    if (indMinicards.length > 0) {
      indMinicards = indMinicards.filter((v, i, s) => s.indexOf(v) === i)
      textReference += '<br/>Minicards: ' + indMinicards.join(', ')
    }
    if (indText.length > 0) {
      indText = indText.filter((v, i, s) => s.indexOf(v) === i)
      textReference += '<br/>Texto: ' + indText.join(', ')
    }

    if (textReference.length > 0) {
      const infoRef = { title: 'Referência', type: 'text', content: { fixed: textReference } }
      if (!structure.info) {
        structure.info = []
      }
      structure.info.push(infoRef)
    }
  }
}

const setFilter = (payload: Record<string, any>) => {
  const structure = props.structure
  if (!structure?.description) return

  // Limpa filtros dos selects que têm payload como pai (parent)
  for (const item of structure.description) {
    if (item.type && item.type === 'select' && payload.id.includes(item.parent)) {
      const itemCustomFilterName = !Array.isArray(item.selection.rules.api)
        ? item.selection.rules.api.args[0].named_prop
        : item.selection.rules.api[0].args[0].named_prop
      customFilters.value[itemCustomFilterName] = null
    }
  }

  if (payload.type && payload.type === 'switch-group') {
    customFilters.value.enabled = payload.enabled
  } else if (payload.type && payload.type === 'check') {
    customFilters.value[payload.id] = payload.value
  } else if (payload.type && payload.type === 'radio') {
    customFilters.value.enabled = payload.enabled
    customFilters.value[payload.id] = payload.item.value
    customFilters.value[payload.id + '_label'] = payload.item.label
  } else if (payload.type && payload.type === 'slider') {
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

    if (payload.item == null || payload.item === undefined) {
      customFilters.value[itemCustomFilterName] = null
    } else {
      if (Array.isArray(payload.item)) {
        let value = ''
        let value_label = ''
        let i = 0
        for (const item of payload.item) {
          const item_value = item[itemCustomFilterName]
          if (typeof item_value === 'string') {
            value += i === 0 ? "'" + item_value + "'" : "-'" + item_value + "'"
            value_label += i === 0 ? item.label : ', ' + item.label
          } else {
            value += i === 0 ? item_value : '-' + item_value
            value_label += i === 0 ? item.label : ', ' + item.label
          }
          i++
        }
        customFilters.value[itemCustomFilterName] = value
        customFilters.value[itemCustomFilterName + '_label'] = value_label
      } else {
        customFilters.value[itemCustomFilterName] = payload.item[itemCustomFilterName]
        customFilters.value[itemCustomFilterName + '_label'] = payload.item.label
      }
    }
  }
}

const getFilters = () => {
  const structure = props.structure
  if (!structure?.description) return ''

  let filterText = ''
  let filterUrl = ''

  for (const filter of structure.description) {
    if (filter.group == null || filter.group === undefined || filter.group === (structure as any).activeGroup) {
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
                if (customFilters.value[filterApiArgs[0].named_prop] !== customFilters.value[filterApiArgs[1].named_prop]) {
                  filterText += customFilters.value[filterApiArgs[0].named_prop] + ' a ' + customFilters.value[filterApiArgs[1].named_prop]
                } else {
                  filterText += customFilters.value[filterApiArgs[0].named_prop]
                }
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
          filterUrl = filterUrl + filter.selection.rules.filter
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
  // updateDataStructure(payload) — override in child if needed
}

const getDatatableData = (dataset: any[], headers: any[]) => {
  return dataset.map((reg) => {
    const row: Record<string, any> = {}
    for (const hd of headers) {
      row[hd.text.replaceAll('<br/>', ' ')] = reg[hd.value]
    }
    return row
  })
}

const updateUrlFilters = (urlString: string, filters: string) => {
  const url = new URLSearchParams(urlString)
  const urlFiltros = url.get('filtros')
  if (filters !== '') {
    if (urlFiltros === null) {
      url.append('filtros', filters.substring(5))
    } else {
      url.set('filtros', urlFiltros + filters)
    }
  }
  return decodeURIComponent(url.toString())
}

// Lifecycle
onMounted(() => {
  loadCardData()
})

// Expose for use in child components (via composable pattern if needed)
defineExpose({
  customFilters,
  reactiveFilter,
  errorMessage,
  selectedTopology,
  dataset,
  cmpTitle,
  cmpTitleComment,
  loadingStatusDataset,
  cmpRefs,
  reloadComponent,
  loadCardData,
  updateTopology,
  completeStructure,
  fetchData,
  triggerChartUpdates,
  sendDataStructureError,
  removeFormatItems,
  indicatorClass,
  changeTextToInvalidInterpol,
  setReferenceInStructure,
  getIndicatorsFromStructure,
  setFilter,
  getFilters,
  triggerDefaultSelect,
  triggerSelect,
  getDatatableData,
  updateUrlFilters
})
</script>

<style>
.title-comment {
  display: block;
  font-family: Palanquin, Calibri, sans-serif !important;
  font-size: 0.857rem;
  font-weight: 200;
  line-height: 1rem;
  color: rgb(239, 97, 69);
}

.sankey-link:hover {
  stroke-opacity: 0.5 !important;
}
</style>

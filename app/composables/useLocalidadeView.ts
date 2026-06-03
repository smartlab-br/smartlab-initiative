import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useEventBus } from '@vueuse/core'
import { useDisplay } from 'vuetify'
import type { Ref } from 'vue'
import { AnalysisUnit } from '~/utils/model/analysisUnit'
import { indicatorsSingleton } from '~/utils/model/indicators'
import { TextTransformService } from '~/utils/service/singleton/textTransform'
import { useSnackbarStore } from '~/store/snackbar'
import { useMainStore } from '~/store/main'
import { useStoryView } from './useStoryView'

const analysisUnit = new AnalysisUnit()
const indicators = indicatorsSingleton
const textTransformService = new TextTransformService()

export function useLocalidadeView() {
  const route = useRoute()
  const router = useRouter()
  const { $loadYamlArray, $fillDataStructure, $getEscopo, $getIdLocalidadeFromRoute } = useNuxtApp()
  const snackbar = useSnackbarStore()
  const mainStore = useMainStore()
  const getObsId = () => mainStore.currentObsId || (route.params.obsid as string)
  const alterMiddleToolbarBus = useEventBus<{ localidade: any }>('alterMiddleToolbar')
  const config = useRuntimeConfig()
  const yamlPath = config.public.gitViewConfUrl ? '/viewconf/' : '/smartlab-initiative-viewconf/'

  // ── State ────────────────────────────────────────────────────────────────────
  const displayHeight = ref('auto')
  const dimensoes = ref<any[]>([])
  const dimensao_ativa = ref<any>(null)
  const dimensao_ativa_id = ref<string | null>(null)
  const sections = ref<any[]>([])
  const localidade = ref<any>(null)
  const masterIndicator = ref('')
  const masterIndicator_compare = ref('')
  const presentation = ref<any>(null)
  const presentation_compare = ref<any>(null)
  const ind_principais = ref<any[]>([])
  const ind_principais_per_row = ref(3)
  const ind_principais_compare = ref<any[]>([])
  const customParams = ref<Record<string, any>>({})
  const unlockLoading = ref(false)
  const visibleCardMaxIndex = ref(1)
  const dimParamsLoaded = ref(false)
  const dimParamsCount = ref(0)
  const dimParamsLoadedCount = ref(0)
  const dimStruct = ref<any>(null)
  const idLocalidade = ref('')
  const idObservatorio = ref('')
  const compareDialog = ref(false)
  const idLocalidade_compare = ref<any>(null)
  const auOptions = ref<any[]>([])
  const sections_compare = ref<any[]>([])

  const { topology, selectCoords, fetchVizLinks, cardLinks } = useStoryView({ customParams })

  // ── Computed ─────────────────────────────────────────────────────────────────
  const currentParallax = computed(() =>
    `background-image:url("/parallax/uf/${customParams.value.cd_uf}.jpg"); background-position: center center; background-size: cover;`
  )

  const computedSearchItems = computed(() => {
    const id = idLocalidade.value
    if (!id) return []
    if (id.length === 7) return auOptions.value.filter(el => el.scope === 'mun')
    if (id.length === 2) return auOptions.value.filter(el => el.scope === 'uf')
    return auOptions.value
  })

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const sendError = (msg: string) => snackbar.showSnackbar({ color: 'error', text: msg })
  const sendInvalidInterpol = () => {}

  // ── Dimension loading ────────────────────────────────────────────────────────

  const setSiblingDimensions = (dimensionsArray: any[]) => {
    const obsid = getObsId()
    const dims = Array.isArray(dimensionsArray)
      ? dimensionsArray
      : (dimensionsArray as any)?.dimensoes ?? []
    dimensoes.value = dims.filter((dim: any) => !dim.external && !dim.blocked)
    setActiveDim(
      route.params.idLocalidade as string,
      obsid,
      route.query.dimensao as string | undefined
    )
  }

  const setActiveDim = (idLoc: string, idObs: string, idDimensao?: string) => {
    for (const dim of dimensoes.value) {
      if ((!idDimensao || idDimensao === '') && dim.default) {
        dimensao_ativa.value = dim
        dimensao_ativa_id.value = dim.id
        idDimensao = dim.id
        break
      } else if (dim.id === idDimensao) {
        dimensao_ativa.value = dim
        dimensao_ativa_id.value = dim.id
        break
      }
    }
    loadLayout(idLoc, idDimensao ?? '', idObs)
  }

  const addDimCustomParams = (dataset: any, _rules: any, structure: any) => {
    if (Array.isArray(dataset) && dataset.length > 0) {
      customParams.value[structure.name] = dataset[0]
    }
    dimParamsLoadedCount.value++
    if (dimParamsLoadedCount.value >= dimParamsCount.value) {
      dimParamsLoaded.value = true
    }
  }

  const loadDimCustomParams = (params: any[]) => {
    for (const param of params) {
      $fillDataStructure(param, customParams.value, addDimCustomParams)
    }
  }

  const setMasterIndicator = (baseObjectList: any, _rules: any, structure: any, addedParams?: any) => {
    const indicatorVar: 'masterIndicator' | 'masterIndicator_compare' =
      addedParams?.indicator_var === 'masterIndicator_compare'
        ? 'masterIndicator_compare'
        : 'masterIndicator'

    const indicatorRef = indicatorVar === 'masterIndicator_compare'
      ? masterIndicator_compare
      : masterIndicator

    if (typeof baseObjectList === 'string') {
      indicatorRef.value = baseObjectList
    } else {
      const base_object = Array.isArray(baseObjectList) && baseObjectList.length > 0
        ? baseObjectList[0]
        : baseObjectList ?? {}

      const finalText = textTransformService.applyInterpol(
        structure,
        customParams.value,
        base_object,
        sendInvalidInterpol
      )
      indicatorRef.value += (finalText ?? '') + '<br/>'
    }
    unlockLoading.value = true
  }

  const changeToCompareStructure = (struct: any[]): any[] => {
    try {
      return JSON.parse(
        JSON.stringify(struct)
          .replace(/centralindicadores/g, 'centralindicadores_compare')
          .replace(/idLocalidade/g, 'idLocalidade_compare')
      )
    } catch {
      return []
    }
  }

  const keepLoadingDimension = () => {
    if (!dimStruct.value) return
    const ds = dimStruct.value

    sections.value = ds.secoes ?? []
    ind_principais_per_row.value = ds.principais_options?.per_row ?? 3
    ind_principais.value = ds.principais ?? []
    presentation.value = ds.presentation ?? null

    masterIndicator.value = ''
    masterIndicator_compare.value = ''

    if (ds.master && Array.isArray(ds.master)) {
      for (const masterItem of ds.master) {
        $fillDataStructure(masterItem, customParams.value, setMasterIndicator)
      }
    } else {
      unlockLoading.value = true
    }

    fetchVizLinks(sections.value)

    if (route.query.compare) {
      sections_compare.value = changeToCompareStructure(sections.value)
      ind_principais_compare.value = ind_principais.value
        ? changeToCompareStructure(ind_principais.value)
        : []
      presentation_compare.value = ds.presentation
        ? JSON.parse(
            JSON.stringify(ds.presentation)
              .replace(/centralindicadores/g, 'centralindicadores_compare')
              .replace(/idLocalidade/g, 'idLocalidade_compare')
          )
        : null

      if (ds.master && Array.isArray(ds.master)) {
        for (const masterItem of ds.master) {
          const compareItem = JSON.parse(
            JSON.stringify(masterItem)
              .replace(/centralindicadores/g, 'centralindicadores_compare')
              .replace(/idLocalidade/g, 'idLocalidade_compare')
          )
          $fillDataStructure(
            compareItem,
            customParams.value,
            setMasterIndicator,
            { indicator_var: 'masterIndicator_compare' }
          )
        }
      }
    }
  }

  const setDimension = (content: any) => {
    const escopo = $getEscopo(idLocalidade.value)
    dimStruct.value = content

    if (content.params && content.params.length > 0) {
      dimParamsLoaded.value = false
      dimParamsCount.value = content.params.length
      dimParamsLoadedCount.value = 0
      loadDimCustomParams(content.params)
    } else {
      dimParamsLoaded.value = true
    }

    const thematicDatasets: string[] = []
    if (content.tematicos) {
      for (const tematico of content.tematicos) {
        thematicDatasets.push(tematico.dataset)
      }
    }

    const promises: Promise<any>[] = []
    const indicadoresTematicos = indicators.getMultipleGlobalDatasets(
      thematicDatasets, escopo, idLocalidade.value
    )
    if (indicadoresTematicos instanceof Promise) {
      promises.push(indicadoresTematicos)
    }

    if (route.query.compare) {
      const compareEscopo = $getEscopo(route.query.compare as string)
      const compareAuId = $getIdLocalidadeFromRoute(route.query.compare as string)
      const indicadoresCompare = indicators.getMultipleGlobalDatasets(
        thematicDatasets, compareEscopo, compareAuId, '_compare'
      )
      if (indicadoresCompare instanceof Promise) {
        promises.push(indicadoresCompare)
      }
    }

    if (promises.length === 0) {
      keepLoadingDimension()
    } else {
      Promise.all(promises)
        .then(() => keepLoadingDimension())
        .catch(() => sendError('Falha ao carregar indicadores temáticos'))
    }
  }

  const loadLayout = (idLoc: string, idDimensao: string, idObs?: string) => {
    idLocalidade.value = idLoc
    idLocalidade_compare.value = route.query.compare ?? null

    customParams.value.idLocalidade = idLoc
    customParams.value.idLocalidade_compare = route.query.compare ?? null
    customParams.value.cd_uf = idLoc.substring(0, 2)

    if (idLocalidade_compare.value) {
      customParams.value.cd_uf_compare = (idLocalidade_compare.value as string).substring(0, 2)
    }
    if (idLoc.length > 6) {
      customParams.value.idLocalidadeD6 = idLoc.substring(0, 6)
      if (idLocalidade_compare.value) {
        customParams.value.idLocalidade_compareD6 = (idLocalidade_compare.value as string).substring(0, 6)
      }
    }

    fetchDataLocalidade(idLoc)
    if (idLocalidade_compare.value) {
      fetchDataLocalidade(idLocalidade_compare.value as string, 'localidade_compare')
    }

    const escopo = $getEscopo(idLoc)
    const observatorioDir = idObs ? `observatorio/${idObs}/` : ''

    const baseStructYamls = [
      { main: 'br/localidade/base' },
      { main: `br/localidade/${escopo}/base` },
      { main: 'br/observatorio/base' },
      { main: 'br/' + observatorioDir + 'base' },
      { main: 'br/' + observatorioDir + 'localidade/base' },
      {
        main: `br/${observatorioDir}localidade/${escopo}/base`,
        alt: `br/${observatorioDir}localidade/default/base`
      },
      {
        main: `br/${observatorioDir}localidade/${escopo}/${idDimensao}`,
        alt: `br/${observatorioDir}localidade/default/${idDimensao}`
      }
    ]

    $loadYamlArray({}, baseStructYamls, setDimension)
  }

  const keepLoading = () => {
    const obsid = getObsId()

    // Load dimensions from YAML (or use store if available)
    import('~/utils/service/singleton/yamlFetcher').then(({ YamlFetcherService }) => {
      YamlFetcherService.loadYaml<any[]>(yamlPath, `br/dimensao/${obsid}`)
        .then(result => setSiblingDimensions(result))
        .catch(() => sendError('Falha ao carregar dimensões'))
    })

    // Load topology
    const idLoc = route.params.idLocalidade as string
    if (idLoc === '0') {
      selectCoords('br', 'uf', 0)
    } else if (idLoc.includes('mptreg') || idLoc.includes('MPTREG')) {
      selectCoords('uf', 'municipio', analysisUnit.getStateFromId(idLoc))
    } else if (
      idLoc.includes('prt') || idLoc.includes('PRT') ||
      idLoc.includes('ptm') || idLoc.includes('PTM')
    ) {
      selectCoords('uf', 'municipio', analysisUnit.getStateFromId(idLoc))
    } else if (idLoc.length === 1) {
      selectCoords('regiao', 'uf', idLoc)
    } else if (idLoc.length === 2) {
      selectCoords('uf', 'municipio', idLoc)
    } else if (idLoc.length === 4) {
      selectCoords('uf', 'mesorregiao', idLoc.substring(0, 2))
    } else if (idLoc.length === 5) {
      selectCoords('uf', 'microrregiao', idLoc.substring(0, 2))
    } else {
      selectCoords('uf', 'municipio', idLoc.substring(0, 2))
    }

    // Load topology for compare locality
    const compareId = route.query.compare as string | undefined
    if (compareId) {
      if (compareId === '0') {
        selectCoords('br', 'uf', 0, '_compare')
      } else if (compareId.length === 1) {
        selectCoords('regiao', 'uf', compareId, '_compare')
      } else if (compareId.length === 2) {
        selectCoords('uf', 'municipio', compareId, '_compare')
      } else if (compareId.length === 4) {
        selectCoords('uf', 'mesorregiao', compareId.substring(0, 2), '_compare')
      } else if (compareId.length === 5) {
        selectCoords('uf', 'microrregiao', compareId.substring(0, 2), '_compare')
      } else {
        selectCoords('uf', 'municipio', compareId.substring(0, 2), '_compare')
      }
    }
  }

  // ── Localidade data ──────────────────────────────────────────────────────────

  const fetchDataLocalidade = async (idLoc: string, nmVar: string = 'localidade') => {
    try {
      const place = await analysisUnit.findPlaceByID(idLoc)
      if (place) {
        if (nmVar === 'localidade') {
          localidade.value = place
        }
        customParams.value[nmVar] = place
      }
    } catch {
      sendError(`Falha ao buscar dados da localidade (${idLoc})`)
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  const isValidLocalidadeId = (id: string): boolean => {
    if (!id) return false
    // Rejeita placeholders de template não substituídos (ex: {0}, {idLocalidade})
    if (/[{}]/.test(id)) return false
    return true
  }

  const initPage = () => {
    const obsid = getObsId()
    const idLoc = route.params.idLocalidade as string
    idObservatorio.value = obsid

    if (!isValidLocalidadeId(idLoc)) {
      sendError('Identificador de localidade inválido: "' + idLoc + '". Verifique o endereço acessado.')
      return
    }

    if (!analysisUnit.isCurrent(idLoc)) {
      analysisUnit.setCurrentAnalysisUnit(idLoc)
    }

    import('~/utils/service/singleton/yamlFetcher').then(({ YamlFetcherService }) => {
      YamlFetcherService.loadYaml<any>(yamlPath, `br/observatorio/${obsid}`)
        .then(obsResult => {
          const escopo = $getEscopo(idLoc)
          const auId = $getIdLocalidadeFromRoute(idLoc)

          const thematicDatasets = ['centralindicadores']
          if (obsResult?.tematicos) {
            for (const tematico of obsResult.tematicos) {
              thematicDatasets.push(tematico.dataset)
            }
          }

          const compareId = route.query.compare as string | undefined
          const compareEscopo = compareId ? $getEscopo(compareId) : null
          const compareAuId = compareId ? $getIdLocalidadeFromRoute(compareId) : null

          const datasetPromises: Promise<any>[] = []
          const indicadoresTematicos = indicators.getMultipleGlobalDatasets(
            thematicDatasets, escopo, auId
          )
          if (indicadoresTematicos instanceof Promise) {
            datasetPromises.push(indicadoresTematicos)
          }

          if (compareId && compareEscopo && compareAuId) {
            const indicadoresCompare = indicators.getMultipleGlobalDatasets(
              thematicDatasets, compareEscopo, compareAuId, '_compare'
            )
            if (indicadoresCompare instanceof Promise) {
              datasetPromises.push(indicadoresCompare)
            }
          }

          if (datasetPromises.length === 0) {
            keepLoading()
          } else {
            Promise.all(datasetPromises)
              .then(() => keepLoading())
              .catch(() => sendError(getMensagemErro(idLoc)))
          }
        })
        .catch(() => sendError('Falha ao carregar configuração do observatório'))
    })
  }

  // ── Utility ──────────────────────────────────────────────────────────────────

  const getMensagemErro = (idLoc: string): string => {
    if (idLoc === '0') return 'Falha ao buscar indicadores do país'
    if (idLoc.includes('mptreg') || idLoc.includes('MPTREG')) {
      return 'Falha ao buscar indicadores da regional do MPT'
    }
    if (
      idLoc.includes('prt') || idLoc.includes('PRT') ||
      idLoc.includes('ptm') || idLoc.includes('PTM')
    ) {
      return 'Falha ao buscar indicadores da unidade do MPT'
    }
    switch (idLoc.length) {
      case 1: return 'Falha ao buscar indicadores da região'
      case 2: return 'Falha ao buscar indicadores do estado'
      case 4: return 'Falha ao buscar indicadores mesorregionais'
      case 5: return 'Falha ao buscar indicadores microrregionais'
    }
    return 'Falha ao buscar indicadores do município'
  }

  const { mdAndUp } = useDisplay()

  const resizeFirstSection = () => {
    if (import.meta.client) {
      if (mdAndUp.value) {
        displayHeight.value = 'min-height:' + window.innerHeight + 'px'
      } else {
        displayHeight.value = 'auto'
      }
    }
  }

  const setVisibleCardMaxIndex = () => {
    const vHeight = window.innerHeight || document.documentElement.clientHeight
    let indexSection = 0
    for (const section of sections.value) {
      if (!section.divider) {
        for (const cardIndex in section.cards) {
          const sectionCardIndex = indexSection * 100 + parseInt(cardIndex)
          const el = document.getElementById('anchor_' + section.cards[cardIndex].id)
          if (el) {
            const { top, bottom } = el.getBoundingClientRect()
            if (
              (top > 0 || bottom > 0) &&
              top < vHeight &&
              sectionCardIndex > visibleCardMaxIndex.value
            ) {
              visibleCardMaxIndex.value = sectionCardIndex + 1
            }
          }
        }
      }
      indexSection++
    }
  }

  const scrollTo = (anchor: string) => {
    const el = document.getElementById(anchor)
    if (el) {
      el.scrollIntoView()
      window.scrollBy(0, -120)
    }
  }

  const goToRouteHash = () => {
    const elId = route.hash.replace('#', 'anchor_')
    let i = 0
    const existCondition = setInterval(() => {
      const el = document.getElementById(elId)
      if (el || i >= 30) {
        clearInterval(existCondition)
        scrollTo(elId)
      }
      i++
    }, 100)
  }

  const changeDim = (idDimensao: string) => {
    const obsid = route.params.obsid as string
    const idLoc = route.params.idLocalidade as string
    const viewEndpoint = route.query.compare ? 'localidadecompare' : 'localidade'
    const query: Record<string, string> = { dimensao: idDimensao }
    if (route.query.compare) query.compare = String(route.query.compare)
    router.push({ path: '/' + obsid + '/' + viewEndpoint + '/' + idLoc, query })
  }

  const navDim = (delta: number) => {
    if (delta === 0) {
      window.scrollTo(0, 0)
      return
    }
    for (const dimIndx in dimensoes.value) {
      if (dimensoes.value[dimIndx].id === dimensao_ativa.value?.id) {
        const nextDim = dimensoes.value[parseInt(dimIndx) + delta]
        if (nextDim) changeDim(nextDim.id)
        break
      }
    }
  }

  const openCompareDialog = () => {
    const options = analysisUnit.getSearchDataset()
    if (!options) return

    if (options instanceof Promise || (options as any).then) {
      ;(options as unknown as Promise<any>).then(() => {
        auOptions.value = analysisUnit.getOptions()
        compareDialog.value = true
      })
    } else if (Array.isArray(options) && options.length > 0) {
      const first = options[0]
      if (first instanceof Promise || (first as any).then) {
        Promise.all(options as unknown as Promise<any>[])
          .then(() => {
            auOptions.value = analysisUnit.getOptions()
            compareDialog.value = true
          })
          .catch(() => sendError('Falha ao buscar lista das localidades'))
      } else {
        auOptions.value = options
        compareDialog.value = true
      }
    } else {
      auOptions.value = options as any[]
      compareDialog.value = true
    }
  }

  const customFilter = (itemText: string, queryText: string, _item?: any): boolean => {
    const normalize = (s: string) =>
      s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    return normalize(itemText).includes(normalize(queryText))
  }

  // ── Watchers ─────────────────────────────────────────────────────────────────

  watch(
    () => route.query.dimensao,
    (newDim, oldDim) => {
      if (newDim !== oldDim && newDim && idLocalidade.value) {
        unlockLoading.value = false
        dimParamsLoaded.value = false
        sections.value = []
        ind_principais.value = []
        masterIndicator.value = ''
        const obsid = getObsId()
        const idLoc = route.params.idLocalidade as string
        setActiveDim(idLoc, obsid, newDim as string)
      }
    }
  )

  watch(
    () => idLocalidade_compare.value,
    (newVal) => {
      if (newVal && !route.query.compare) {
        const obsid = route.params.obsid as string
        const idLoc = route.params.idLocalidade as string
        const dimQuery = route.query.dimensao ? '&dimensao=' + route.query.dimensao : ''
        const url = `/${obsid}/localidadecompare/${idLoc}?compare=${newVal.id}${dimQuery}`
        router.push(url)
      }
    }
  )

  watch(localidade, (newVal) => {
    if (newVal) {
      alterMiddleToolbarBus.emit({ localidade: newVal })
    }
  })

  watch(unlockLoading, (newVal) => {
    if (newVal && route.hash) {
      goToRouteHash()
    }
  })

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  onMounted(() => {
    initPage()
    window.addEventListener('scroll', setVisibleCardMaxIndex)
    window.addEventListener('resize', resizeFirstSection)
    resizeFirstSection()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', setVisibleCardMaxIndex)
    window.removeEventListener('resize', resizeFirstSection)
  })

  return {
    // State
    displayHeight,
    dimensoes,
    dimensao_ativa,
    dimensao_ativa_id,
    sections,
    sections_compare,
    localidade,
    masterIndicator,
    masterIndicator_compare,
    presentation,
    presentation_compare,
    ind_principais,
    ind_principais_per_row,
    ind_principais_compare,
    customParams,
    topology,
    unlockLoading,
    visibleCardMaxIndex,
    cardLinks,
    dimParamsLoaded,
    idLocalidade,
    idObservatorio,
    compareDialog,
    idLocalidade_compare,
    auOptions,
    // Computed
    currentParallax,
    computedSearchItems,
    // Methods
    changeDim,
    navDim,
    scrollTo,
    openCompareDialog,
    customFilter,
  }
}

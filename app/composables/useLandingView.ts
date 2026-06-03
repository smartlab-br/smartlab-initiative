import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEventBus } from '@vueuse/core'
import { AnalysisUnit } from '~/utils/model/analysisUnit'
import { TextTransformService } from '~/utils/service/singleton/textTransform'

const analysisUnit = new AnalysisUnit()
const textTransformService = new TextTransformService()

export function useLandingView(options?: {
  statusOption?: Ref<Record<string, string>>
  idObservatorio?: Ref<string | null>
}) {
  const locationDialogBus = useEventBus<void>('showLocationDialog')
  const alterMiddleToolbarBus = useEventBus<{ localidade: any }>('alterMiddleToolbar')

  const itemBusca = ref<any>(null)
  const visibleTitle = ref(true)
  const dialog = ref<boolean | null>(null)
  const idLocalidade = ref<string>('0')
  const currentAnalysisUnit = ref<string | null>(null)

  // Equivalente ao computed loadingStatusSearchOptions do Vue 2
  const loadingStatusSearchOptions = computed<string>(() => {
    const statusOption = options?.statusOption?.value
    if (!statusOption) return 'SUCCESS'

    let minStatus = 'SUCCESS'
    for (const indx in statusOption) {
      if (statusOption[indx] === 'ERROR') return 'ERROR'
      else if (statusOption[indx] === 'LOADING') minStatus = 'LOADING'
    }
    return minStatus
  })

  // Equivalente ao método assessVisibleTitle
  const assessVisibleTitle = () => {
    const el = document.getElementById('screenTitle')
    if (el) {
      const { top, bottom } = el.getBoundingClientRect()
      visibleTitle.value = !(top < 0 && bottom - 88 < 0)
    } else {
      visibleTitle.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', assessVisibleTitle)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', assessVisibleTitle)
  })

  const showDialogContext = () => {
    dialog.value = true
  }

  // Equivalente ao customFilter — usado em v-autocomplete
  const customFilter = (_item: any, queryText: string, itemText: string): boolean => {
    const normalizedQuery = textTransformService.replaceSpecialCharacters(queryText).toLowerCase()
    const normalizedItem = textTransformService.replaceSpecialCharacters(itemText).toLowerCase()
    return normalizedItem.includes(normalizedQuery)
  }

  const openLinkFonte = (sourceLink: string) => {
    window.open(sourceLink, '_blank')
  }

  const openLinkAnalysis = (analysisLink: string) => {
    window.open(analysisLink, '_blank')
  }

  // Callback do GeoIP — substitui this.$nuxt.$emit por useEventBus
  const getClientGeoCallback = (info: any) => {
    if (info.city === undefined) {
      locationDialogBus.emit()
      return
    }

    analysisUnit.getIdLocalidade(info.state, info.city)
      .then((result) => {
        if (result != null) {
          idLocalidade.value = result.cd_municipio_ibge_dv
          analysisUnit.setCurrentAnalysisUnit(result.cd_municipio_ibge_dv)
          alterMiddleToolbarBus.emit({ localidade: result })
        } else {
          locationDialogBus.emit()
        }
      })
      .catch(() => {
        locationDialogBus.emit()
      })
  }

  // Verifica e define a unidade de análise atual (localidade/município)
  const checkCurrentAnalysisUnit = () => {
    const currAU = analysisUnit.getCurrentAnalysisUnit()
    const obsId = options?.idObservatorio?.value

    if (obsId && obsId === 'td' && ((currAU && currAU.toString().length !== 7) || !currAU)) {
      locationDialogBus.emit()
    } else if (!currAU) {
      currentAnalysisUnit.value = '0'
      idLocalidade.value = '0'
      analysisUnit.setCurrentAnalysisUnit('0')
    } else {
      currentAnalysisUnit.value = currAU.toString()
    }
  }

  return {
    // estado
    itemBusca,
    visibleTitle,
    dialog,
    idLocalidade,
    currentAnalysisUnit,
    // computed
    loadingStatusSearchOptions,
    // métodos
    assessVisibleTitle,
    showDialogContext,
    customFilter,
    openLinkFonte,
    openLinkAnalysis,
    getClientGeoCallback,
    checkCurrentAnalysisUnit,
  }
}

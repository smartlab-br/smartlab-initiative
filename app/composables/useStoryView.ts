import { ref, reactive, computed } from 'vue'
import type { Ref } from 'vue'
import { TextTransformService } from '~/utils/service/singleton/textTransform'

const textTransformService = new TextTransformService()

export function useStoryView(options?: {
  customParams?: Ref<Record<string, any>>
}) {
  const { $fillDataStructure } = useNuxtApp()

  const cardLinks = ref<Array<{ id?: string; title: string }>>([])

  // Armazena topologias por sufixo; '' é o padrão (equivalente a this.topology)
  const _topologies = reactive<Record<string, any>>({})

  // Atalho para this.topology (sufixo vazio)
  const topology = computed({
    get: () => _topologies[''] ?? null,
    set: (val: any) => { _topologies[''] = val }
  })

  // Equivalente a selectCoords do BaseStoryView
  const selectCoords = (range: string, scope: string, id: string | number, suffix: string = '') => {
    const topoFile = '/topojson/' + scope + '/' + range + '/' + id + '.json'
    $fetch<any>(topoFile).then((response) => {
      _topologies[suffix] = response
    })
  }

  // Callback usado internamente por fetchVizLinks para popular cardLinks
  const setCardLink = (
    baseObjectList: any,
    _rules: any,
    structure: any,
    addedParams?: Record<string, any> | string
  ) => {
    if (!addedParams || typeof addedParams === 'string') return

    if (typeof baseObjectList === 'string') {
      cardLinks.value[addedParams.pos] = {
        id: addedParams.id,
        title: baseObjectList
      }
    } else {
      const baseObject = Array.isArray(baseObjectList) ? baseObjectList[0] : baseObjectList
      cardLinks.value[addedParams.pos] = {
        id: addedParams.id,
        title: textTransformService.applyInterpol(
          structure,
          options?.customParams?.value ?? {},
          baseObject
        )
      }
    }
  }

  // Equivalente a fetchVizLinks do BaseStoryView
  const fetchVizLinks = (sections: any[]) => {
    let indxViz = 0
    for (const indxSecao in sections) {
      if (sections[indxSecao].name !== '') {
        cardLinks.value[indxViz] = {
          title: sections[indxSecao].name
        }
        indxViz++
      }
      for (const indxCard in sections[indxSecao].cards) {
        const card = sections[indxSecao].cards[indxCard]

        if (card.type && card.type === 'headline') {
          cardLinks.value[indxViz] = {
            title: card.title.fixed
          }
          indxViz++
          continue
        }

        if (card.card_template && (card.title == null || card.title === undefined)) {
          card.title = { fixed: card.id }
        }

        $fillDataStructure(
          card.title,
          options?.customParams?.value ?? {},
          setCardLink,
          { id: card.id, pos: indxViz }
        )
        indxViz++
      }
    }
  }

  return {
    cardLinks,
    topology,
    selectCoords,
    fetchVizLinks,
    setCardLink
  }
}

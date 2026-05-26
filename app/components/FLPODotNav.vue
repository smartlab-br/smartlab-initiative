<template>
  <v-container class="left_nav pa-0" fluid>
    <v-list class="text-center py-0">
      <template v-for="(section, index) in sectionsStructure" :key="index">
        <v-list-item v-if="!section.divider" class="pa-0">
          <v-tooltip location="right" :text="tooltip[section.name!]">
            <template #activator="{ props: tooltipProps }">
              <a v-bind="tooltipProps" @click="scrollTo('anchor_' + section.name)">
                <v-icon
                  :color="section.vizColor"
                  class="ml-1 my-5"
                >
                  mdi-lens
                </v-icon>
              </a>
            </template>
          </v-tooltip>
        </v-list-item>
      </template>
    </v-list>
  </v-container>
</template>

<script setup lang="ts">
import { TextTransformService } from '~/utils/service/singleton/textTransform'
import { Indicators } from '~/utils/model/indicators'

interface SectionCard {
  id: string
  title: any
  type?: string
}

interface SectionGroup {
  cards: SectionCard[]
}

interface SectionStructureItem {
  name: string | null
  divider: boolean
  vizColor: string
}

interface Props {
  sections?: SectionGroup[]
  customParams?: Record<string, any>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  invalidateInterpol: [payload: any]
}>()

const { $fillDataStructure } = useNuxtApp()
const textTransformService = new TextTransformService()
const indicators = new Indicators()

const sectionsStructure = ref<SectionStructureItem[]>([])
const tooltip = ref<Record<string, string>>({})

const sendInvalidInterpol = (payload: any) => {
  emit('invalidateInterpol', payload)
}

const scrollTo = (anchor: string) => {
  if (!import.meta.client) return
  const el = document.getElementById(anchor)
  if (el) {
    el.scrollIntoView()
    window.scrollBy(0, -120)
  }
}

const setTooltipTitle = (baseObjectList: any, rules: any, structure: any, addedParams: any, _metadata?: any) => {
  if (typeof baseObjectList === 'string') {
    tooltip.value[addedParams.id] = baseObjectList
  } else {
    tooltip.value[addedParams.id] = textTransformService.replaceArgs(
      structure.template,
      indicators.indicatorsToValueArray(rules, baseObjectList, sendInvalidInterpol)
    )
  }
}

const buildStruct = () => {
  sectionsStructure.value = []
  if (!props.sections) return

  for (const groupIndex in props.sections) {
    if (sectionsStructure.value.length > 0) {
      sectionsStructure.value.push({
        name: null,
        divider: true,
        vizColor: 'primary-lighten-1'
      })
    }
    for (const itemIndex in props.sections[groupIndex].cards) {
      const card = props.sections[groupIndex].cards[itemIndex]

      if (card.type && card.type === 'headline') {
        sectionsStructure.value.push({
          name: null,
          divider: true,
          vizColor: 'primary-lighten-1'
        })
        continue
      }

      sectionsStructure.value.push({
        name: card.id,
        divider: false,
        vizColor: 'primary-lighten-1'
      })

      $fillDataStructure(
        card.title,
        props.customParams,
        setTooltipTitle,
        { id: card.id }
      )
    }
  }
}

const assessVisibleCards = () => {
  if (!import.meta.client) return
  const vHeight = window.innerHeight || document.documentElement.clientHeight
  for (const item of sectionsStructure.value) {
    if (!item.divider && item.name) {
      const el = document.getElementById(item.name)
      if (el) {
        const { top, bottom } = el.getBoundingClientRect()
        item.vizColor = (top > 0 || bottom > 0) && top < vHeight ? 'accent' : 'primary-lighten-1'
      } else {
        item.vizColor = 'primary-lighten-1'
      }
    }
  }
}

watch(() => props.sections, () => {
  if (!import.meta.client) return
  window.removeEventListener('scroll', assessVisibleCards)
  buildStruct()
  window.addEventListener('scroll', assessVisibleCards)
  assessVisibleCards()
})

onMounted(() => {
  buildStruct()
  window.addEventListener('scroll', assessVisibleCards)
  assessVisibleCards()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', assessVisibleCards)
})
</script>

<style>
.left_nav {
  position: fixed;
  top: 50%;
  z-index: 101;
  transform: translate(0, -50%);
  width: 1.5em !important;
}
.left_nav .v-list {
  background-color: rgba(0, 0, 0, 0) !important;
  border-radius: 0 0.35em 0.35em 0;
}
.left_nav .v-list-item {
  background-color: rgba(0, 0, 0, 0) !important;
  height: 1.5em;
  padding: 0;
  min-height: unset;
}
.left_nav i {
  font-size: 12px;
}
.left_nav a {
  text-decoration: none;
  cursor: pointer;
}
</style>

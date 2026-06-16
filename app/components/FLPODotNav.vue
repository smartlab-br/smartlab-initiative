<template>
  <div class="left_nav">
    <v-list class="text-center py-0">
      <template v-for="(section, index) in sectionsStructure" :key="index">
        <v-list-item v-if="!section.divider" class="pa-0">
          <v-tooltip location="right" :text="tooltip[section.name!]">
            <template #activator="{ props: tooltipProps }">
              <a v-bind="tooltipProps" @click="scrollTo('anchor_' + section.name)">
                <span
                  class="dot"
                  :style="{ backgroundColor: section.vizColor }"
                />
              </a>
            </template>
          </v-tooltip>
        </v-list-item>
      </template>
    </v-list>
  </div>
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

const DOT_COLOR_INACTIVE = '#3f4a54'
const DOT_COLOR_ACTIVE = '#19cfe1'

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

  for (const group of props.sections) {
    if (sectionsStructure.value.length > 0) {
      sectionsStructure.value.push({
        name: null,
        divider: true,
        vizColor: DOT_COLOR_INACTIVE
      })
    }
    if (!group?.cards) continue
    for (const card of group.cards) {
      if (!card) continue

      if (card.type && card.type === 'headline') {
        sectionsStructure.value.push({
          name: null,
          divider: true,
          vizColor: DOT_COLOR_INACTIVE
        })
        continue
      }

      sectionsStructure.value.push({
        name: card.id,
        divider: false,
        vizColor: DOT_COLOR_INACTIVE
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
        item.vizColor = (top > 0 || bottom > 0) && top < vHeight ? DOT_COLOR_ACTIVE : DOT_COLOR_INACTIVE
      } else {
        item.vizColor = DOT_COLOR_INACTIVE
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
  left: 0;
  top: 50%;
  z-index: 101;
  transform: translate(0, -50%);
  width: 2em !important;
  overflow: hidden !important;
  scrollbar-width: none; /* Firefox */ } 
  
  /* Esconde scrollbar e botões de seta (WebKit) */ 
 .left_nav::-webkit-scrollbar { 
    width: 0;
    height: 0; }

 .left_nav::-webkit-scrollbar-button { 
    display: none;
    width: 0;
    height: 0; } 
    
  .left_nav .v-list { 
    background-color: transparent !important;
    border-radius: 0 0.35em 0.35em 0;
    overflow: hidden !important; 
    margin: 0 !important; 
    padding: 0 !important; 
    scrollbar-width: none; /* Firefox */ } 
    
  .left_nav .v-list::-webkit-scrollbar { width: 0; height: 0; } 
  .left_nav .v-list::-webkit-scrollbar-button { 
    display: none; 
    width: 0; 
    height: 0; } 

  .left_nav .v-list-item { 
    background-color: transparent !important; 
    height: auto; 
    min-height: unset !important; 
    margin: 0 !important; 
    padding: 0 !important; } 

  .left_nav a { 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    text-decoration: none; 
    cursor: pointer; 
    margin: 0 !important; 
    padding: 4px 0 !important; 
    line-height: 1; 
  } 
  .left_nav .dot { 
    display: block; 
    width: 10px; 
    height: 10px; 
    border-radius: 50%; 
    opacity: 1; 
    flex: 0 0 10px; 
  } 
</style>
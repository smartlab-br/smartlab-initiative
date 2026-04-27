<template>
  <v-row v-for="(descSection, index) in normalizedStructure" :key="index" :class="descSection.class ? descSection.class : 'pr-0 pl-2 pb-0 pt-5'">
    <v-col>
      <v-row :class="sectionClass ? sectionClass : 'px-3'">
        <v-col>
          <!-- Seção de texto interpolado -->
          <v-row v-if="descSection.type === 'text'" column>
            <v-col v-if="descSection.title" :class="'headline-obs ' + (descSection.cls ? descSection.cls : 'py-0 px-4')">
              {{ descSection.title }}
            </v-col>
            <FLPOTextBuilder
              :reactive-filter="reactiveFilter"
              :custom-params="customParams"
              :structure="descSection.content"
              :read-more-limit="descSection.read_more_limit"
              @invalidateInterpol="throwInvalidInterpol"
            />
            <v-col v-if="descSection.comment != undefined" class="red--text pa-0 pb-4">
              {{ descSection.comment.fixed }}
            </v-col>
          </v-row>

          <!-- Seção de rankings -->
          <v-row v-else-if="descSection.type === 'ranking'" column class="pb-2">
            <v-col pa-0 class="headline-obs">
              {{ descSection.title }}
            </v-col>
            <FLPORankingText
              :custom-params="customParams"
              :structure="descSection"
            />
          </v-row>

          <!-- Seção de rankings lista -->
          <v-row v-else-if="descSection.type === 'ranking_list'" column pb-2>
            <v-col class="headline-obs pa-0 ml-2">
              {{ descSection.title }}
            </v-col>
            <v-row wrap :class="descSection.sectionClass ? descSection.sectionClass : 'pb-2'">
              <FLPORankingList
                v-for="(ranking, index) in (descSection.rankings || []).filter(filterGroup)"
                :key="(ranking.group ? ranking.group : 'group') + index"
                :structure="ranking"
                :reactive-filter="reactiveFilter"
                :custom-filters="customFilters"
                :custom-params="customParams"
              />
            </v-row>
          </v-row>

          <!-- Seção de minicards -->
          <v-row v-else-if="descSection.type === 'minicards'" column pb-2>
            <v-col class="headline-obs pa-0">
              {{ descSection.title }}
            </v-col>
            <v-row wrap :class="descSection.sectionClass ? descSection.sectionClass : 'pb-4'">
              <FLPOMinicard
                v-for="(miniCard, index) in descSection.cards?.filter(filterGroup) || []"
                :key="(miniCard.group ? miniCard.group : 'group') + index"
                :reactive-filter="reactiveFilter"
                :custom-filters="customFilters"
                :structure="miniCard"
                :custom-params="customParams"
                :row-class="descSection.rowClass"
              />
            </v-row>
            <v-col v-if="descSection.comment != undefined" class="red--text pa-0 pb-4">
              {{ descSection.comment.fixed }}
            </v-col>
          </v-row>

          <v-row v-else-if="descSection.type === 'select' && isGroupActive(descSection)" :class="descSection.cls ? descSection.cls : 'pb-2'">
            <v-col v-if="descSection.title" cols="12" class="headline-obs pa-0 pb-1">
              {{ descSection.title }}
            </v-col>
            <FLPOSelectEmitter
              :id="`${descSection.id}_${id}`"
              :reactive-parent="reactiveParent"
              :reactive-filter="reactiveFilter"
              :custom-params="customParams"
              :structure="descSection"
              @selection="triggerSelect"
              @default-selection="triggerDefaultSelect"
            />
          </v-row>
          <v-row
            v-else-if="descSection.type === 'legend-list' &&
              (descSection.group === undefined || descSection.group === null || descSection.group === activeGroup)"
            column
            :class="descSection.cls ? descSection.cls : 'pb-2'"
          >
            <v-col class="title-obs pa-0">
              {{ descSection.title }}
            </v-col>
            <FLPOLegendList
              :id="descSection.id + '_' + id"
              :structure="descSection"
            />
          </v-row>

          <v-row
            v-else-if="descSection.type === 'switch-group' &&
              (descSection.group === undefined || descSection.group === null || descSection.group === activeGroup)"
            column
            :class="descSection.cls ? descSection.cls : 'pb-2'"
          >
            <v-col v-if="descSection.title" class="title-obs pt-0 pb-0 pr-0 pl-4 text-start">
              {{ descSection.title }}
            </v-col>
            <FLPOSwitchGroupEmitter
              :id="descSection.id + '_' + id"
              :structure="descSection"
              @selection="triggerSelect"
              @default-selection="triggerDefaultSelect"
            />
          </v-row>

          <v-row
            v-else-if="descSection.type === 'radio' &&
              (descSection.group === undefined || descSection.group === null || descSection.group === activeGroup)"
            column
            :class="descSection.cls ? descSection.cls : 'pb-2'"
          >
            <FLPORadioEmitter
              :id="descSection.id + '_' + id"
              :custom-params="customParams"
              :structure="descSection"
              @selection="triggerSelect"
              @default-selection="triggerDefaultSelect"
            />
          </v-row>

          <v-row
            v-else-if="descSection.type === 'check' &&
              (descSection.group === undefined || descSection.group === null || descSection.group === activeGroup)"
            column
            :class="descSection.cls ? descSection.cls : 'pb-2'"
          >
            <v-col v-if="descSection.title" class="headline-obs pa-0">
              {{ descSection.title }}
            </v-col>
            <FLPOCheckEmitter
              :id="descSection.id + '_' + id"
              :custom-params="customParams"
              :structure="descSection"
              @selection="triggerSelect"
              @default-selection="triggerDefaultSelect"
            />
          </v-row>

          <v-row
            v-else-if="descSection.type === 'slider' &&
              (descSection.group === undefined || descSection.group === null || descSection.group === activeGroup)"
            column
            :class="descSection.cls ? descSection.cls : 'pb-2'"
          >
            <v-col class="headline-obs pa-0">
              {{ descSection.title }}
            </v-col>
            <FLPOSliderEmitter
              :id="descSection.id + '_' + id"
              :custom-params="customParams"
              :structure="descSection"
              @selection="triggerSelect"
              @default-selection="triggerDefaultSelect"
            />
          </v-row>
          <!-- Seção de odômetro -->
          <v-row v-if="descSection.type === 'odometer'" column pb-2>
            <v-col
              class="headline-obs text-center pa-0"
              :style="`background-color:${descSection.bg_color || 'black'};color:${descSection.title_font_color || 'white'}`"
            >
              {{ descSection.title }}
            </v-col>
            <FLPOOdometer
              :odometer-items="descSection.odometer_items || []"
              :comment-title="descSection.comment_title"
              :title-font-color="descSection.title_font_color"
              :bg-color="descSection.bg_color"
            />
          </v-row>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
// Definição de tipos para as seções
interface DescSection {
  type?: 'text' | 'ranking' | 'ranking_list' | 'minicards' | 'select' | 'legend-list' | 'switch-group' | 'radio' | 'check' | 'slider' | 'odometer'
  class?: string
  cls?: string
  title?: string
  content?: any
  read_more_limit?: number
  comment?: { fixed: string }
  sectionClass?: string
  rankings?: any[]
  cards?: any[]
  rowClass?: string
  id?: string
  group?: string
  odometer_items?: any[]
  comment_title?: string
  title_font_color?: string
  bg_color?: string
  [key: string]: any // Permite propriedades adicionais
}

interface Props {
  id?: string
  structure?: DescSection[]
  customParams?: Record<string, any>
  customFilters?: Record<string, any>
  topology?: Record<string, any>
  sectionIndex?: number
  rowClass?: string
  activeGroup?: string
  sectionClass?: string
  reactiveFilter?: Record<string, any>
}

const props = defineProps<Props>()

// Normaliza a prop structure para lidar com o caso em que campos YAML
// (já arrays) são passados envoltos em [] extras, criando arrays aninhados.
const normalizedStructure = computed<DescSection[]>(() => {
  if (!props.structure) return []
  return (props.structure as any[]).flatMap((item: any) =>
    Array.isArray(item) ? item : [item]
  )
})

const emit = defineEmits<{
  selection: [payload: any]
  'default-selection': [payload: any]
  resendInvalidInterpol: [payload: any]
}>()

const dataset = ref<any[]>([])
const metadata = ref<any[]>([])
const datasetsComplete = ref(0)
const reactiveParent = ref<string | undefined>(undefined)
const { $chartGen } = useNuxtApp()

const filterGroup = (card: any) => {
  if (card.group === undefined || card.group === null || card.group === props.activeGroup) {
    return card
  }
}

const triggerSelect = (payload: any) => {
  reactiveParent.value = payload.id
  emit("selection", payload)
}

const triggerDefaultSelect = (payload: any) => {
  reactiveParent.value = payload.id
  emit("default-selection", payload)
}

const throwInvalidInterpol = (payload: any) => {
  emit("resendInvalidInterpol", payload)
}

const isGroupActive = (descSection: any) => {
  return descSection.group === undefined || descSection.group === null || descSection.group === props.activeGroup
}
</script>

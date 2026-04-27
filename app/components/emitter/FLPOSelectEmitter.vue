<template>
  <v-col cols="12">
    <v-autocomplete
      v-model="chosen"
      :items="items"
      :filter="ignoreSpecialCharFilter"
      :variant="isOutline ? 'outlined' : 'filled'"
      :label="structure?.label"
      item-title="label"
      :placeholder="structure?.placeholder"
      item-value="id"
      class="input-group--focused"
      return-object
      :color="structure?.color || 'primary'"
      :multiple="structure?.multiple || false"
      :clearable="structure?.clearable ?? true"
      :hint="errorMessage"
      persistent-hint
      @update:model-value="sendSelection"
    />
  </v-col>
</template>


<script setup lang="ts">
import { TextTransformService } from "~/utils/service/singleton/textTransform"

interface SelectDefault {
  fixed?: any
  base_object?: string
  named_prop?: string
}

interface SelectStructure {
  label?: string
  placeholder?: string
  color?: string
  multiple?: boolean
  clearable?: boolean
  default?: SelectDefault
  [key: string]: any
}

interface Props {
  id?: string
  structure?: SelectStructure
  customParams?: Record<string, any>
  immediate?: boolean
  reactiveFilter?: Record<string, any>
  reactiveParent?: string
  isOutline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  immediate: true,
  isOutline: false
})

const emit = defineEmits<{
  selection: [payload: any]
  'default-selection': [payload: any]
}>()

const textTransformService = new TextTransformService()
const { $fillDataStructure } = useNuxtApp()

const chosen = ref<any>(null)
const items = ref<any[]>([])
const errorMessage = ref<string | undefined>(undefined)

const toItem = (row: any, rules: any) => {
  const eachItem = { ...row }
  rules.forEach((rule: any) => {
    if (rule.fixed != null) {
      eachItem[rule.prop] = rule.fixed
    } else if (rule.named_prop != null) {
      eachItem[rule.prop] = row[rule.named_prop]
    }
  })
  items.value.push(eachItem)
}

const toItems = (dataset: any, rules: any, _preloaded: any, _addedParams: any = null, _metadata: any = null) => {
  items.value = []
  if (dataset) {
    dataset.forEach((row: any) => toItem(row, rules))
  }

  // Seleciona o valor default, se houver
  if (props.structure?.default) {
    let defaultValue = null

    if (props.structure.default.fixed != null) {
      defaultValue = props.structure.default.fixed
    } else if (props.structure.default.base_object && props.structure.default.named_prop && props.customParams && props.customParams[props.structure.default.base_object]) {
      defaultValue = props.customParams[props.structure.default.base_object][props.structure.default.named_prop]
    } else if (props.customParams && props.structure.default.named_prop) {
      defaultValue = props.customParams[props.structure.default.named_prop]
    }

    chosen.value = items.value.find(item => item.id === defaultValue) || null
  } else if (props.structure?.clearable === false) {
    chosen.value = items.value[0] || null
  } else {
    chosen.value = null
  }

  if (chosen.value != null) {
    sendDefaultSelection()
  }
}

const ignoreSpecialCharFilter = (item: any, queryText: string, itemText: string): boolean => {
  queryText = textTransformService.replaceSpecialCharacters(queryText).toLowerCase()
  itemText = textTransformService.replaceSpecialCharacters(itemText).toLowerCase()
  return itemText.includes(queryText)
}

const buildPayload = (item: any) => ({
  id: props.id,
  item,
  type: props.structure?.type,
  rules: props.structure?.selection?.rules
})

const sendSelection = (newVal: any) => {
  emit('selection', buildPayload(newVal))
}

const sendDefaultSelection = () => {
  emit('default-selection', buildPayload(chosen.value))
}

onMounted(() => {
  $fillDataStructure(props.structure, props.customParams, toItems)
})
</script>

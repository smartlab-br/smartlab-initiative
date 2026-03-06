<template>
  <v-col cols="12" class="px-3 pt-4">
    <v-range-slider
      v-if="structure?.range"
      v-model="rangeValue" 
      thumb-color="primary"
      color="accent"
      always-dirty
      thumb-label="always"
      :step="step"
      :min="min"
      :max="max"
      :hint="errorMessage"
      persistent-hint
      @change="sendSelection"
    />
    <v-slider
      v-else
      v-model="value" 
      thumb-color="primary"
      color="accent"
      thumb-label="always"
      always-dirty
      :tick-labels="items"
      :step="step"
      :min="min"
      :max="max"
      class="slider-no-tick-mark"
      :hint="errorMessage"
      persistent-hint
      @change="sendSelection"
    />
  </v-col>
</template>

<script setup lang="ts">
import { ObjectTransformService } from "@/utils/service/singleton/objectTransform"

interface SliderSelection {
  event?: string
  rules?: any
  [key: string]: any
}

interface SliderStructure {
  id?: string
  range?: boolean
  type?: string
  selection?: SliderSelection
  default?: any
  [key: string]: any
}

interface Props {
  id?: string
  structure?: SliderStructure
  customParams?: Record<string, any>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  [key: string]: [payload: any]
}>()

const objectTransformService = new ObjectTransformService()

const value = ref<number>(0)
const rangeValue = ref<number[]>([0, 0]) 
const step = ref(1)
const min = ref(0)
const max = ref(0)
const items = ref<string[]>([])
const errorMessage = ref("")

onMounted(() => {
  if (props.structure?.range) {
    rangeValue.value = [min.value, max.value]
  } else {
    value.value = max.value
  }
})

const toItems = (dataset: any[], rules: any[], structure: any, _addedParams: any, _metadata: any) => {
  rules.forEach((rule: any) => {
    if (rule.fixed !== null && rule.fixed !== undefined) {
      if (props.structure?.range) {
        rangeValue.value = rule.fixed
      } else {
        value.value = rule.fixed
      }
    } else if (rule.named_prop !== null && rule.named_prop !== undefined) {
      if (props.structure?.range) {
        rangeValue.value = dataset[0][rule.named_prop]
      } else {
        value.value = dataset[0][rule.named_prop]
      }
    } else if (rule.function) {
      const result = objectTransformService.runNamedFunction(rule, dataset[0])
      if (props.structure?.range) {
        rangeValue.value = result
      } else {
        value.value = result
      }
    }
  })

  if (props.structure?.range) {
    rangeValue.value = [min.value, max.value]
  } else {
    items.value.push(min.value.toString())
    const emptyTicks = Math.floor((max.value - min.value) / step.value) - 1
    items.value.push(...Array(emptyTicks).fill(""))
    items.value.push(max.value.toString())
  }

  if (structure.default != null) {
    if (props.structure?.range) {
      rangeValue.value = structure.default
    } else {
      value.value = structure.default
    }
    sendDefaultSelection()
  } else if (!props.structure?.range) {
    value.value = max.value
    sendDefaultSelection()
  }
}

const sendSelection = () => {
  const eventName = props.structure?.selection?.event
  if (eventName) {
    emit(eventName, {
      id: props.structure?.id,
      value: props.structure?.range ? rangeValue.value : value.value,
      type: props.structure?.type,
      rules: props.structure?.selection?.rules
    })
  }
}

const sendDefaultSelection = () => {
  emit("default-selection", {
    id: props.structure?.id,
    value: props.structure?.range ? rangeValue.value : value.value,
    type: props.structure?.type,
    rules: props.structure?.selection?.rules
  })
}
</script>

<style>
.v-input--range-slider span {
  color: #fff !important;
}

.v-slider__thumb-label span {
  color: #fff !important;
}

.slider-no-tick-mark .v-slider__ticks {
  border-color: transparent !important;
}
</style>
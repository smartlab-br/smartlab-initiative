<template>
  <div class="pl-4 pt-2">
    <div
      v-for="eachSwitch in structure?.switches"
      :key="eachSwitch.id"
      :class="eachSwitch.cls || 'pl-3'"
    >
      <div v-if="eachSwitch.title" class="title-obs text-start">
        {{ eachSwitch.title }}
      </div>
      <div class="d-flex align-center">
        <v-switch
          v-model="selection[eachSwitch.id]"
          class="switch-compact"
          density="compact"
          hide-details
          :color="eachSwitch.color || 'primary'"
          :readonly="!!eachSwitch.readonly"
          @update:model-value="toggleSwitch(eachSwitch)"
        >
          <template v-if="eachSwitch.label" #label>
            {{ eachSwitch.label }}
          </template>
        </v-switch>
        <FLPOMinicard
          v-for="(miniCard, index) in eachSwitch.minicards"
          :key="index"
          :structure="miniCard"
          :custom-params="customParams"
          :row-class="miniCard.rowClass || 'pa-1'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MiniCard {
  rowClass?: string
  [key: string]: any
}

interface SwitchItem {
  id: string
  title?: string
  label?: string
  color?: string
  readonly?: boolean
  default?: boolean
  cls?: string
  minicards?: MiniCard[]
  [key: string]: any
}

interface SwitchGroupStructure {
  switches?: SwitchItem[]
  event?: string
  [key: string]: any
}

interface Props {
  id?: string
  structure?: SwitchGroupStructure
  customParams?: Record<string, any>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  [key: string]: [payload: any]
}>()

const selection = ref<Record<string, boolean>>({})

// Inicializa a seleção dos switches
const initializeSelection = () => {
  props.structure?.switches?.forEach((switchItem: SwitchItem) => {
    selection.value[switchItem.id] = switchItem.default ?? true
  })

  if (props.structure?.event) {
    emit(props.structure.event, {
      id: props.id,
      type: "switch-group",
      enabled: selection.value
    })
  }
}

// Toggle de um switch específico
const toggleSwitch = (_struct: any) => {
  if (props.structure?.event) {
    emit(props.structure.event, {
      id: props.id,
      type: "switch-group",
      enabled: selection.value
    })
  }
}

onMounted(() => {
  initializeSelection()
})
</script>

<style scoped>
.switch-compact {
  margin: 0;
  padding: 0;
}

:deep(.switch-compact.v-input) {
  --v-input-control-height: 28px;
}

:deep(.switch-compact .v-input__control) {
  min-height: unset;
}

:deep(.switch-compact .v-selection-control) {
  min-height: unset;
  padding-top: 0;
  padding-bottom: 0;
}
</style>

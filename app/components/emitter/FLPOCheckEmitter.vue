<template>
  <v-row class="py-0">
    <v-checkbox
      v-model="checkValue"
      :color="structure?.color || 'accent'"
      :label="structure?.label || ''"
      @update:model-value="sendSelection"
    />
  </v-row>
</template>

<script setup lang="ts">
interface CheckSelection {
  event?: string
  rules?: any
  [key: string]: any
}

interface CheckStructure {
  id?: string
  value?: boolean
  color?: string
  label?: string
  type?: string
  selection?: CheckSelection
  [key: string]: any
}

interface Props {
  id?: string
  structure?: CheckStructure
  customParams?: Record<string, any>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  [key: string]: [payload: any]
}>()

const checkValue = ref(true)

onMounted(() => {
  // Inicializar o valor da checkbox com a estrutura
  checkValue.value = props.structure?.value ?? true
})

const sendSelection = () => {
  const eventName = props.structure?.selection?.event
  if (eventName) {
    emit(eventName, {
      id: props.structure?.id,
      value: checkValue.value,
      type: props.structure?.type,
      rules: props.structure?.selection?.rules
    })
  }
}
</script>

<style scoped>
.v-input--selection-controls {
  margin-top: 0px;
}
</style>

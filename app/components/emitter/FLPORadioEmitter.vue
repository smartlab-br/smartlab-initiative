<template>
  <v-col>
    <v-radio-group
      v-model="chosen"
      class="pa-0"
      hide-details
      @update:model-value="(val) => toggleRadio(structure?.items?.find(i => i.value === val))"
    >
      <v-radio
        v-for="item in structure?.items"
        :key="item.id"
        :color="item.color || 'accent'"
        :value="item.value"
      >
        <template #label>
          <v-row align="center">
            <v-col v-if="item.label" class="d-flex"><span v-html="item.label"></span></v-col>
            <FLPOMinicard
              v-for="(miniCard, index) in item.minicards"
              :key="index"
              :structure="miniCard"
              :custom-params="customParams"
              :row-class="miniCard.rowClass || 'pa-1'"
            />
          </v-row>
        </template>
      </v-radio>
    </v-radio-group>
  </v-col>
</template>

<script setup lang="ts">
interface MiniCard {
  rowClass?: string
  [key: string]: any
}

interface RadioItem {
  id: string
  label?: string
  color?: string
  value: any
  minicards?: MiniCard[]
  [key: string]: any
}

interface RadioSelection {
  event?: string
  rules?: any
  [key: string]: any
}

interface RadioStructure {
  id?: string
  items?: RadioItem[]
  event?: string
  selection?: RadioSelection
  [key: string]: any
}

interface Props {
  id?: string
  structure?: RadioStructure
  customParams?: Record<string, any>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  [key: string]: [payload: any]
}>()

const chosen = ref(props.structure?.items?.[0]?.value)
const selection = ref<Record<string, boolean>>({})

onMounted(() => {
  chosen.value = props.structure?.items?.[0]?.value
})

const toggleRadio = (chosenItem: any) => {
  props.structure?.items?.forEach((item: RadioItem) => {
    selection.value[item.value] = item.value === chosenItem.value
  })

  const eventName = props.structure?.event || props.structure?.selection?.event
  if (eventName) {
    emit(eventName, {
      id: props.structure?.id,
      type: "radio",
      enabled: selection.value,
      item: chosenItem,
      rules: props.structure?.selection?.rules || null
    })
  }
}
</script>

<style scoped>
</style>

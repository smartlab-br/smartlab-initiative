<template>
  <v-row class="rank" ma-0 ml-2 py-3>
    <v-col>
      <span v-if="national_rank !== ''" v-html="cmpText"></span>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { NumberTransformService } from "~/utils/service/singleton/numberTransform"

interface RankingArg {
  prop: string
  fixed?: any
  named_prop?: string
  format?: string
  precision?: number
  multiplier?: number
  collapse?: any
  signed?: boolean
  uiTags?: boolean
  default?: any
}

interface RankingStructure {
  api?: any
  preloaded?: any
  args?: RankingArg[]
  [key: string]: any
}

interface Props {
  id?: string
  structure?: RankingStructure
  customParams?: Record<string, any>
}

const props = defineProps<Props>()

const numberTransformService = new NumberTransformService()
const { $fillDataStructure } = useNuxtApp()

const regional_rank = ref("")
const regional_total = ref("")
const regional_complementary_text = ref("")
const national_rank = ref("")
const national_total = ref("")
const national_complementary_text = ref("")

const cmpText = computed(() => {
  if (regional_rank.value) {
    return (
      regional_rank.value +
      "º de " +
      regional_total.value +
      " na UF" +
      regional_complementary_text.value +
      "<br/>" +
      national_rank.value +
      "º de " +
      national_total.value +
      " no Brasil" +
      national_complementary_text.value
    )
  } else if (national_rank.value) {
    return (
      national_rank.value +
      "º de " +
      national_total.value +
      " no Brasil" +
      national_complementary_text.value
    )
  }
  return null
})

const setRankingProp = (prop: string, value: any) => {
  const normalizedValue = value == null ? "" : String(value)
  switch (prop) {
  case "regional_rank":
    regional_rank.value = normalizedValue
    break
  case "regional_total":
    regional_total.value = normalizedValue
    break
  case "regional_complementary_text":
    regional_complementary_text.value = normalizedValue
    break
  case "national_rank":
    national_rank.value = normalizedValue
    break
  case "national_total":
    national_total.value = normalizedValue
    break
  case "national_complementary_text":
    national_complementary_text.value = normalizedValue
    break
  }
}

const applyRankingArgs = (baseObject: Record<string, any>, args: RankingArg[] = []) => {
  for (const item of args) {
    let value = item.fixed
    if (item.named_prop) {
      value = baseObject?.[item.named_prop]
    }

    if ((value === null || value === undefined || value === "") && item.default != null) {
      value = item.default
    }

    if (item.format && value !== null && value !== undefined && value !== "") {
      value = numberTransformService.formatNumber(
        value,
        item.format,
        item.precision,
        item.multiplier,
        item.collapse,
        item.signed,
        item.uiTags
      )
    }

    setRankingProp(item.prop, value)
  }
}

onMounted(() => {
  if (props.structure?.api || props.structure?.preloaded) {
    $fillDataStructure(
      props.structure,
      props.customParams ?? {},
      (dataset: any, rules: RankingArg[] = []) => {
        const row = Array.isArray(dataset) ? (dataset[0] ?? {}) : (dataset ?? {})
        applyRankingArgs(row, rules)
      }
    )
  } else {
    applyRankingArgs(props.customParams ?? {}, props.structure?.args ?? [])
  }
})
</script>

<style scoped>
.rank {
  display: inline-block !important;
  font-size: 1rem;
  color: rgb(68, 114, 196, 1);
}
</style>

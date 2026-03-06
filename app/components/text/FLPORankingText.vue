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
const { $fillDataStructure, $autoFillLayout } = useNuxtApp()

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

onMounted(() => {
  if (props.structure?.api || props.structure?.preloaded) {
    $fillDataStructure(
      props.structure,
      props.customParams,
      $autoFillLayout
    )
  } else {
    if (props.structure?.args) {
      for (const item of props.structure.args) {
        let value = item.fixed
        if (item.format) {
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
        if ((value === null || value === undefined) && item.default != null && item.default !== undefined) {
          value = item.default
        }
        // Atualizar os valores reativos conforme o prop item.prop
        switch (item.prop) {
        case "regional_rank":
          regional_rank.value = value
          break
        case "regional_total":
          regional_total.value = value
          break
        case "regional_complementary_text":
          regional_complementary_text.value = value
          break
        case "national_rank":
          national_rank.value = value
          break
        case "national_total":
          national_total.value = value
          break
        case "national_complementary_text":
          national_complementary_text.value = value
          break
        }
      }
    }
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

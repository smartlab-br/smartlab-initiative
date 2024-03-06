<template>
  <div>
    Page: Teste
  </div>
  <div v-if="smartlab">ObsId: {{ currentObsId }}</div>
  <div v-if="smartlab">Dimensão: {{ currentDimension }}</div>
  <div v-if="smartlab">Obs: {{ currentObs }}</div>
  <div v-if="smartlab">Smartlab: {{ smartlab }}</div>
  <div v-if="observatories">Observatorios: {{ observatories }}</div>
</template>

<script lang="ts">
import { useMainStore } from "~/store"
import { onMounted } from "vue"
import { storeToRefs } from "pinia"
// import { useNuxtApp } from "#app"

export default {
  setup() {
    const store = useMainStore()

    const { smartlab, observatories, currentObs, currentObsId, currentDimension } = storeToRefs(store)

    // const { $reformDataset } = useNuxtApp()

    // const ds = [
    //   { cd_indicador: "1", nu_competencia: 2099, vl_indicador: 123.45 },
    //   { cd_indicador: "1", nu_competencia: 2047, vl_indicador: 678.9 }
    // ]
    // const options = {
    //   formatters: [
    //     { id: "vl_indicador", format: "inteiro" }
    //   ]
    // }
    // const result = $reformDataset(ds, options, {})
    // console.log(result)


    onMounted(() => {
    })

    return {
      smartlab,
      observatories,
      currentObs,
      currentObsId,
      currentDimension
    }
  }
}

</script>

<style scoped></style>

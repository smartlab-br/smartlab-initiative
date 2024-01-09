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

export default {
  setup() {
    const store = useMainStore()

    const { smartlab, observatories, currentObs, currentObsId, currentDimension } = storeToRefs(store)

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

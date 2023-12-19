<template>
  <div>
    Page: Teste
  </div>
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

    const { smartlab, observatories } = storeToRefs(store)

    onMounted(() => {
    })

    return {
      smartlab,
      observatories
    }
  }
}

</script>

<style scoped></style>

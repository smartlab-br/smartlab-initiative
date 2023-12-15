<template>
  <div>
    Page: Teste
  </div>
  <div v-if="observatorios">Testando: {{ observatorios }}</div>
</template>

<script lang="ts">
import { ref, onMounted } from "vue"
import { useState } from "#imports"

export default {
  setup() {
    const observatorios = ref(null)
    onMounted(() => {
      const getSmartlabData = () => useState("smartlab")
      const smartlabData: any = getSmartlabData()
      console.log(smartlabData.value)
      if (smartlabData.value) {
        observatorios.value = smartlabData.value.observatorios
      }
      
    })

    return {
      observatorios
    }
  }
}

</script>

<style scoped></style>

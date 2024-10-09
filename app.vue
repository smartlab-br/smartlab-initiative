<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts">
import { onMounted } from "vue"
import { useMainStore } from "~/store"

export default {
  setup() {
    const store = useMainStore()
    
    onMounted(async () => {
      // Carregar os dados após a montagem no lado do cliente
      await store.loadSmartlabData()
    })

    return {}
  },
}
</script>

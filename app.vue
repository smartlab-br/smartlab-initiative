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
    const { loadSmartlabData } = store
    onMounted(() => {
      loadSmartlabData()
    })
    
    return {
    }
  }
}

</script>

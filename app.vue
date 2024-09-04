<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script lang="ts">
import { onMounted } from "vue"
import { useMainStore } from "~/store"
import { useRoute } from "vue-router"

export default {
  setup() {
    const store = useMainStore()
    const { loadSmartlabData, setCurrentObs, setCurrentPlace } = store

    const route = useRoute()
    
    onMounted(() => {
      setCurrentPlace("0")
      loadSmartlabData().then(() => {
        setCurrentObs(route)
      })
    })
    
    return {
    }
  }
}

</script>

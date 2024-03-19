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
    const { loadSmartlabData, setCurrentObs, setLocalidade } = store

    const route = useRoute()
    
    onMounted(() => {
      setLocalidade("0")
      loadSmartlabData().then(() => {
        setCurrentObs(route)
      })
    })
    
    return {
    }
  }
}

</script>

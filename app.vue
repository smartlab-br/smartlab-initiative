<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script lang="ts">
const { $store } = useNuxtApp()

import { onMounted } from "vue"

export default {
  setup() {
    
    onMounted(() => {
      $store.loadSmartlabData()
    })

    return {
    }
  }
}

</script>

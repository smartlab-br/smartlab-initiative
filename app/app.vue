<template>
  <NuxtLayout>
    <div v-if="isLoading" class="loading-container">
      <v-progress-circular
        indeterminate
        size="64"
        color="primary"
      />
      <p class="mt-4">Carregando Smartlab...</p>
    </div>
    <NuxtPage v-else />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useMainStore } from '~/store'

const store = useMainStore()
const isLoading = ref(true)

onMounted(async () => {
  // Garante que os dados sejam carregados antes de renderizar o conteúdo
  if (!store.smartlab) {
    await store.loadSmartlabData()
  }
  isLoading.value = false
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
}
</style>


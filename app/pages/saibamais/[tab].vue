<template>
  <div style="background-color: #000; min-height: calc(100vh - 64px); padding: 40px 5%;">
    <FLPOSobreLayout
      v-if="sobre && activeTab"
      :content="sobre"
      :active-tab="activeTab"
    />
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from '~/store'

const route = useRoute()
const store = useMainStore()

const activeTab = computed(() => route.params.tab as string)
const sobre = computed(() => store.aboutSmartlabData)
</script>
<template>
  <div v-if="sourceDesc || analysisDesc" class="data-source caption">
    <div v-if="sourceDesc && !sourceLink">Fonte: {{ sourceDesc }}</div>
    <div v-else-if="sourceDesc && sourceLink">
      Fonte: <a class="text-accent cursor-pointer" :href="sourceLink" target="_blank" rel="noopener">{{ sourceDesc }}</a>
    </div>
    <div v-if="analysisDesc && !analysisLink">Tratamento e análise: {{ analysisDesc }}</div>
    <div v-else-if="analysisDesc && analysisLink">
      Tratamento e análise: <a class="text-accent cursor-pointer" :href="analysisLink" target="_blank" rel="noopener">{{ analysisDesc }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  source?: { desc?: string; link?: string } | null
  analysis?: { desc?: string; link?: string; hide_analysis?: boolean } | null
}>()

const sourceDesc = computed(() => props.source?.desc ?? null)
const sourceLink = computed(() => props.source?.link || null)
const analysisDesc = computed(() => {
  if (props.analysis?.hide_analysis) return null
  return props.analysis?.desc ?? 'SmartLab'
})
const analysisLink = computed(() => props.analysis?.link || null)
</script>

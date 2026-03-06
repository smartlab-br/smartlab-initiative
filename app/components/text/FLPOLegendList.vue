<template>
  <v-row>
    <v-col
      v-for="eachItem in structure?.items"
      :key="eachItem.id"
      :class="'ma-0 ' + (eachItem.cls ? eachItem.cls : 'pb-0 pl-3')"
      :xs="getColSize('xs',eachItem.cls) || 12"
      :sm="getColSize('sm',eachItem.cls)"
      :md="getColSize('md',eachItem.cls)"
      :lg="getColSize('lg',eachItem.cls)"
      :xl="getColSize('xl',eachItem.cls)"
    >
      <v-row>
        <v-col cols="1" class="pt-1 pr-3">
          <v-icon
            :color="eachItem.color ? eachItem.color : 'primary'"
            size="small"
          >
            {{ eachItem.icon ? eachItem.icon : (structure?.icon ? structure.icon : 'mdi-circle') }}
          </v-icon>
        </v-col>
        <v-col class="caption pt-2">
          {{ eachItem.label }}
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
interface LegendItem {
  id: string
  cls?: string
  color?: string
  icon?: string
  label?: string
  [key: string]: any
}

interface LegendStructure {
  items?: LegendItem[]
  icon?: string
  [key: string]: any
}

interface Props {
  id?: string
  structure?: LegendStructure
}

defineProps<Props>()

const { $getColSize } = useNuxtApp()
const getColSize = $getColSize
</script>

<style scoped>
.control-top-align .v-input__slot {
  align-items: baseline;
}
</style>

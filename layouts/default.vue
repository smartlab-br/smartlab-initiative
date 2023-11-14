<template>
  <div id="app">
    <v-app>
      Lorem ipsum dolor sit amet consectetur adipisicing elit
      <v-list lines="one">
        <v-list-item
          v-for="n in 3"
          :key="n"
          :title="'Item ' + n"
          subtitle="Lorem ipsum dolor sit amet consectetur adipisicing elit"
        />
      </v-list>
    </v-app>
  </div>
</template>

<script lang="ts" setup>
// const $ColorsService = ColorsService

</script>
<style>

</style>

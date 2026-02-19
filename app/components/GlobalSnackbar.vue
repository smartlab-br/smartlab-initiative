<template>
  <v-snackbar
    v-model="snackbar.visible"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    top
    @click:outside="snackbar.hideSnackbar"
  >
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { useSnackbarStore } from "~/store/snackbar"

const snackbar = useSnackbarStore()
</script>

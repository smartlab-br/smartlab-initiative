<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <v-row class="d-flex align-center justify-center">
        <v-col cols="auto"> <v-btn color="primary"> Primary </v-btn> </v-col>
        <v-col cols="auto">
          <v-btn color="secondary"> Secondary </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn color="accent"> Accent </v-btn>
        </v-col>
        <v-col cols="auto">
          <p>{{ ColorsService.changeTheme("des") }}</p>
        </v-col>
        <v-col cols="auto">
          <div>
            
          </div>
        </v-col>
      </v-row>
      <v-row class="d-flex align-center justify-center">
        <v-col cols="auto"> 
          <slot />
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script lang="ts">
import { onMounted } from "vue"

export default {
  setup() {
    onMounted(() => {
    })

    return {
    }
  }
}

</script>

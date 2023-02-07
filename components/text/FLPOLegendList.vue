<template>
  <v-layout row wrap>
    <v-flex
      v-for="eachItem in structure.items"
      :key="eachItem.id"
      :class="'ma-0 ' + (eachItem.cls ? eachItem.cls : ' pb-0 pl-3 xs12')"
    >
      <v-layout row>
        <v-flex xs1 pt-1 pr-3>
          <v-icon
            small
            :color="eachItem.color?eachItem.color: 'primary'"
          >
            {{ (eachItem.icon?eachItem.icon: (structure.icon?structure.icon: "circle")) }}
          </v-icon>
        </v-flex>
        <v-flex caption pt-2>
          {{ eachItem.label }}
        </v-flex>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ['id', 'structure'],
  data () {
    return {
    }
  },
  created () {
  },
  methods: {
  }
}
</script>

<style>
.control-top-align .v-input__slot {
    align-items: baseline;
}
</style>

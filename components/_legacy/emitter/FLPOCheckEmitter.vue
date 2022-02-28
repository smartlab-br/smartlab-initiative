<template>
  <v-flex py-0>
    <v-checkbox 
      v-model="check_value"
      :key="structure.value"
      :color="structure.color ? structure.color : 'accent'"
      :label="structure.label ? structure.label : ''"
      @change="sendSelection">
    </v-checkbox>
  </v-flex>
</template>

<script>
  import FLPOBaseEmitter from '../FLPOBaseEmitter.vue';

  export default {
    extends: FLPOBaseEmitter,
    data () {
      return {
        label: null,
        color: 'primary',
        check_value: true
      }
    },
    created () {
      this.check_value = this.structure.value;
    },
    methods: {
      sendSelection() {
        this.$emit(
          this.structure.selection.event,
          { id: this.structure.id,
            value: this.check_value,
            type: this.structure.type,
            rules: this.structure.selection.rules
          }
        );
      },
    }
  }



</script>

<style>

.v-input--selection-controls {
    margin-top: 0px;
}

</style>

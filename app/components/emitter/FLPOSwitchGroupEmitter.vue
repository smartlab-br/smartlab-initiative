<template>
  <v-layout row wrap>
    <v-flex v-for="eachSwitch in structure.switches"
      :key="eachSwitch.id"
      :class="'ma-0 ' + (eachSwitch.cls ? eachSwitch.cls : ' pb-0 pl-3 xs12')">
      <v-flex v-if="eachSwitch.title" pa-0 class="title-obs">{{ eachSwitch.title }}</v-flex>
      <v-switch class="ma-0 pa-0" hide-details
        v-model="selection[eachSwitch.id]"
        :color="eachSwitch.color !== null ? eachSwitch.color : 'primary'"
        v-on:change="toggleSwitch(eachSwitch)">
        <template slot="label">
          {{ eachSwitch.label ? eachSwitch.label : '' }}
          <flpo-minicard v-for="(miniCard, index) in eachSwitch.minicards" :key="index"
            :structure="miniCard" :customFunctions="customFunctions"
            :customParams="customParams"
            :row-class="miniCard.rowClass ? miniCard.rowClass : 'pa-1'">
          </flpo-minicard>
        </template>
      </v-switch>
    </v-flex>
  </v-layout>
</template>

<script>
  import FLPOBaseEmitter from '../FLPOBaseEmitter.vue';

  export default {
    extends: FLPOBaseEmitter,
    data () {
      return {
        selection: {}
      }
    },
    created () {
      for (var indxStruct in this.structure.switches) {
        if (this.structure.switches[indxStruct].default === null ||
            this.structure.switches[indxStruct].default === undefined) {
          this.selection[this.structure.switches[indxStruct].id] = true;
        } else {
          this.selection[this.structure.switches[indxStruct].id] = this.structure.switches[indxStruct].default;
        }
      }
      this.$emit(this.structure.event, { id: this.id, type: 'switch-group', enabled: this.selection });
    },
    methods: {
      toggleSwitch(struct) {
        this.$emit(this.structure.event, { id: this.id, type: 'switch-group', enabled: this.selection });
        //this.$emit(this.structure.event, { id: this.id, item: this.chosen, rules: this.structure.selection.rules });
      }
    }
  }
</script>

<style>
</style>

<template>
  <v-flex>
    <v-radio-group v-model="chosen"
      class="pa-0"
      hide-details>
      <v-radio v-for="item in structure.items"
        :key="item.id"
        :color="item.color ? item.color : 'accent'"
        :value="item.value"
        v-on:change="toggleRadio(item)">
        <template slot="label">
          <v-layout v-html="item.label ? item.label : ''"> 
          </v-layout>
          <flpo-minicard v-for="(miniCard, index) in item.minicards" :key="index"
            :structure="miniCard" :customFunctions="customFunctions"
            :customParams="customParams"
            rowClass="pa-1"
            @showSnackbar="snackAlert">
          </flpo-minicard>
        </template>
      </v-radio>
    </v-radio-group>
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
        chosen: null,
        selection: {}
      }
    },
    created () {
      this.chosen = this.structure.items[0].value;
      this.toggleRadio(this.structure.items[0]);
    },
    methods: {
      toggleRadio(chosen) {
        for(let item of this.structure.items){
          if (item.value == chosen.value){
            this.selection[item.value] = true;
          } else {
            this.selection[item.value] = false;
          }
        }
        this.$emit(this.structure.event, { id: this.id, type: 'radio', enabled: this.selection, item: chosen});
      },
    }
  }
</script>
<style>
</style>

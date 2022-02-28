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
          <v-layout align-center>
            <v-flex v-html="item.label ? item.label : ''"> 
            </v-flex> 
            <flpo-minicard v-for="(miniCard, index) in item.minicards" :key="index"
              :structure="miniCard" :customFunctions="customFunctions"
              :customParams="customParams"
              rowClass="pa-1"
              @showSnackbar="snackAlert">
            </flpo-minicard>
          </v-layout>
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
        this.$emit(this.structure.event ? this.structure.event : this.structure.selection.event, 
                  { id: this.structure.id, type: 'radio', enabled: this.selection, 
                    item: chosen,
                    rules: this.structure.selection ? this.structure.selection.rules : null}
                  );
      },
    }
  }
</script>
<style>
</style>

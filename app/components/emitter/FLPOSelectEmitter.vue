<template>
  <v-flex>
    <v-autocomplete :items="items"
      :filter="ignoreSpecialCharFilter"
      :outline="isOutline"
      v-model="chosen"
      :label="structure.label" item-text="label"
      :placeholder="structure.placeholder"
      item-value="id" class="input-group--focused" return-object
      :color="structure.color !== null ? structure.color : 'primary'"
      :multiple="structure.multiple ? structure.multiple : false"
      v-on:change="sendSelection()" :clearable="structure.clearable == null || structure.clearable == undefined || structure.clearable"
      :hint="errorMessage"
      persistent-hint>
    </v-autocomplete>
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
        chosen: null
      }
    },
    props: ['isOutline', 'customParams'],
    methods: {

      toItems(dataset, rules, structure, addedParams, metadata) {
        this.items = [];
        for (var rowIndx in dataset) {
          this.toItem(dataset[rowIndx], rules);
        }


        // seleciona, caso tenha valor default
        if (structure.default != null && structure.default != undefined){
          let defaultValue;

          if (structure.default.fixed != null && structure.default.fixed != undefined) {
            defaultValue = structure.default.fixed;
          } else if (structure.default.base_object && this.customParams[structure.default.base_object]) {
            defaultValue = this.customParams[structure.default.base_object][structure.default.named_prop];
          } else {
            defaultValue = this.customParams[structure.default.named_prop];
          }

          for (let item of this.items){
            if (item.id == defaultValue){
              this.chosen = item;
              break;
            }
          }
        // caso não possa ser limpo (clearable), seleciona o primeiro registro
        } else if (structure.clearable != null && structure.clearable != undefined && !structure.clearable){
          this.chosen = this.items[0];
        } else {
          this.chosen = null;
        }
        if (this.chosen != null){
          this.sendDefaultSelection();
        } 

      },

      ignoreSpecialCharFilter (item, queryText, itemText) {
        queryText = this.$textTransformService.replaceSpecialCharacters(queryText).toLowerCase();
        itemText = this.$textTransformService.replaceSpecialCharacters(itemText).toLowerCase();
        return itemText.indexOf(queryText) > -1 
      }
      
    }

  }
</script>

<style>
</style>

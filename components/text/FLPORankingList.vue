<template>
  <v-flex :class="cls ? cls : 'xs12'">
    <v-layout v-if="structure.look !='minicard'" column wrap ml-2 mb-2>
      <v-flex x12 px-0 :class="'display-1-obs ranking-list-title pb-2'" v-html="title"></v-flex>
      <v-flex v-if="errorMessage" x12 px-0 :class="'display-1-obs ranking-list-text'+ (structure.text_size? '-'+structure.text_size:'')+' pb-2'"> {{ errorMessage }} </v-flex>
      <v-flex xs12 class="ranking-list pa-0" v-for="(item, itemIndx) in ranking" :key="itemIndx">      
        <div :class="'ranking-list-text'+ (structure.text_size? '-'+structure.text_size:'')" v-html="'<span>' + (item.rank? item.rank: itemIndx+1) + '. </span>'+ item.localidade + ' ' + (item.vl_indicador?item.vl_indicador:'')" />
      </v-flex>
    </v-layout>
    <v-layout v-else column wrap ml-2 mb-2 class="ranking-list-minicard">
      <v-flex v-if="errorMessage" x12 px-0 :class="'display-1-obs ranking-list-minicard-text'+ (structure.text_size? '-'+structure.text_size:'')+' pb-2'"> {{ errorMessage }} </v-flex>
      <v-flex xs12 class="ranking-list-minicard pa-0" v-for="(item, itemIndx) in ranking" :key="itemIndx">      
        <div :class="'ranking-list-minicard-text'+ (structure.text_size? '-'+structure.text_size:'')" v-html="(item.rank? item.rank: itemIndx+1) + '. '+ item.localidade + ' ' + (item.vl_indicador?item.vl_indicador:'')" />
      </v-flex>
      <v-flex x12 px-0 :class="'ranking-list-minicard-title pb-2'" v-html="title"></v-flex>
    </v-layout>
  </v-flex>
</template>

<script>
  export default {
    data () {
      return {
          ranking: [],
          cls: "xs12",
          title: null,
          errorMessage: null
      }
    },
    props: ['id', 'structure', 'customParams', 'customFunctions', 'reactiveFilter', 'customFilters'],
    created () {
      if (this.structure.cls) this.cls = this.structure.cls;
      if (this.structure.title) this.title = this.structure.title;

      this.fillDataStructure(
        this.structure, this.customParams,
        this.customFunctions, this.fillRankingList
      );
    },
    watch: {
      reactiveFilter: function(newVal, oldVal) {
        if (newVal != oldVal) {
          if (this.structure.reactive){
            this.errorMessage = null;
            this.ranking= [];
            this.updateReactiveDataStructure(this.customFilters.filterUrl);
          } 
        }
      },
    },
    methods: {
      fillRankingList(base_object_list, rules, preloaded, addedParams = null, metadata = null) {
        let ranking = [];
        let value = null;
        for (let item in base_object_list){
          ranking[item] = {};
          for (let idxRule in rules){
            value = base_object_list[item][rules[idxRule].named_prop];
            if(value !== null && value !== undefined && rules[idxRule].format) {
              let formatRules = rules[idxRule];
              value = this.$numberTransformService.formatNumber(
                value, formatRules.format, formatRules.precision, formatRules.multiplier, formatRules.collapse, formatRules.signed, formatRules.uiTags
              );
            } 
            ranking[item][rules[idxRule].prop] = value;
          }
        }
        this.ranking = ranking;
      },
      updateReactiveDataStructure(filterUrl){
        let structReactive = Object.assign({},this.structure);
        structReactive.api = JSON.parse(JSON.stringify(this.structure.apiBase?this.structure.apiBase:this.structure.api));

        if (structReactive.api){
          if (!Array.isArray(structReactive.api)){
            structReactive.api = [structReactive.api];
          }
          for(let struct of structReactive.api){
            if (struct.fixed){
              struct.fixed += filterUrl
            } else if (struct.template){
              struct.template += filterUrl
            }
          }
        }
        
        this.fillDataStructure(
          structReactive, this.customParams,
          this.customFunctions, this.fillRankingList
        );
      }
    }
  }
</script>

<style>

  .ranking-list {
    display: inline-block !important;
  }

  .ranking-list-text span {
    font-size: 0.85rem;
  } 
  
  .ranking-list-text {
    font-size: 1rem;
  } 
  
  .ranking-list-title {
    text-transform: uppercase;
    font-size: 1.25rem;
  } 
  
  .ranking-list-minicard {
    color: rgb(53,94,168,1);
  }
  
  .ranking-list-minicard-text {
    font-family: Lato, Calibri, sans-serif !important;
    font-size: 1.25rem;
    line-height: 1.2;
  } 
  
  .ranking-list-minicard-title {
    text-transform: uppercase;
    font-size: 0.8rem;
    font-weight: 400;
  } 
  
</style>
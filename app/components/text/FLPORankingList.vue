<template>
  <v-flex :class="cls">
    <v-layout column wrap ml-2 mb-2>
      <v-flex x12 px-0 class="display-1-obs ranking-list-title pb-2"> {{ title}} </v-flex>
      <v-flex xs12 class="ranking-list pa-0" v-for="(item, itemIndx) in ranking" :key="itemIndx">      
        <div class="ranking-list-text"><span>{{item.rank? item.rank: itemIndx+1}}. </span>{{item.localidade + " " + item.vl_indicador}}</div>
      </v-flex>
      <!--
      <v-layout py-2 class="ranking-list-title"> {{title}} </v-layout>      
      <v-layout pa-2 mb-1 class="ranking-list" v-for="(item, itemIndx) in ranking" :key="itemIndx">
        <v-layout row wrap pr-2>
          <v-flex pa-1 xs2 primary white--text class="display-1-obs">
            <v-layout ma-0 justify-center fill-height align-center>
              {{ item.rank ? item.rank : (itemIndx + 1) }}
            </v-layout>
          </v-flex>
          <v-flex xs10 column>
            <v-layout pa-1 class="ranking-list-text">{{item.localidade}}</v-layout>
            <v-layout pa-1 class="ranking-list-value" grey lighten-2>{{item.vl_indicador}}</v-layout>
          </v-flex>
        </v-layout>
      </v-layout>
    -->
    </v-layout>
  </v-flex>
</template>

<script>
  export default {
    data () {
      return {
          ranking: [],
          cls: "xs12",
          title: null
      }
    },
    props: ['id', 'structure', 'customParams', 'customFunctions'],
    created () {
      if (this.structure.cls) this.cls = this.structure.cls;
      if (this.structure.title) this.title = this.structure.title;
      this.fillDataStructure(
        this.structure, this.customParams,
        this.customFunctions, this.fillRankingList
      );
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
              value = this.formatNumber(
                value, formatRules.format, formatRules.precision, formatRules.multiplier, formatRules.collapse, formatRules.signed, formatRules.uiTags
              );
            } 
            ranking[item][rules[idxRule].prop] = value;
          }
        }
        this.ranking = ranking;
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
  
  .ranking-list-value {
    font-size: 0.85rem;
    padding-bottom: 0.5rem;
  } 
  
</style>
<template>
  <v-flex :class="cls" >
    <v-card>
      <v-card-title :class="color + ' ranking-card-head white--text'" >
        <div style="width:100%">
          <v-layout row align-center>
            <v-flex class="ranking-card-text">{{ranking[0].localidade}}</v-flex>
            <v-flex class="ranking-card-value">{{formatNumber(ranking[0].vl_indicador,"inteiro")}}</v-flex>
          </v-layout>
          <div class="ranking-card-title pt-3" >{{title}}</div>

        </div>
      </v-card-title>
      <v-card-text class="pa-0 ranking-card-bottom">
          <v-list light class="pa-0">
            <template v-for="(item, itemIndx) in ranking.slice(1)">
              <v-list-tile>
                <!--<v-list-tile-avatar>{{item.rank? item.rank: itemIndx+2}}</v-list-tile-avatar>-->
                <v-list-tile-content class="caption">{{item.localidade}}</v-list-tile-content>
                <v-list-tile-action class="caption">{{formatNumber(item.vl_indicador,"inteiro")}}</v-list-tile-action>
              </v-list-tile>
              <v-divider></v-divider>
            </template>
          </v-list>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
  export default {
    data () {
      return {
          ranking: [],
          cls: "xs12",
          title: null,
          color: "primary"
      }
    },
    props: ['id', 'structure', 'customParams', 'customFunctions'],
    created () {
      if (this.structure.cls) this.cls = this.structure.cls;
      if (this.structure.color) this.color = this.structure.color;
      if (this.structure.title) this.title = this.structure.title;
      this.fillDataStructure(
        this.structure, this.customParams,
        this.customFunctions, this.fillRankingList
      );
    },
    methods: {
      fillRankingList(base_object_list, rules, preloaded, addedParams = null, metadata = null) {
        let ranking = [];
        for (let item in base_object_list){
          ranking[item] = {};
          for (let idxRule in rules){
              ranking[item][rules[idxRule].prop] = base_object_list[item][rules[idxRule].named_prop]
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

  .ranking-card-text span {
    font-size: 0.85rem;
  } 
  
  .ranking-card-text {
    font-family: Lato, Calibri, sans-serif !important;
    font-weight: 300;
    font-size: 1.25rem;
    line-height: 2rem;
  } 
  
  .ranking-card-title {
    text-transform: uppercase;
    font-size: 0.85rem;
    text-align: center;
  } 
  
  .ranking-card-head {
    min-height: 114px
  } 
  
  .ranking-card-bottom {
    min-height: 196px
  } 
  
  .ranking-card-value {
    font-family: Lato, Calibri, sans-serif !important;
    font-weight: 300;
    font-size: 2rem;
    line-height: 2rem;
    text-align: right;
  } 
  
</style>
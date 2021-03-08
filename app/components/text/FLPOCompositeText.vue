<template>
  <v-layout column class="px-0 pb-0 pt-2">
    <v-flex v-for="(descSection, index) in structure" :key="index" column :class=" descSection.class ? descSection.class : 'pr-0 pl-2 pb-0 pt-3'">
      <v-layout row :class="sectionClass ? sectionClass : 'px-3'">
        <!-- Seção de texto interpolado -->
        <!-- <v-layout v-if="descSection.type && descSection.type == 'text'" column>
          <v-flex class="headline-obs">{{ descSection.title }}</v-flex>
          <v-flex>{{ applyInterpol(descSection.content, customParams, customFunctions) }}</v-flex>
        </v-layout> -->
        <v-layout v-if="descSection.type && descSection.type == 'text'" column>
          <v-flex :class="'headline-obs ' + (descSection.cls ? descSection.cls : 'py-0 px-4')">{{ descSection.title }}</v-flex>
          <flpo-text-builder
            :reactive-filter="reactiveFilter"
            :custom-params="customParams"
            :custom-functions="customFunctions"
            :structure="descSection.content"
            :read-more-limit="descSection.read_more_limit"
            v-on:invalidateInterpol="throwInvalidInterpol"
            @showSnackbar="snackAlert">
          </flpo-text-builder>
          <v-flex v-if="descSection.comment != undefined" pa-0 pb-4 class="red--text">{{ descSection.comment.fixed }}</v-flex>
        </v-layout>
        <!-- Seção de rankings -->
        <v-layout v-else-if="descSection.type && descSection.type == 'ranking_slider'" column pb-2>
          <v-flex pa-0 class="headline-obs">{{ descSection.title }}</v-flex>
          <flpo-ranking-slider
            :customParams="customParams"
            :structure="descSection">
          </flpo-ranking-slider>
        </v-layout>
        <v-layout v-else-if="descSection.type && descSection.type == 'ranking'" column pb-2>
          <v-flex pa-0 class="headline-obs">{{ descSection.title }}</v-flex>
          <flpo-ranking-text
            :customParams="customParams"
            :custom-functions="customFunctions"
            :structure="descSection">
          </flpo-ranking-text>
        </v-layout>
        <v-layout v-else-if="descSection.type && descSection.type == 'ranking_list'" column pb-2>
          <v-flex pa-0 ml-2 class="headline-obs">{{ descSection.title }}</v-flex>
          <v-layout row wrap :class="descSection.sectionClass ? descSection.sectionClass : 'pb-2'">
            <flpo-ranking-list v-for="(ranking, index) in descSection.rankings.filter(filterGroup)" :key="(ranking.group ? ranking.group : 'group') + index"
              :structure="ranking" :customFunctions="customFunctions"
              :reactive-filter="reactiveFilter"
              :custom-filters="customFilters"
              :customParams="customParams"
              @showSnackbar="snackAlert">
            </flpo-ranking-list>
          </v-layout>
        </v-layout>
        <!-- Seção de rankings (bullet) -->
        <v-layout v-else-if="descSection.type && descSection.type == 'rank_bullet'" column pb-2>
          <flpo-ranking-bullet
            :id = "descSection.id + '_' + id" 
            :customParams="customParams"
            :structure="descSection">
          </flpo-ranking-bullet>
        </v-layout>
        <!-- Seção de minicards -->
        <v-layout v-else-if="descSection.type && descSection.type == 'minicards'" column pb-2>
          <v-flex pa-0 class="headline-obs">{{ descSection.title }}</v-flex>
          <v-layout row wrap :class="descSection.sectionClass ? descSection.sectionClass : 'pb-4'">
            <flpo-minicard v-for="(miniCard, index) in descSection.cards.filter(filterGroup)" :key="(miniCard.group ? miniCard.group : 'group') + index"
              :reactive-filter="reactiveFilter"
              :custom-filters="customFilters"
              :structure="miniCard" :customFunctions="customFunctions"
              :customParams="customParams" 
              :row-class="descSection.rowClass"
              @showSnackbar="snackAlert">
            </flpo-minicard>
          </v-layout>
          <v-flex v-if="descSection.comment != undefined" pa-0 pb-4 class="red--text">{{ descSection.comment.fixed }}</v-flex>
        </v-layout>
        <!-- Seção de select -->
        <v-layout column v-else-if="descSection.type && descSection.type == 'select' &&
                                    (descSection.group == undefined || descSection.group == null || descSection.group == activeGroup)"  
          :class="descSection.cls?descSection.cls:'pb-2'">
          <v-flex pa-0 class="headline-obs">{{ descSection.title }}</v-flex>
          <flpo-select-emitter
            v-if="descSection.type == 'select'"
            :id = "descSection.id + '_' + id" 
            :reactive-parent = "reactiveParent"
            :reactive-filter="reactiveFilter"
            :custom-params="customParams"
            :structure="descSection"
            :custom-functions="customFunctions"
            v-on:selection="triggerSelect"
            v-on:default-selection="triggerDefaultSelect"
            @showSnackbar="snackAlert">
          </flpo-select-emitter>
        </v-layout>
        <v-layout column v-else-if="descSection.type && descSection.type == 'switch-group'&&
                                    (descSection.group == undefined || descSection.group == null || descSection.group == activeGroup)" 
          :class="descSection.cls?descSection.cls:'pb-2'">
          <v-flex pa-0 class="headline-obs">{{ descSection.title }}</v-flex>
          <flpo-switch-group-emitter
            :id = "descSection.id + '_' + id" 
            :structure="descSection"
            :custom-functions="customFunctions"
            v-on:selection="triggerSelect"
            v-on:default-selection="triggerDefaultSelect"
            @showSnackbar="snackAlert">
          </flpo-switch-group-emitter>
        </v-layout>
        <v-layout column v-else-if="descSection.type && descSection.type == 'radio'&&
                                    (descSection.group == undefined || descSection.group == null || descSection.group == activeGroup)" 
          :class="descSection.cls?descSection.cls:'pb-2'">
          <flpo-radio-emitter
            :id = "descSection.id + '_' + id" 
            :custom-params="customParams"
            :structure="descSection"
            :custom-functions="customFunctions"
            v-on:selection="triggerSelect"
            v-on:default-selection="triggerDefaultSelect"
            @showSnackbar="snackAlert">
          </flpo-radio-emitter>
        </v-layout>
        <v-layout column v-else-if="descSection.type && descSection.type == 'check'&&
                                    (descSection.group == undefined || descSection.group == null || descSection.group == activeGroup)" 
          :class="descSection.cls?descSection.cls:'pb-2'">
          <flpo-check-emitter
            :id = "descSection.id + '_' + id" 
            :custom-params="customParams"
            :structure="descSection"
            :custom-functions="customFunctions"
            v-on:selection="triggerSelect"
            v-on:default-selection="triggerDefaultSelect"
            @showSnackbar="snackAlert">
          </flpo-check-emitter>
        </v-layout>
        <v-layout column v-else-if="descSection.type && descSection.type == 'slider'&&
                                    (descSection.group == undefined || descSection.group == null || descSection.group == activeGroup)" 
          :class="descSection.cls?descSection.cls:'pb-2'">
          <v-flex pa-0 class="headline-obs">{{ descSection.title }}</v-flex>
          <flpo-slider-emitter
            :id = "descSection.id + '_' + id" 
            :custom-params="customParams"
            :structure="descSection"
            :custom-functions="customFunctions"
            v-on:selection="triggerSelect"
            v-on:default-selection="triggerDefaultSelect"
            @showSnackbar="snackAlert">
          </flpo-slider-emitter>
        </v-layout>
        <!-- Seção de ligear gauge -->
        <v-layout v-else-if="descSection.type && descSection.type == 'linear-gauge'" column pb-2>
          <v-flex pa-0 class="headline-obs">{{ descSection.title }}</v-flex>
          <flpo-gauge-linear
            :id = "descSection.id + '_lineargauge_' + id"
            :customParams="customParams"
            :structure="descSection">
          </flpo-gauge-linear>
        </v-layout>
        <!-- Seção de odômetro -->
        <v-layout v-if="descSection.type && descSection.type == 'odometer'" column pb-2>
          <v-flex pa-0 class="headline-obs text-xs-center"
            :style="'background-color:' + (descSection.bg_color ? descSection.bg_color : 'black') + 
                    ';color:'+ (descSection.title_font_color ? descSection.title_font_color : 'white')">
            {{ descSection.title }}
          </v-flex>
          <flpo-odometer 
            :odometer-items="descSection.odometer_items"
            :comment-title="descSection.comment_title"
            :title-font-color="descSection.title_font_color"
            :bg-color="descSection.bg_color"
            @showSnackbar="snackAlert">
          </flpo-odometer>
        </v-layout>
        <!-- Seção de gráfico -->
        <v-layout v-else-if="descSection.type && descSection.type == 'chart'" column pb-2>
          <v-flex pa-0 class="headline-obs">{{ descSection.title }}</v-flex>
          <v-layout fill-height
            v-if="descSection && descSection.chartType && validCharts.includes(descSection.chartType)"
            :class = "leafletBasedCharts.includes(descSection.chartType) ? 'map_geo' : ''"
            :id="descSection.id"
            @showSnackbar="snackAlert">
          </v-layout>
        </v-layout>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
  import FLPOBaseLayout from '../FLPOBaseLayout.vue';

  export default {
    extends: FLPOBaseLayout,
    data () {
      return {
        dataset: [],
        metadata: [],
        datasetsComplete: 0,
        reactiveParent: null
      }
    },
    props: ['id','activeGroup', 'reactiveFilter', 'sectionClass', 'customFilters'],
    created () {
      for (var indxDesc in this.structure) {
        if (this.structure[indxDesc].type === 'chart') {
          this.fillDataStructure(
            this.structure[indxDesc], this.customParams,
            this.customFunctions, this.setDataset,
            { id: this.structure[indxDesc].id }
          );
        }
      }
    },
    mounted: function() {
    },
    methods: {
      filterGroup (card){
        if (card.group == undefined || card.group == null || card.group == this.activeGroup){
          return card;
        }
      },
      triggerSelect(payload) {
        this.reactiveParent = payload.id;
        this.$emit('selection', payload);
      },

      triggerDefaultSelect(payload) {
        this.$emit('default-selection', payload);
      },

      throwInvalidInterpol(payload) {
        this.$emit('resendInvalidInterpol', payload);
      },

      triggerChartUpdates(id, dataset, metadata) {
        for (let sectionIndex in this.structure) {
          if (this.structure[sectionIndex].type == 'chart') {
            let eachChart = this.structure[sectionIndex];
            if (eachChart && eachChart.id == id) {
              this.chartGen(
                this.chartId[id],
                eachChart.chartType,
                eachChart,
                eachChart.options,
                dataset,
                metadata,
                sectionIndex);
            }
          }
        }
      }

    }
  }
</script>

<style>
</style>

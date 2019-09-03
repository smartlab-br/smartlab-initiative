<template>
  <v-layout row wrap>
    <v-flex xs12>
      <!-- Estilo de CARD -->
      <v-card :id="structure.id" :class="'mx-4 mb-5 bg-card' + $colorsService.getClassIfIsDark(null, sectionIndex, $vuetify.theme)">
        <v-progress-linear
          height="5"
          :indeterminate="loadingStatusDataset == 'LOADING'"
          v-show="loadingStatusDataset != 'SUCCESS'"
          :color="loadingStatusDataset == 'ERROR' ? 'error' : 'info'">
        </v-progress-linear>
        <v-flex xs12 row wrap red darken-1 text-xs-center class="error-in-card"
          v-show="loadingStatusDataset == 'ERROR'">
          {{ errorMessage }}
        </v-flex>
        <v-card-text v-if="dataset" v-show="loadingStatusDataset == 'SUCCESS'">
          <v-layout column>
            <v-flex pb-0>
              <v-layout row align-end fill-height wrap pl-3 pt-3 pb-0 pr-0 class="display-1-obs mb-0">
                <v-flex xs10 class="card-title">
                  {{ cmpTitle ? cmpTitle : '' }}
                  <v-tooltip :v-if="structure && structure.info" bottom max-width="700px">
                    <v-icon color="accent"
                      class="pb-1"
                      slot="activator">
                      info
                    </v-icon>
                    <flpo-composite-text
                      ref = "description"
                      :id = "'info_' + structure.id"
                      :structure="structure.info"
                      :custom-params="customParams"
                      :custom-functions="customFunctions">
                    </flpo-composite-text>
                  </v-tooltip>
                  <div v-if="cmpTitleComment != null" class="title-comment" v-html="cmpTitleComment"></div>
                </v-flex>
                <!-- <v-spacer></v-spacer> -->
                <!-- <v-btn small fill-height class="mb-0" flat :color="$colorsService.assessZebraTitleColor(this.sectionIndex, $vuetify.theme)"
                  @click.native="downloadChart">
                  <span class="hidden-sm-and-down body">Baixar gráfico</span>
                  <v-icon right>file_download</v-icon>
                </v-btn> -->
                <v-flex xs2 text-xs-right pr-4>
                <v-btn small flat :color="$colorsService.assessZebraTitleColor(this.sectionIndex, $vuetify.theme)"
                  @click.native="dialog = true" style="margin: 0px;">
                  <span :class="chartPosition == 'bottom'?'hidden-md-and-down body': 'hidden-sm-and-down body'">Dados</span>
                  <v-icon right>view_list</v-icon> <!-- list -->
                </v-btn>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex>
              <v-layout row wrap style="min-height:500px;">
                <v-flex xs12 :class="chartPosition != 'bottom' ? 'md3 position-relative': 'position-relative'" column>
                  <v-flex column pt-0 slot="description">
                    <flpo-composite-text
                      v-if="!invalidInterpol"
                      :id = "'story_' + structure.id"
                      :structure="structure.description"
                      :custom-params="customParams"
                      :custom-functions="customFunctions"
                      v-on:selection="triggerSelect"
                      v-on:resendInvalidInterpol="changeTextToInvalidInterpol">
                    </flpo-composite-text>
                    <v-flex v-else
                      class="text-xs-justify body-obs d-inline-block"
                      pa-2
                      v-html="structure.msgNoData.desc">
                    </v-flex>
                  </v-flex>

                  <v-flex class="caption pb-0 pt-3 px-3 bottom-30 data-source">
                    Fonte:
                    <template v-for="(cmpSrc, indxSrc) in cmpSources">
                      <template v-if="cmpSrc.desc && indxSrc > 0">,&nbsp;</template>
                      <template v-if="cmpSrc.desc && !cmpSrc.link">
                        {{ cmpSrc.desc }}
                      </template>
                      <template v-else-if="cmpSrc.desc && cmpSrc.link">
                        <a class="accent--text" v-on:click="openLinkFonte(cmpSrc.link)">{{ cmpSrc.desc }}</a>
                      </template>
                    </template>
                  </v-flex>

                  <v-flex 
                    v-if="cmpSources && cmpSources.length > 0"
                    class="caption pt-0 px-3 bottom-30 data-source">
                    Tratamento e análise:
                    <template v-for="(cmpAn, indxAnalysis) in cmpAnalysis">
                      <template v-if="cmpAn.desc && indxAnalysis > 0">,&nbsp;</template>
                      <template v-if="cmpAn.desc && !cmpAn.link">
                        {{ cmpAn.desc }}
                      </template>
                      <template v-else-if="cmpAn.desc && cmpAn.link">
                        <a class="accent--text" v-on:click="openLinkFonte(cmpAn.link)">{{ cmpAn.desc }}</a>
                      </template>
                    </template>
                  </v-flex>
                </v-flex>
                <v-flex xs12 :class="chartPosition != 'bottom' ? 'md9': ''" py-2>
                  <v-layout row wrap
                    v-if="datasetsComplete == structure.charts.length"
                    :class="$vuetify.breakpoint.mdAndUp ? ' fill-height' : ''">
                    <v-flex
                      v-for="chart in structure.charts"
                      :key="chart.id"
                      :class="(chart.cls ? chart.cls : '') + ($vuetify.breakpoint.mdAndUp ? ' fill-height' : '')">
                      <v-layout column :style="cmpStyle" :class="{'px-3': $vuetify.breakpoint.smAndDown, 'px-0 mx-0 fill-height': $vuetify.breakpoint.mdAndUp}">
                        <v-flex fill-height :class="{'mx-0': $vuetify.breakpoint.smAndDown, 'mx-3 pb-0': $vuetify.breakpoint.mdAndUp}">
                          <!-- Definition of all possible charts -->
                          <flpo-bar-chart
                            v-if="dataset && dataset[chart.id] !== null && chart.type == 'BAR' && chart.options !== null"
                            :id="chartId[chart.id]"
                            :dataset="dataset[chart.id]"
                            :options="chart.options"
                            :headers="chart.headers"
                            :section-index="sectionIndex">
                          </flpo-bar-chart>
                          <flpo-boxplot-chart
                            v-if="dataset && dataset[chart.id] !== null && chart.type == 'BOXPLOT' && chart.options !== null"
                            :id="chartId[chart.id]"
                            :dataset="dataset[chart.id]"
                            :options="chart.options"
                            :headers="chart.headers"
                            :section-index="sectionIndex">
                          </flpo-boxplot-chart>
                          <flpo-sankey
                            v-if="dataset !== null && structure && structure.chart_type == 'SANKEYD3' && structure.chart_options !== null"
                            ref = "chart"
                            :id="chartId"
                            :dataset="dataset"
                            :options="structure.chart_options"
                            :headers="structure.headers">
                          </flpo-sankey>
                          <flpo-scatter-chart
                            v-if="dataset && dataset[chart.id] !== null && chart.type == 'SCATTERPLOT' && chart.options !== null"
                            :id="chartId[chart.id]"
                            :dataset="dataset[chart.id]"
                            :options="chart.options"
                            :headers="chart.headers"
                            :section-index="sectionIndex">
                          </flpo-scatter-chart>
                          <flpo-treemap-chart
                            v-if="dataset && dataset[chart.id] && chart.type == 'TREEMAP' && chart.options !== null"
                            :id="chartId[chart.id]"
                            :dataset="dataset[chart.id]"
                            :options="chart.options"
                            :headers="chart.headers"
                            :section-index="sectionIndex">
                          </flpo-treemap-chart>
                          <flpo-leaflet-map
                            v-if = "dataset && dataset[chart.id] !== null && chart.type == 'MAP_LEAFLET' && chart.options !== null &&
                                    ((chart.options.type == 'topo' && topology) || (chart.options.type !== 'topo'))"
                            :id="chartId[chart.id]"
                            :selected-place="selectedPlace"
                            :dataset="dataset[chart.id]"
                            :options="chart.options"
                            :headers="chart.headers"
                            :section-index="sectionIndex"
                            :topology="topology"
                            :topology-uf = "topologyUf"
                            :customParams = "customParams">
                          </flpo-leaflet-map>
                          <flpo-topojson-map
                            v-if="dataset && dataset[chart.id] && dataset[chart.id].length >= 0 && chart.type == 'MAP_TOPOJSON' && chart.options !== null && topology"
                            :id="chartId[chart.id]"
                            :selected-place="selectedPlace"
                            :dataset="dataset[chart.id]"
                            :options="chart.options"
                            :headers="chart.headers"
                            :section-index="sectionIndex"
                            :topology="topology"
                            :topology-uf = "topologyUf"
                            :customParams="customParams">
                          </flpo-topojson-map>
                          <flpo-line-chart
                            v-if="dataset && dataset[chart.id] !== null && chart.type == 'LINE' && chart.options !== null"
                            :id="chartId[chart.id]"
                            :dataset="dataset[chart.id]"
                            :options="chart.options"
                            :headers="chart.headers"
                            :section-index="sectionIndex">
                          </flpo-line-chart>
                          <flpo-stacked-line-chart
                            v-if="dataset && dataset[chart.id] !== null && chart.type == 'STACKED' && chart.options !== null"
                            :id="chartId[chart.id]"
                            :dataset="dataset[chart.id]"
                            :options="chart.options"
                            :headers="chart.headers"
                            :section-index="sectionIndex">
                          </flpo-stacked-line-chart>
                        </v-flex>
                        <v-layout v-if="chartFooter && chartFooter[chart.id] && updatedChartFooters == structure.charts.length" pb-0 xs12 justify-center chart-footer>
                          {{ chartFooter[chart.id] }}
                        </v-layout>
                      </v-layout>
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>

      <!-- Modal com o dataset -->
      <v-dialog :v-if="dataset && dialog" v-model="dialog">
        <v-card>
          <v-card-title class="headline-obs">Datasets</v-card-title>
          <v-card-text>
            <v-tabs
              v-if="dialog"
              color="accent"
              slider-color="white"
              class="elevation-1"
              dark>
              <v-tab v-for="chart in structure.charts"
                :key="chartId[chart.id]">
                {{ chart.dataset_title ? chart.dataset_title : chart.title }}
              </v-tab>
              <v-tab-item v-for="chart in structure.charts"
                :key="chartId[chart.id]">
                <div v-if="dataset && dataset[chart.id] && chart.headers" class="content">
                  <v-data-table
                    :headers="removeFormatItems(chart.headers)"
                    :items="dataset[chart.id]"
                    class="elevation-1">
                    <template :headers="chart.headers" slot="items" slot-scope="props">
                      <!-- v-for SEM BIND, pois está restrito ao contexto do template do data-table -->
                      <td v-for="hdr in chart.headers"
                        :key="'key_'+ chart.id + '_hdr_' + hdr.value">
                        <div :class="hdr.item_class != null ? hdr.item_class : ''">
                          {{ props.item[hdr.value] }}
                        </div>
                      </td> 
                    </template>
                  </v-data-table>
                </div>
              </v-tab-item>
            </v-tabs>
          </v-card-text>
          <v-card-actions class="px-3 pb-3">
            <v-spacer></v-spacer>
            <v-btn small class="theme--light" color="accent"
              @click.native="downloadData()">
              <v-icon left>file_download</v-icon> <!-- list -->
              Baixar
            </v-btn>
            <v-btn small class="theme--light" color="accent"
              @click.native="openBugDialog(cmpTitle)">
              <v-icon left>bug_report</v-icon> <!-- list -->
              Relate um problema
            </v-btn>
            <v-btn small class="theme--light" color="accent"
              @click.native="dialog = false">
              <v-icon left>close</v-icon>
              Fechar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-flex>
  </v-layout>
</template>

<script>
  import { Parser } from 'json2csv'

  import FLPOBaseStoryCard from '../../FLPOBaseStoryCard.vue';

  export default {
    extends: FLPOBaseStoryCard,
    data () {
      return {
        dataset: null,
        datasetsComplete: 0,
        metadata: null,
        errorDataset: false,
        dialog: false,
        errorMessage: null,
        cmpTitle: null,
        cmpTitleComment: null,
        invalidInterpol: false,
        chartFooter: {},
        updatedChartFooters: 0,
        chartId: {}
      }
    },
    computed: {
      cmpStyle: function() {
        if (this.$vuetify.breakpoint.smAndDown || this.chartPosition == "bottom") {
          return "height:313px;"
        }
      },
      cmpSources: function() {
        if (this.structure.source) {
          return [this.structure.source];
        } else if (this.datasetsComplete == this.structure.charts.length) {
          var sources = [];
          loopCharts: for (var eachChart in this.structure.charts) {
            var src = {};
            if (this.dataset[this.structure.charts[eachChart].id] && this.structure.charts[eachChart].source && 
                this.structure.charts[eachChart].source.desc_field && this.dataset[this.structure.charts[eachChart].id][0]) {
              src.desc = this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].source.desc_field] != null ?
                this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].source.desc_field] :
                null;
            } else if (this.metadata && this.metadata[this.structure.charts[eachChart].id] && this.metadata[this.structure.charts[eachChart].id].fonte) {
              src.desc = this.metadata[this.structure.charts[eachChart].id].fonte;
            }

            if (this.dataset[this.structure.charts[eachChart].id] && this.structure.charts[eachChart].link && 
                this.structure.charts[eachChart].source.link_field && this.dataset[this.structure.charts[eachChart].id][0]) {
              src.link = this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].source.link_field] != null ?
                          this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].source.link_field] :
                          null;
            } else if (this.metadata && this.metadata[this.structure.charts[eachChart].id] && this.metadata[this.structure.charts[eachChart].id].link) {
              src.link = this.metadata[this.structure.charts[eachChart].id].link;
            }

            // Se a fonte já existe (nome E link iguais), não adiciona de novo
            for (var indxSource in sources) {
              if (sources[indxSource].desc == src.desc &&
                  sources[indxSource].link == src.link) {
                continue loopCharts;
              }
            }
            sources.push(src);
          }
          
          if (sources.length > 0) return sources;
          return [{ desc: "Sem Registros" }];
        } 
      },

      cmpAnalysis: function() {
        if (this.structure.analysis) {
          return [this.structure.analysis];
        } else {
          var colAnalysis = [];
          loopCharts: for (var eachChart in this.structure.charts) {
            let nuAnalysis = {};
            if (this.dataset[this.structure.charts[eachChart].id] && this.structure.charts[eachChart].analysis && 
                this.structure.charts[eachChart].analysis.desc_field && this.dataset[this.structure.charts[eachChart].id][0]) {
              nuAnalysis.desc = this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].analysis.desc_field] != null ?
                this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].analysis.desc_field] :
                null;
            } else if (this.metadata && this.metadata[this.structure.charts[eachChart].id] && this.metadata[this.structure.charts[eachChart].id].analysis) {
              nuAnalysis.desc = this.metadata[this.structure.charts[eachChart].id].analysis;
            }
            
            if (this.dataset[this.structure.charts[eachChart].id] && this.structure.charts[eachChart].analysis && 
                this.structure.charts[eachChart].analysis.link_field && this.dataset[this.structure.charts[eachChart].id][0]) {
              nuAnalysis.link = this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].analysis.link_field] != null ?
                          this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].analysis.link_field] :
                          null;
            } else if (this.metadata && this.metadata[this.structure.charts[eachChart].id] && this.metadata[this.structure.charts[eachChart].id].link_analysis) {
              nuAnalysis.link = this.metadata[this.structure.charts[eachChart].id].link_analysis;
            }

            // Se a fonte já existe (nome E link iguais), não adiciona de novo
            for (var indxAnalysis in colAnalysis) {
              if (colAnalysis[indxAnalysis].desc == nuAnalysis.desc &&
                  colAnalysis[indxAnalysis].link == nuAnalysis.link) {
                continue loopCharts;
              }
            }

            if (nuAnalysis.desc) {
              colAnalysis.push(nuAnalysis);
            }
          }
          
          if (colAnalysis.length > 0) return colAnalysis;
          return [{ desc: "SmartLab" }];
        } 
      }
    },
    watch: {
      datasetsComplete: function(newVal){
        if (newVal == this.structure.charts.length){
          this.dataset = Object.assign({},this.dataset);
        }
      },
    },
    methods: {
      completeStructure() {
        this.setReferenceInStructure();
        this.updatedChartFooters = 0;
        for (var eachChart in this.structure.charts) {
          if (this.structure.charts[eachChart].options.format_function !== null && this.structure.charts[eachChart].options.format_function !== undefined) {
            this.structure.charts[eachChart].options.format = this.customFunctions[this.structure.charts[eachChart].options.format_function];
          }
          if (this.structure.charts[eachChart].options.y_function !== null && this.structure.charts[eachChart].options.y_function !== undefined) {
            this.structure.charts[eachChart].options.y = this.customFunctions[this.structure.charts[eachChart].options.y_function];
          }
          if (this.structure.charts[eachChart].options.tooltip_function !== null && this.structure.charts[eachChart].options.tooltip_function !== undefined && this.structure.charts[eachChart].options.tooltip_function !== "default_tooltip") {
            if(this.customFunctions[this.structure.charts[eachChart].options.tooltip_function]){
              this.structure.charts[eachChart].options.tooltip_function = this.customFunctions[this.structure.charts[eachChart].options.tooltip_function];
            }
          }

          if (this.structure.charts[eachChart]) {
            if (this.structure.charts[eachChart].footnote === null || this.structure.charts[eachChart].footnote === undefined) {
              this.chartFooter[this.structure.charts[eachChart].id] = this.structure.charts[eachChart].title;
              this.updatedChartFooters++;
            } else if (this.structure.charts[eachChart].footnote && typeof(this.structure.charts[eachChart].footnote) == "string") {
              this.chartFooter[this.structure.charts[eachChart].id] = this.structure.charts[eachChart].footnote;
              this.updatedChartFooters++;
            } else {
              this.fillDataStructure(
                this.structure.charts[eachChart].footnote,
                this.customParams,
                this.customFunctions,
                this.setComplexFootnote,
                { 
                  chartId: this.structure.charts[eachChart].id,
                  chartTitle: this.structure.charts[eachChart].title
                }
              );
            }
          }

          this.chartId[this.structure.charts[eachChart].id] = "chart_" + this.structure.charts[eachChart].type.toLowerCase() + "_" + this.structure.charts[eachChart].id;
        }
      },

      setComplexFootnote(base_object_list, rules, structure, addedParams = null, metadata = null) {
        if (typeof base_object_list == 'string') {
          this.chartFooter[addedParams.chartId] = base_object_list;
          this.updatedChartFooters++;
        } else {
          let base_object = {};
          if (Array.isArray(base_object_list) && base_object_list.length == 1) {
            base_object = base_object_list[0];
          } else if (base_object_list !== null && base_object_list !== undefined) {
            base_object = base_object_list;
          }

          let finalLbl = this.$textTransformService.applyInterpol(
            structure,
            this.customParams,
            this.customFunctions,
            base_object,
            this.sendInvalidInterpol
          );

          if (finalLbl) {
            this.chartFooter[addedParams.chartId] = finalLbl;
            this.updatedChartFooters++;
            return;
          }
          this.chartFooter[addedParams.chartId] = addedParams.chartTitle;
          this.updatedChartFooters++;
        }
      },

      openLinkFonte(link) {
        window.open(link, '_blank');
      },
      
      updateDataStructure(payload) {
        this.dataset = {};
        this.datasetsComplete = 0;
        this.metadata = {};

        for (var eachChart of this.structure.charts) {
          let endpoint = "";
          if (payload.rules.filter){
            let apiUrl = ""
            if (eachChart.apiBase){
              apiUrl = this.$textTransformService.applyInterpol(eachChart.apiBase, this.customParams, this.customFunctions);//eachChart.apiBase;
            } else {
              apiUrl = this.$textTransformService.applyInterpol(eachChart.api, this.customParams, this.customFunctions);
            }
            // if (this.customFilters.radioApi){
            //   apiUrl = this.customFilters.radioApi;
            // }
            endpoint = apiUrl + this.getFilters();
            eachChart.options.filterText = this.customFilters.filterText;
          } else {
            endpoint = this.$textTransformService.applyInterpol(payload.rules.api, this.customParams, this.customFunctions, this.customFilters);
          }

          if (payload.type && payload.type === 'slider' || payload.type && payload.type === 'check') {
            this.fillDataStructure(
              eachChart, this.customParams,
              this.customFunctions, this.setDataset,
              { "endpoint": endpoint,
                id: eachChart.id
              }
            );
          } else {

            //substitui a vírgula por '\,'
            // let payloadItem = Object.assign({}, payload.item);
            // for (let indexItem in payloadItem){
            //   let itemValue = payloadItem[indexItem];
            //   if (typeof(itemValue) == "string"){
            //     payloadItem[indexItem] = itemValue.replace(/,/g,"\\,");
            //     payloadItem[indexItem] = itemValue.replace(/-/g,"\\-");
            //   }
            // }

            // Troca a topologia se for um select de uf
            if (payload.target && payload.target.scope && payload.target.range) {
              let range = payload.target.range;
              let scope = payload.target.scope;
              let id = payload.item.id;
              let topoFile = "/static/topojson/" + scope + "/" + range + "/" + id + ".json";
              axios.get(topoFile)
                .then(response => {
                  this.cmpTopology = response.data;
                  this.fillDataStructure(
                    eachChart, this.customParams,
                    this.customFunctions, this.setDataset,
                    { "endpoint": endpoint,
                      id: eachChart.id
                    }
                  );
                });
            } else {
              this.fillDataStructure(
                eachChart, this.customParams,
                this.customFunctions, this.setDataset,
                { "endpoint": endpoint,
                  id: eachChart.id
                }
              );
            }
          }
        }
      },

      // triggerSelect(payload) {
      //   if (payload.type && payload.type === 'switch-group') {
      //     this.customParams.enabled = payload.enabled;
      //     this.$refs.chart.reloadMap();
      //   } else {
      //     //var endpoint = this.$textTransformService.applyInterpol(payload.rules.api, this.customParams, this.customFunctions, payload.item);
      //     this.fetchData(endpoint);
      //   }
      // },

      fetchData(endpoint = null) {
        this.dataset = {};
        this.metadata = {};
        for (var eachChart in this.structure.charts) {
          this.fillDataStructure(
            this.structure.charts[eachChart], this.customParams,
            this.customFunctions, this.setDataset,
            { "endpoint": endpoint,
              id: this.structure.charts[eachChart].id
            }
          );
        }
      },

      downloadData() {
        for (let indexDS in this.dataset) {
          // Dataset to binary data
          const csvBin = new Blob([new Parser({delimiter: ';', withBOM: true}).parse(this.dataset[indexDS])]);
          
          // Generates transient link
          let dynaLink = document.createElement("a");
          dynaLink.setAttribute("download", indexDS + ".csv");
          dynaLink.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(csvBin));
          dynaLink.href = URL.createObjectURL(csvBin);
          dynaLink.style.display = 'none';
          // Activates the transient link
          dynaLink.click();
        }
      },

      downloadChart() {
        var d3plusExport = require('../../../node_modules/d3plus-export/build/d3plus-export.min.js');
        for (var eachChart in this.structure.charts) {

           // chart_treemap_treemap_dirigentes_sexo
          let svg = document.getElementById(this.chartId[this.structure.charts[eachChart].id]).getElementsByTagName('svg')[0];
          d3plusExport.saveElement(svg, { filename: this.chartId[this.structure.charts[eachChart].id] });
        }
      }
    }
  }
</script>

<style>
  .application .dialog {
    width: auto;
    max-width: 90%;
  }
  /* .bg-card{
    background-color: rgba(255,255,255,0.05) !important;
  } */
  .bg-card{
    background-color: transparent !important;
  }
  
</style>

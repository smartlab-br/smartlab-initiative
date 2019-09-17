<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card :id="structure.id" :class= "'mx-4 mb-5 bg-card ' + $colorsService.constructor.getClassIfIsDark(null, sectionIndex, this.$vuetify.theme)">
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
              <v-layout row fill-height wrap pl-3 pt-3 pb-0 pr-0 class="display-1-obs mb-0">
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
                <!-- <v-btn small fill-height class="mb-0" flat :color="$colorsService.constructor.assessZebraTitleColor(this.sectionIndex, this.$vuetify.theme)"
                  @click.native="downloadChart">
                  <span class="hidden-sm-and-down body">Baixar gráfico</span>
                  <v-icon right>file_download</v-icon>
                </v-btn> -->
                <v-flex xs2 text-xs-right pr-4>
                <v-btn small flat :color="$colorsService.constructor.assessZebraTitleColor(this.sectionIndex, this.$vuetify.theme)"
                  @click.native="dialog = true" style="margin: 0px;">
                  <span :class="chartPosition == 'bottom'?'hidden-md-and-down body': 'hidden-sm-and-down body'">Dados</span>
                  <v-icon right>view_list</v-icon> <!-- list -->
                </v-btn>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex pt-0>    
              <v-layout row wrap :style="structure.type != 'headline' && structure.type != 'text' ? 'min-height:500px;' : ''">
                <v-flex xs12 :class="chartPosition != 'bottom' ? 'md3 position-relative': 'position-relative'" column>
                  <v-flex column pt-0 slot="description">
                    <flpo-composite-text
                      v-if="!invalidInterpol"
                      :id = "'story_' + structure.id"
                      :structure="structure.description"
                      :custom-params="customParams"
                      :custom-functions="customFunctions"
                      :custom-filters="customFilters"
                      :reactive-filter="reactiveFilter"
                      v-on:selection="triggerSelect"
                      v-on:default-selection="triggerDefaultSelect"
                      v-on:resendInvalidInterpol="changeTextToInvalidInterpol">
                    </flpo-composite-text>
                    <v-flex v-else
                      class="text-xs-justify body-obs d-inline-block"
                      pa-2
                      v-html="structure.msgNoData.desc">
                    </v-flex>
                  </v-flex>

                  <div v-if="sourceDesc && !sourceLink" class="caption pb-0 pt-3 px-2 pl-3 bottom-30 data-source">Fonte: {{ sourceDesc }}</div>
                  <div v-else-if="sourceDesc && sourceLink" class="caption pb-0 px-2 pt-3 bottom-30 data-source">
                    Fonte: 
                    <a class="accent--text" v-on:click="openLinkFonte">{{ sourceDesc }}</a>
                  </div>

                  <div v-if="analysisDesc && !analysisLink" class="caption pt-0 px-2 pl-3 bottom-30 data-source">Tratamento e análise: {{ analysisDesc }}</div>
                  <div v-else-if="analysisDesc && analysisLink" class="caption px-2 pt-0 bottom-30 data-source">
                    Tratamento e análise: 
                    <a class="accent--text" v-on:click="openLinkAnalysis">{{ analysisDesc }}</a>
                  </div>
                </v-flex>
                <v-flex xs12 :class="chartPosition != 'bottom' ? 'md9': ''" py-3>
                  <v-layout fill-height row wrap>
                    <v-flex xs12 fill-height :style="cmpStyle"
                      :class="{'mx-0 px-3': (this.$vuetify.breakpoint.smAndDown || chartPosition == 'bottom'), 'mx-0 pt-2 pr-4 pb-0': (this.$vuetify.breakpoint.mdAndUp && chartPosition != 'bottom')}">
                      <!-- Definition of all possible charts -->
                      <flpo-bar-chart
                        v-if="dataset !== null && structure && structure.chart_type == 'BAR' && structure.chart_options !== null"
                        ref = "chart"
                        :id="chartId"
                        :dataset="dataset"
                        :options="structure.chart_options"
                        :headers="structure.headers"
                        :section-index="sectionIndex">
                      </flpo-bar-chart>
                      <flpo-boxplot-chart
                        v-if="dataset !== null && structure && structure.chart_type == 'BOXPLOT' && structure.chart_options !== null"
                        ref = "chart"
                        :id="chartId"
                        :dataset="dataset"
                        :options="structure.chart_options">
                      </flpo-boxplot-chart>
                      <flpo-sankey
                        v-if="dataset !== null && metadata && metadata.sankey_data && structure && structure.chart_type == 'SANKEYD3' && structure.chart_options !== null"
                        ref = "chart"
                        :id="chartId"
                        :dataset="dataset"
                        :metadata="metadata"
                        :options="structure.chart_options"
                        :headers="structure.headers">
                      </flpo-sankey>
                      <flpo-scatter-chart
                        v-if="dataset !== null && structure && structure.chart_type == 'SCATTERPLOT' && structure.chart_options !== null"
                        ref = "chart"
                        :id="chartId"
                        :dataset="dataset"
                        :options="structure.chart_options"
                        :headers="structure.headers">
                      </flpo-scatter-chart>
                      <flpo-treemap-chart
                        v-if="dataset !== null && structure && structure.chart_type == 'TREEMAP' && structure.chart_options !== null"
                        ref = "chart"
                        :id="chartId"
                        :dataset="dataset"
                        :options="structure.chart_options"
                        :headers="structure.headers"
                        :section-index="sectionIndex">
                      </flpo-treemap-chart>
                      <flpo-leaflet-map
                        v-if="dataset !== null && structure && structure.chart_type == 'MAP_LEAFLET' && structure.chart_options !== null &&
                              ((structure.chart_options.type == 'topo' && cmpTopology) || (structure.chart_options.type !== 'topo'))"
                        ref = "chart"
                        :id = "chartId"
                        :selected-place="selectedPlace"
                        :topology = "cmpTopology"
                        :topology-uf = "topologyUf"
                        :dataset = "dataset"
                        :options = "structure.chart_options"
                        :customParams = "customParams"
                        :headers = "structure.headers">
                      </flpo-leaflet-map>
                      <flpo-topojson-map
                        v-if="dataset !== null && structure && structure.chart_type == 'MAP_TOPOJSON' && structure.chart_options !== null && cmpTopology"
                        ref = "chart"
                        :topology="cmpTopology"
                        :topology-uf = "topologyUf"
                        :id="chartId"
                        :selected-place="selectedPlace"
                        :dataset="dataset"
                        :options="structure.chart_options"
                        :customParams="customParams"
                        :custom-functions="customFunctions"
                        :headers="structure.headers"
                        :section-index="sectionIndex">
                      </flpo-topojson-map>
                      <div
                        v-if="dataset !== null && structure && structure.chart_type == 'MAP_TOPOJSON_JS' && structure.chart_options !== null && cmpTopology"
                        ref = "chart"
                        :id="chartId">
                      </div>
                      <flpo-line-chart
                        v-if="dataset !== null && structure && structure.chart_type == 'LINE' && structure.chart_options !== null"
                        ref = "chart"
                        :id="chartId"
                        :dataset="dataset"
                        :options="structure.chart_options"
                        :headers="structure.headers"
                        :section-index="sectionIndex">
                      </flpo-line-chart>
                      <flpo-stacked-line-chart
                        v-if="dataset !== null && structure && structure.chart_type == 'STACKED' && structure.chart_options !== null"
                        ref = "chart"
                        :id="chartId"
                        :dataset="dataset"
                        :options="structure.chart_options"
                        :headers="structure.headers"
                        :section-index="sectionIndex">
                      </flpo-stacked-line-chart>
                      <flpo-calendar-chart
                        v-if="dataset !== null && structure && structure.chart_type == 'CALENDAR' && structure.chart_options !== null"
                        ref = "chart"
                        :id="chartId"
                        :dataset="dataset"
                        :options="structure.chart_options"
                        :headers="structure.headers"
                        :section-index="sectionIndex">
                      </flpo-calendar-chart>
                    </v-flex>
                    <v-layout v-if="chartFooter" xs12 pt-0 justify-center chart-footer>
                      {{ chartFooter }}
                    </v-layout>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>

      <!-- Modal com o dataset -->
      <v-dialog :v-if="dataset && structure && structure.headers && dialog" v-model="dialog">
        <v-card>
          <v-card-title class="headline-obs">Dataset</v-card-title>
          <v-card-text>
            <div v-if="dataset && structure.headers && dialog" class="content">
              <v-data-table
                :headers="removeFormatItems(structure.headers)"
                :items="dataset"
                class="elevation-1">
                <template :headers="structure.headers" slot="items" slot-scope="props">
                  <!-- v-for SEM BIND, pois está restrito ao contexto do template do data-table -->
                  <td v-for="hdr in structure.headers">
                    <div v-if="typeof props.item[hdr.value] === 'string' && props.item[hdr.value].includes('</')"
                      :class="hdr.item_class != null ? hdr.item_class : ''"
                      v-html="props.item[hdr.value]">
                    </div>
                    <div v-else
                      :class="hdr.item_class != null ? hdr.item_class : ''">
                      {{ props.item[hdr.value] }}
                    </div>
                  </td> 
                </template>
              </v-data-table>
            </div>
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
  import axios from 'axios'
  import { Parser } from 'json2csv'

  import FLPOBaseStoryCard from '../../FLPOBaseStoryCard.vue';

  import ChartBuilderService from '../../../assets/service/chart/chartBuilderService'

  export default {
    extends: FLPOBaseStoryCard,
    data () {
      return {
        dataset: null,
        metadata: null,
        errorDataset: false,
        dialog: false,
        errorMessage: null,
        cmpTitle: null,
        cmpTitleComment: null,
        invalidInterpol: false,
        footnote: null,
        cmpTopology: null,
        chartFooter: null
      }
    },
    created() {
      this.cmpTopology = this.topology;
    },
    mounted() {
      if (this.structure.chart_type == 'MAP_TOPOJSON_JS') {
        ChartBuilderService.generateChart(this.structure.chart_type, this.chartId, this.dataset, this.chart_options);
      }
    },
    computed: {
      cmpStyle: function() {
        if (this.$vuetify.breakpoint.smAndDown || this.chartPosition == "bottom") {
          return "min-height:313px;"
        }
      },
      chartId: function() {
        return "chart_" + this.structure.chart_type.toLowerCase() + "_" + this.structure.id;
      },
      sourceDesc: function() {
        return this.$indicatorsModel.getSourceDesc(this.structure, this.dataset, this.metadata);
      },
      sourceLink: function() {
        return this.$indicatorsModel.getSourceLink(this.structure, this.dataset, this.metadata);
      },
      analysisDesc: function() {
        return this.$indicatorsModel.getAnalysisDesc(this.structure, this.dataset, this.metadata);
      },
      analysisLink: function() {
        return this.$indicatorsModel.getAnalysisLink(this.structure, this.dataset, this.metadata);
      },
      // chartFooter: function() {
      //   if (this.footnote) return this.footnote;
      //   if (this.structure.footnote === null || this.structure.footnote === undefined) {
      //     return this.cmpTitle;
      //   } else {
      //     return this.structure.footnote;
      //   }
      // }
    },
    methods: {
      completeStructure() {
        this.setReferenceInStructure();
        
        if (this.structure.chart_options.format_function !== null && this.structure.chart_options.format_function !== undefined) {
          this.structure.chart_options.format = this.customFunctions[this.structure.chart_options.format_function];
        }
        if (this.structure.chart_options.y_function !== null && this.structure.chart_options.y_function !== undefined) {
          this.structure.chart_options.y = this.customFunctions[this.structure.chart_options.y_function];
        }
        if (this.structure.chart_options.tooltip_function !== null && this.structure.chart_options.tooltip_function !== undefined && this.structure.chart_options.tooltip_function !== "default_tooltip") {
          if(this.customFunctions[this.structure.chart_options.tooltip_function]){
            this.structure.chart_options.tooltip_function = this.customFunctions[this.structure.chart_options.tooltip_function];
          } 
        }
      },
      openLinkFonte() {
        window.open(this.sourceLink, '_blank');
      },
      openLinkAnalysis() {
        window.open(this.analysisLink, '_blank');
      },

      updateDataStructure(payload) {
        let endpoint = "";

        if (payload.type && (payload.type === 'switch-group' || payload.type === 'radio')) {
          if (this.$refs.chart) this.$refs.chart.adjustVisibleLayers();
        } else if (payload.type && (payload.type === 'slider' || payload.type === 'check')) {
          if (payload.rules.filter){
            let apiUrl = this.$textTransformService.applyInterpol(this.structure.api, this.customParams, this.customFunctions);
            if (this.structure.apiBase){
              apiUrl = this.$textTransformService.applyInterpol(this.structure.apiBase, this.customParams, this.customFunctions);// this.structure.apiBase;
            }
            // if (this.customFilters.radioApi){
            //   apiUrl = this.customFilters.radioApi;
            // }
            endpoint = apiUrl + this.getFilters();
            this.structure.chart_options.filterText = this.customFilters.filterText;
          } else {
            endpoint = this.$textTransformService.applyInterpol(payload.rules.api, this.customParams, this.customFunctions, this.customFilters);
          }
          this.fetchData(endpoint);
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
                this.handleDataStructure(payload);
              });
          } else {
            this.handleDataStructure(payload);
          }
        }
      },

      handleDataStructure(payload) {
        let apiUrl = ""
        let endpoint = ""
        if (this.structure.apiBase){
          apiUrl = this.$textTransformService.applyInterpol(this.structure.apiBase, this.customParams, this.customFunctions); //this.structure.apiBase;
        } else {
          apiUrl = this.$textTransformService.applyInterpol(this.structure.api, this.customParams, this.customFunctions);
        }
        // if (this.customFilters.radioApi){
        //   apiUrl = this.customFilters.radioApi;
        // }
        if (payload.rules.filter){
          endpoint = apiUrl + this.getFilters();
          this.structure.chart_options.filterText = this.customFilters.filterText;
          this.fetchData(endpoint);
        } else if (payload.item){
          endpoint = this.$textTransformService.applyInterpol(payload.rules.api, this.customParams, this.customFunctions, this.customFilters);
          this.fetchData(endpoint);
        } else {
          this.fetchData();
        }
      },


      fetchData(endpoint = null) {
        this.fillDataStructure(
          this.structure, this.customParams,
          this.customFunctions, this.setDataset,
          {
            "endpoint": endpoint,
            "fnCallback": this.assessChartFooter
          }
        );
      },

      assessChartFooter(dataset, rules, structure, addedParams, metadata) {
        if (this.structure && this.structure.footnote) {
          if (typeof(this.structure.footnote) == "string") {
            this.chartFooter = this.structure.footnote;
          } else {
            this.fillDataStructure(
              this.structure.footnote, this.customParams,
              this.customFunctions, this.setComplexAttribute,
              { attribute: 'chartFooter' }
            );
          }
        } else {
          this.chartFooter = this.cmpTitle;
        }
      },

      setFootnote(dataset, rules, structure, addedParams, metadata) {
        if (dataset && dataset.length > 0) {
          this.footnote = dataset[0].ds_indicador_curto;
        } else {
          this.footnote = null;
        }
      },

      downloadData() {
        // Dataset to binary data
        let datasetCsv = new Parser({delimiter: ';',withBOM: true}).parse(this.dataset);
        datasetCsv = datasetCsv.replace(/<span>/g,"").replace(/<\/span>/g,"")
        const csvBin = new Blob([datasetCsv]);
        
        // Generates transient link
        let dynaLink = document.createElement("a");
        dynaLink.setAttribute("download", "dataset.csv");
        dynaLink.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(csvBin));
        dynaLink.href = URL.createObjectURL(csvBin);
        dynaLink.style.display = 'none';

        // Activates the transient link
        document.body.appendChild(dynaLink);
        dynaLink.click();
        document.body.removeChild(dynaLink);
      },

      downloadChart() {
        this.$refs.chart.download();
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

  .card-title {
    color: rgba(51,51,51,1);
    line-height: 1em;
  }

  .chart-footer  {
    font-size: 0.857rem !important;
  }

  .v-btn span {
    font-weight: 300;
    font-size: 1.1rem;
    color: rgba(0,0,0,0.87);
    font-family: titulos-observatorio, Calibri, sans-serif !important;
  }

</style>

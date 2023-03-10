<template>
  <v-layout v-if="renderComponent" row wrap>
    <v-flex xs12>
      <v-card :id="structure.id" :class="'mx-4 mb-5 bg-card ' + $colorsService.getClassIfIsDark(null, sectionIndex, $vuetify.theme)">
        <v-progress-linear
          v-show="loadingStatusDataset != 'SUCCESS'"
          height="5"
          :indeterminate="loadingStatusDataset == 'LOADING'"
          :color="loadingStatusDataset == 'ERROR' ? 'error' : 'info'"
        />
        <v-flex v-show="loadingStatusDataset == 'ERROR'" x12>
          <v-layout align-center row wrap style="min-height:500px;">
            <v-flex xs12 class="red--text darken-1 text-xs-center">
              {{ errorMessage }}
              <v-tooltip bottom>
                <v-btn
                  slot="activator"
                  fab
                  dark
                  small
                  color="red darken-1"
                  @click="reloadComponent"
                >
                  <v-icon
                    dark
                    class="pb-1"
                  >
                    refresh
                  </v-icon>
                </v-btn>
                Recarregar
              </v-tooltip>
            </v-flex>
          </v-layout>
        </v-flex>
        <v-card-text v-if="dataset" v-show="loadingStatusDataset == 'SUCCESS'">
          <v-layout column>
            <v-flex pb-0>
              <v-layout
                row
                fill-height
                wrap
                pl-3
                pt-3
                pb-0
                pr-0
                class="display-1-obs mb-0"
              >
                <v-flex xs10 class="card-title">
                  {{ cmpTitle ? cmpTitle : '' }}
                  <v-tooltip v-if="structure && structure.info" bottom max-width="700px" close-delay="1000">
                    <v-icon
                      slot="activator"
                      color="accent"
                      class="pb-1"
                    >
                      info
                    </v-icon>
                    <FLPOCompositeText
                      :id="'info_' + structure.id"
                      ref="description"
                      :structure="structure.info"
                      :custom-params="customParams"
                      :custom-functions="customFunctions"
                    />
                  </v-tooltip>
                  <div v-if="cmpTitleComment != null" class="title-comment" v-html="cmpTitleComment" />
                </v-flex>
                <v-flex xs2 text-xs-right pr-4>
                  <v-btn
                    small
                    flat
                    :color="$colorsService.assessZebraTitleColor(sectionIndex, $vuetify.theme)"
                    style="margin: 0px;"
                    @click.native="dialog = true"
                  >
                    <span :class="chartPosition == 'bottom'?'hidden-md-and-down body': 'hidden-sm-and-down body'">Dados</span>
                    <v-icon right>
                      view_list
                    </v-icon> <!-- list -->
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex pt-0>
              <v-layout row wrap :style="structure.type != 'headline' && structure.type != 'text' ? 'min-height:500px;' : ''">
                <v-flex xs12 :class="chartPosition != 'bottom' ? 'md3 position-relative pr-4': 'position-relative'" column>
                  <v-flex slot="description" column pt-0>
                    <FLPOCompositeText
                      v-if="!invalidInterpol"
                      :id="'story_' + structure.id"
                      :structure="structure.description"
                      :custom-params="customParams"
                      :custom-functions="customFunctions"
                      :custom-filters="customFilters"
                      :reactive-filter="reactiveFilter"
                      @selection="triggerSelect"
                      @default-selection="triggerDefaultSelect"
                      @resendInvalidInterpol="changeTextToInvalidInterpol"
                      @showSnackbar="snackAlert"
                      @showAuthenticatioDialog="openAuthenticatioDialog"
                    />
                    <v-flex
                      v-else
                      class="text-xs-justify body-obs d-inline-block"
                      pa-2
                      v-html="structure.msgNoData.desc"
                    />
                  </v-flex>

                  <div v-if="sourceDesc && !sourceLink" class="caption pb-0 pt-3 px-2 pl-3 bottom-30 data-source">
                    Fonte: {{ sourceDesc }}
                  </div>
                  <div v-else-if="sourceDesc && sourceLink" class="caption pb-0 px-2 pt-3 pl-3 bottom-30 data-source">
                    Fonte:
                    <a class="accent--text" @click="openLinkFonte">{{ sourceDesc }}</a>
                  </div>

                  <div v-if="analysisDesc && !analysisLink" class="caption pt-0 px-2 pl-3 bottom-30 data-source">
                    Tratamento e análise: {{ analysisDesc }}
                  </div>
                  <div v-else-if="analysisDesc && analysisLink" class="caption px-2 pt-0 bottom-30 data-source">
                    Tratamento e análise:
                    <a class="accent--text" @click="openLinkAnalysis">{{ analysisDesc }}</a>
                  </div>
                </v-flex>
                <v-flex xs12 :class="chartPosition != 'bottom' ? 'md9': ''" py-3>
                  <v-layout fill-height column>
                    <v-flex
                      grow
                      fill-height
                      :style="cmpStyle"
                      :class="{'mx-0 px-3': ($vuetify.breakpoint.smAndDown || chartPosition == 'bottom'), 'mx-0 pt-2 pr-4 pb-0': ($vuetify.breakpoint.mdAndUp && chartPosition != 'bottom')}"
                    >
                      <!-- Definition of all possible charts -->
                      <v-layout
                        v-if="structure && structure.chart_options !== null &&
                          validCharts.includes(structure.chart_type)"
                        :id="chartId"
                        ref="chartRef"
                        fill-height
                        :class="leafletBasedCharts.includes(structure.chart_type) ? 'map_geo' : ''"
                      />
                      <v-layout
                        v-if="structure && structure.component_options !== null && structure.component_type == 'SPARKLINES'"
                        fill-height
                      >
                        <FLPOSparklines
                          :custom-params="customParams"
                          :custom-functions="customFunctions"
                          :custom-filters="customFilters"
                          :refresh-component="refreshComponent"
                          :structure="Object.assign({}, structure.component_options, (({ api, apiBase, headers, api_options }) => ({ api, apiBase, headers, api_options }))(structure))"
                          @dataset-loaded="triggerDatasetUpdate"
                        />
                      </v-layout>
                      <v-layout
                        v-if="structure && structure.component_options !== null && structure.component_type == 'DATATABLE'"
                        fill-height
                      >
                        <FLPODatatable
                          :custom-params="customParams"
                          :custom-functions="customFunctions"
                          :custom-filters="customFilters"
                          :refresh-component="refreshComponent"
                          :structure="Object.assign({}, structure.component_options, (({ api, apiBase, headers, api_options }) => ({ api, apiBase, headers, api_options }))(structure))"
                          @dataset-loaded="triggerDatasetUpdate"
                        />
                      </v-layout>
                      <v-layout
                        v-if="structure && structure.component_options !== null && structure.component_type == 'TEXT'"
                        fill-height
                      >
                        <FLPOCompositeText
                          v-if="!invalidInterpol"
                          :id="'story_component_' + structure.id"
                          :structure="structure.component_options"
                          :custom-params="customParams"
                          :custom-functions="customFunctions"
                          :custom-filters="customFilters"
                          :reactive-filter="reactiveFilter"
                          @selection="triggerSelect"
                          @default-selection="triggerDefaultSelect"
                          @resendInvalidInterpol="changeTextToInvalidInterpol"
                          @showSnackbar="snackAlert"
                          @showAuthenticatioDialog="openAuthenticatioDialog"
                        />
                      </v-layout>
                    </v-flex>
                    <v-flex
                      v-if="chartFooter"
                      shrink
                      xs12
                      pt-0
                      text-xs-center
                      chart-footer
                    >
                      {{ chartFooter }}
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>

      <!-- Modal com o dataset -->
      <v-dialog v-if="dataset && structure && structure.headers && dialog" v-model="dialog">
        <v-card>
          <v-card-title class="headline-obs py-0">
            Dataset
          </v-card-title>
          <v-card-text>
            <div v-if="dataset && structure.headers && dialog" class="content">
              <v-data-table
                :headers="removeFormatItems(structure.headers)"
                :pagination.sync="pagination"
                :items="dataset"
                class="elevation-1"
              >
                <template
                  slot="headers"
                  slot-scope="props"
                >
                  <tr>
                    <th
                      v-for="(header, idxHeader) in props.headers"
                      :key="idxHeader"
                      scope="colgroup"
                      :class="['text-xs-left column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
                      :width="header.width"
                      @click="changeSort(header.value)"
                    >
                      <span class="word-wrap" v-html="header.text" /><v-icon small>
                        arrow_upward
                      </v-icon>
                    </th>
                  </tr>
                </template>
                <template slot="items" slot-scope="props" :headers="structure.headers">
                  <!-- v-for SEM BIND, pois está restrito ao contexto do template do data-table -->
                  <td v-for="(hdr, idxHdr) in structure.headers" :key="idxHdr">
                    <div
                      v-if="typeof props.item[hdr.value] === 'string' && props.item[hdr.value].includes('</')"
                      :class="hdr.item_class != null ? hdr.item_class : ''"
                      v-html="props.item[hdr.value]"
                    />
                    <div
                      v-else
                      :class="hdr.item_class != null ? hdr.item_class : ''"
                    >
                      {{ props.item[hdr.value] }}
                    </div>
                  </td>
                </template>
              </v-data-table>
            </div>
          </v-card-text>
          <v-card-actions class="px-3 pb-3">
            <v-spacer />
            <v-btn
              small
              class="theme--light"
              color="accent"
              @click.native="handleDownloadClick()"
            >
              <v-icon left>
                file_download
              </v-icon> <!-- list -->
              Baixar
            </v-btn>
            <v-btn
              small
              class="theme--light"
              color="accent"
              @click.native="openBugDialog(cmpTitle)"
            >
              <v-icon left>
                bug_report
              </v-icon> <!-- list -->
              Relate um problema
            </v-btn>
            <v-btn
              small
              class="theme--light"
              color="accent"
              @click.native="dialog = false"
            >
              <v-icon left>
                close
              </v-icon>
              Fechar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Modal com as citações -->
      <v-dialog
        v-model="quotationDialog"
        width="500px"
      >
        <v-card>
          <v-card-title class="headline-obs">
            Citações
          </v-card-title>
          <v-card-text>
            <p>As citações da plataforma, em regra, devem respeitar o formato ABNT para cada Observatório, incluindo-se, na consulta, a dimensão específica consultada.</p>
            <p>Exemplos:</p>
            <ul class="mention-examples">
              <li>Observatório do Trabalho Decente – Contexto Econômico e Social. SmartLab, 2021. Fonte original: (...). Disponível em: https://smartlabbr.org/trabalhodecente. Acesso em: 10 de ago. de 2021.</li>
              <li>Observatório de Segurança e Saúde no Trabalho – Covid 19. Fonte original: (...). SmartLab, 2021. Disponível em: https://smartlabbr.org/sst. Acesso em: 10 de ago. de 2021.</li>
              <li>Observatório da Erradicação do Trabalho Escravo e do Tráfico de Pessoas – Sinan/ Tráfico de Pessoas. Fonte original: (...). SmartLab, 2021. Disponível em: https://smartlabbr.org/trabalhoescravo. Acesso em: 10 de ago. de 2021.</li>
              <li>Observatório da Prevenção e da Erradicação do Trabalho Infantil – Áreas Prioritárias e Análise Comparativa. Fonte original: (...). SmartLab, 2021. Disponível em: https://smartlabbr.org/trabalhoinfantil. Acesso em: 10 de ago. de 2021.</li>
              <li>Observatório da Diversidade e Igualdade de Oportunidades no Trabalho – População em Situação de Rua. Fonte original: (...). SmartLab, 2021. Disponível em: https://smartlabbr.org/diversidade. Acesso em: 10 de ago. de 2021.</li>
            </ul>
          </v-card-text>
          <v-layout
            align-center
            justify-center
            row
            fill-height
          >
            <v-btn
              class="theme--light mb-3 mt-0"
              color="accent"
              @click="downloadData()"
            >
              <v-icon
                left
                color="white"
              >
                check
              </v-icon>
              OK
            </v-btn>
          </v-layout>
        </v-card>
      </v-dialog>
    </v-flex>
  </v-layout>
</template>

<script>
import { Parser } from 'json2csv'

import FLPOBaseStoryCard from '../../FLPOBaseStoryCard.vue'

export default {
  extends: FLPOBaseStoryCard,
  data () {
    return {
      dataset: null,
      metadata: null,
      dialog: false,
      errorMessage: null,
      cmpTitle: null,
      cmpTitleComment: null,
      invalidInterpol: false,
      footnote: null,
      chartFooter: null,
      chart: null,
      renderComponent: true,
      refreshComponent: true,
      pagination: {},
      quotationDialog: false
    }
  },
  // watch: {
  //   dataset: function (nuDS, oldDS) {
  //     if (oldDS) this.triggerChartUpdates();
  //   }
  // },
  computed: {
    cmpStyle: function () {
      if (this.$vuetify.breakpoint.smAndDown || this.chartPosition == 'bottom') {
        return 'min-height:313px;'
      }
      return null
    },
    chartId: function () {
      return 'chart_' + this.structure.chart_type.toLowerCase() + '_' + this.structure.id
    },
    sourceDesc: function () {
      return this.$indicatorsModel.getSourceDesc(this.structure, this.dataset, this.metadata)
    },
    sourceLink: function () {
      return this.$indicatorsModel.getSourceLink(this.structure, this.dataset, this.metadata)
    },
    analysisDesc: function () {
      return this.$indicatorsModel.getAnalysisDesc(this.structure, this.dataset, this.metadata)
    },
    analysisLink: function () {
      return this.$indicatorsModel.getAnalysisLink(this.structure, this.dataset, this.metadata)
    }
    // chartFooter: function() {
    //   if (this.footnote) return this.footnote;
    //   if (this.structure.footnote === null || this.structure.footnote === undefined) {
    //     return this.cmpTitle;
    //   } else {
    //     return this.structure.footnote;
    //   }
    // }
  },
  created () {
    // switch-group or radio - initialize customParams.enabled used in leaflet maps(visibleLayers)
    const visibleLayers = {}
    if (this.structure.description) {
      for (const struct of this.structure.description) {
        if (struct.type == 'switch-group') {
          for (const swt of struct.switches) {
            if (swt.default) {
              visibleLayers[swt.id] = true
            } else {
              visibleLayers[swt.id] = false
            }
          }
          break
        }
        if (struct.type == 'radio') {
          for (const idxRadio in struct.items) {
            if (idxRadio == 0) {
              visibleLayers[struct.items[idxRadio].id] = true
            } else {
              visibleLayers[struct.items[idxRadio].id] = false
            }
          }
          this.customFilters[struct.id] = struct.items[0].value
          break
        }
      }
    }
    if (Object.keys(visibleLayers).length > 0) {
      this.customFilters.enabled = visibleLayers
    }
  },
  mounted () {
  },
  methods: {
    changeSort (column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending
      } else {
        this.pagination.sortBy = column
        this.pagination.descending = false
      }
    },
    completeStructure () {
      this.setReferenceInStructure()

      if (this.structure.chart_options && this.structure.chart_options.format_function !== null && this.structure.chart_options.format_function !== undefined) {
        this.structure.chart_options.format = this.customFunctions[this.structure.chart_options.format_function]
      }
      if (this.structure.chart_options && this.structure.chart_options.y_function !== null && this.structure.chart_options.y_function !== undefined) {
        this.structure.chart_options.y = this.customFunctions[this.structure.chart_options.y_function]
      }
      if (this.structure.chart_options && this.structure.chart_options.tooltip_function !== null && this.structure.chart_options.tooltip_function !== undefined && this.structure.chart_options.tooltip_function !== 'default_tooltip') {
        if (this.customFunctions[this.structure.chart_options.tooltip_function]) {
          this.structure.chart_options.tooltip_function = this.customFunctions[this.structure.chart_options.tooltip_function]
        }
      }
    },
    openLinkFonte () {
      window.open(this.sourceLink, '_blank')
    },
    openLinkAnalysis () {
      window.open(this.analysisLink, '_blank')
    },

    updateDataStructure (payload) {
      let endpoint = ''

      if (payload.type && this.chartHandler && !this.chartHandler.topojson && (payload.type === 'switch-group' || payload.type === 'radio')) {
        this.chartHandler.adjustVisibleLayers(payload.enabled)
      }

      if (payload.rules) {
        if (payload.type && (payload.type === 'slider' || payload.type === 'check' || payload.type === 'radio')) {
          if (payload.rules.filter) {
            let apiUrl = this.$textTransformService.applyInterpol(this.structure.api, this.customParams, this.customFunctions)
            if (this.structure.apiBase) {
              apiUrl = this.$textTransformService.applyInterpol(this.structure.apiBase, this.customParams, this.customFunctions)// this.structure.apiBase;
            }
            const filters = this.getFilters()
            if (!Array.isArray(apiUrl)) {
              endpoint = apiUrl + filters
            } else {
              endpoint = []
              for (const item of apiUrl) {
                endpoint.push(item + filters)
              }
            }

            if (this.structure.chart_options) {
              this.structure.chart_options.filterText = this.customFilters.filterText
            }
          } else {
            endpoint = this.$textTransformService.applyInterpol(payload.rules.api, this.customParams, this.customFunctions, this.customFilters)
          }
          this.fetchData(endpoint)
        } else if (payload.type && (payload.type !== 'switch-group')) {
          // substitui a vírgula por '\,'
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
            const range = payload.target.range
            const scope = payload.target.scope
            const id = payload.item.id
            const topoFile = '/topojson/' + scope + '/' + range + '/' + id + '.json'
            this.$axios.$get(topoFile)
              .then((response) => {
                this.selectedTopology = response
                this.handleDataStructure(payload)
              })
          } else {
            this.handleDataStructure(payload)
          }
        }
      }
    },

    handleDataStructure (payload) {
      let apiUrl = ''
      let endpoint = ''
      if (this.structure.apiBase) {
        apiUrl = this.$textTransformService.applyInterpol(this.structure.apiBase, this.customParams, this.customFunctions) // this.structure.apiBase;
      } else {
        apiUrl = this.$textTransformService.applyInterpol(this.structure.api, this.customParams, this.customFunctions)
      }
      // if (this.customFilters.radioApi){
      //   apiUrl = this.customFilters.radioApi;
      // }
      if (payload.rules.filter) {
        const filters = this.getFilters()
        if (!Array.isArray(apiUrl)) {
          endpoint = apiUrl + filters
        } else {
          endpoint = []
          for (const item of apiUrl) {
            endpoint.push(item + filters)
          }
        }
        if (this.structure.chart_options) {
          this.structure.chart_options.filterText = this.customFilters.filterText
        }
        this.fetchData(endpoint)
      } else if (payload.item) {
        endpoint = this.$textTransformService.applyInterpol(payload.rules.api, this.customParams, this.customFunctions, this.customFilters)
        this.fetchData(endpoint)
      } else {
        this.fetchData()
      }
    },

    fetchData (endpoint = null) {
      this.assessChartFooter()
      if (this.structure.chart_type && this.structure.chart_type != 'MIXED_MAP') {
        this.fillDataStructure(
          this.structure, this.customParams,
          this.customFunctions, this.setDataset,
          {
            endpoint,
            msgError: 'Falha ao carregar dados do gráfico ' + this.chartFooter,
            fnCallback: this.triggerChartUpdates
          }
        )
      } else if (this.structure.component_options) {
        this.dataset = true
        this.triggerComponentUpdates()
      } else {
        for (const eachChart of this.structure.chart_options.layers) {
          this.fillDataStructure(
            eachChart,
            this.customParams,
            this.customFunctions,
            this.setDataset,
            {
              id: eachChart.id
            }
          )
        }
      }
    },
    triggerComponentUpdates () {
      this.refreshComponent = !this.refreshComponent
    },
    triggerChartUpdates () {
      const fnSendError = this.sendError
      const chartTitle = this.chartFooter
      if (this.chartHandler) {
        this.chartRegen(
          this.chartHandler,
          this.chartId,
          this.structure.chart_type,
          this.structure,
          this.structure.chart_options,
          this.dataset,
          this.metadata,
          this.sectionIndex
        ).then(
          (chartHandler) => { this.sendChartLoaded(chartHandler) },
          (reject) => {
            console.log(reject)
            fnSendError("Falha ao carregar gráfico '" + chartTitle + "'.")
          }
        )
      } else {
        this.chartGen(
          this.chartId,
          this.structure.chart_type,
          this.structure,
          this.structure.chart_options,
          this.dataset,
          this.metadata,
          this.sectionIndex
        ).then(
          (chartHandler) => { this.sendChartLoaded(chartHandler) },
          (reject) => {
            console.log(reject)
            fnSendError("Falha ao carregar gráfico do card '" + chartTitle + "'.")
          }
        )
      }
    },

    sendChartLoaded (chartHandler) {
      this.chartHandler = chartHandler
      this.$emit('chart-loaded')
    },

    assessChartFooter (dataset, rules, structure, addedParams, metadata) {
      if (this.structure && this.structure.footnote) {
        if (typeof (this.structure.footnote) === 'string') {
          this.chartFooter = this.structure.footnote
        } else {
          this.fillDataStructure(
            this.structure.footnote, this.customParams,
            this.customFunctions, this.setComplexAttribute,
            { attribute: 'chartFooter' }
          )
        }
      } else {
        this.chartFooter = this.cmpTitle
      }
    },

    setFootnote (dataset, rules, structure, addedParams, metadata) {
      if (dataset && dataset.length > 0) {
        this.footnote = dataset[0].ds_indicador_curto
      } else {
        this.footnote = null
      }
    },

    handleDownloadClick () {
      if (!this.$store.state.user) {
        this.openAuthenticatioDialog()
      } else {
        this.quotationDialog = true
      }
    },
    downloadData () {
      this.quotationDialog = false
      const dtDownload = this.getDatatableData(this.dataset, this.structure.headers)
      // Dataset to binary data
      let datasetCsv = new Parser({ delimiter: ';', withBOM: true }).parse(dtDownload)
      datasetCsv = datasetCsv.replace(/<span>/g, '').replace(/<\/span>/g, '')
      const csvBin = new Blob([datasetCsv])

      // Generates transient link
      const dynaLink = document.createElement('a')
      dynaLink.setAttribute('download', 'dataset.csv')
      dynaLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvBin))
      dynaLink.href = URL.createObjectURL(csvBin)
      dynaLink.style.display = 'none'

      // Activates the transient link
      document.body.appendChild(dynaLink)
      dynaLink.click()
      document.body.removeChild(dynaLink)
    },

    triggerDatasetUpdate (dataset) {
      this.dataset = dataset
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

  table thead tr th span.word-wrap {
    word-wrap: break-word;
    white-space: normal;
  }
</style>

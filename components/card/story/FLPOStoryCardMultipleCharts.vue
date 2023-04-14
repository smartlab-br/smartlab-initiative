<template>
  <v-layout row wrap>
    <v-flex xs12>
      <!-- Estilo de CARD -->
      <v-card :id="structure.id" :class="'mx-4 mb-5 bg-card' + $colorsService.getClassIfIsDark(null, sectionIndex, $vuetify.theme)">
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
                align-end
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
            <v-flex>
              <v-layout row wrap style="min-height:500px;">
                <v-flex xs12 :class="chartPosition != 'bottom' ? 'md3 position-relative': 'position-relative'" column>
                  <v-flex slot="description" column pt-0>
                    <FLPOCompositeText
                      v-if="!invalidInterpol"
                      :id="'story_' + structure.id"
                      :structure="structure.description"
                      :custom-params="customParams"
                      :custom-functions="customFunctions"
                      :reactive-filter="reactiveFilter"
                      @selection="triggerSelect"
                      @default-selection="triggerDefaultSelect"
                      @resendInvalidInterpol="changeTextToInvalidInterpol"
                    />
                    <v-flex
                      v-else
                      class="text-xs-justify body-obs d-inline-block"
                      pa-2
                      v-html="structure.msgNoData.desc"
                    />
                  </v-flex>

                  <v-flex class="caption pb-0 pt-3 px-3 bottom-30 data-source">
                    Fonte:
                    <template v-for="(cmpSrc, indxSrc) in cmpSources">
                      <template v-if="cmpSrc.desc && indxSrc > 0">
                        ,&nbsp;
                      </template>
                      <template v-if="cmpSrc.desc && !cmpSrc.link">
                        {{ cmpSrc.desc }}
                      </template>
                      <template v-else-if="cmpSrc.desc && cmpSrc.link">
                        <a :key="indxSrc" class="accent--text" @click="openLinkFonte(cmpSrc.link)">{{ cmpSrc.desc }}</a>
                      </template>
                    </template>
                  </v-flex>

                  <v-flex
                    v-if="cmpSources && cmpSources.length > 0"
                    class="caption pt-0 px-3 bottom-30 data-source"
                  >
                    Tratamento e análise:
                    <template v-for="(cmpAn, indxAnalysis) in cmpAnalysis">
                      <template v-if="cmpAn.desc && indxAnalysis > 0">
                        ,&nbsp;
                      </template>
                      <template v-if="cmpAn.desc && !cmpAn.link">
                        {{ cmpAn.desc }}
                      </template>
                      <template v-else-if="cmpAn.desc && cmpAn.link">
                        <a :key="indxAnalysis" class="accent--text" @click="openLinkFonte(cmpAn.link)">{{ cmpAn.desc }}</a>
                      </template>
                    </template>
                  </v-flex>
                </v-flex>
                <v-flex xs12 :class="chartPosition != 'bottom' ? 'md9': ''" py-2>
                  <v-layout
                    row
                    wrap
                    :class="$vuetify.breakpoint.mdAndUp ? ' fill-height' : ''"
                  >
                    <v-flex
                      v-for="chart in structure.charts"
                      :key="chart.id"
                      :class="(chart.cls ? chart.cls : '') + ($vuetify.breakpoint.mdAndUp ? ' fill-height' : '')"
                    >
                      <v-layout column :style="cmpStyle" :class="{'px-3': $vuetify.breakpoint.smAndDown, 'px-0 mx-0 fill-height': $vuetify.breakpoint.mdAndUp}">
                        <v-flex fill-height :class="{'mx-0': $vuetify.breakpoint.smAndDown, 'mx-3 pb-0': $vuetify.breakpoint.mdAndUp}">
                          <!-- Definition of all possible charts -->
                          <v-layout
                            v-if="validCharts.includes(chart.type) && chart.options !== null"
                            :id="chartId[chart.id]"
                            fill-height
                            :class="leafletBasedCharts.includes(chart.type) ? 'map_geo' : ''"
                          />
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
      <v-dialog v-if="dataset && dialog" v-model="dialog">
        <v-card>
          <v-card-title class="headline-obs">
            Datasets
          </v-card-title>
          <v-card-text>
            <v-tabs
              v-if="dialog"
              color="accent"
              slider-color="white"
              class="elevation-1"
              dark
            >
              <v-tab
                v-for="chart in structure.charts"
                :key="chartId[chart.id]"
              >
                {{ chart.dataset_title ? chart.dataset_title : chart.title }}
              </v-tab>
              <v-tab-item
                v-for="chart in structure.charts"
                :key="chartId[chart.id]"
              >
                <div v-if="dataset && dataset[chart.id] && chart.headers" class="content">
                  <v-data-table
                    :headers="removeFormatItems(chart.headers)"
                    :items="dataset[chart.id]"
                    class="elevation-1"
                  >
                    <template slot="items" slot-scope="props" :headers="chart.headers">
                      <!-- v-for SEM BIND, pois está restrito ao contexto do template do data-table -->
                      <td
                        v-for="hdr in chart.headers"
                        :key="'key_'+ chart.id + '_hdr_' + hdr.value"
                      >
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
      datasetsComplete: 0,
      metadata: null,
      dialog: false,
      errorMessage: null,
      cmpTitle: null,
      cmpTitleComment: null,
      invalidInterpol: false,
      chartFooter: {},
      updatedChartFooters: 0,
      chartId: {},
      quotationDialog: false
    }
  },
  computed: {
    cmpStyle: function () {
      if (this.$vuetify.breakpoint.smAndDown || this.chartPosition == 'bottom') {
        return 'height:313px;'
      }
      return null
    },
    cmpSources: function () {
      if (this.structure.source) {
        return [this.structure.source]
      } else if (this.datasetsComplete == this.structure.charts.length) {
        const sources = []
        loopCharts: for (const eachChart in this.structure.charts) {
          const src = {}
          if (this.dataset[this.structure.charts[eachChart].id] && this.structure.charts[eachChart].source &&
                this.structure.charts[eachChart].source.desc_field && this.dataset[this.structure.charts[eachChart].id][0]) {
            src.desc = this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].source.desc_field] != null
              ? this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].source.desc_field]
              : null
          } else if (this.metadata && this.metadata[this.structure.charts[eachChart].id] && this.metadata[this.structure.charts[eachChart].id].fonte) {
            src.desc = this.metadata[this.structure.charts[eachChart].id].fonte
          }

          if (this.dataset[this.structure.charts[eachChart].id] && this.structure.charts[eachChart].link &&
                this.structure.charts[eachChart].source.link_field && this.dataset[this.structure.charts[eachChart].id][0]) {
            src.link = this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].source.link_field] != null
              ? this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].source.link_field]
              : null
          } else if (this.metadata && this.metadata[this.structure.charts[eachChart].id] && this.metadata[this.structure.charts[eachChart].id].link) {
            src.link = this.metadata[this.structure.charts[eachChart].id].link
          }

          // Se a fonte já existe (nome E link iguais), não adiciona de novo
          for (const indxSource in sources) {
            if (sources[indxSource].desc == src.desc &&
                  sources[indxSource].link == src.link) {
              continue loopCharts
            }
          }
          sources.push(src)
        }

        if (sources.length > 0) { return sources }
        return [{ desc: 'Sem Registros' }]
      }
      return null
    },

    cmpAnalysis: function () {
      if (this.structure.analysis) {
        return [this.structure.analysis]
      } else {
        const colAnalysis = []
        loopCharts: for (const eachChart in this.structure.charts) {
          const nuAnalysis = {}
          if (this.dataset[this.structure.charts[eachChart].id] && this.structure.charts[eachChart].analysis &&
                this.structure.charts[eachChart].analysis.desc_field && this.dataset[this.structure.charts[eachChart].id][0]) {
            nuAnalysis.desc = this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].analysis.desc_field] != null
              ? this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].analysis.desc_field]
              : null
          } else if (this.metadata && this.metadata[this.structure.charts[eachChart].id] && this.metadata[this.structure.charts[eachChart].id].analysis) {
            nuAnalysis.desc = this.metadata[this.structure.charts[eachChart].id].analysis
          }

          if (this.dataset[this.structure.charts[eachChart].id] && this.structure.charts[eachChart].analysis &&
                this.structure.charts[eachChart].analysis.link_field && this.dataset[this.structure.charts[eachChart].id][0]) {
            nuAnalysis.link = this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].analysis.link_field] != null
              ? this.dataset[this.structure.charts[eachChart].id][0][this.structure.charts[eachChart].analysis.link_field]
              : null
          } else if (this.metadata && this.metadata[this.structure.charts[eachChart].id] && this.metadata[this.structure.charts[eachChart].id].link_analysis) {
            nuAnalysis.link = this.metadata[this.structure.charts[eachChart].id].link_analysis
          }

          // Se a fonte já existe (nome E link iguais), não adiciona de novo
          for (const indxAnalysis in colAnalysis) {
            if (colAnalysis[indxAnalysis].desc == nuAnalysis.desc &&
                  colAnalysis[indxAnalysis].link == nuAnalysis.link) {
              continue loopCharts
            }
          }

          if (nuAnalysis.desc) {
            colAnalysis.push(nuAnalysis)
          }
        }

        if (colAnalysis.length > 0) { return colAnalysis }
        return [{ desc: 'SmartLab' }]
      }
    }
  },
  watch: {
    datasetsComplete: function (newVal) {
      if (newVal == this.structure.charts.length) {
        this.dataset = Object.assign({}, this.dataset)
      }
    }
  },
  methods: {
    completeStructure () {
      this.setReferenceInStructure()
      this.updatedChartFooters = 0
      for (const eachChart in this.structure.charts) {
        if (this.structure.charts[eachChart].options.format_function !== null && this.structure.charts[eachChart].options.format_function !== undefined) {
          this.structure.charts[eachChart].options.format = this.customFunctions[this.structure.charts[eachChart].options.format_function]
        }
        if (this.structure.charts[eachChart].options.y_function !== null && this.structure.charts[eachChart].options.y_function !== undefined) {
          this.structure.charts[eachChart].options.y = this.customFunctions[this.structure.charts[eachChart].options.y_function]
        }
        if (this.structure.charts[eachChart].options.tooltip_function !== null && this.structure.charts[eachChart].options.tooltip_function !== undefined && this.structure.charts[eachChart].options.tooltip_function !== 'default_tooltip') {
          if (this.customFunctions[this.structure.charts[eachChart].options.tooltip_function]) {
            this.structure.charts[eachChart].options.tooltip_function = this.customFunctions[this.structure.charts[eachChart].options.tooltip_function]
          }
        }

        if (this.structure.charts[eachChart]) {
          if (this.structure.charts[eachChart].footnote === null || this.structure.charts[eachChart].footnote === undefined) {
            this.chartFooter[this.structure.charts[eachChart].id] = this.structure.charts[eachChart].title
            this.updatedChartFooters++
          } else if (this.structure.charts[eachChart].footnote && typeof (this.structure.charts[eachChart].footnote) === 'string') {
            this.chartFooter[this.structure.charts[eachChart].id] = this.structure.charts[eachChart].footnote
            this.updatedChartFooters++
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
            )
          }
        }

        this.chartId[this.structure.charts[eachChart].id] = 'chart_' + this.structure.charts[eachChart].type.toLowerCase() + '_' + this.structure.charts[eachChart].id
      }
    },

    setComplexFootnote (base_object_list, rules, structure, addedParams = null, metadata = null) {
      if (typeof base_object_list === 'string') {
        this.chartFooter[addedParams.chartId] = base_object_list
        this.updatedChartFooters++
      } else {
        let base_object = {}
        if (Array.isArray(base_object_list) && base_object_list.length == 1) {
          base_object = base_object_list[0]
        } else if (base_object_list !== null && base_object_list !== undefined) {
          base_object = base_object_list
        }

        const finalLbl = this.$textTransformService.applyInterpol(
          structure,
          this.customParams,
          this.customFunctions,
          base_object,
          this.sendInvalidInterpol
        )

        if (finalLbl) {
          this.chartFooter[addedParams.chartId] = finalLbl
          this.updatedChartFooters++
          return
        }
        this.chartFooter[addedParams.chartId] = addedParams.chartTitle
        this.updatedChartFooters++
      }
    },

    openLinkFonte (link) {
      window.open(link, '_blank')
    },

    updateDataStructure (payload) {
      this.dataset = {}
      this.datasetsComplete = 0
      this.metadata = {}

      for (const eachChart of this.structure.charts) {
        let endpoint = ''
        if (payload.rules.filter) {
          let apiUrl = ''
          if (eachChart.apiBase) {
            apiUrl = this.$textTransformService.applyInterpol(eachChart.apiBase, this.customParams, this.customFunctions)// eachChart.apiBase;
          } else {
            apiUrl = this.$textTransformService.applyInterpol(eachChart.api, this.customParams, this.customFunctions)
          }
          // if (this.customFilters.radioApi){
          //   apiUrl = this.customFilters.radioApi;
          // }
          const filters = this.getFilters()
          if (!Array.isArray(apiUrl)) {
            endpoint = this.updateUrlFilters(apiUrl, filters)
          } else {
            endpoint = []
            for (const item of apiUrl) {
              endpoint.push(this.updateUrlFilters(item, filters))
            }
          }
          eachChart.options.filterText = this.customFilters.filterText
        } else {
          endpoint = this.$textTransformService.applyInterpol(payload.rules.api, this.customParams, this.customFunctions, this.customFilters)
        }

        if ((payload.type && payload.type === 'slider') || (payload.type && payload.type === 'check')) {
          this.fillDataStructure(
            eachChart, this.customParams,
            this.customFunctions, this.setDataset,
            {
              endpoint,
              id: eachChart.id
            }
          )
          // } else {
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
        } else if (payload.target && payload.target.scope && payload.target.range) {
          const range = payload.target.range
          const scope = payload.target.scope
          const id = payload.item.id
          const topoFile = '/topojson/' + scope + '/' + range + '/' + id + '.json'
          this.$axios.$get(topoFile)
            .then((response) => {
              this.selectedTopology = response
              this.fillDataStructure(
                eachChart, this.customParams,
                this.customFunctions, this.setDataset,
                {
                  endpoint,
                  id: eachChart.id
                }
              )
            })
        } else {
          this.fillDataStructure(
            eachChart, this.customParams,
            this.customFunctions, this.setDataset,
            {
              endpoint,
              id: eachChart.id
            }
          )
        }
      }
    },

    // triggerSelect(payload) {
    //   if (payload.type && payload.type === 'switch-group') {
    //     this.customFilters.enabled = payload.enabled;
    //     this.$refs.chart.reloadMap();
    //   } else {
    //     //var endpoint = this.$textTransformService.applyInterpol(payload.rules.api, this.customParams, this.customFunctions, payload.item);
    //     this.fetchData(endpoint);
    //   }
    // },

    fetchData (endpoint = null) {
      this.dataset = {}
      this.metadata = {}
      for (const eachChart in this.structure.charts) {
        this.fillDataStructure(
          this.structure.charts[eachChart], this.customParams,
          this.customFunctions, this.setDataset,
          {
            endpoint,
            msgError: 'Falha ao carregar dados do gráfico ' + this.chartFooter[this.structure.charts[eachChart].id],
            id: this.structure.charts[eachChart].id
          }
        )
      }
    },

    triggerChartUpdates (id, dataset, metadata) {
      for (const eachChart of this.structure.charts) {
        if (eachChart && eachChart.id == id) {
          this.chartGen(
            this.chartId[id],
            eachChart.type,
            eachChart,
            eachChart.options,
            dataset,
            metadata,
            this.sectionIndex)
        }
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
      for (const indexDS in this.dataset) {
        const chart = this.structure.charts.filter(el => el.id == indexDS)[0]
        const dtDownload = this.getDatatableData(this.dataset[indexDS], chart.headers)
        // Dataset to binary data
        let datasetCsv = new Parser({ delimiter: ';', withBOM: true }).parse(dtDownload)
        datasetCsv = datasetCsv.replace(/<span>/g, '').replace(/<\/span>/g, '')
        const csvBin = new Blob([datasetCsv])

        // Generates transient link
        const dynaLink = document.createElement('a')
        dynaLink.setAttribute('download', indexDS + '.csv')
        dynaLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvBin))
        dynaLink.href = URL.createObjectURL(csvBin)
        dynaLink.style.display = 'none'
        // Activates the transient link
        document.body.appendChild(dynaLink)
        dynaLink.click()
        document.body.removeChild(dynaLink)
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

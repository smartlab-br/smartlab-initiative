// import TooltipBuildingService from '../../assets/service/singleton/tooltipBuildingService'
import axios from 'axios'
// import ColorsService from '../../assets/service/singleton/colorsService'
// import ChartBuilderService from '@smartlabbr/smartlab-charts'

import Vue from 'vue'

if (!Vue.__snackbarManager__) {
  Vue.__snackbarManager__ = true
  Vue.mixin({
    data () {
      return {
        validCharts: ['MAP_TOPOJSON', 'LINE', 'STACKED', 'BAR', 'TREEMAP', 'SCATTERPLOT', 'BOXPLOT', 'CALENDAR', 'SANKEYD3', 'MAP_BUBBLES', 'MAP_HEAT', 'MAP_CLUSTER', 'MAP_MIGRATION', 'MAP_POLYGON', 'MIXED_MAP'],
        leafletBasedCharts: ['MAP_BUBBLES', 'MAP_HEAT', 'MAP_CLUSTER', 'MAP_MIGRATION', 'MAP_POLYGON', 'MIXED_MAP']
      }
    },
    methods: {
      sendError (err) {
        if (typeof err === 'string') {
          this.$nuxt.$emit('showSnackbar', { color: 'error', text: err })
        } else {
          this.$nuxt.$emit('showSnackbar', { color: 'error', text: 'Houve uma falha. - ' + err.message })
        }
      },

      snackAlert (params) {
        this.$nuxt.$emit('showSnackbar', params)
      },

      openBugDialog (cardTitle) {
        this.$nuxt.$emit('showBugDialog', cardTitle)
      },

      openAuthenticatioDialog () {
        this.$nuxt.$emit('showAuthenticatioDialog')
      },

      chartGen (id, chartType, structure, chartOptions, dataset, metadata, sectionIndex = 0) {
        if (structure && chartOptions && this.validCharts.includes(chartType)) {
          if (chartOptions.from_api) {
            const idObservatorio = this.$parent.idObservatorio
            const dimension = this.$parent.dimensao_ativa_id
            const idLocalidade = this.$parent.idLocalidade
            const scope = this.getEscopo(idLocalidade)
            const url = '/chart?from_viewconf=S&au=' + idLocalidade +
                      '&card_id=' + structure.id + '&observatory=' + idObservatorio +
                      '&dimension=' + dimension + '&scope=' + scope + '&as_image=N'
            return new Promise((resolve, reject) => {
              axios(this.$axiosCallSetupService.getAxiosOptions(url))
                .then((result) => {
                  const container = document.getElementById(id)
                  if (container) {
                    container.innerHTML = result.data
                    container.style.display = 'inline'
                  }
                  resolve()
                }).catch((error) => {
                  this.sendDataStructureError('Falha ao buscar dados do card ' + id)
                  reject()
                })
            })
          } else {
            const additionalOptions = this.buildChartAdditionalOptions(id, chartType, structure, chartOptions, dataset, metadata, sectionIndex)

            return this.$chartBuilderService.generateChart(
              chartType,
              id,
              dataset,
              chartOptions,
              additionalOptions
            )
          }
        }
      },
      chartRegen (chartHandler, id, chartType, structure, chartOptions, dataset, metadata, sectionIndex = 0) {
        if (structure && chartOptions && this.validCharts.includes(chartType)) {
          const additionalOptions = this.buildChartAdditionalOptions(id, chartType, structure, chartOptions, dataset, metadata, sectionIndex)

          return this.$chartBuilderService.regenerateChart(
            chartHandler,
            chartType,
            id,
            dataset,
            chartOptions,
            additionalOptions
          )
        }
      },

      buildChartAdditionalOptions (id, chartType, structure, chartOptions, dataset, metadata, sectionIndex = 0) {
        const fnNavigation = this.$navigationManager.searchAnalysisUnit
        let idAnalysisUnit = this.selectedPlace ? this.selectedPlace : (this.customParams ? this.customParams.idLocalidade : null)
        if (chartOptions.selected_place) {
          if (chartOptions.selected_place.fixed) {
            idAnalysisUnit = chartOptions.selected_place.fixed
          } else if (chartOptions.selected_place.named_prop && this.customParams) {
            idAnalysisUnit = this.customParams[chartOptions.selected_place.named_prop]
          }
        }
        const fnSendError = this.sendError
        const additionalOptions = {
          idAU: idAnalysisUnit,
          theme: this.$vuetify.theme,
          sectionIndex,
          headers: structure.headers,
          route: this.$route,
          context: this,
          fnSendError: this.sendError,
          navigate: {
            fnNav: (router, placeId) => {
              try {
                fnNavigation(router, { id: placeId, to: '/localidade/' + placeId + '?' })
              } catch (err) {
                fnSendError(err)
              }
            },
            openingArgs: [this.$router]
          },
          tooltipFunction: chartOptions.tooltip_function ? this[chartOptions.tooltip_function] : this.$tooltipBuildingService.defaultTooltip,
          colorHandlers: {
            getColorScale: this.$colorsService.getColorScale,
            assessZebraTitleColor: this.$colorsService.assessZebraTitleColor
          },
          cleanLabel: this.$tooltipBuildingService.removeFromLabel,
          axesStrokeClass: this.$colorsService.assessZebraAxesColor(sectionIndex, this.$vuetify.theme)
        }

        additionalOptions.topology = this.selectedTopology

        if (idAnalysisUnit) { additionalOptions.au = this.$analysisUnitModel.findPlaceByID(idAnalysisUnit) }
        if (chartType == 'SANKEYD3') { additionalOptions.metadata = metadata }
        if (chartOptions.colorScale && chartOptions.colorScale.scale_name_value && chartOptions.colorScale.color_array) {
          if (this.customFilters && this.customFilters[chartOptions.colorScale.scale_name_value]) {
            additionalOptions.colorScaleSelectedName = chartOptions.colorScale.color_array[this.customFilters[chartOptions.colorScale.scale_name_value]]
          }
        }
        if (this.leafletBasedCharts.includes(chartType)) {
          if (chartOptions.tooltip_function == null) { additionalOptions.tooltipFunction = this.$tooltipBuildingService.defaultLeafletTooltip }

          if (this.limCoords) {
            additionalOptions.limCoords = this.limCoords
          } else if (this.customParams && this.customParams.limCoords) {
            additionalOptions.limCoords = this.customParams.limCoords
          }

          if (chartType == 'MAP_MIGRATION') {
            additionalOptions.targetTooltipFunction = chartOptions.target.tooltip_function ? this[chartOptions.target.tooltip_function] : this.$tooltipBuildingService.defaultLeafletTooltip
          }
          // Prepares the layers
          let visibleLayers = {}
          if (this.customFilters && this.customFilters.enabled) {
            visibleLayers = this.customFilters.enabled
          } else if (this.customParams.enabled) {
            visibleLayers = this.customParams.enabled
          } else if (chartOptions.indicadores) {
            for (const ident of chartOptions.indicadores) {
              if (chartOptions.show_all || visibleLayers[ident] == null || visibleLayers[ident] == undefined) {
                visibleLayers[ident] = true
              } else {
                visibleLayers[ident] = false
              }
            }
          }

          this.visibleLayers = visibleLayers
          additionalOptions.visibleLayers = visibleLayers
        }
        return additionalOptions
      },

      // TOOLTIPS - Temporarily stored here
      changeCursor (containerId, image) {
        document.getElementById(containerId).style.cursor = image
      },

      obsTETooltip (target, route, tooltip_list = [], removed_text_list = [], options = null) {
        let url = "/te/indicadoresmunicipais/rerank?categorias=cd_mun_ibge,cd_uf,cd_indicador,nm_municipio_uf,nu_competencia_max,nu_competencia_min&valor=vl_indicador&agregacao=sum&filtros=nn-vl_indicador,and,in-cd_indicador-'te_ope'-'te_sit_trab_resgatados'-'te_nat'-'te_res'-'te_inspecoes'-'te_insp_rgt',and,post-eq-cd_mun_ibge-" + target.options.rowData.cd_mun_ibge
        // let url = "/te/indicadoresmunicipais?categorias=cd_mun_ibge,nm_municipio_uf,nu_competencia_max,nu_competencia_min&valor=vl_indicador&agregacao=sum&pivot=cd_indicador&filtros=nn-vl_indicador,and,in-cd_indicador-'te_ope'-'te_rgt'-'te_nat'-'te_res'-'te_inspecoes',and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
        const urlIndicadores = "/indicadoresmunicipais?categorias=cd_indicador,ds_indicador_radical,nu_competencia,nu_competencia_max,nu_competencia_min,vl_indicador&filtros=nn-vl_indicador,and,in-cd_indicador-'06_01_09_01'-'01_16_02_00'-'01_15_01_00'-'01_14_13_00',and,eq-cd_mun_ibge-" + target.options.rowData.cd_mun_ibge + ',and,eq-nu_competencia-nu_competencia_max&ordenacao=ds_indicador_radical'
        let text = ''
        if (options && options.clickable) {
          text += "<p class='text-xs-right ma-0'><a href='" + this.$tooltipBuildingService.getUrlByPlace(target.options.rowData.cd_mun_ibge, route) + "' class='primary--text font-weight-black'>IR PARA</a></p>"
        }
        if (this.customParams.filterUrl && this.customParams.filterUrl != '') {
          url = url + this.customParams.filterUrl
          text += 'Considerados os seguintes filtros: ' + this.customParams.filterText
        }
        if (this.customFilters && this.customFilters.filterUrl && this.customFilters.filterUrl != '') {
          url = url + this.customFilters.filterUrl
          text += 'Considerados os seguintes filtros: ' + this.customFilters.filterText
        }
        this.changeCursor(target.options.customOptions.containerId, 'wait')
        axios.all([axios(this.$axiosCallSetupService.getAxiosOptions(url)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlIndicadores))])
          .then(axios.spread((result, resultIndicadores) => {
            const dt = result.data.dataset
            const dtIndicadores = resultIndicadores.data.dataset
            // let source = result.data).metadata.fonte;
            let ano_min
            let ano_max

            text += "<p class='headline-obs'>Município: <b>" + dt[0].nm_municipio_uf + '</b></p>'
            text += "<table width='100%'>"
            let vl_ope = 0
            let vl_ope_nu_competencia_min
            let vl_ope_nu_competencia_max
            let vl_inspecoes = 0
            let vl_insp_rgt = 0
            let vl_rgt = 0
            let vl_rgt_rank_uf = 0
            let vl_rgt_pct_uf = 0
            let vl_rgt_rank_br = 0
            let vl_rgt_pct_br = 0
            let vl_rgt_nu_competencia_min
            let vl_rgt_nu_competencia_max
            let vl_nat = 0
            let vl_nat_rank_uf = 0
            let vl_nat_pct_uf = 0
            let vl_nat_rank_br = 0
            let vl_nat_pct_br = 0
            let vl_nat_nu_competencia_min
            let vl_nat_nu_competencia_max
            let vl_res = 0
            let vl_res_rank_uf = 0
            let vl_res_pct_uf = 0
            let vl_res_rank_br = 0
            let vl_res_pct_br = 0
            let vl_res_nu_competencia_min
            let vl_res_nu_competencia_max
            for (const item of dt) {
              switch (item.cd_indicador) {
                case 'te_ope': // Operações
                  vl_ope_nu_competencia_max = item.nu_competencia_max ? item.nu_competencia_max : null
                  vl_ope_nu_competencia_min = item.nu_competencia_min ? item.nu_competencia_min : null
                  vl_ope = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0
                  vl_ope_nu_competencia_max = item.nu_competencia_max ? item.nu_competencia_max : null
                  vl_ope_nu_competencia_min = item.nu_competencia_min ? item.nu_competencia_min : null
                  break
                case 'te_inspecoes': // Inspeções
                  vl_inspecoes = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0
                  break
                case 'te_insp_rgt': // Inspeções com resgate
                  vl_insp_rgt = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0
                  break
                case 'te_sit_trab_resgatados': // Resgates
                  vl_rgt_nu_competencia_max = item.nu_competencia_max ? item.nu_competencia_max : null
                  vl_rgt_nu_competencia_min = item.nu_competencia_min ? item.nu_competencia_min : null
                  vl_rgt = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0
                  vl_rgt_rank_uf = item.rerank_rank_uf ? this.$numberTransformService.formatNumber(item.rerank_rank_uf, 'inteiro') : 0
                  vl_rgt_rank_br = item.rerank_rank_br ? this.$numberTransformService.formatNumber(item.rerank_rank_br, 'inteiro') : 0
                  vl_rgt_pct_uf = item.rerank_rank_uf ? this.$numberTransformService.formatNumber(item.rerank_perc_uf, 'porcentagem', 2, 100) : 0
                  vl_rgt_pct_br = item.rerank_rank_br ? this.$numberTransformService.formatNumber(item.rerank_perc_br, 'porcentagem', 3, 100) : 0
                  break
                case 'te_nat': // Resgatados Naturais
                  vl_nat_nu_competencia_max = item.nu_competencia_max ? item.nu_competencia_max : null
                  vl_nat_nu_competencia_min = item.nu_competencia_min ? item.nu_competencia_min : null
                  vl_nat = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0
                  vl_nat_rank_uf = item.rerank_rank_uf ? this.$numberTransformService.formatNumber(item.rerank_rank_uf, 'inteiro') : 0
                  vl_nat_rank_br = item.rerank_rank_br ? this.$numberTransformService.formatNumber(item.rerank_rank_br, 'inteiro') : 0
                  vl_nat_pct_uf = item.rerank_rank_uf ? this.$numberTransformService.formatNumber(item.rerank_perc_uf, 'porcentagem', 2, 100) : 0
                  vl_nat_pct_br = item.rerank_rank_br ? this.$numberTransformService.formatNumber(item.rerank_perc_br, 'porcentagem', 3, 100) : 0
                  break
                case 'te_res': // Resgatados Residentes
                  vl_res_nu_competencia_max = item.nu_competencia_max ? item.nu_competencia_max : null
                  vl_res_nu_competencia_min = item.nu_competencia_min ? item.nu_competencia_min : null
                  vl_res = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0
                  vl_res_rank_uf = item.rerank_rank_uf ? this.$numberTransformService.formatNumber(item.rerank_rank_uf, 'inteiro') : 0
                  vl_res_rank_br = item.rerank_rank_br ? this.$numberTransformService.formatNumber(item.rerank_rank_br, 'inteiro') : 0
                  vl_res_pct_uf = item.rerank_rank_uf ? this.$numberTransformService.formatNumber(item.rerank_perc_uf, 'porcentagem', 2, 100) : 0
                  vl_res_pct_br = item.rerank_rank_br ? this.$numberTransformService.formatNumber(item.rerank_perc_br, 'porcentagem', 3, 100) : 0
                  break
              }
            }

            text += "<tr><td class='font-weight-bold green--text accent-4'>RESGATES</td></tr>"
            text += '<tr><td>' + this.$numberTransformService.formatNumber(vl_rgt, 'inteiro') + ' resgates</td></tr>'
            if (vl_rgt != 0) {
              text += '<tr><td>' + vl_rgt_rank_uf + 'ª posição no Estado com ' + vl_rgt_pct_uf + ' do total</td></tr>'
              text += '<tr><td>' + vl_rgt_rank_br + 'ª posição no Brasil com ' + vl_rgt_pct_br + ' do total</td></tr>'
              ano_min = this.customParams.value_min && this.customParams.value_min >= vl_rgt_nu_competencia_min ? this.customParams.value_min : vl_rgt_nu_competencia_min
              ano_max = this.customParams.value_max && this.customParams.value_max <= vl_rgt_nu_competencia_max ? this.customParams.value_max : vl_rgt_nu_competencia_max
              text += '<tr><td>Fonte: Radar SIT - Painel de Informações e Estatísticas da Inspeção do Trabalho no Brasil</td></tr>'
              text += '<tr><td>Período: ' + ano_min + (ano_min != ano_max ? ' a ' + ano_max : '') + '<br/><br/></td></tr>'
            }
            text += "<tr><td class='font-weight-bold accent-4'>OPERAÇÕES</td></tr>"
            text += '<tr><td>' + this.$numberTransformService.formatNumber(vl_ope, 'inteiro') + ' operações</td></tr>'
            if (vl_ope != 0) {
              text += '<tr><td>' + this.$numberTransformService.formatNumber(vl_rgt / vl_ope, 'real', 2) + ' resgates por operação (envolvendo ' + vl_inspecoes + ' inspeções/fiscalizações)</td></tr>'
            }
            if (vl_inspecoes != 0) {
              text += '<tr><td>' + this.$numberTransformService.formatNumber(vl_insp_rgt / vl_inspecoes, 'real', 2, 100) + '% de inspeções/fiscalizações com resgates</td></tr>'
            }
            if (vl_ope != 0) {
              ano_min = this.customParams.value_min && this.customParams.value_min >= vl_ope_nu_competencia_min ? this.customParams.value_min : vl_ope_nu_competencia_min
              ano_max = this.customParams.value_max && this.customParams.value_max <= vl_ope_nu_competencia_max ? this.customParams.value_max : vl_ope_nu_competencia_max
              text += '<tr><td>Fonte: COETE</td></tr>'
              text += '<tr><td>Período: ' + ano_min + (ano_min != ano_max ? ' a ' + ano_max : '') + '<br/><br/></td></tr>'
            }
            text += "<tr><td class='font-weight-bold red--text'>RESGATADOS NATURAIS</td></tr>"
            text += '<tr><td>' + this.$numberTransformService.formatNumber(vl_nat, 'inteiro') + ' trabalhadores regatados nascidos no município em destaque</td></tr>'
            if (vl_nat != 0) {
              text += '<tr><td>' + vl_nat_rank_uf + 'ª posição no Estado com ' + vl_nat_pct_uf + ' do total</td></tr>'
              text += '<tr><td>' + vl_nat_rank_br + 'ª posição no Brasil com ' + vl_nat_pct_br + ' do total</td></tr>'
              ano_min = this.customParams.value_min && this.customParams.value_min >= vl_nat_nu_competencia_min ? this.customParams.value_min : vl_nat_nu_competencia_min
              ano_max = this.customParams.value_max && this.customParams.value_max <= vl_nat_nu_competencia_max ? this.customParams.value_max : vl_nat_nu_competencia_max
              text += '<tr><td>Fonte: Seguro Desemprego do Trabalhador Resgatado (MTb)</td></tr>'
              text += '<tr><td>Período: ' + ano_min + (ano_min != ano_max ? ' a ' + ano_max : '') + '<br/><br/></td></tr>'
            }
            text += "<tr><td class='font-weight-bold light-blue--text'>RESGATADOS RESIDENTES</td></tr>"
            text += '<tr><td>' + this.$numberTransformService.formatNumber(vl_res, 'inteiro') + ' trabalhadores resgatados que declararam residir, no momento do resgate, no município em destaque</td></tr>'
            if (vl_res != 0) {
              text += '<tr><td>' + vl_res_rank_uf + 'ª posição no Estado com ' + vl_res_pct_uf + ' do total</td></tr>'
              text += '<tr><td>' + vl_res_rank_br + 'ª posição no Brasil com ' + vl_res_pct_br + ' do total</td></tr>'
              ano_min = this.customParams.value_min && this.customParams.value_min >= vl_res_nu_competencia_min ? this.customParams.value_min : vl_res_nu_competencia_min
              ano_max = this.customParams.value_max && this.customParams.value_max <= vl_res_nu_competencia_max ? this.customParams.value_max : vl_res_nu_competencia_max
              text += '<tr><td>Fonte: Seguro Desemprego do Trabalhador Resgatado (MTb)</td></tr>'
              text += '<tr><td>Período: ' + ano_min + (ano_min != ano_max ? ' a ' + ano_max : '') + '<br/><br/></td></tr>'
            }

            text += "<tr><td class='font-weight-bold'><br/>INDICADORES MUNICIPAIS:</td></tr>"
            for (const item of dtIndicadores) {
              switch (item.cd_indicador) {
                case '01_15_01_00': // População
                  text += '<tr><td>' + item.ds_indicador_radical + ': ' + this.$numberTransformService.formatNumber(item.vl_indicador, 'inteiro') + ' (' + item.nu_competencia + ')</td></tr>'
                  break
                case '06_01_09_01': // IDHM
                  text += '<tr><td>' + item.ds_indicador_radical + ': ' + this.$numberTransformService.formatNumber(item.vl_indicador, 'real', 3) + ' (' + item.nu_competencia + ')</td></tr>'
                  break
                case '01_14_13_00': // Proporção Pobreza
                  text += '<tr><td>' + item.ds_indicador_radical + ': ' + this.$numberTransformService.formatNumber(item.vl_indicador, 'porcentagem') + ' (' + item.nu_competencia + ')</td></tr>'
                  break
                case '01_16_02_00': // PIB per capita
                  text += '<tr><td>' + item.ds_indicador_radical + ': ' + this.$numberTransformService.formatNumber(item.vl_indicador, 'monetario', 2) + ' (' + item.nu_competencia + ')</td></tr>'
                  break
              }
            }
            text += '</table>'
            target.bindPopup(text, { maxHeight: 300, minWidth: 400 }).openPopup()
            this.changeCursor(target.options.customOptions.containerId, '')
          }, (error) => {
            this.changeCursor(target.options.customOptions.containerId, '')
            console.error(error.toString())
            this.sendError('Erro ao carregar dataset tooltip')
          }))
      },

      obsTITooltip (target, route, tooltip_list = [], removed_text_list = [], options = null) {
        let urlSinan = "/indicadoresmunicipais?categorias=nm_municipio_uf,ds_agreg_primaria,ds_fonte,nu_competencia_min,nu_competencia_max&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'06_05_02_99',and,eq-cd_mun_ibge-" + target.options.rowData.cd_mun_ibge
        let urlCatMenores = '/sst/cats?categorias=1&valor=nm_municipio_uf,cd_municipio_ibge&agregacao=COUNT&filtros=lt-idade_cat-18,and,ne-idade_cat-0,and,eq-cd_municipio_ibge_dv-' + target.options.rowData.cd_mun_ibge
        let urlProvaBrasil = '/ti/provabrasil?categorias=nm_municipio_uf,nu_ano_prova_brasil-nu_competencia&valor=vl_indicador&agregacao=sum&filtros=nn-vl_indicador,and,ne-vl_indicador-0,and,eq-nu_ano_prova_brasil-2017,and,eq-cd_tr_fora-1,and,eq-cd_municipio_ibge_dv-' + target.options.rowData.cd_mun_ibge
        let urlPotAprendizes = "/indicadoresmunicipais?categorias=nm_municipio_uf,nu_competencia,ds_fonte&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'APRZ_21_001',and,eq-nu_competencia-nu_competencia_max,and,eq-cd_municipio_ibge_dv-" + target.options.rowData.cd_mun_ibge
        let urlTENascimento = "/te/indicadoresmunicipais?categorias=nm_municipio_uf&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'te_nat_idade',and,lt-cast(ds_agreg_primaria as smallint)-18,and,eq-cd_mun_ibge-" + target.options.rowData.cd_mun_ibge
        // let urlTEResidencia = "/te/indicadoresmunicipais?categorias=nm_municipio_uf&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'te_res_idade',and,lt-cast(ds_agreg_primaria as smallint)-18,and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
        let urlMapear = '/ti/mapear?categorias=nm_municipio_uf&agregacao=count&filtros=eq-nu_competencia-nu_competencia_max,and,eq-cd_municipio_ibge_dv-' + target.options.rowData.cd_mun_ibge
        let urlCenso = "/indicadoresmunicipais?categorias=nm_municipio_uf,ds_agreg_primaria,ds_fonte,nu_competencia&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'06_01_01_01',and,eq-nu_competencia-nu_competencia_max,and,eq-cd_mun_ibge-" + target.options.rowData.cd_mun_ibge
        let urlCensoAgro = "/indicadoresmunicipais?categorias=nm_municipio_uf,ds_agreg_primaria,ds_fonte,nu_competencia&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'CAGRO_TICA01',and,eq-nu_competencia-nu_competencia_max,and,eq-cd_mun_ibge-" + target.options.rowData.cd_mun_ibge
        let text = ''
        if (options && options.clickable) {
          text += "<p class='text-xs-right ma-0'><a href='" + this.$tooltipBuildingService.getUrlByPlace(target.options.rowData.cd_mun_ibge, route) + "' class='primary--text font-weight-black'>IR PARA</a></p>"
        }
        if (this.customParams.filterUrl && this.customParams.filterUrl != '') {
          urlSinan = urlSinan + this.customParams.filterUrl
          urlCatMenores = urlCatMenores + this.customParams.filterUrl
          urlProvaBrasil = urlProvaBrasil + this.customParams.filterUrl
          urlPotAprendizes = urlPotAprendizes + this.customParams.filterUrl
          urlTENascimento = urlTENascimento + this.customParams.filterUrl
          // urlTEResidencia = urlTEResidencia + this.customParams.filterUrl;
          urlMapear = urlMapear + this.customParams.filterUrl
          urlCenso = urlCenso + this.customParams.filterUrl
          urlCensoAgro = urlCensoAgro + this.customParams.filterUrl
          text += 'Considerados os seguintes filtros: ' + this.customParams.filterText
        }
        axios.all([
          axios(this.$axiosCallSetupService.getAxiosOptions(urlSinan)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlCatMenores)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlProvaBrasil)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlPotAprendizes)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlTENascimento)),
          //  axios(this.$axiosCallSetupService.getAxiosOptions(urlTEResidencia)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlMapear)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlCenso)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlCensoAgro))])
          .then(axios.spread((
            resultSinan,
            resultCatMenores,
            resultProvaBrasil,
            resultPotAprendizes,
            resultTENascimento,
            // resultTEResidencia,
            resultMapear,
            resultCenso,
            resultCensoAgro) => {
            const dtSinan = resultSinan.data.dataset[0]
            const dtProvaBrasil = resultProvaBrasil.data.dataset[0]
            const dtCatMenores = resultCatMenores.data.dataset[0]
            const dtPotAprendizes = resultPotAprendizes.data.dataset[0]
            const dtTENascimento = resultTENascimento.data.dataset[0]
            // let dtTEResidencia = resultTEResidencia.data.dataset[0];
            const dtMapear = resultMapear.data.dataset[0]
            const dtCenso = resultCenso.data.dataset[0]
            const dtCensoAgro = resultCensoAgro.data.dataset[0]
            const municipio = dtCenso && dtCenso.nm_municipio_uf ? dtCenso.nm_municipio_uf : dtProvaBrasil && dtProvaBrasil.nm_municipio_uf ? dtProvaBrasil.nm_municipio_uf : dtCatMenores && dtCatMenores.nm_municipio_uf ? dtCatMenores.nm_municipio_uf : dtSinan.nm_municipio_uf

            text += "<p class='headline-obs ma-0'>Município: <b>" + municipio + '</b></p>'
            text += "<table width='100%'>"
            text += "<tr><td class='font-weight-bold indigo--text darken-2'>CRIANÇAS E ADOLESCENTES OCUPADOS</td></tr>"
            text += '<tr><td>' + (dtCenso && dtCenso.agr_sum_vl_indicador ? this.$numberTransformService.formatNumber(dtCenso.agr_sum_vl_indicador, 'inteiro') + ' crianças e adolescentes ocupados entre 10 e 17 anos' : 'Nenhum registro de crianças e adolescentes ocupados entre 10 e 17 anos') + '</td></tr>'
            text += '<tr><td>Fonte: IBGE - Censo Demográfico 2010</td></tr>'
            text += "<tr><td class='font-weight-bold purple--text'>TRABALHANDO FORA DE CASA</td></tr>"
            text += '<tr><td>' + (dtProvaBrasil && dtProvaBrasil.agr_sum_vl_indicador ? this.$numberTransformService.formatNumber(dtProvaBrasil.agr_sum_vl_indicador, 'inteiro') + ' declararam trabalhar fora de casa' : 'Nenhum estudante declarou trabalhar fora de casa') + '</td></tr>'
            text += '<tr><td>Fonte: Prova Brasil 2017 (5º e 9º ano)</td></tr>'
            text += "<tr><td class='font-weight-bold cyan--text darken-2'>CRIANÇAS E ADOLESCENTES OCUPADOS EM ESTABELECIMENOS AGROPECUÁRIOS</td></tr>"
            text += '<tr><td>' + (dtCensoAgro && dtCensoAgro.agr_sum_vl_indicador ? this.$numberTransformService.formatNumber(dtCensoAgro.agr_sum_vl_indicador, 'inteiro') + ' menores de 14 anos ocupados em estabelecimentos agropecuários' : 'Nenhum registro de menores de 14 anos ocupados em estabelecimentos agropecuários') + '</td></tr>'
            text += '<tr><td>Fonte: IBGE - Censo Agropecuário 2017</td></tr>'
            text += "<tr><td class='font-weight-bold'>SOFRENDO ACIDENTES</td></tr>"
            text += "<tr><td class='font-weight-bold brown--text'>COM VÍNCULOS DE EMPREGO</td></tr>"
            text += '<tr><td>' + (dtCatMenores && dtCatMenores.agr_count_cd_municipio_ibge ? this.$numberTransformService.formatNumber(dtCatMenores.agr_count_cd_municipio_ibge, 'inteiro') + ' notificações de acidentes de menores de 18 anos' : 'Não houve notificações de acidentes de menores de 18 anos') + '</td></tr>'
            text += '<tr><td>Fonte: CATWEB 2012 a 2020</td></tr>'
            text += "<tr><td class='font-weight-bold orange--text'>SEGUNDO AS NOTIFICAÇÕES SINAN</td></tr>"
            text += '<tr><td>' + (dtSinan && dtSinan.agr_sum_vl_indicador ? this.$numberTransformService.formatNumber(dtSinan.agr_sum_vl_indicador, 'inteiro') + ' notificações de ' + dtSinan.ds_agreg_primaria : 'Não houve notificações de acidente de trabalho grave de Crianças e Adolescentes ( 0 a 17 anos)') + '</td></tr>'
            text += '<tr><td>Fonte: MS - SINAN 2007 a 2020</td></tr>'
            text += "<tr><td class='font-weight-bold'>EXPLORADOS PELO TRABALHO ESCRAVO</td></tr>"
            text += "<tr><td class='font-weight-bold red--text'>LOCAL DE NASCIMENTO</td></tr>"
            text += '<tr><td>' + (dtTENascimento && dtTENascimento.agr_sum_vl_indicador ? this.$numberTransformService.formatNumber(dtTENascimento.agr_sum_vl_indicador, 'inteiro') + ' menores resgatados do trabalho escravo são naturais do município' : 'Não houve menores resgatados do trabalho escravo naturais desse município') + '</td></tr>'
            text += '<tr><td>Fonte: Seguro Desemprego, 2003-2018</td></tr>'
            // text += "<tr><td class='font-weight-bold light-blue--text'>LOCAL DE RESIDÊNCIA</td></tr>";
            // text += "<tr><td>" + (dtTEResidencia && dtTEResidencia.agr_sum_vl_indicador ? this.$numberTransformService.formatNumber(dtTEResidencia.agr_sum_vl_indicador,"inteiro") + " menores resgatados do trabalho escravo são residentes do município" : "Não houve menores resgatados do trabalho escravo residentes nesse município")+ "</td></tr>";
            // text += "<tr><td>Fonte: Seguro Desemprego, 2003-2018</td></tr>";
            text += "<tr><td class='font-weight-bold'>RISCOS DE EXPLORAÇÃO SEXUAL COMERCIAL</td></tr>"
            text += '<tr><td>' + (dtMapear && dtMapear.agr_count ? this.$numberTransformService.formatNumber(dtMapear.agr_count, 'inteiro') + ' pontos de riscos de exploração sexual de menores em rodovias federais do município' : 'Não foram registrados locais de riscos de exploração sexual de menores em rodovias federais do município') + '</td></tr>'
            text += '<tr><td>Fonte: Mapear/PRF</td></tr>'
            text += "<tr><td class='font-weight-bold green--text accent-4'>POTENCIAL DE COTAS DE APRENDIZAGEM</td></tr>"
            text += '<tr><td>' + (dtPotAprendizes && dtPotAprendizes.agr_sum_vl_indicador ? this.$numberTransformService.formatNumber(dtPotAprendizes.agr_sum_vl_indicador, 'inteiro') + ' vagas de cotas de aprendizagem' : 'Nenhuma vaga de cotas de aprendizagem') + '</td></tr>'
            text += '<tr><td>Fonte: ME – IDEB/SIT, janeiro de 2021</td></tr>'
            text += '</table>'
            target.bindPopup(text, { maxHeight: 300, minWidth: 400 }).openPopup()
          }))
      },

      obsSSTTooltip (target, route, tooltip_list = [], removed_text_list = [], options = null) {
        let text = ''
        if (options && options.clickable) {
          text += "<p class='text-xs-right ma-0'><a href='" + this.$tooltipBuildingService.getUrlByPlace(target.options.rowData.cd_municipio_ibge_dv, route) + "' class='primary--text font-weight-black'>IR PARA</a></p>"
        }
        if (target.options.rowData.codigo == 'sinan') {
          const urlIndicadores = "/indicadoresmunicipais?categorias=nm_municipio_uf,ds_agreg_primaria,ds_fonte&valor=vl_indicador,nu_competencia,nu_competencia&agregacao=sum,min,max&ordenacao=ds_agreg_primaria&filtros=nn-vl_indicador,and,ne-vl_indicador-0,and,in-cd_indicador-'06_05_01_00'-'06_05_02_00'-'06_05_03_00'-'06_05_04_00'-'06_05_05_00'-'06_05_06_00'-'06_05_07_00'-'06_05_08_00'-'06_05_09_00'-'06_05_20_00',and,ge-nu_competencia-'2012',and,eq-cd_mun_ibge-" + target.options.rowData.cd_mun_ibge
          //          if (this.customParams.filterUrl && this.customParams.filterUrl != ""){
          //            url = url + this.customParams.filterUrl;
          //            text = "Considerados os seguintes filtros: " + this.customParams.filterText;
          //          }
          axios.all([axios(this.$axiosCallSetupService.getAxiosOptions(urlIndicadores))])
            .then(axios.spread((resultIndicadores) => {
              const dtIndicadores = resultIndicadores.data.dataset

              text += "<p class='headline-obs'>Município: <b>" + dtIndicadores[0].nm_municipio_uf + '</b></p>'
              text += "<table width='100%'>"
              text += "<tr><td colspan='2' class='font-weight-bold'>As Notificações no Sistema de Informação de Agravos de Notificação (Sinan) para a localidade apresentaram os seguintes números:</td></tr>"
              for (const item of dtIndicadores) {
                text += "<tr><td class='font-weight-bold purple--text accent-4'>" + item.ds_agreg_primaria + ":</td><td class='text-xs-right'>" + this.$numberTransformService.formatNumber(item.agr_sum_vl_indicador, 'inteiro') + '</td></tr>'
              }
              text += '<tr><td>Fonte: ' + dtIndicadores[0].ds_fonte + '</td></tr>'
              text += '<tr><td>Período: ' + dtIndicadores[0].agr_min_nu_competencia + ' a ' + dtIndicadores[0].agr_max_nu_competencia + '</td></tr>'
              text += '</table>'
              target.bindPopup(text, { maxHeight: 300, minWidth: 400 }).openPopup()
            }, (error) => {
              console.error(error.toString())
              this.sendError('Erro ao carregar dataset tooltip')
            }))
        } else {
          let urlPeriodo = ''
          let urlTipo = ''
          let urlAtividade = ''
          let urlObs1 = ''
          let urlObs2 = ''
          let txtTipoTitulo = ''
          let txtTipoQtde = ''
          let txtColor = ''
          let filtro = ''
          if (this.customParams.filterUrl && this.customParams.filterUrl != '') {
            filtro = this.customParams.filterUrl
            text += 'Considerados os seguintes filtros: ' + this.customParams.filterText
          }

          if (target.options.rowData.codigo == 'cat') {
            urlPeriodo = '/sst/cats?categorias=1&valor=ano_cat&agregacao=min,max'
            urlTipo = "/sst/cats?categorias=ds_natureza_lesao-nm_tipo&agregacao=COUNT&filtros=ne-ds_natureza_lesao-'',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro + '&ordenacao=-agr_count&limit=5'
            txtTipoTitulo = 'ACIDENTES DE TRABALHO'
            txtTipoQtde = this.$numberTransformService.formatNumber(target.options.rowData.agr_count_cd_municipio_ibge, 'inteiro') + ' registros de acidentes de trabalho'
            txtColor = 'red--text darken-4'
            urlAtividade = "/sst/cats?categorias=ds_cnae_classe_cat-nm_atividade&agregacao=COUNT&filtros=ne-ds_cnae_classe_cat-'',and,ne-ds_cnae_classe_cat-'Indefinido',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro + '&ordenacao=-agr_count&limit=5'
            urlObs1 = '/sst/cats?categorias=cd_municipio_ibge&agregacao=COUNT&filtros=lt-idade_cat-18,and,ne-idade_cat-0,and,eq-cd_municipio_ibge-' + target.options.rowData.cd_mun_ibge + filtro
            urlObs2 = "/sst/cats?categorias=cd_municipio_ibge&agregacao=COUNT&filtros=eq-cd_indica_obito-'S',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro
          } else if (target.options.rowData.codigo == 'mortes') {
            urlPeriodo = '/sst/cats?categorias=1&valor=ano_cat&agregacao=min,max'
            urlTipo = "/sst/cats?categorias=ds_natureza_lesao-nm_tipo&agregacao=COUNT&filtros=ne-ds_natureza_lesao-'',and,eq-cd_indica_obito-'S',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro + '&ordenacao=-agr_count&limit=5'
            txtTipoTitulo = 'ACIDENTES DE TRABALHO COM MORTES'
            txtTipoQtde = this.$numberTransformService.formatNumber(target.options.rowData.agr_count_cd_municipio_ibge, 'inteiro') + ' registros de acidentes de trabalho com mortes.'
            txtColor = 'black--text'
            urlAtividade = "/sst/cats?categorias=ds_cnae_classe_cat-nm_atividade&agregacao=COUNT&filtros=eq-cd_indica_obito-'S',and,ne-ds_cnae_classe_cat-'',and,ne-ds_cnae_classe_cat-'Indefinido',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro + '&ordenacao=-agr_count&limit=5'
            urlObs1 = "/sst/cats?categorias=cd_municipio_ibge&agregacao=COUNT&filtros=eq-cd_indica_obito-'S',and,lt-idade_cat-18,and,ne-idade_cat-0,and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro
            urlObs2 = "/sst/cats?categorias=cd_municipio_ibge&agregacao=COUNT&filtros=eq-cd_indica_obito-'S',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro
          } else {
            urlPeriodo = '/sst/beneficios?categorias=1&valor=ano_beneficio&agregacao=min,max'
            urlTipo = '/sst/beneficios?categorias=cd_agrupamento_categoria_cid-nm_tipo&agregacao=COUNT&filtros=eq-cd_municipio_ibge-' + target.options.rowData.cd_mun_ibge + ',and,eq-cd_especie_beneficio-91' + filtro + '&ordenacao=-agr_count&limit=5'
            txtTipoTitulo = 'AFASTAMENTOS INSS (B91)'
            txtTipoQtde = this.$numberTransformService.formatNumber(target.options.rowData.agr_count_cd_municipio_ibge, 'inteiro') + ' afastamentos acidentários superiores a 15 dias(auxílio-doença por acidente de trabalho).'
            txtColor = 'light-blue--text'
            urlAtividade = "/sst/beneficios?categorias=ds_cnae_classe-nm_atividade&agregacao=COUNT&filtros=ne-ds_cnae_classe-'',and,eq-cd_especie_beneficio-91,and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro + '&ordenacao=-agr_count&limit=5'
            // urlObs1 = "/sst/beneficios?categorias=cd_municipio_ibge&valor=qt_despesa_total&agregacao=SUM&filtros=eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + ",and,eq-cd_especie_beneficio-91"+ filtro ;
            urlObs1 = '/indicadoresmunicipais?categorias=cd_municipio_ibge&valor=vl_indicador&agregacao=SUM&filtros=eq-cd_municipio_ibge-' + target.options.rowData.cd_mun_ibge + ",and,ge-nu_competencia-'2012',and,eq-cd_indicador-'10_11_01_03'"
            urlObs2 = '/sst/beneficios?categorias=cd_municipio_ibge&valor=qt_dias_perdidos&agregacao=SUM&filtros=eq-cd_municipio_ibge-' + target.options.rowData.cd_mun_ibge + ',and,eq-cd_especie_beneficio-91' + filtro
          }
          axios.all([axios(this.$axiosCallSetupService.getAxiosOptions(urlPeriodo)),
            axios(this.$axiosCallSetupService.getAxiosOptions(urlTipo)),
            axios(this.$axiosCallSetupService.getAxiosOptions(urlAtividade)),
            axios(this.$axiosCallSetupService.getAxiosOptions(urlObs1)),
            axios(this.$axiosCallSetupService.getAxiosOptions(urlObs2))])
            .then(axios.spread((resultPeriodo, resultTipo, resultAtividade, resultObs1, resultObs2) => {
              const dtPeriodo = resultPeriodo.data
              const dtTipo = resultTipo.data.dataset
              const dtAtividade = resultAtividade.data.dataset
              const dtObs1 = resultObs1.data.dataset
              const dtObs2 = resultObs2.data.dataset

              text += "<p class='title-obs'>Município: <b>" + target.options.rowData.nm_municipio_uf + '</b></p>'
              text += "<table width='100%'>"
              text += "<tr><td colspan='2' class='font-weight-bold " + txtColor + "'>" + txtTipoTitulo + '</td></tr>'
              text += "<tr><td colspan='2'>" + txtTipoQtde + '</td></tr>'
              text += "<tr><td colspan='2' class='font-weight-bold " + txtColor + "'>Destacaram-se as seguintes ocorrências:</td></tr>"
              for (const item of dtTipo) {
                text += '<tr><td><b>' + item.nm_tipo + "</b> :</td><td class='text-xs-right'>" + this.$numberTransformService.formatNumber(item.agr_count, 'inteiro') + '</td></tr>'
              }
              text += "<tr><td colspan='2' class='font-weight-bold " + txtColor + "'>Atividade Econômicas mais frequentes envolvidas:</td></tr>"
              for (const item of dtAtividade) {
                text += '<tr><td><b>' + item.nm_atividade + "</b> :</td><td class='text-xs-right'>" + this.$numberTransformService.formatNumber(item.agr_count, 'inteiro') + '</td></tr>'
              }
              text += "<tr><td colspan='2'><br/></td></tr>"
              let ano_min = ''
              let ano_max = ''
              if (target.options.rowData.codigo == 'cat' || target.options.rowData.codigo == 'mortes') {
                ano_min = this.customParams.value_min_ano_cat ? this.customParams.value_min_ano_cat : dtPeriodo.dataset[0].agr_min_ano_cat
                ano_max = this.customParams.value_max_ano_cat ? this.customParams.value_max_ano_cat : dtPeriodo.dataset[0].agr_max_ano_cat
                if (dtObs1.length > 0) {
                  text += "<tr><td colspan='2'>" + this.$numberTransformService.formatNumber(dtObs1[0].agr_count, 'inteiro') + ' ocorrências envolveram menores de 18 anos.</td></tr>'
                }
                if (dtObs2.length > 0 && target.options.rowData.codigo == 'cat') {
                  text += "<tr><td colspan='2'>Foram reportadas, ainda, " + this.$numberTransformService.formatNumber(dtObs2[0].agr_count, 'inteiro') + ' mortes.</td></tr>'
                }
                text += "<tr><td colspan='2'><br/>Fonte: " + dtPeriodo.metadata.fonte + '</td></tr>'
                text += "<tr><td colspan='2'>Período: " + ano_min + (ano_min != ano_max ? ' a ' + ano_max : '') + '</td></tr>'
              } else {
                ano_min = this.customParams.value_min_ano_beneficio ? this.customParams.value_min_ano_beneficio : dtPeriodo.dataset[0].agr_min_ano_beneficio
                ano_max = this.customParams.value_max_ano_beneficio ? this.customParams.value_max_ano_beneficio : dtPeriodo.dataset[0].agr_max_ano_beneficio
                if (filtro) {
                  text += "<tr><td colspan='2'>O impacto previdenciário dos afastamentos acidentários no município ocasionou perda de " + this.$numberTransformService.formatNumber(dtObs2[0].agr_sum_qt_dias_perdidos, 'inteiro') + ' dias de trabalho.</td></tr>'
                } else {
                  text += "<tr><td colspan='2'>O impacto previdenciário dos afastamentos acidentários no município foi de " + this.$numberTransformService.formatNumber(dtObs1[0].agr_sum_vl_indicador, 'monetario', 2) + ' , com a perda de ' + this.$numberTransformService.formatNumber(dtObs2[0].agr_sum_qt_dias_perdidos, 'inteiro') + ' dias de trabalho.</td></tr>'
                }
                text += "<tr><td colspan='2'><br/>Fonte: " + dtPeriodo.metadata.fonte + '</td></tr>'
                text += "<tr><td colspan='2'>Período: " + ano_min + (ano_min != ano_max ? ' a ' + ano_max : '') + '</td></tr>'
              }
              text += '</table>'

              target.bindPopup(text, { maxHeight: 300, minWidth: 400 }).openPopup()
            }, (error) => {
              console.error(error.toString())
              this.sendError('Erro ao carregar dataset tooltip')
            }))
        }
      },

      obsTDTooltip (target, route, tooltip_list = [], removed_text_list = [], options = null) {
        let text = ''
        if (options && options.clickable) {
          text += "<p class='text-xs-right ma-0'><a href='" + this.$tooltipBuildingService.getUrlByPlace(target.options.rowData.cd_municipio_ibge_dv, route) + "' class='primary--text font-weight-black'>IR PARA</a></p>"
        }
        const urlSaldoMunicipio = "/thematic/cagedtermometro?categorias=competencia_mov,nm_municipio_uf,saldo_municipio&valor=admitidos,desligados&agregacao=sum,sum&filtros=eq-termometro_grupo-'cbo',and,eq-competencia_mov-" + target.options.rowData.competencia_mov + ',and,eq-cd_municipio_ibge_dv-' + target.options.rowData.cd_municipio_ibge_dv
        const urlCBOAumento = "/thematic/cagedtermometro?categorias=termometro_codigo,termometro_descricao,saldo,admitidos,desligados&ordenacao=-saldo&limit=5&filtros=eq-termometro_grupo-'cbo',and,gt-saldo-0,and,eq-competencia_mov-" + target.options.rowData.competencia_mov + ',and,eq-cd_municipio_ibge_dv-' + target.options.rowData.cd_municipio_ibge_dv
        const urlCBODiminui = "/thematic/cagedtermometro?categorias=termometro_codigo,termometro_descricao,saldo,admitidos,desligados&ordenacao=saldo&limit=5&filtros=eq-termometro_grupo-'cbo',and,lt-saldo-0,and,eq-competencia_mov-" + target.options.rowData.competencia_mov + ',and,eq-cd_municipio_ibge_dv-' + target.options.rowData.cd_municipio_ibge_dv
        const urlCNAEAumento = "/thematic/cagedtermometro?categorias=termometro_codigo,termometro_descricao,saldo,admitidos,desligados&ordenacao=-saldo&limit=5&filtros=eq-termometro_grupo-'cnae_classe',and,nk-termometro_descricao-'CNAE NÃO IDENTIFICADO%25',and,gt-saldo-0,and,eq-competencia_mov-" + target.options.rowData.competencia_mov + ',and,eq-cd_municipio_ibge_dv-' + target.options.rowData.cd_municipio_ibge_dv
        const urlCNAEDiminui = "/thematic/cagedtermometro?categorias=termometro_codigo,termometro_descricao,saldo,admitidos,desligados&ordenacao=saldo&limit=5&filtros=eq-termometro_grupo-'cnae_classe',and,nk-termometro_descricao-'CNAE NÃO IDENTIFICADO%25',and,lt-saldo-0,and,eq-competencia_mov-" + target.options.rowData.competencia_mov + ',and,eq-cd_municipio_ibge_dv-' + target.options.rowData.cd_municipio_ibge_dv
        axios.all([axios(this.$axiosCallSetupService.getAxiosOptions(urlSaldoMunicipio)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlCBOAumento)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlCBODiminui)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlCNAEAumento)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlCNAEDiminui))
        ])
          .then(axios.spread((resultSaldoMunicipio, resultCBOAumento, resultCBODiminui, resultCNAEAumento, resultCNAEDiminui) => {
            const dtSaldoMunicipio = resultSaldoMunicipio.data.dataset[0]
            const dtCBOAumento = resultCBOAumento.data.dataset
            const dtCBODiminui = resultCBODiminui.data.dataset
            const dtCNAEAumento = resultCNAEAumento.data.dataset
            const dtCNAEDiminui = resultCNAEDiminui.data.dataset

            text += "<span class='title-obs'>Município: <b>" + target.options.rowData.nm_municipio_uf + '</b></span>' +
                    "<table width='100%'>" +
                    "<tr><td class='font-weight-bold text-lg-center title-obs' colspan='3'>Empregos Formais (CAGED)</td></tr>" +
                    "<tr><td class='text-lg-center' colspan='3'>Competência da movimentação: " +
                    dtSaldoMunicipio.competencia_mov.toString().substr(5, 1) + 'º Trimestre ' + dtSaldoMunicipio.competencia_mov.toString().substr(0, 4) + '</td></tr>' +
                    "<tr style='border-bottom:1px solid rgba(0,0,0,0.12)'><td width='33%' class='font-weight-bold text-lg-center'>Admitidos</td>" +
                    "<td width='33%' class='font-weight-bold text-lg-center'>Desligados</td>" +
                    "<td width='34%' class='font-weight-bold text-lg-center'>Saldo</td></tr>" +
                    "<tr><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(dtSaldoMunicipio.agr_sum_admitidos, 'inteiro') +
                    "</td><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(dtSaldoMunicipio.agr_sum_desligados, 'inteiro') +
                    "</td><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(dtSaldoMunicipio.saldo_municipio, 'inteiro') + '</td></tr>' +
                    '</table>' +
                    "<table width='100%' style='border-collapse: collapse;'>" +
                    "<tr><td colspan='4' class='title-obs font-weight-bold light-blue--text pt-3 pb-1'>Ocupações com Maior Ganho de Postos Formais</td></tr>" +
                    "<tr style='border-bottom: 1px solid rgba(0,0,0,0.15);'><td width='55%' class='font-weight-bold'>Ocupação</td>" +
                    "<td width='15%' class='font-weight-bold text-lg-center'>Admitidos</td>" +
                    "<td width='15%' class='font-weight-bold text-lg-center'>Desligados</td>" +
                    "<td width='15%' class='font-weight-bold text-lg-center'>Saldo</td></tr>"
            for (const item of dtCBOAumento) {
              text += "<tr style='border-bottom: 1px solid rgba(0,0,0,0.15);'><td>" + item.termometro_descricao +
              "</td><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(item.admitidos, 'inteiro') +
              "</td><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(item.desligados, 'inteiro') +
              "</td><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(item.saldo, 'inteiro') + '</td></tr>'
            }
            text += "<tr><td colspan='4' class='title-obs font-weight-bold red--text pt-3 pb-1'>Ocupações com Maior Perda de Postos Formais</td></tr>" +
                    "<tr style='border-bottom: 1px solid rgba(0,0,0,0.15);'><td class='font-weight-bold'>Ocupação</td>" +
                    "<td class='font-weight-bold text-lg-center'>Admitidos</td>" +
                    "<td class='font-weight-bold text-lg-center'>Desligados</td>" +
                    "<td class='font-weight-bold text-lg-center'>Saldo</td></tr>"
            for (const item of dtCBODiminui) {
              text += "<tr style='border-bottom: 1px solid rgba(0,0,0,0.15);'><td>" + item.termometro_descricao +
              "</td><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(item.admitidos, 'inteiro') +
              "</td><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(item.desligados, 'inteiro') +
              "</td><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(item.saldo, 'inteiro') + '</td></tr>'
            }
            text += "<tr><td colspan='4' class='title-obs font-weight-bold light-blue--text pt-3 pb-1'>Atividades Econômicas com Maior Ganho de Postos Formais</td></tr>" +
                    "<tr style='border-bottom: 1px solid rgba(0,0,0,0.15);'><td class='font-weight-bold'>Atividade</td>" +
                    "<td class='font-weight-bold text-lg-center'>Admitidos</td>" +
                    "<td class='font-weight-bold text-lg-center'>Desligados</td>" +
                    "<td class='font-weight-bold text-lg-center'>Saldo</td></tr>"
            for (const item of dtCNAEAumento) {
              text += "<tr style='border-bottom: 1px solid rgba(0,0,0,0.15);'><td>" + item.termometro_descricao +
              "</td><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(item.admitidos, 'inteiro') +
              "</td><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(item.desligados, 'inteiro') +
              "</td><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(item.saldo, 'inteiro') + '</td></tr>'
            }
            text += "<tr><td colspan='4' class='title-obs font-weight-bold red--text pt-3 pb-1'>Atividades Econômicas com Maior Perda de Postos Formais</td></tr>" +
                    "<tr style='border-bottom: 1px solid rgba(0,0,0,0.15);'><td class='font-weight-bold'>Atividade</td>" +
                    "<td class='font-weight-bold text-lg-center'>Admitidos</td>" +
                    "<td class='font-weight-bold text-lg-center'>Desligados</td>" +
                    "<td class='font-weight-bold text-lg-center'>Saldo</td></tr>"
            for (const item of dtCNAEDiminui) {
              text += "<tr style='border-bottom: 1px solid rgba(0,0,0,0.15);'><td>" + item.termometro_descricao +
              "</td><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(item.admitidos, 'inteiro') +
              "</td><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(item.desligados, 'inteiro') +
              "</td><td class='text-lg-center'>" + this.$numberTransformService.formatNumber(item.saldo, 'inteiro') + '</td></tr>'
            }
            text += '</table>'

            target.bindPopup(text, { maxHeight: 300, minWidth: 400 }).openPopup()
          }, (error) => {
            console.error(error.toString())
            this.sendError('Erro ao carregar dataset tooltip')
          }))
      },

      tooltipLinkGoogleStreetView (target, route, tooltip_list = [], removed_text_list = [], options = null) {
        let text = ''
        const d = target.options.rowData
        text = this.$tooltipBuildingService.defaultTooltip(d, route, tooltip_list, removed_text_list, options)
        text += "<p class='text-xs-right ma-0'><a href='https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + d[options.lat] + ',' + d[options.long] + "' target='_blank' class='primary--text font-weight-black'>Google Street View</a></p>"
        target.unbindPopup()
        target.bindPopup(text).openPopup()
      },

      obsCovidMunicipioTooltip (target, route, tooltip_list = [], removed_text_list = [], options = null) {
        const urlCovidMunicipio = "/thematic/covidcasos?categorias=cd_municipio_ibge_dv,nm_municipio_uf,last_available_date,last_available_deaths,last_available_confirmed,last_available_death_rate&filtros=eq-place_type-'city',and,eq-is_last-TRUE,and,ne-latitude-0,and,ne-longitude-0,and,eq-cd_municipio_ibge_dv-" + target.options.rowData.cd_mun_ibge
        const urlDenunciaMPT = '/thematic/coviddenunciampt?categorias=cd_municipio_ibge_dv,nm_municipio_uf&agregacao=COUNT&filtros=eq-cd_municipio_ibge_dv-' + target.options.rowData.cd_mun_ibge
        const urlAcoesMPT = "/thematic/coviddocumentompt?categorias=descricao_tipodocumento&agregacao=COUNT&filtros=in-tipodocumento-'ACPs'-'TAC'-'RECOMENDAÇÃO',and,eq-cd_municipio_ibge_dv-" + target.options.rowData.cd_mun_ibge
        const urlDestinacaoMPT = '/thematic/coviddestinacaompt?categorias=1&valor=destinacaovalor&agregacao=SUM&filtros=eq-cd_municipio_ibge_dv-' + target.options.rowData.cd_mun_ibge
        axios.all([axios(this.$axiosCallSetupService.getAxiosOptions(urlCovidMunicipio)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlDenunciaMPT)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlAcoesMPT)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlDestinacaoMPT))])
          .then(axios.spread((resultCovidMun, resultDenunciaMPT, resultAcoesMPT, resultDestinacaoMPT) => {
            const dtCovidMun = resultCovidMun.data.dataset[0]
            const dtDenunciaMPT = resultDenunciaMPT.data.dataset[0]
            const dtAcoesMPT = resultAcoesMPT.data.dataset
            const dtDestinacaoMPT = resultDestinacaoMPT.data.dataset[0]
            let total_acoes = 0
            if (dtAcoesMPT) {
              for (const item of dtAcoesMPT) {
                total_acoes += item.agr_count
              }
            }

            let text = ''
            if (options && options.clickable) {
              text += "<p class='text-xs-right ma-0'><a href='" + this.$tooltipBuildingService.getUrlByPlace(target.options.rowData.cd_mun_ibge, route) + "' class='primary--text font-weight-black'>IR PARA</a></p>"
            }
            text += "<p class='headline-obs'>Município: <b>" + dtCovidMun.nm_municipio_uf + '</b></p>'
            text += "<table width='100%'>"
            if (dtDenunciaMPT) {
              text += "<tr><td class='text-xs-center font-weight-bold red--text accent-4' colspan='2'>DENÚNCIAS AO MPT</td></tr>"
              text += "<tr><td nowrap class='font-weight-bold'>Total de Denúncias:</td>"
              text += "<td class='text-xs-right'>" + this.$numberTransformService.formatNumber(dtDenunciaMPT.agr_count, 'inteiro') + '</td></tr>'
            }
            // if(dtAcoesMPT.length > 0){
            //   text += "<tr><td class='text-xs-center font-weight-bold green--text' colspan='2'>ATUAÇÃO MPT</td></tr>";
            //   for (let item of dtAcoesMPT){
            //     text += "<tr><td><b>" + item.descricao_tipodocumento + "</b> :</td><td class='text-xs-right'>" + this.$numberTransformService.formatNumber(item.agr_count,"inteiro") + "</td></tr>";
            //   }
            //   text += "<tr><td><b>TOTAL</b>:</td><td class='text-xs-right'><b>" + this.$numberTransformService.formatNumber(total_acoes,"inteiro") + "</b></td></tr>";
            // }
            // if(dtDestinacaoMPT){
            //   text += "<tr><td class='text-xs-center font-weight-bold light-blue--text accent-4' colspan='2'>RECURSOS DESTINADOS PELO MPT PARA AÇÕES DE COMBATE À COVID-19</td></tr>";
            //   text += "<tr><td nowrap class='font-weight-bold'>Total de recursos:</td>";
            //   text += "<td class='text-xs-right'>"+ this.$numberTransformService.formatNumber(dtDestinacaoMPT.agr_sum_destinacaovalor,"monetario",2) +"</td></tr>";
            // }
            text += "<tr><td class='text-xs-center font-weight-bold brown--text' colspan='2'>COVID-19</td></tr>"
            text += "<tr><td nowrap class='font-weight-bold'>Data coleta:</td>"
            text += '<td>' + this.$numberTransformService.formatNumber(dtCovidMun.last_available_date, 'dataDMY') + '</td></tr>'
            text += "<tr><td nowrap class='font-weight-bold'>Casos confirmados:</td>"
            text += "<td class='text-xs-right'>" + this.$numberTransformService.formatNumber(dtCovidMun.last_available_confirmed, 'inteiro') + '</td></tr>'
            text += "<tr><td nowrap class='font-weight-bold'>Óbitos confirmados:</td>"
            text += "<td class='text-xs-right'>" + this.$numberTransformService.formatNumber(dtCovidMun.last_available_deaths, 'inteiro') + '</td></tr>'
            text += "<tr><td nowrap class='font-weight-bold'>Letalidade:</td>"
            text += "<td class='text-xs-right'>" + this.$numberTransformService.formatNumber(dtCovidMun.last_available_death_rate, 'porcentagem', 1, 100) + '</td></tr>'
            text += '</table>'
            target.unbindPopup()
            target.bindPopup(text, { maxHeight: 400 }).openPopup()
          }, (error) => {
            console.error(error.toString())
            this.sendError('Erro ao carregar dataset tooltip')
          }))
      },

      obsCustomTooltip (target, route, tooltip_list = [], removed_text_list = [], options = null) {
        const params = Object.assign({}, this.customParams, { tooltipLocalidade: target.options.rowData.cd_municipio_ibge_dv })
        this.fillDataStructure(
          options.tooltip_data, params,
          this.customFunctions, this.showDefaultTooltip,
          { target, route, tooltip_list, removed_text_list, options }
        )
      },

      showDefaultTooltip (sourceDS, rules, sourceStructure, addedParams = null, metadata = null) {
        let text = ''
        const d = sourceDS[0]
        text = this.$tooltipBuildingService.defaultTooltip(d, addedParams.route, addedParams.options.tooltip_list ? addedParams.options.tooltip_list : addedParams.tooltip_list, addedParams.removed_text_list, addedParams.options)
        addedParams.target.unbindPopup()
        addedParams.target.bindPopup(text).openPopup()
      },

      obsCovidRegicTooltip (target, route, tooltip_list = [], removed_text_list = [], options = null) {
        this.obsCovidRegicTextTooltip(target)
      },

      obsCovidRegicUTITooltip (target, route, tooltip_list = [], removed_text_list = [], options = null) {
        this.obsCovidRegicTextTooltip(target, true)
      },

      obsCovidRegicTextTooltip (target, showDadosSaude = false) {
        const urlRegic = '/thematic/covidarranjoregic?categorias=nm_municipio_uf_origem,populacao_estimada_mun_origem&ordenacao=nm_municipio_uf_origem&filtros=eq-cd_municipio_ibge_alta_complex-' + target.options.rowData.target_cd_mun
        const urlArranjo = '/thematic/covidarranjoregic?categorias=nm_municipio_uf_alta_complex,qt_leitos_uti_arranjo,qt_leitos_outros_arranjo,qt_respiradores_arranjo,qt_respiradores_uso_arranjo,qt_estabelecimentos_arranjo,dt_coleta_covid_arranjo,qt_casos_covid_arranjo,qt_mortes_covid_arranjo,proporcao_mortes_covid_arranjo,populacao_aglomerados_subnormais_arranjo,proporcao_leitos_uti_10k_arranjo,proporcao_respiradores_uso_10k_arranjo,proporcao_respiradores_uso_arranjo&limit=1&filtros=eq-cd_municipio_ibge_alta_complex-' + target.options.rowData.target_cd_mun
        axios.all([axios(this.$axiosCallSetupService.getAxiosOptions(urlRegic)),
          axios(this.$axiosCallSetupService.getAxiosOptions(urlArranjo))])
          .then(axios.spread((resultRegic, resultArranjo) => {
            const dtRegic = resultRegic.data.dataset
            const dtArranjo = resultArranjo.data.dataset[0]
            let pop = 0
            let municipios = ''
            const total_mun = dtRegic.length
            for (const item of dtRegic) {
              municipios += item.nm_municipio_uf_origem + ', '
              pop += item.populacao_estimada_mun_origem
            }
            municipios = municipios.substring(0, municipios.length - 2)
            let text = ''
            text = "<p class='headline-obs text-xs-center'>Pólo de Alta Complexidade<br/>" +
                  '<b>Arranjo Populacional de ' + dtArranjo.nm_municipio_uf_alta_complex + '</b></p>' +
                  "<table width='100%'>" +
                  "<tr><td class='font-weight-bold'>Municípios Atendidos:</td>" +
                  '<td>' + total_mun + '</td></tr>' +
                  "<tr><td nowrap class='font-weight-bold'>População atendida:</td>" +
                  '<td>' + this.$numberTransformService.formatNumber(pop, 'inteiro') + '</td></tr>' +
                  "<tr><td class='font-weight-bold'>População aglomerados subnormais (2010):</td>" +
                  '<td>' + this.$numberTransformService.formatNumber(dtArranjo.populacao_aglomerados_subnormais_arranjo, 'inteiro') + '</td></tr>'
            if (showDadosSaude) {
              text += "<tr><td class='font-weight-bold'>Qt hospitais:</td>" +
                    '<td>' + this.$numberTransformService.formatNumber(dtArranjo.qt_estabelecimentos_arranjo, 'inteiro') + '</td></tr>' +
                    "<tr><td class='font-weight-bold'>Qt leitos UTI:</td>" +
                    '<td>' + this.$numberTransformService.formatNumber(dtArranjo.qt_leitos_uti_arranjo, 'inteiro') + '</td></tr>' +
                    "<tr><td class='font-weight-bold'>Qt leitos outros:</td>" +
                    '<td>' + this.$numberTransformService.formatNumber(dtArranjo.qt_leitos_outros_arranjo, 'inteiro') + '</td></tr>' +
                    "<tr><td class='font-weight-bold'>Leitos UTI/10.000 hab.:</td>" +
              //         "<td>"+ this.$numberTransformService.formatNumber(dtArranjo.qt_leitos_uti_arranjo/pop*10000,"real") +"</td></tr>" +
                    '<td>' + this.$numberTransformService.formatNumber(dtArranjo.proporcao_leitos_uti_10k_arranjo, 'real') + '</td></tr>' +
                    "<tr><td class='font-weight-bold'>Qt respiradores:</td>" +
                    '<td>' + this.$numberTransformService.formatNumber(dtArranjo.qt_respiradores_arranjo, 'inteiro') + '</td></tr>' +
                    "<tr><td class='font-weight-bold'>Qt respiradores em condições de uso:</td>" +
                    '<td>' + this.$numberTransformService.formatNumber(dtArranjo.qt_respiradores_uso_arranjo, 'inteiro') + '</td></tr>' +
                    "<tr><td class='font-weight-bold'>Respiradores em condições de uso (%):</td>" +
              //         "<td>"+ this.$numberTransformService.formatNumber(dtArranjo.qt_respiradores_uso_arranjo/dtArranjo.qt_respiradores_arranjo,"real",1,100) +"%</td></tr>" +
                    '<td>' + this.$numberTransformService.formatNumber(dtArranjo.proporcao_respiradores_uso_arranjo, 'real', 1, 100) + '%</td></tr>' +
                    "<tr><td class='font-weight-bold'>Respiradores em condições de uso/10.000 hab.:</td>" +
              //         "<td>"+ this.$numberTransformService.formatNumber(dtArranjo.qt_respiradores_uso_arranjo/pop*10000,"real") +"</td></tr>" +
                    '<td>' + this.$numberTransformService.formatNumber(dtArranjo.proporcao_respiradores_uso_10k_arranjo, 'real') + '</td></tr>'
            }
            text += "<tr><td colspan='2'class='font-weight-bold text-xs-center'>COVID-19</td></tr>" +
                  "<tr><td nowrap class='font-weight-bold'>Data coleta:</td>" +
                  '<td>' + this.$numberTransformService.formatNumber(dtArranjo.dt_coleta_covid_arranjo, 'dataDMY') + '</td></tr>' +
                  "<tr><td nowrap class='font-weight-bold'>Casos confirmados:</td>" +
                  '<td>' + this.$numberTransformService.formatNumber(dtArranjo.qt_casos_covid_arranjo, 'inteiro') + '</td></tr>' +
                  "<tr><td nowrap class='font-weight-bold'>Óbitos confirmados:</td>" +
                  '<td>' + this.$numberTransformService.formatNumber(dtArranjo.qt_mortes_covid_arranjo, 'inteiro') + '</td></tr>' +
                  "<tr><td nowrap class='font-weight-bold'>Letalidade:</td>" +
                  '<td>' + this.$numberTransformService.formatNumber(dtArranjo.proporcao_mortes_covid_arranjo, 'porcentagem', 1, 100) + '</td></tr>' +
                  "<tr><td colspan='2'class='font-weight-bold text-xs-center'>Municípios</td></tr>" +
                  "<tr><td colspan='2'>" + municipios + '</td></tr>' +
                  '</table>'
            target.unbindPopup()
            target.bindPopup(text, { maxHeight: 350 }).openPopup()
          }, (error) => {
            console.error(error.toString())
            this.sendError('Erro ao carregar dataset tooltip')
          }))
      }
    }
  })
}

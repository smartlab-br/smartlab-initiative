import ChartBuilderService from '../../assets/service/chart/chartBuilderService'
import TooltipBuildingService from '../../assets/service/singleton/tooltipBuildingService'

const SnackbarManager = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        sendError(message) {
          this.$emit('showSnackbar', { color : 'error', text: message });
        },
        openBugDialog(cardTitle){
          this.$emit('showBugDialog', cardTitle);
        },
        sendChartLoaded(){ this.$emit('chart-loaded'); },
        chartGen(id, chartType, structure, chartOptions, dataset, metadata, sectionIndex = 0) {
          let validCharts = ['MAP_TOPOJSON', 'LINE', 'STACKED', 'BAR', 'TREEMAP', 'SCATTERPLOT', 'BOXPLOT', 'CALENDAR', 'SANKEYD3', 'MAP_BUBBLES', 'MAP_HEAT', 'MAP_CLUSTER'];
          if (structure && chartOptions && validCharts.includes(chartType)) {
            let fnNavigation = this.$navigationManager.constructor.searchAnalysisUnit;
            let fnSendError = this.sendError;    
            let additionalOptions = { 
              idAU: this.selectedPlace ? this.selectedPlace : this.customParams.idLocalidade,
              au: this.$analysisUnitModel.findPlaceByID(this.selectedPlace ? this.selectedPlace : this.customParams.idLocalidade),
              theme: this.$vuetify.theme,
              sectionIndex: sectionIndex,
              topology: this.topology,
              topologyUf: this.topologyUf,
              headers: structure.headers,
              route: this.$route,
              context: this,
              navigate: {
                fnNav: (router, placeId) => {
                  try {         
                      fnNavigation(router, { id: placeId, to: '/localidade/' + placeId + '?' });
                  } catch (err) {
                      fnSendError(err);
                  }
                },
                openingArgs: [this.$router]
              },
              tooltipFunction: chartOptions.tooltipFunction ? this[chartOptions.tooltipFunction] : TooltipBuildingService.defaultTooltip,
            }
            if (chartType == 'SANKEYD3') additionalOptions.metadata = metadata;
            if (['MAP_BUBBLES', 'MAP_HEAT', 'MAP_CLUSTER'].includes(chartType)) {
                if (chartOptions.tooltipFunction == null) additionalOptions.tooltipFunction = TooltipBuildingService.defaultLealfetTooltip; 

                if (this.customParams && this.customParams.limCoords) {
                  additionalOptions.limCoords = this.customParams.limCoords;
                }
                
                // Prepares the layers
                let visibleLayers = {}
                if (chartOptions.indicadores) {
                  for (const ident of chartOptions.indicadores) {
                    if (visibleLayers[ident] == null || visibleLayers[ident] == undefined) visibleLayers[ident] = true;
                  }
                  
                }
                this.visibleLayers = visibleLayers;
                additionalOptions.visibleLayers = visibleLayers;
            }
  
            ChartBuilderService.generateChart(
              chartType, 
              id,
              dataset,
              chartOptions,
              additionalOptions
            ).then(
              (chart) => { this.sendChartLoaded(); },
              (reject) => { this.sendError(reject); }
            );
          }
        },

        // TOOLTIPS - Temporarily stored here
        changeCursor(image){
          this.$refs[this.id].style.cursor = image;
        },
        
        obsTETooltip(target, route, tooltip_list = [], removed_text_list = [], options = null){
          let url = "/te/indicadoresmunicipais/rerank?categorias=cd_mun_ibge,cd_uf,cd_indicador,nm_municipio_uf,nu_competencia_max,nu_competencia_min&valor=vl_indicador&agregacao=sum&filtros=nn-vl_indicador,and,in-cd_indicador-'te_ope'-'te_rgt'-'te_nat'-'te_res'-'te_inspecoes'-'te_insp_rgt',and,post-eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
          // let url = "/te/indicadoresmunicipais?categorias=cd_mun_ibge,nm_municipio_uf,nu_competencia_max,nu_competencia_min&valor=vl_indicador&agregacao=sum&pivot=cd_indicador&filtros=nn-vl_indicador,and,in-cd_indicador-'te_ope'-'te_rgt'-'te_nat'-'te_res'-'te_inspecoes',and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
          let urlIndicadores = "/indicadoresmunicipais?categorias=cd_indicador,ds_indicador_radical,nu_competencia,nu_competencia_max,nu_competencia_min,vl_indicador&filtros=nn-vl_indicador,and,in-cd_indicador-'06_01_09_01'-'01_16_02_00'-'01_15_01_00'-'01_14_13_00',and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge+",and,eq-nu_competencia-nu_competencia_max&ordenacao=ds_indicador_radical";
          let text = "";
          if (options && options.clickable){
            text += "<p class='text-xs-right ma-0'><a href='" + this.$tooltipBuildingService.constructor.getUrlByPlace(target.options.rowData.cd_mun_ibge, route) + "' class='primary--text font-weight-black'>IR PARA</a></p>";
          }
          if (this.customParams.filterUrl && this.customParams.filterUrl != ""){
            url = url + this.customParams.filterUrl;
            text += "Considerados os seguintes filtros: " + this.customParams.filterText;
          }
          this.changeCursor('wait');
          axios.all([axios(this.$axiosCallSetupService.getAxiosOptions(url)),
                     axios(this.$axiosCallSetupService.getAxiosOptions(urlIndicadores))])
            .then(axios.spread((result, resultIndicadores) => {
              let dt = JSON.parse(result.data).dataset;
              let dtIndicadores = JSON.parse(resultIndicadores.data).dataset;
              // let source = JSON.parse(result.data).metadata.fonte;
              let ano_min = this.customParams.value_min ? this.customParams.value_min : dt[0].nu_competencia_min;
              let ano_max = this.customParams.value_max ? this.customParams.value_max : dt[0].nu_competencia_max;
  
              text += "<p class='headline-obs'>Município: <b>" + dt[0].nm_municipio_uf + "</b></p>";
              text += "<table width='100%'>";
              let vl_ope = 0;
              let vl_inspecoes = 0;
              let vl_insp_rgt = 0;
              let vl_rgt = 0;
              let vl_rgt_rank_uf = 0;
              let vl_rgt_pct_uf = 0;
              let vl_rgt_rank_br = 0;
              let vl_rgt_pct_br = 0;
              let vl_nat = 0;
              let vl_nat_rank_uf = 0;
              let vl_nat_pct_uf = 0;
              let vl_nat_rank_br = 0;
              let vl_nat_pct_br = 0;
              let vl_res = 0;
              let vl_res_rank_uf = 0;
              let vl_res_pct_uf = 0;
              let vl_res_rank_br = 0;
              let vl_res_pct_br = 0;
              for (let item of dt){
                switch(item.cd_indicador){
                  case "te_ope": // Operações
                    vl_ope = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0;
                  break;
                  case "te_inspecoes": // Inspeções
                    vl_inspecoes = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0;
                  break;
                  case "te_insp_rgt": // Inspeções com resgate
                    vl_insp_rgt = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0;
                  break;
                  case "te_rgt": // Resgates
                    vl_rgt = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0;
                    vl_rgt_rank_uf = item.rerank_rank_uf ? this.$numberTransformService.constructor.formatNumber(item.rerank_rank_uf,"inteiro") : 0;
                    vl_rgt_rank_br = item.rerank_rank_br ? this.$numberTransformService.constructor.formatNumber(item.rerank_rank_br,"inteiro") : 0;
                    vl_rgt_pct_uf = item.rerank_rank_uf ? this.$numberTransformService.constructor.formatNumber(item.rerank_perc_uf,"porcentagem",2,100) : 0;
                    vl_rgt_pct_br = item.rerank_rank_br ? this.$numberTransformService.constructor.formatNumber(item.rerank_perc_br,"porcentagem",3,100) : 0;
                  break;
                  case "te_nat": // Resgatados Naturais
                    vl_nat = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0;
                    vl_nat_rank_uf = item.rerank_rank_uf ? this.$numberTransformService.constructor.formatNumber(item.rerank_rank_uf,"inteiro") : 0;
                    vl_nat_rank_br = item.rerank_rank_br ? this.$numberTransformService.constructor.formatNumber(item.rerank_rank_br,"inteiro") : 0;
                    vl_nat_pct_uf = item.rerank_rank_uf ? this.$numberTransformService.constructor.formatNumber(item.rerank_perc_uf,"porcentagem",2,100) : 0;
                    vl_nat_pct_br = item.rerank_rank_br ? this.$numberTransformService.constructor.formatNumber(item.rerank_perc_br,"porcentagem",3,100) : 0;
                  break;
                  case "te_res": // Resgatados Residentes
                    vl_res = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0;
                    vl_res_rank_uf = item.rerank_rank_uf ? this.$numberTransformService.constructor.formatNumber(item.rerank_rank_uf,"inteiro") : 0;
                    vl_res_rank_br = item.rerank_rank_br ? this.$numberTransformService.constructor.formatNumber(item.rerank_rank_br,"inteiro") : 0;
                    vl_res_pct_uf = item.rerank_rank_uf ? this.$numberTransformService.constructor.formatNumber(item.rerank_perc_uf,"porcentagem",2,100) : 0;
                    vl_res_pct_br = item.rerank_rank_br ? this.$numberTransformService.constructor.formatNumber(item.rerank_perc_br,"porcentagem",3,100) : 0;
                  break;
                }
              }
  
              text += "<tr><td class='font-weight-bold green--text accent-4'>OPERAÇÕES E RESGATES</td></tr>";
              text += "<tr><td>" + this.$numberTransformService.constructor.formatNumber(vl_ope,"inteiro") + " operações</td></tr>";
              text += "<tr><td>" + this.$numberTransformService.constructor.formatNumber(vl_rgt,"inteiro") + " resgates</td></tr>";
              if (vl_rgt != 0){
                text += "<tr><td>" + vl_rgt_rank_uf + "ª posição no Estado com " + vl_rgt_pct_uf + " do total</td></tr>";
                text += "<tr><td>" + vl_rgt_rank_br + "ª posição no Brasil com " + vl_rgt_pct_br + " do total</td></tr>";
              }
              if (vl_ope != 0){
                text += "<tr><td>" + this.$numberTransformService.constructor.formatNumber(vl_rgt/vl_ope,"real",2) + " resgates por operação (envolvendo " + vl_inspecoes + " inspeções/fiscalizações)</td></tr>";
              }
              if (vl_inspecoes != 0){
                text += "<tr><td>" + this.$numberTransformService.constructor.formatNumber(vl_insp_rgt/vl_inspecoes,"real",2,100) + "% de inspeções/fiscalizações com resgates</td></tr>";
              }
              text += "<tr><td class='font-weight-bold red--text'>RESGATADOS NATURAIS</td></tr>";
              text += "<tr><td>" + this.$numberTransformService.constructor.formatNumber(vl_nat,"inteiro") + " trabalhadores regatados nascidos no município em destaque</td></tr>";
              if (vl_nat != 0){
                text += "<tr><td>" + vl_nat_rank_uf + "ª posição no Estado com " + vl_nat_pct_uf + " do total</td></tr>";
                text += "<tr><td>" + vl_nat_rank_br + "ª posição no Brasil com " + vl_nat_pct_br + " do total</td></tr>";
              }
              text += "<tr><td class='font-weight-bold light-blue--text'>RESGATADOS RESIDENTES</td></tr>";
              text += "<tr><td>" + this.$numberTransformService.constructor.formatNumber(vl_res,"inteiro") + " trabalhadores resgatados que declararam residir, no momento do resgate, no município em destaque</td></tr>";
              if (vl_res != 0){
                text += "<tr><td>" + vl_res_rank_uf + "ª posição no Estado com " + vl_res_pct_uf + " do total</td></tr>";
                text += "<tr><td>" + vl_res_rank_br + "ª posição no Brasil com " + vl_res_pct_br + " do total</td></tr>";
              }
              // text += "<tr><td><br/>Fonte: "+ source +"</td></tr>";
              text += "<tr><td><br/>Fonte: COETE e Seguro Desemprego do Trabalhador Resgatado (MTb)</td></tr>";
              text += "<tr><td>Período: "+ ano_min + (ano_min != ano_max ? " a "+ ano_max : "") +"</td></tr>";
  
              text += "<tr><td class='font-weight-bold'><br/>INDICADORES MUNICIPAIS:</td></tr>";
              for (let item of dtIndicadores){
                switch(item.cd_indicador){
                  case "01_15_01_00": // População
                    text += "<tr><td>" + item.ds_indicador_radical + ": " + this.$numberTransformService.constructor.formatNumber(item.vl_indicador,"inteiro") + " ("+ item.nu_competencia +")</td></tr>";
                    break;
                  case "06_01_09_01": // IDHM
                    text += "<tr><td>" + item.ds_indicador_radical + ": " + this.$numberTransformService.constructor.formatNumber(item.vl_indicador,"real",3) + " ("+ item.nu_competencia +")</td></tr>";
                    break;
                  case "01_14_13_00": // Proporção Pobreza
                    text += "<tr><td>" + item.ds_indicador_radical + ": " + this.$numberTransformService.constructor.formatNumber(item.vl_indicador,"porcentagem") + " ("+ item.nu_competencia +")</td></tr>";
                    break;
                  case "01_16_02_00": // PIB per capita
                    text += "<tr><td>" + item.ds_indicador_radical + ": " + this.$numberTransformService.constructor.formatNumber(item.vl_indicador,"monetario",2) + " ("+ item.nu_competencia +")</td></tr>";
                    break;
                }
              }
              text += "</table>";
              target.bindPopup(text).openPopup();
              this.changeCursor('');
            }, error => {
              this.changeCursor('');
              console.error(error.toString());
              this.sendError("Erro ao carregar dataset tooltip");
            }));
        },
  
        obsTITooltip(target, route, tooltip_list = [], removed_text_list = [], options = null){
          // let urlSinan = "/indicadoresmunicipais?categorias=nm_municipio_uf,ds_agreg_primaria,ds_fonte,nu_competencia_min,nu_competencia_max&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'06_05_13_00',and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
          let urlCatMenores = "/sst/cats?categorias=1&valor=nm_municipio_uf,cd_municipio_ibge&agregacao=COUNT&filtros=lt-idade_cat-18,and,eq-cd_municipio_ibge_dv-"+ target.options.rowData.cd_mun_ibge;
          let urlProvaBrasil = "/ti/provabrasil?categorias=nm_municipio_uf,nu_ano_prova_brasil-nu_competencia&valor=vl_indicador&agregacao=sum&filtros=nn-vl_indicador,and,ne-vl_indicador-0,and,eq-nu_ano_prova_brasil-2017,and,eq-cd_tr_fora-1,and,eq-cd_municipio_ibge_dv-"+ target.options.rowData.cd_mun_ibge;
          let urlPotAprendizes = "/indicadoresmunicipais?categorias=nm_municipio_uf,nu_competencia,ds_fonte&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'12_03_03_00',and,eq-nu_competencia-nu_competencia_max,and,eq-cd_municipio_ibge_dv-"+ target.options.rowData.cd_mun_ibge;
          let urlTENascimento = "/te/indicadoresmunicipais?categorias=nm_municipio_uf&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'te_nat_idade',and,lt-cast(ds_agreg_primaria as smallint)-18,and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
          // let urlTEResidencia = "/te/indicadoresmunicipais?categorias=nm_municipio_uf&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'te_res_idade',and,lt-cast(ds_agreg_primaria as smallint)-18,and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
          let urlMapear = "/ti/mapear?categorias=nm_municipio_uf&agregacao=count&filtros=eq-cd_municipio_ibge_dv-"+ target.options.rowData.cd_mun_ibge;
          let urlCenso = "/indicadoresmunicipais?categorias=nm_municipio_uf,ds_agreg_primaria,ds_fonte,nu_competencia&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'06_01_01_01',and,eq-nu_competencia-nu_competencia_max,and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
          let urlCensoAgro = "/ti/censoagromunicipal?categorias=nm_municipio_uf,qt_ocupados_menores14&filtros=eq-cod_mun-"+ target.options.rowData.cd_mun_ibge;
          let text = "";
          if (options && options.clickable){
            text += "<p class='text-xs-right ma-0'><a href='" + this.$tooltipBuildingService.constructor.getUrlByPlace(target.options.rowData.cd_mun_ibge, route) + "' class='primary--text font-weight-black'>IR PARA</a></p>";
          }
          if (this.customParams.filterUrl && this.customParams.filterUrl != ""){
            // urlSinan = urlSinan + this.customParams.filterUrl;
            urlCatMenores = urlCatMenores + this.customParams.filterUrl;
            urlProvaBrasil = urlProvaBrasil + this.customParams.filterUrl;
            urlPotAprendizes = urlPotAprendizes + this.customParams.filterUrl;
            urlTENascimento = urlTENascimento + this.customParams.filterUrl;
            // urlTEResidencia = urlTEResidencia + this.customParams.filterUrl;
            urlMapear = urlMapear + this.customParams.filterUrl;
            urlCenso = urlCenso + this.customParams.filterUrl;
            urlCensoAgro = urlCensoAgro + this.customParams.filterUrl;
            text += "Considerados os seguintes filtros: " + this.customParams.filterText;
          }
          axios.all([
                    //  axios(this.$axiosCallSetupService.getAxiosOptions(urlSinan)),
                     axios(this.$axiosCallSetupService.getAxiosOptions(urlCatMenores)),
                     axios(this.$axiosCallSetupService.getAxiosOptions(urlProvaBrasil)),
                     axios(this.$axiosCallSetupService.getAxiosOptions(urlPotAprendizes)),
                     axios(this.$axiosCallSetupService.getAxiosOptions(urlTENascimento)),
                    //  axios(this.$axiosCallSetupService.getAxiosOptions(urlTEResidencia)),
                     axios(this.$axiosCallSetupService.getAxiosOptions(urlMapear)),
                     axios(this.$axiosCallSetupService.getAxiosOptions(urlCenso)),
                     axios(this.$axiosCallSetupService.getAxiosOptions(urlCensoAgro))])
            .then(axios.spread((
                                // resultSinan, 
                                resultCatMenores, 
                                resultProvaBrasil, 
                                resultPotAprendizes, 
                                resultTENascimento, 
                                // resultTEResidencia, 
                                resultMapear, 
                                resultCenso, 
                                resultCensoAgro) => {
              // let dtSinan = JSON.parse(resultSinan.data).dataset[0];
              let dtProvaBrasil = JSON.parse(resultProvaBrasil.data).dataset[0];
              let dtCatMenores = JSON.parse(resultCatMenores.data).dataset[0];
              let dtPotAprendizes = JSON.parse(resultPotAprendizes.data).dataset[0];
              let dtTENascimento = JSON.parse(resultTENascimento.data).dataset[0];
              // let dtTEResidencia = JSON.parse(resultTEResidencia.data).dataset[0];
              let dtMapear = JSON.parse(resultMapear.data).dataset[0];
              let dtCenso = JSON.parse(resultCenso.data).dataset[0];
              let dtCensoAgro = JSON.parse(resultCensoAgro.data).dataset[0];
              let municipio = dtCenso && dtCenso.nm_municipio_uf ? dtCenso.nm_municipio_uf : dtProvaBrasil && dtProvaBrasil.nm_municipio_uf ? dtProvaBrasil.nm_municipio_uf : dtCatMenores && dtCatMenores.nm_municipio_uf ? dtCatMenores.nm_municipio_uf : dtSinan.nm_municipio_uf;
  
              text += "<p class='headline-obs ma-0'>Município: <b>" + municipio + "</b></p>";
              text += "<table width='100%'>";
              text += "<tr><td class='font-weight-bold indigo--text darken-2'>CRIANÇAS E ADOLESCENTES OCUPADOS</td></tr>";
              text += "<tr><td>" + (dtCenso && dtCenso.agr_sum_vl_indicador ? this.$numberTransformService.constructor.formatNumber(dtCenso.agr_sum_vl_indicador,"inteiro") + " crianças e adolescentes ocupados entre 10 e 17 anos" : "Nenhum registro de crianças e adolescentes ocupados entre 10 e 17 anos") + "</td></tr>";
              text += "<tr><td>Fonte: IBGE - Censo Demográfico 2010</td></tr>";
              text += "<tr><td class='font-weight-bold purple--text'>TRABALHANDO FORA DE CASA</td></tr>";
              text += "<tr><td>" + (dtProvaBrasil && dtProvaBrasil.agr_sum_vl_indicador ? this.$numberTransformService.constructor.formatNumber(dtProvaBrasil.agr_sum_vl_indicador,"inteiro") + " declararam trabalhar fora de casa" : "Nenhum estudante declarou trabalhar fora de casa") + "</td></tr>";
              text += "<tr><td>Fonte: Prova Brasil 2017 (5º e 9º ano)</td></tr>";
              text += "<tr><td class='font-weight-bold cyan--text darken-2'>CRIANÇAS E ADOLESCENTES OCUPADOS EM ESTABELECIMENOS AGROPECUÁRIOS</td></tr>";
              text += "<tr><td>" + (dtCensoAgro && dtCensoAgro.qt_ocupados_menores14 ? this.$numberTransformService.constructor.formatNumber(dtCensoAgro.qt_ocupados_menores14,"inteiro") + " menores de 14 anos ocupados em estabelecimentos agropecuários" : "Nenhum registro de menores de 14 anos ocupados em estabelecimentos agropecuários") + "</td></tr>";
              text += "<tr><td>Fonte: IBGE - Censo Agropecuário 2017</td></tr>";
              text += "<tr><td class='font-weight-bold'>SOFRENDO ACIDENTES</td></tr>";
              text += "<tr><td class='font-weight-bold brown--text'>COM VÍNCULOS DE EMPREGO</td></tr>";
              text += "<tr><td>" + (dtCatMenores && dtCatMenores.agr_count_cd_municipio_ibge ? this.$numberTransformService.constructor.formatNumber(dtCatMenores.agr_count_cd_municipio_ibge,"inteiro") + " notificações de acidentes de menores de 18 anos" : "Não houve notificações de acidentes de menores de 18 anos")+ "</td></tr>";
              text += "<tr><td>Fonte: CATWEB 2012 a 2018</td></tr>";
              // text += "<tr><td class='font-weight-bold orange--text'>SEGUNDO AS NOTIFICAÇÕES SINAN</td></tr>";
              // text += "<tr><td>" + (dtSinan && dtSinan.agr_sum_vl_indicador ? this.$numberTransformService.constructor.formatNumber(dtSinan.agr_sum_vl_indicador,"inteiro") + " notificações relacionadas ao trabalho de "+ dtSinan.ds_agreg_primaria : "Não houve notificações relacionadas ao trabalho de Crianças e Adolescentes ( 0 a 17 anos)") +"</td></tr>";
              // text += "<tr><td>Fonte: MS - SINAN 2007 a 2018</td></tr>";
              text += "<tr><td class='font-weight-bold'>EXPLORADOS PELO TRABALHO ESCRAVO</td></tr>";
              text += "<tr><td class='font-weight-bold red--text'>LOCAL DE NASCIMENTO</td></tr>";
              text += "<tr><td>" + (dtTENascimento && dtTENascimento.agr_sum_vl_indicador ? this.$numberTransformService.constructor.formatNumber(dtTENascimento.agr_sum_vl_indicador,"inteiro") + " menores resgatados do trabalho escravo são naturais do município" : "Não houve menores resgatados do trabalho escravo naturais desse município")+ "</td></tr>";
              text += "<tr><td>Fonte: Seguro Desemprego, 2003-2018</td></tr>";
              // text += "<tr><td class='font-weight-bold light-blue--text'>LOCAL DE RESIDÊNCIA</td></tr>";
              // text += "<tr><td>" + (dtTEResidencia && dtTEResidencia.agr_sum_vl_indicador ? this.$numberTransformService.constructor.formatNumber(dtTEResidencia.agr_sum_vl_indicador,"inteiro") + " menores resgatados do trabalho escravo são residentes do município" : "Não houve menores resgatados do trabalho escravo residentes nesse município")+ "</td></tr>";
              // text += "<tr><td>Fonte: Seguro Desemprego, 2003-2018</td></tr>";
              text += "<tr><td class='font-weight-bold'>RISCOS DE EXPLORAÇÃO SEXUAL COMERCIAL</td></tr>";
              text += "<tr><td>" + (dtMapear && dtMapear.agr_count ? this.$numberTransformService.constructor.formatNumber(dtMapear.agr_count,"inteiro") + " pontos de riscos de exploração sexual de menores em rodovias federais do município" : "Não foram registrados locais de riscos de exploração sexual de menores em rodovias federais do município")+ "</td></tr>";
              text += "<tr><td>Fonte: Mapear/PRF</td></tr>";
              text += "<tr><td class='font-weight-bold green--text accent-4'>POTENCIAL DE COTAS DE APRENDIZAGEM</td></tr>";
              text += "<tr><td>" + (dtPotAprendizes && dtPotAprendizes.agr_sum_vl_indicador ? this.$numberTransformService.constructor.formatNumber(dtPotAprendizes.agr_sum_vl_indicador,"inteiro") + " vagas de cotas de aprendizagem" : "Nenhuma vaga de cotas de aprendizagem") + "</td></tr>";
              text += "<tr><td>Fonte: RAIS/Ministério da Economia, 2019</td></tr>";
              text += "</table>";
              target.bindPopup(text).openPopup();
            }))
        },
  
        obsSSTTooltip(target, route, tooltip_list = [], removed_text_list = [], options = null) {
          let text = "";
          if (options && options.clickable){
            text += "<p class='text-xs-right ma-0'><a href='" + this.$tooltipBuildingService.constructor.getUrlByPlace(target.options.rowData.cd_municipio_ibge_dv, route) + "' class='primary--text font-weight-black'>IR PARA</a></p>";
          }
          if (target.options.rowData.codigo == "sinan"){
            let urlIndicadores = "/indicadoresmunicipais?categorias=nm_municipio_uf,ds_agreg_primaria,ds_fonte&valor=vl_indicador&agregacao=sum&ordenacao=ds_agreg_primaria&filtros=nn-vl_indicador,and,ne-vl_indicador-0,and,in-cd_indicador-'06_05_01_00'-'06_05_02_00'-'06_05_03_00'-'06_05_04_00'-'06_05_05_00'-'06_05_06_00'-'06_05_07_00'-'06_05_08_00'-'06_05_09_00'-'06_05_11_00'-'06_05_12_00',and,ge-nu_competencia-'2012',and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
  //          if (this.customParams.filterUrl && this.customParams.filterUrl != ""){
  //            url = url + this.customParams.filterUrl;
  //            text = "Considerados os seguintes filtros: " + this.customParams.filterText;
  //          }
            axios.all([axios(this.$axiosCallSetupService.getAxiosOptions(urlIndicadores))])
              .then(axios.spread((resultIndicadores) => {
                let dtIndicadores = JSON.parse(resultIndicadores.data).dataset;
  
                text += "<p class='headline-obs'>Município: <b>" + dtIndicadores[0].nm_municipio_uf + "</b></p>";
                text += "<table width='100%'>";
                text += "<tr><td colspan='2' class='font-weight-bold'>As Notificações no Sistema de Informação de Agravos de Notificação (Sinan) para a localidade apresentaram os seguintes números:</td></tr>";
                for (let item of dtIndicadores){
                  text += "<tr><td class='font-weight-bold purple--text accent-4'>" + item.ds_agreg_primaria + ":</td><td class='text-xs-right'>" + this.$numberTransformService.constructor.formatNumber(item.agr_sum_vl_indicador,"inteiro") + "</td></tr>";
                }
                text += "<tr><td>Fonte: "+ dtIndicadores[0].ds_fonte +"</td></tr>";
                text += "<tr><td>Período: 2012 a 2018</td></tr>";              
                text += "</table>";
                target.bindPopup(text).openPopup();
              }, error => {
                console.error(error.toString());
                this.sendError("Erro ao carregar dataset tooltip");
              }));
          } else {
          let urlPeriodo = "";
          let urlTipo = "";
          let urlAtividade = "";
          let urlObs1 = "";
          let urlObs2 = "";
          let txtTipoTitulo = "";
          let txtTipoQtde = "";
          let txtColor = "";
          let filtro = "";
          if (this.customParams.filterUrl && this.customParams.filterUrl != ""){
            filtro = this.customParams.filterUrl;
            text += "Considerados os seguintes filtros: " + this.customParams.filterText;
          }
          
          if (target.options.rowData.codigo == "cat"){  
            urlPeriodo = "/sst/cats?categorias=1&valor=ano_cat&agregacao=min,max";
            urlTipo = "/sst/cats?categorias=ds_natureza_lesao-nm_tipo&agregacao=COUNT&filtros=eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro + "&ordenacao=-agr_count&limit=5";
            txtTipoTitulo = "ACIDENTES DE TRABALHO"
            txtTipoQtde = this.$numberTransformService.constructor.formatNumber(target.options.rowData.agr_count_cd_municipio_ibge,"inteiro") + " registros de acidentes de trabalho";
            txtColor = "red--text darken-4"
            urlAtividade = "/sst/cats?categorias=ds_cnae_classe_cat-nm_atividade&agregacao=COUNT&filtros=ne-ds_cnae_classe_cat-'null',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro + "&ordenacao=-agr_count&limit=5";
            urlObs1 = "/sst/cats?categorias=cd_municipio_ibge&agregacao=COUNT&filtros=lt-idade_cat-18,and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro;
            urlObs2 = "/sst/cats?categorias=cd_municipio_ibge&agregacao=COUNT&filtros=eq-cd_indica_obito-'S',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro;
          } else if (target.options.rowData.codigo == "mortes"){  
            urlPeriodo = "/sst/cats?categorias=1&valor=ano_cat&agregacao=min,max";
            urlTipo = "/sst/cats?categorias=ds_natureza_lesao-nm_tipo&agregacao=COUNT&filtros=eq-cd_indica_obito-'S',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro + "&ordenacao=-agr_count&limit=5";
            txtTipoTitulo = "ACIDENTES DE TRABALHO COM MORTES"
            txtTipoQtde = this.$numberTransformService.constructor.formatNumber(target.options.rowData.agr_count_cd_municipio_ibge,"inteiro") + " registros de acidentes de trabalho com mortes.";
            txtColor = "black--text"
            urlAtividade = "/sst/cats?categorias=ds_cnae_classe_cat-nm_atividade&agregacao=COUNT&filtros=eq-cd_indica_obito-'S',and,ne-ds_cnae_classe_cat-'null',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro + "&ordenacao=-agr_count&limit=5";
            urlObs1 = "/sst/cats?categorias=cd_municipio_ibge&agregacao=COUNT&filtros=eq-cd_indica_obito-'S',and,lt-idade_cat-18,and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro;
            urlObs2 = "/sst/cats?categorias=cd_municipio_ibge&agregacao=COUNT&filtros=eq-cd_indica_obito-'S',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro;
          } else {
            urlPeriodo = "/sst/beneficios?categorias=1&valor=ano_beneficio&agregacao=min,max";
            urlTipo = "/sst/beneficios?categorias=cd_agrupamento_categoria_cid-nm_tipo&agregacao=COUNT&filtros=eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + ",and,eq-cd_especie_beneficio-91"+ filtro + "&ordenacao=-agr_count&limit=5";
            txtTipoTitulo = "AFASTAMENTOS INSS (B91)"
            txtTipoQtde = this.$numberTransformService.constructor.formatNumber(target.options.rowData.agr_count_cd_municipio_ibge,"inteiro") + " afastamentos acidentários superiores a 15 dias(auxílio-doença por acidente de trabalho).";
            txtColor = "light-blue--text"
            urlAtividade = "/sst/beneficios?categorias=ds_cnae_classe-nm_atividade&agregacao=COUNT&filtros=ne-ds_cnae_classe-'null',and,eq-cd_especie_beneficio-91,and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro +  "&ordenacao=-agr_count&limit=5";
            urlObs1 = "/sst/beneficios?categorias=cd_municipio_ibge&valor=qt_despesa_total&agregacao=SUM&filtros=eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + ",and,eq-cd_especie_beneficio-91"+ filtro ;
            urlObs2 = "/sst/beneficios?categorias=cd_municipio_ibge&valor=qt_dias_perdidos&agregacao=SUM&filtros=eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + ",and,eq-cd_especie_beneficio-91"+ filtro ;
          }
          axios.all([axios(this.$axiosCallSetupService.getAxiosOptions(urlPeriodo)),
                     axios(this.$axiosCallSetupService.getAxiosOptions(urlTipo)),
                     axios(this.$axiosCallSetupService.getAxiosOptions(urlAtividade)),
                     axios(this.$axiosCallSetupService.getAxiosOptions(urlObs1)),
                     axios(this.$axiosCallSetupService.getAxiosOptions(urlObs2))])
            .then(axios.spread((resultPeriodo, resultTipo, resultAtividade, resultObs1, resultObs2) => {
  
              let dtPeriodo = JSON.parse(resultPeriodo.data);
              let dtTipo = JSON.parse(resultTipo.data).dataset;
              let dtAtividade = JSON.parse(resultAtividade.data).dataset;
              let dtObs1 = JSON.parse(resultObs1.data).dataset;
              let dtObs2 = JSON.parse(resultObs2.data).dataset;
  
  
              text += "<p class='title-obs'>Município: <b>" + target.options.rowData.nm_municipio_uf + "</b></p>";
              text += "<table width='100%'>";
              text += "<tr><td colspan='2' class='font-weight-bold "+ txtColor +"'>" + txtTipoTitulo + "</td></tr>";
              text += "<tr><td colspan='2'>" + txtTipoQtde + "</td></tr>";
              text += "<tr><td colspan='2' class='font-weight-bold "+ txtColor +"'>Destacaram-se as seguintes ocorrências:</td></tr>";
              for (let item of dtTipo){
                text += "<tr><td><b>" + item.nm_tipo + "</b> :</td><td class='text-xs-right'>" + this.$numberTransformService.constructor.formatNumber(item.agr_count,"inteiro") + "</td></tr>";
              }
              text += "<tr><td colspan='2' class='font-weight-bold "+ txtColor +"'>Atividade Econômicas mais frequentes envolvidas:</td></tr>";
              for (let item of dtAtividade){
                text += "<tr><td><b>" + item.nm_atividade + "</b> :</td><td class='text-xs-right'>" + this.$numberTransformService.constructor.formatNumber(item.agr_count,"inteiro") + "</td></tr>";
              }
              text += "<tr><td colspan='2'><br/></td></tr>";
              let ano_min = "";
              let ano_max = "";
              if (target.options.rowData.codigo == "cat" || target.options.rowData.codigo == "mortes"){  
                ano_min = this.customParams.value_min_ano_cat ? this.customParams.value_min_ano_cat : dtPeriodo.dataset[0].agr_min_ano_cat;
                ano_max = this.customParams.value_max_ano_cat ? this.customParams.value_max_ano_cat : dtPeriodo.dataset[0].agr_max_ano_cat;
                if(dtObs1.length > 0){
                  text += "<tr><td colspan='2'>" + this.$numberTransformService.constructor.formatNumber(dtObs1[0].agr_count,"inteiro") +" ocorrências envolveram menores de 18 anos.</td></tr>";
                }
                if(dtObs2.length > 0 && target.options.rowData.codigo == "cat"){
                  text += "<tr><td colspan='2'>Foram reportadas, ainda, "+ this.$numberTransformService.constructor.formatNumber(dtObs2[0].agr_count,"inteiro") +" mortes.</td></tr>";
                }
                text += "<tr><td colspan='2'><br/>Fonte: "+ dtPeriodo.metadata.fonte +"</td></tr>";
                text += "<tr><td colspan='2'>Período: " + ano_min + (ano_min != ano_max ? " a " + ano_max : "") +"</td></tr>";
              } else {
                ano_min = this.customParams.value_min_ano_beneficio ? this.customParams.value_min_ano_beneficio : dtPeriodo.dataset[0].agr_min_ano_beneficio;
                ano_max = this.customParams.value_max_ano_beneficio ? this.customParams.value_max_ano_beneficio : dtPeriodo.dataset[0].agr_max_ano_beneficio;
                text += "<tr><td colspan='2'>O impacto previdenciário dos afastamentos acidentários no município foi de " + this.$numberTransformService.constructor.formatNumber(dtObs1[0].agr_sum_qt_despesa_total,"monetario",2) +" , com a perda de "+ this.$numberTransformService.constructor.formatNumber(dtObs2[0].agr_sum_qt_dias_perdidos,"inteiro") +" dias de trabalho.</td></tr>";
                text += "<tr><td colspan='2'><br/>Fonte: "+ dtPeriodo.metadata.fonte +"</td></tr>";
                text += "<tr><td colspan='2'>Período: " + ano_min + (ano_min != ano_max ? " a " + ano_max : "") +"</td></tr>";
              }
              text += "</table>";
  
              target.bindPopup(text).openPopup();
            }, error => {
              console.error(error.toString());
              this.sendError("Erro ao carregar dataset tooltip");
            }));
          }
        },
  
        tooltipLinkGoogleStreetView(target, route, tooltip_list = [], removed_text_list = [], options = null) { 
          let text = "";
          let d = target.options.rowData;
          text = this.$tooltipBuildingService.constructor.defaultTooltip(d, route, tooltip_list, removed_text_list, options);
          text += "<p class='text-xs-right ma-0'><a href='https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + d[options.lat] +"," + d[options.long] +"' target='_blank' class='primary--text font-weight-black'>Google Street View</a></p>";
          target.unbindPopup();
          target.bindPopup(text).openPopup();
        },
      }
    })
  }
}

export default SnackbarManager;
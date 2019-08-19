<template>
  <v-layout row wrap class="pa-0">
    <!-- Nome do município + UF -->
    <v-container fluid grid-list-lg xs12 class="first-section pa-0" :style="displayHeight">
      <v-layout xs12 class="bg-parallax" height="auto" :style="currentParallax" v-if="customParams.cd_uf"></v-layout>
      <v-layout xs12 class="bg-parallax ma-0"></v-layout>
      <v-layout row wrap class="parallax-content" v-if="dimensao_ativa">
        <!-- Menu para cada dimensao -->
        <!--
        <v-flex xs12 class="justify-bottom pa-0 dim-menu">
          <v-bottom-nav :value="true" :active.sync="dimensao_ativa.id"
            class="pa-3 toolbar" shift style="height:auto; opacity:0.75;">
            <v-layout row wrap justify-center>
              <v-flex text-xs-center column 
                v-on:click="changeDim(dimensao.id, idLocalidade, idObservatorio)"
                :class="getGridPositionDimensao(dimensao, dimIndx)"
                v-for="(dimensao, dimIndx) in dimensoes" :key="dimensao.id">
                <v-tooltip bottom>
                  <v-layout pa-2 column slot="activator">
                    <v-icon dark 
                      :color="dimensao.id == dimensao_ativa.id ? 'accent' : ''">
                      {{ dimensao.icon }}
                    </v-icon>
                  </v-layout>
                  {{ dimensao.short_desc }}
                </v-tooltip>
              </v-flex>
            </v-layout>
          </v-bottom-nav>
        </v-flex>
        -->
        <!-- Menu para cada dimensao - tabs -->
        <v-flex xs12 class="justify-bottom pa-0 dim-menu">
          <v-tabs
            color="primary"
            :v-if="dimensao_ativa"
            v-model="dimensao_ativa_id"
            show-arrows
            grow
            dark>
            <v-tabs-slider></v-tabs-slider>
            <!-- Headers -->
            <v-tab 
              v-for="(dimensao, dimIndx) in dimensoes" 
              :key="dimensao.id" 
              :href="'#'+dimensao.id"
              v-on:click="changeDim(dimensao.id, idLocalidade, idObservatorio)"
              ripple
              class="caption-obs px-3">
               {{ dimensao.short_desc }}
            </v-tab>
          </v-tabs>
        </v-flex>        
        <v-flex column pt-1 px-5 xs12 >
          <v-flex v-if="ind_principais && ind_principais.length == 0 && localidade != null" class="text-xs-center pa-0">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>        
          </v-flex>
          <v-flex pt-5></v-flex>
          <v-flex id="screenTitle" class="white--text text-xs-center pa-5 line-height-1">
            <div class="display-3-obs">
                {{ localidade != null ? localidade.nm_localidade : '' }}
                <v-tooltip v-if="presentation" bottom class="icon-vertical-align-middle">
                  <v-icon color="accent"
                    class="pb-1"
                    slot="activator">
                    info
                  </v-icon>
                  <flpo-text-builder
                    :custom-params="customParams"
                    :custom-functions="custom_functions"
                    :structure="presentation">
                  </flpo-text-builder>
                </v-tooltip>
                <!--
                <span class="icon-vertical-align-middle">
                  <v-icon :color="isFavorite ? 'amber' : 'grey'"
                    class="pb-1"
                    v-on:click="toggleFavorite">
                    star
                  </v-icon>
                </span>
                -->
            </div>
            <v-layout pa-1 justify-center class="subheading master-indicator" v-if="masterIndicator"
              v-html="masterIndicator">
            </v-layout>
            <div class="display-2-obs pt-3" v-html="dimensao_ativa != null ? (dimensao_ativa.title != null ? dimensao_ativa.title : dimensao_ativa.label) : ''">
            </div>
          </v-flex>
          <!-- <div :v-if="localidade !== null && localidade.tipo !== null" class="display-1-obs white--text text-xs-center pb-5">
            {{ currentContext }}
          </div> -->
          <v-layout row wrap justify-center pt-4>
            <v-flex white--text subheading xs12 md4 lg3 :class="{'px-3': $vuetify.breakpoint.mdAndDown, 'px-4': $vuetify.breakpoint.lgAndUp}" v-html="dimensao_ativa.description">
            </v-flex>
            <v-flex text-xs-center xs12 md3 :class="{'px-3': $vuetify.breakpoint.mdAndDown, 'px-4': $vuetify.breakpoint.lgAndUp}" >
              <v-layout row wrap justify-center>
                <flpo-minicard
                  v-if="ind_principais && unlockLoading"
                  v-for="(miniCardPrincipal, indexMinicardsPrincipal) in ind_principais"
                  :key="'minicard_principal_'+indexMinicardsPrincipal"
                  :structure="miniCardPrincipal" :customFunctions="custom_functions"
                  :customParams="customParams" :row-class="miniCardPrincipal.rowClass">
                </flpo-minicard>
              </v-layout>
            </v-flex>
            <v-flex xs12 md4 lg3 :class="{'px-3': $vuetify.breakpoint.mdAndDown, 'px-4': $vuetify.breakpoint.lgAndUp}">
              <v-flex pt-0 column wrap v-if="sections && sections.length > 0" > 
                <v-flex v-for="(cardLink, cardLinkIndx) in cardLinks"
                  :key="cardLink.id ? cardLink.id : ('sec' + cardLinkIndx)" py-0>
                  <!--<v-icon color="accent">arrow_right</v-icon>-->
                  <a v-if="cardLink.id" class="accent--text subheading"
                    v-on:click="scrollTo('anchor_' + cardLink.id)">
                    <span class='card-title-bullet accent--text'>&#9679;</span> {{ cardLink.title }}
                  </a>
                  <div v-else :class="cardLinkIndx != 0 ? 'pt-2 title-obs white--text':'title-obs white--text'">
                    {{ cardLink.title }}
                  </div>
                </v-flex>
              </v-flex>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
    <!-- Indicadores principais: Empregadores, Vínculos Formais, Municípios, Estabelecimentos, % MEI e EPPs -->
    <v-container fluid  xs12  class="pa-0 ma-0">
      <v-layout class="bg-page grey lighten-2" column pa-0 ma-0>
        <v-layout  v-if="sections && sections.length > 0" 
          v-for="(secao, indexSecao) in sections"  
          :key="secao.id"
          row wrap>
          <v-layout column :id="secao.id" :style="'background-color:' + assessZebraBG(indexSecao) + ';'">
            <v-flex xs12>
              <div
                :class="'display-2-obs pt-5 pb-3  ml-5 pl-3 font-weight-bold ' + assessZebraTitle(indexSecao)">
                {{ secao.name }}
              </div>
            </v-flex>
            <!-- <v-container fluid grid-list-md py-0>
              <v-layout row wrap align-end justify-center>
                <flpo-leadcard v-if="secao.indicadores.length > 0" 
                  v-for="(secindicador, indx) in secao.indicadores"
                  :key="indx"
                  :structure="secindicador"
                  :customParams="customParams"
                  :customFunctions="custom_functions">
                </flpo-leadcard>
              </v-layout>
            </v-container> -->
            <v-container fluid grid-list-lg py-2 px-1>
              <v-layout column
                v-if="unlockLoading && secao.cards && secao.cards.length > 0" >
                <v-flex xs12 
                  v-for="(card, cardIndex) in secao.cards"
                  :key="card.id">
                  <v-layout :id="'anchor_' + card.id" ma-0 pa-0
                    :style="card.type != 'headline' && card.type != 'text' ? 'min-height:500px;': ''">
                    <v-layout v-if="card.type && card.type == 'text'"
                      :id="card.id" px-4 pb-4>
                      <flpo-composite-text
                        :structure="card.description"
                        :custom-params = "customParams"
                        :custom-functions = "custom_functions"
                        :section-index="indexSecao">
                      </flpo-composite-text>
                    </v-layout>
                    <v-layout v-else-if="card.type && card.type == 'headline'"
                      pt-5 pb-3 ml-5 pl-2
                      :class="'display-2-obs font-weight-bold ' + assessZebraTitle(indexSecao)"
                      v-html="card.title.fixed">
                    </v-layout>
                    <flpo-story-card-autofill
                      v-else-if="card.autoFill && topologyUfLoaded  && topology && ((indexSecao*100) + cardIndex <= visibleCardMaxIndex)"
                      :structure="card"
                      :custom-params = "customParams"
                      :custom-functions = "custom_functions"
                      :topology = "topology"
                      :topology-uf = "topology_uf"
                      :section-index="indexSecao">
                    </flpo-story-card-autofill>
                    <flpo-story-card-multiple-charts
                      v-else-if="card.type && card.type == 'multiple-charts' && topologyUfLoaded  && topology && ((indexSecao*100) + cardIndex  <= visibleCardMaxIndex)"
                      :structure="card"
                      :custom-params = "customParams"
                      :custom-functions = "custom_functions"
                      :topology = "topology"
                      :topology-uf = "topology_uf"
                      :section-index="indexSecao"
                      @showBugDialog="openBugDialog">
                    </flpo-story-card-multiple-charts>
                    <flpo-story-card
                      v-else-if="topologyUfLoaded  && topology && ((indexSecao*100) + cardIndex  <= visibleCardMaxIndex)"
                      :structure="card"
                      :custom-params = "customParams"
                      :custom-functions = "custom_functions"
                      :topology = "topology"
                      :topology-uf = "topology_uf"
                      :section-index="indexSecao"
                      @showBugDialog="openBugDialog">
                    </flpo-story-card>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-container>
          </v-layout>
        </v-layout>
      </v-layout>
    </v-container>
    <!-- Navegação lateral em dots pelos dimensoes e seções -->
    <flpo-dot-nav :sections="sections"></flpo-dot-nav>
    <v-layout text-xs-center pa-0 ma-0
      class="footer-nav white--text">
      <v-layout row wrap caption class="cursor-pointer">
        <!--
        <v-layout column scroll-menu v-if="!isFirstDim" pa-2
          v-on:click="navDim(-1)">
          <v-tooltip top>
            <v-layout pa-2 column slot="activator">
              <v-icon dark>chevron_left</v-icon>
            </v-layout>
            Dimensão anterior
          </v-tooltip>
        </v-layout>
        -->
        <v-layout column scroll-menu v-if="!isPageBottom" pa-2
          v-on:click="scrollDown()">
          Leia mais
          <v-icon dark>keyboard_arrow_down</v-icon>
        </v-layout>
        <v-layout column scroll-menu v-if="isPageBottom" pa-2
          v-on:click="navDim(0)">
          <v-icon dark>keyboard_arrow_up</v-icon>
          Para o topo
        </v-layout>
        <!--
        <v-layout column scroll-menu v-if="!isLastDim" pa-2
          v-on:click="navDim(1)">
          <v-tooltip top>
            <v-layout pa-2 column slot="activator">
              <v-icon dark>chevron_right</v-icon>
            </v-layout>
            Próxima dimensão
          </v-tooltip>
        </v-layout>
        -->
      </v-layout>
    </v-layout>
    <v-layout  v-if="!unlockLoading" align-center justify-center row fill-height class= "loadingPanel">
      <v-progress-circular
        :size="120"
        :width="8"
        color="grey lighten-1"
        indeterminate>
        Carregando dados
      </v-progress-circular>
    </v-layout>
  </v-layout>
</template>

<script>
  import axios from 'axios'

  import BaseStoryView from './BaseStoryView.vue';

  export default {
    extends: BaseStoryView,
    data () {
      return {
        displayHeight: "auto",
        select: null,
        dimensao_ativa: [],
        dimensao_ativa_id: null,
        sections: [],
        show: false,
        idLocalidade: null,
        idObservatorio: null,
        localidade:null,
        masterIndicator: null,
        presentation: null,
        ind_master: null,
        ind_principais:[],
        ind_principais_per_row: 2,
        dimensoes: [],
        customParams: {},
        topology: null,
        topology_uf: null,
        topologyUfLoaded: false,
        isPageBottom: true,
        cardLinks: [],
        totalLinksSections: 0,
        unlockLoading: false,
        thematicDatasetQuantity: 0,
        thematicLoaded: 0,
        isFavorite: false,
        visibleCardMaxIndex: 1, //dois primeiros cards
        custom_functions: {
          concat_values(indicador, value1, value2, value3 = "", value4 = "", value5 = "") {return value1 + ' ' + value2 + ' ' + value3 + ' ' + value4 + ' ' + value5; },
          calc_subtraction: function(a, b) {  return a - b; },
          calc_complemetary_absolut_from_percentage: function(percentage, abs_total) {
            return (abs_total * (100 - percentage)) / 100;
          },
          oppose: function(d, prop_ref, value_ref, prop_val) {
            if (d[prop_ref] == value_ref) {
              return -d[prop_val];
            }
            return d[prop_val];
          },
          get_bin_faixa_etaria: function(d, age_prop) {
            if (d[age_prop] <= 17) return '01'; // < 18
            if (d[age_prop] <= 24) return '02'; // 18-24
            if (d[age_prop] <= 29) return '03'; // 25-29
            if (d[age_prop] <= 34) return '04'; // 30-34
            if (d[age_prop] <= 39) return '05'; // 35-39
            if (d[age_prop] <= 44) return '06'; // 40-44
            if (d[age_prop] <= 49) return '07'; // 45-49
            if (d[age_prop] <= 54) return '08'; // 50-54
            if (d[age_prop] <= 59) return '09'; // 55-59
            return '10'; // > 60
          },
          get_faixa_etaria: function(d, age_prop) {
            if (d[age_prop] <= 17) return '< 18'
            if (d[age_prop] <= 24) return '18-24'
            if (d[age_prop] <= 29) return '25-29'
            if (d[age_prop] <= 34) return '30-34'
            if (d[age_prop] <= 39) return '35-39'
            if (d[age_prop] <= 44) return '40-44'
            if (d[age_prop] <= 49) return '45-49'
            if (d[age_prop] <= 54) return '50-54'
            if (d[age_prop] <= 59) return '55-59'
            return '> 60'
          },
          calc_subtraction_ds: function(d, a, b) { return a - b; },
          calc_addition_ids_ds: function(d, a, b, multiplier=10000000) { return a*multiplier + b; },
          calc_percentage: function(parte,total) { return parte / total * 100},
          calc_percentage_val1: function(val1,val2) { return val1 / (val1 + val2) * 100},
          calc_percentage_2values: function(val1,val2,total) { return (val1 + val2) / total * 100},
          calc_proportion: function(dividendo, divisor) { return dividendo / divisor; },
          calc_proportion_ds: function(d,dividendo, divisor) { return dividendo / divisor; },
          get_flag_value: function(d) {return (d.vl_indicador == 0) ? d.ds_indicador_radical + ": NÃO" : d.ds_indicador_radical + ": SIM";},
          get_te_label: function(d,campo) {
              switch(d[campo]) {
                  case 'te_nat':
                      return 'Vítimas que nasceram na localidade'
                      break;
                  case 'te_res':
                      return 'Vítimas que residem na localidade'
                      break;
                  case 'te_rgt':
                      return 'Vítimas resgatadas na localidade'
                      break;
                  default:
                      return d[campo];
              }
          },
          get_period_from_string: function(str){ 
            let reg = /de \d{4} a \d{4}/g;
            return str.match(reg);
            },
          get_text_from_parentheses_ds: function(d, str){ 
            let reg = /\(.*\)/;
            var returnStr = String(str).match(reg);
            returnStr = String(returnStr).replace('(', '').replace(')', '');
            return returnStr;
            },
          get_proportional_indicator_uf: function(d,campo='vl_indicador', media="media_uf") { return Math.log(((d[campo] - d[media]) / d[media]) + 1.01); },
          get_log: function(d,campo='vl_indicador') { return Math.log(d[campo] + 0.01); },
          get_bipolar_scale: function(d, prop, origin = 0) {
            let val = d[prop] - origin;
            if (val > 0) {
              return Math.log(val / d.maxVal + 1.0001);
            }
            if (val < 0) {
              return -Math.log(Math.abs(val) / Math.abs(d.minVal) + 1.0001);
            }
            return 0;
          },
          inv_deviation: function(v, bs) {
            let valor = (Math.exp(v) - 1.01) * bs + bs;
            return valor.toLocaleString('pt-br', {maximumFractionDigits: 2, minimumFractionDigits: 2});
          },
          concat_ds_vl: function(d, formato, casasDecimais) {
            let valor = null;
            if(d.vl_indicador === null || d.vl_indicador == undefined){
              valor = "-"; 
            } else {
              valor = parseFloat(d.vl_indicador);
              if(casasDecimais === null || casasDecimais === undefined) {
                casasDecimais = 2;
              }
              switch(formato) {
                  case 'inteiro':
                      valor = valor.toLocaleString('pt-br', {maximumFractionDigits: 0});
                      break;
                  case 'real':
                      valor = valor.toLocaleString('pt-br', {maximumFractionDigits: casasDecimais, minimumFractionDigits: casasDecimais});
                      break;
                  case 'porcentagem':
                      valor = valor.toLocaleString('pt-br', {maximumFractionDigits: casasDecimais, minimumFractionDigits: casasDecimais}) + "%";
                      break;
                  case 'monetario':
                      valor = "R$ " + valor.toLocaleString('pt-br', {maximumFractionDigits: 0});
                      // return valor.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
                      break;
                  default:
                      valor = valor.toLocaleString('pt-br');
              }
            }
            return d.ds_indicador_radical + ": " + valor; },
          get_proportional_resg_fisc: function(d) { return d.qt_resgatados/ d.qt_ope; },
          get_idh_level: (d) => {
            if (d.vl_indicador < 0.5) return 1; // Muito Baixo
            if (d.vl_indicador < 0.6) return 2; // Baixo
            if (d.vl_indicador < 0.7) return 3; // Médio
            if (d.vl_indicador < 0.8) return 4; // Alto
            return 5;
          },
          remove_year: function(d){ return String(d.ds_indicador_radical).replace(d.nu_competencia,"").replace("  "," ")},
          absolute: function(d, campo="vl_indicador") { return Math.abs(d[campo]); },
          concat_descriptions: function(d) {
            return d.desc_indicador + " - " + d.ds_indicador_radical;
          },
          replace_text_namepercent: function(data, options) {
            return data[options.name_field] + " (" + data[options.pct_field] + ")"; 
          },
          replace_value_by_zero(show_value, value){
            if (show_value){
              return value;
            } else {
              return 0;
            }
          },
          fn_in_interpol_functions: function(a, b) { return "args " + a + " " + b; },
          calc_proportion_by_month: function(dividendo, divisor) { return dividendo / divisor / 12; },
          calc_average_by_year: function(total1, ano1, total2, ano2) { return (total2-total1) / ((parseInt(ano2)- parseInt(ano1)) + 1); },
          calc_class_idh: function(idh, showIdh = false, showParentheses = false, letterCaption = true) { 
            var returText = "";
            // showIdh = (String(showIdh) == 'true');
            // showParentheses = (String(showParentheses) == 'true');
            // letterCaption = (String(letterCaption) == 'true');

            if (idh < 0.5){
              returText = letterCaption ? "Muito baixo" : "muito baixo";
            } else if (idh < 0.6){
              returText = letterCaption ? "Baixo" : "baixo";
            } else if (idh < 0.7){
              returText = letterCaption ? "Médio" : "médio";
            } else if (idh < 0.8){
              returText = letterCaption ? "Alto" : "alto";
            } else {
              returText = letterCaption ? "Muito alto" : "muito alto";
            }
            returText = showParentheses ? " (" + returText + ")": returText;
            returText = showIdh ? idh + " " + returText : returText;

            return returText;
          }
        },
        loadedPrincipais: false,
      }
    },
   
    created () {
      let tmpIdObs = this.identifyObservatory(this.$route.path.split('/')[1]);
      this.$dimensions.getDimensions(tmpIdObs, this.setSiblingDimensions);
      this.idObservatorio = tmpIdObs;
      
      let scope = this.getEscopo(this.$route.params.idLocalidade);
      let auId = this.getIdLocalidadeFromRoute(this.$route.params.idLocalidade);
      let msgErro = this.getMensagemErro(this.$route.params.idLocalidade);
      
      if (tmpIdObs) {
        this.loadYaml("br/observatorio/" + tmpIdObs, this.setObservatorio);
      } else {
        this.getGlobalDataset(
          'centralindicadores',
          scope,
          msgErro,
          auId,
          this.keepLoading
        );
        this.$emit('alterToolbar', null);
      }
    },
    computed: {
      cardLinksLoaded: function() {
        return this.totalLinksSections == this.cardLinks.length;
      },
      idLocalidadeD6: function() {
        return this.idLocalidade.toString().substring(0,6); //sem dígito
      },
      cd_uf: function() {
        return this.idLocalidade.toString().substring(0,2); //sem dígito
      },
      // currentContext: function() {
      //   return this.localidade !== null && this.localidade !== undefined && this.localidade.tipo !== null && this.localidade.tipo !== undefined ? 
      //     (this.localidade.tipo == 'Município' ? 'Indicadores Municipais' : 'PNAD Contínua') :
      //     '';
      // },
      currentParallax: function() {
        return 'background-image:url("/static/parallax/uf/' + this.customParams.cd_uf + '.jpg"); background-position: center center; background-size: cover;';
      },
      dimSplitColumns: function() {
        if (this.$vuetify.breakpoint.mdAndUp) {
          return 'dim-description';
        }
      },
      isFirstDim: function() {
        if (this.dimensoes && this.dimensao_ativa) {
          return this.dimensoes[0].id === this.dimensao_ativa.id;
        }
        return true;
      },
      isLastDim: function() {
        if (this.dimensoes && this.dimensao_ativa) {
          return this.dimensoes[this.dimensoes.length - 1].id === this.dimensao_ativa.id;
        }
        return true;
      }
    },
    mounted: function() {
      this.checkFavoriteAnalysisUnit();
      window.addEventListener('scroll', this.assessPageBottom);
      window.addEventListener('scroll', this.setVisibleCardMaxIndex);
      this.assessPageBottom();
      window.addEventListener('resize', this.resizeFirstSection);
      this.resizeFirstSection();

      if (this.$cookies.isKey("currentAnalysisUnit")) {
        this.isFavorite = this.$route.params.idLocalidade == this.$cookies.get("currentAnalysisUnit");
      } else {
        this.isFavorite = this.$route.params.idLocalidade == this.$store.state.favLocation;
      }
    },
    beforeDestroy () {
      window.removeEventListener('scroll', this.assessPageBottom);
      window.removeEventListener('scroll', this.setVisibleCardMaxIndex);
      window.removeEventListener('resize', this.resizeFirstSection);
    },
    methods: {
      scrollDown(){
        window.scrollBy(0, window.innerHeight / 2);        
      },

      setSiblingDimensions(content) {
        let dimensoesTmp = [];
        for (let dim of content.dimensoes) {
          if (dim.status != 'EM BREVE') {
            dimensoesTmp.push(dim);
          }
        }
        this.dimensoes = dimensoesTmp;
      },

      setObservatorio(content) {
        let scope = this.getEscopo(this.$route.params.idLocalidade);
        let auId = this.getIdLocalidadeFromRoute(this.$route.params.idLocalidade);
        let msgErro = this.getMensagemErro(this.$route.params.idLocalidade);
      
        if (content.tematicos) {
          let thematicDatasets = ['centralindicadores'];
          for (let indxTematico in content.tematicos){
            thematicDatasets.push(content.tematicos[indxTematico].dataset);
            if (parseInt(indxTematico) + 1 == content.tematicos.length) { 
              this.getMultipleGlobalDatasets(thematicDatasets, scope, auId, this.keepLoading);
            }
          }
        } else {
          this.getGlobalDataset(
            'centralindicadores',
            scope,
            msgErro,
            auId,
            this.keepLoading
          );
        }
        this.$emit('alterToolbar', content.theme.toolbar);
      },

      setVisibleCardMaxIndex(){
        const vHeight = (window.innerHeight || document.documentElement.clientHeight);
        let indexSection = 0;
        for(let section of this.sections){
          if (!section.divider) {
            for (let cardIndex in section.cards) {
              let sectionCardIndex = indexSection * 100 + parseInt(cardIndex);
              if (document.getElementById('anchor_' + section.cards[cardIndex].id) != null) {
                var { top, bottom } = document.getElementById('anchor_' + section.cards[cardIndex].id).getBoundingClientRect();
                if ((top > 0 || bottom > 0) && (top < vHeight) && (sectionCardIndex > this.visibleCardMaxIndex)) {  
                  this.visibleCardMaxIndex = sectionCardIndex + 1;
                } 
              } 
            }
          }
          indexSection++;
        }
      },
      
      keepLoading() {
        let tmpIdObs = this.identifyObservatory(this.$route.path.split('/')[1]);
        
        this.setActiveDim(this.$route.params.idLocalidade, tmpIdObs, this.$route.query.dimensao);

        this.customParams.deck = this.loadYaml("br/autocard");

        // Carrega a topologia do município
        if (this.$route.params.idLocalidade == 0){ //Brasil
          // this.selectCoords("/static/topojson/country.json");
          this.selectCoords("br", "uf", 0);
        } else if (this.$route.params.idLocalidade.includes("mptreg") || this.$route.params.idLocalidade.includes("MPTREG")) {
          this.selectCoords("uf", "municipio", this.getUFFromPlace(this.$route.params.idLocalidade));
        } else if (this.$route.params.idLocalidade.includes("prt") || this.$route.params.idLocalidade.includes("PRT") ||
                   this.$route.params.idLocalidade.includes("ptm") || this.$route.params.idLocalidade.includes("PTM")) {
          this.selectCoords("uf", "municipio", this.getUFFromPlace(this.$route.params.idLocalidade));
        } else if (this.$route.params.idLocalidade.length == 1){ //Região
          this.selectCoords("br", "uf", 0);
          // this.selectCoords("/static/topojson/regiao.json");
        } else if (this.$route.params.idLocalidade.length == 2){ //Estado
          this.selectCoords("uf", "municipio", this.$route.params.idLocalidade.substring(0, 2));
        } else if (this.$route.params.idLocalidade.length == 4){ //Mesorregião
          this.selectCoords("uf", "uf", this.$route.params.idLocalidade);
        } else if (this.$route.params.idLocalidade.length == 5){ //Microrregião
          this.selectCoords("mesorregiao", "uf", this.$route.params.idLocalidade);
        } else {
          this.selectCoords("uf", "municipio", this.$route.params.idLocalidade.substring(0, 2));
        }
      },
      resizeFirstSection(){
        if (this.$vuetify.breakpoint.mdAndDown){
          this.displayHeight = "auto";
        } else {
          this.displayHeight = "min-height:" + window.innerHeight + "px";
        }
      },
      loadPlacePage(idLocalidade){
        if (this.dimensao_ativa) {
          this.$router.push('/localidade/'+idLocalidade+'?dimensao='+this.dimensao_ativa.id);
          this.$router.go('/localidade/'+idLocalidade+'?dimensao='+this.dimensao_ativa.id);
        }
      },

      flagThematicLoaded() {
        ++this.thematicLoaded;
      },

      loadLayout(idLocalidade, idDimensao, idObservatorio = null) {
        this.idLocalidade = idLocalidade;
        this.customParams.idLocalidade = idLocalidade;

        // if (idLocalidade.length > 2) {
        this.customParams.cd_uf = idLocalidade.substring(0,2);
        // }
        if (idLocalidade.length > 6) {
          this.customParams.idLocalidadeD6 = idLocalidade.substring(0,6);
        }

        this.fetchDataLocalidade(idLocalidade);

        let escopo = this.getEscopo(idLocalidade);
        let observatorioDir = '';
        if (idObservatorio !== null && idObservatorio !== undefined) {
          observatorioDir = 'observatorio/' + idObservatorio + '/';
        }

        let baseStructYamls = [
          { main: "br/localidade/base" },
          { main: "br/localidade/" + escopo + "/base" },
          { main: "br/observatorio/base" },
          { main: "br/" + observatorioDir + "base" },
          { main: "br/" + observatorioDir + "localidade/base" },
          { main: "br/" + observatorioDir + "localidade/" + escopo + "/base", alt: "br/" + observatorioDir + "localidade/default/base" },
          { main: "br/" + observatorioDir + "localidade/" + escopo + "/" + idDimensao, alt: "br/" + observatorioDir + "localidade/default/" + idDimensao }
        ];
        this.loadYamlArray({}, baseStructYamls, this.setDimension);
      },

      setDimension(content) {
        let escopo = this.getEscopo(this.$route.params.idLocalidade);
        this.dimStruct = content;
        if (content.tematicos) {
          let thematicDatasets = ['centralindicadores'];
          for (let tematico of content.tematicos){
            thematicDatasets.push(tematico.dataset);
          }
          this.getMultipleGlobalDatasets(
            thematicDatasets,
            escopo,
            this.getIdLocalidadeFromRoute(this.$route.params.idLocalidade),
            this.keepLoadingDimension);
        } else {
          this.keepLoadingDimension();
        }
      },

      keepLoadingDimension() {
        this.sections = this.dimStruct.secoes;

        this.ind_principais_per_row = (this.dimStruct.principais_options && this.dimStruct.principais_options.per_row) ? this.dimStruct.principais_options.per_row : 3;
        this.ind_principais = this.dimStruct.principais;
        this.presentation = this.dimStruct.presentation;
            
        this.totalLinksSections = 0;
        for (let section of this.sections) {
          if (section.name != '') {
            this.totalLinksSections += 1
          }
          this.totalLinksSections += section.cards.length;
        }
        this.cardLinks = [];
        this.fetchVizLinks(this.sections);
      
        this.unlockLoading = true;

        this.fillDataStructure(
          this.dimStruct.master, this.customParams,
          this.customFunctions, this.setMasterIndicator
        );
      },

      getMensagemErro(idLocalidade) {
        if (idLocalidade == 0) return 'Falha ao buscar indicadores do país';
        if (idLocalidade.includes("mptreg") || idLocalidade.includes("MPTREG")) return 'Falha ao buscar indicadores da regional do MPT';
        if (idLocalidade.includes("prt") || idLocalidade.includes("PRT") ||
            idLocalidade.includes("ptm") || idLocalidade.includes("PTM")) return 'Falha ao buscar indicadores da unidade do MPT';
        switch (idLocalidade.length) {
          case 1:
            return "Falha ao buscar indicadores da região";
          case 2:
            return "Falha ao buscar indicadores do estado";
          case 4:
            return "Falha ao buscar indicadores mesorregionais";
          case 5:
            return "Falha ao buscar indicadores microrregionais";
        }
        return "Falha ao buscar indicadores do município";
      },

      fetchDataLocalidade(idLocalidade) {
        var url = null;
        //axios(this.getAxiosOptions("/municipios?categorias=nm_municipio,cd_uf,nm_uf,sigla_uf,lat,long,ano_instalacao,ano_extincao,altitude&filtros=eq-cd_municipio_ibge-" + idLocalidade))
        if (idLocalidade == 0){ //Brasil
          this.localidade = {
            id_localidade: 0,
            nm_localidade: 'Brasil',
            tipo: '',
            img: "/static/thumbs/municipios/" + idLocalidade + ".jpg"
          };
          this.customParams.localidade = this.localidade;

          this.$emit('alterMiddleToolbar', { title: 'Brasil', subTitle: this.dimensao_ativa.short_des, localidade: this.localidade });
        } else if (idLocalidade.includes("mptreg") || idLocalidade.includes("MPTREG")) {
          let localidade = this.getPRTPTMInstance(idLocalidade.substring(0,6), idLocalidade.substring(6));
          this.localidade = localidade;
          this.customParams.localidade = localidade;
          this.$emit('alterMiddleToolbar', { "localidade": localidade });
        } else if (idLocalidade.includes("prt") || idLocalidade.includes("PRT") ||
                   idLocalidade.includes("ptm") || idLocalidade.includes("PTM")) {
          url = "/municipios?categorias=cd_unidade,nm_unidade,cd_uf&agregacao=distinct&filtros=eq-cd_unidade-" + idLocalidade.substring(3);
          axios(this.getAxiosOptions(url))
            .then(result => {
              var infoUnidade = JSON.parse(result.data).dataset;
              if (infoUnidade.length > 0) {
                let localidade = {
                  id_localidade: infoUnidade[0].cd_unidade,
                  nm_localidade: infoUnidade[0].nm_unidade,
                  tipo: idLocalidade.substring(0,3)
                };
                this.localidade = localidade;
                this.customParams.localidade = localidade;
                this.$emit('alterMiddleToolbar', { "localidade": localidade });
              }
            }, error => {
              console.error(error.toString());
              this.sendError("Falha ao buscar total das localidades");
              reject({ code: 500 });
            });
        } else if (idLocalidade.length == 1){ //Região
          this.localidade.id_localidade = idLocalidade;
          this.localidade.nm_localidade = this.getRegion(idLocalidade);
          this.localidade.tipo = '';
          this.localidade.img = "/static/thumbs/municipios/" + idLocalidade + ".jpg";
          this.customParams.localidade = this.localidade;

          this.$emit('alterMiddleToolbar', this.getRegion(idLocalidade));
        } else if (idLocalidade.length == 2){ //Estado
          url = "/municipios?categorias=cd_uf,nm_uf&filtros=eq-cd_uf-" + idLocalidade;
          axios(this.getAxiosOptions(url))
            .then(result => {
              this.localidade = JSON.parse(result.data).dataset[0];
              this.localidade.id_localidade = this.localidade.cd_uf;
              this.localidade.nm_localidade = this.localidade.nm_uf;
              this.localidade.tipo = 'UF';
              this.localidade.img = "/static/thumbs/municipios/" + idLocalidade + ".jpg";
              this.customParams.localidade = this.localidade;

              this.$emit('alterMiddleToolbar', { localidade: this.localidade });
            }, error => {
              console.error(error.toString());
              this.sendError("Falha ao buscar dados do município");
            });
        } else if (idLocalidade.length == 4){ //Mesorregião
          url = "/municipios?categorias=cd_mesorregiao,nm_mesorregiao&filtros=eq-cd_mesorregiao-" + idLocalidade;
          axios(this.getAxiosOptions(url))
            .then(result => {
              this.localidade = JSON.parse(result.data).dataset[0];
              this.localidade.id_localidade = this.localidade.cd_mesorregiao;
              this.localidade.nm_localidade = this.localidade.nm_mesorregiao;
              this.localidade.tipo = 'Mesorregião';
              this.localidade.img = "/static/thumbs/municipios/" + idLocalidade + ".jpg";
              this.customParams.localidade = this.localidade;

              this.$emit('alterMiddleToolbar', { localidade: this.localidade });
            }, error => {
              console.error(error.toString());
              this.sendError("Falha ao buscar dados da mesorregião");
            });
        } else if (idLocalidade.length == 5){ //Microrregião
          url = "/municipios?categorias=cd_microrregiao,nm_microrregiao,latitude,longitude&filtros=eq-cd_microrregiao-" + idLocalidade;
          axios(this.getAxiosOptions(url))
            .then(result => {
              this.localidade = JSON.parse(result.data).dataset[0];
              this.localidade.id_localidade = this.localidade.cd_microrregiao;
              this.localidade.nm_localidade = this.localidade.nm_microrregiao;
              this.localidade.tipo = 'Microrregião';
              this.localidade.img = "/static/thumbs/municipios/" + idLocalidade + ".jpg";
              this.customParams.localidade = this.localidade;
              
              this.$emit('alterMiddleToolbar', { localidade: this.localidade });
            }, error => {
              console.error(error.toString());
              this.sendError("Falha ao buscar dados da microrregião");
            });
        } else {
          url = "/municipio/" + idLocalidade;
          axios(this.getAxiosOptions(url))
            .then(result => {
              var localidade = JSON.parse(result.data)[0];
              localidade.id_localidade = localidade.cd_municipio_ibge_dv;
              localidade.nm_localidade = localidade.nm_municipio_uf;
              localidade.tipo = 'Município';
              localidade.img = "/static/thumbs/municipios/" + idLocalidade + ".jpg";
              this.localidade = localidade;
              this.customParams.localidade = localidade;

              this.$emit('alterMiddleToolbar', { "localidade": localidade });
            }, error => {
              console.error(error.toString());
              this.sendError("Falha ao buscar dados do município");
            });
        }
      },

      setMasterIndicator(base_object_list, rules, structure, metadata) {
        if (typeof base_object_list == 'string') {
          this.masterIndicator = base_object_list;
        } else {
          let finalText = this.replaceArgs(
            structure.template,
            this.indicatorsToValueArray(
              rules, 
              this.customFunctions, 
              base_object_list,
              this.sendInvalidInterpol
            ),
            this.sendInvalidInterpol
          );
          this.masterIndicator = finalText;
        }
      },

      setActiveDim(idLocalidade, idObservatorio = null, idDimensao = null) {
        for (var indxDim in this.dimensoes) {
          // Se não estiver em uma dimensão pela rota, pega a default
          if ((!idDimensao || idDimensao == '') && this.dimensoes[indxDim].default) {
            this.dimensao_ativa = this.dimensoes[indxDim];
            this.dimensao_ativa_id = this.dimensao_ativa.id;
            idDimensao = this.dimensoes[indxDim].id;
            break;
          } else if (this.dimensoes[indxDim].id == idDimensao) { 
            // Se estiver em dimensão pela rota, tentar o match
            this.dimensao_ativa = this.dimensoes[indxDim];
            this.dimensao_ativa_id = this.dimensao_ativa.id;
            break;
          }
        }
        
        this.loadLayout(idLocalidade, idDimensao, idObservatorio);
      },

      getGridPositionDimensao(dimensao, dimIndx) {
        switch (this.dimensoes.length) {
          case 6:
            return 'xs4 sm2';
            break;
          case 8:
            let clz = 'xs3 sm1';
            if (dimIndx == 0) {
              clz += ' offset-sm2';
            }
            return clz;
          default:
            return 'xs2 sm1';
        }
      },

      scrollTo(anchor) {
        var el = this.$el.querySelector("#" + anchor);
        el.scrollIntoView();
        window.scrollBy(0,-120);
      },

      changeDim(idDimensao, idLocalidade, idObservatorio) {
        let urlComplemento = '';
        if (idDimensao) {
          urlComplemento = '&dimensao=' + idDimensao;
        }
        this.$router.push("/" + this.identifyObservatoryById(idObservatorio) + "/localidade/" + idLocalidade + "?" + urlComplemento);
      },

      getLeadSlice(rowIndx) {
        let startIndx = (rowIndx - 1) * this.ind_principais_per_row;
        let endIndx = startIndx + this.ind_principais_per_row;
        if (endIndx > this.ind_principais.length) {
          endIndx = this.ind_principais.length;
        }
        return this.ind_principais.slice(startIndx, endIndx);
      },

      setCardLink(base_object_list, rules, structure, addedParams = null, metadata = null) {
        if (typeof base_object_list == 'string') {
          this.cardLinks[addedParams.pos] = {
            id: addedParams.id,
            title: base_object_list
          };
        } else {
          let base_object = {};
          if (Array.isArray(base_object_list) && base_object_list.length > 0) {
            base_object = base_object_list[0];
          } else if (base_object_list !== null && base_object_list !== undefined) {
            base_object = base_object_list;
          }
          this.cardLinks[addedParams.pos] = {
            id: addedParams.id,
            title: this.applyInterpol(
                structure,
                this.customParams,
                this.customFunctions,
                base_object,
                this.sendInvalidInterpol
                )}
            // title: this.replaceArgs(
            //   structure.template,
            //   this.indicatorsToValueArray(
            //     structure.args, 
            //     this.customFunctions, 
            //     base_object_list,
            //     this.sendInvalidInterpol
            //   ),
            // this.sendInvalidInterpol
            // )
        }
      },

      assessPageBottom() {
        this.isPageBottom = false;
        if (window && document) {
          if (window.scrollY == 0){ //início
            this.isPageBottom = false;
          }
          else{
            this.isPageBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight-1;
          }
        } 
      },

      navDim(delta) {
        if (delta === 0) {
          window.scrollTo(0,0);
        } else {
          for (var dimIndx in this.dimensoes) {
            if (this.dimensoes[dimIndx].id === this.dimensao_ativa.id) {
              this.changeDim(this.dimensoes[parseInt(dimIndx) + parseInt(delta)].id, this.idLocalidade, this.idObservatorio);
              break;
            }
          }
        }
      },

      toggleFavorite() {
        if (this.isFavorite) {
          if (this.$cookies.isKey("currentAnalysisUnit")) {
            this.$cookies.remove("currentAnalysisUnit");
          }
          this.$store.state.favLocation = null;
        } else {
          this.$cookies.set("currentAnalysisUnit", this.$route.params.idLocalidade, -1);
          this.$store.state.favLocation = this.$route.params.idLocalidade;
        }
        this.isFavorite = !this.isFavorite;
      }
    }
  }
</script>
<style>
  .dim-menu {
    background-color:rgba(0,0,0,0.8) !important;
    width: 100%;
    position: fixed;
    z-index: 99 !important;
  }

  .bg-transp-10{
    background-color:rgba(256,256,256,0.10) !important;
  }

  .dim-menu .hidden {
    display: none;
  }

  .dim-menu .flex:hover .hidden {
    display: block;
  }
  
  .dim-menu .flex { cursor: pointer; }
  
  .bg-black {
    background-color: black;
  }

  .scroll-menu { cursor: pointer; }

  /* .minicard {
    background-color: rgba(0,0,0,0.7);
    align-self: stretch;
    overflow: hidden;
  } */

  .dim-description {
    column-count: 2;
    column-gap: 4.5em;
  }

  .icon-vertical-align-middle i {
    vertical-align: middle !important;
  }
  .table-info th, .table-info td{
    border:1px solid;
    padding: 10px;
  }

  .master-indicator span{
    align-self: auto;
  }

  .loadingPanel {
    width: 100%; 
    background-color: rgba(33, 33, 33, 0.9); 
    position: absolute; 
    z-index:99;
  }

  .card-title-bullet {
    font-size: 0.75rem !important;
    display: table-caption;
  }
</style>
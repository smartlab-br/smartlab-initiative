<template>
  <v-layout row wrap class="pa-0">
    <!-- Nome do município + UF -->
    <v-container fluid grid-list-lg xs12 overflow-hidden class="first-section pa-0" :style="displayHeight">
      <v-layout xs12 class="bg-zoom" height="auto" :style="currentParallax" v-if="customParams.cd_uf"></v-layout>
      <v-layout xs12 class="bg-shadow ma-0"></v-layout>
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
            v-if="dimensao_ativa"
            v-model="dimensao_ativa_id"
            show-arrows
            grow
            dark>
            <v-tabs-slider></v-tabs-slider>
            <!-- Headers -->
            <v-tab 
              v-for="dimensao in dimensoes" 
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
            <v-layout pa-1 justify-center class="subheading master-indicator" v-if="masterIndicator" v-html="masterIndicator">
            </v-layout>
            <v-layout justify-center v-if='idLocalidade != 0'>
              <v-btn small class="accent--text" color="transparent"
                @click.native="openCompareDialog()">
                <v-icon left>add</v-icon>
                Comparar
              </v-btn>
            </v-layout>
            <div class="display-2-obs pt-3" v-html="dimensao_ativa != null ? (dimensao_ativa.title != null ? dimensao_ativa.title : dimensao_ativa.label) : ''">
            </div>
          </v-flex>
          <!-- <div v-if="localidade !== null && localidade.tipo !== null" class="display-1-obs white--text text-xs-center pb-5">
            {{ currentContext }}
          </div> -->
          <v-layout row wrap justify-center pt-4>
            <v-flex white--text subheading xs12 md4 lg3 :class="{'px-3': $vuetify.breakpoint.mdAndDown, 'px-4': $vuetify.breakpoint.lgAndUp}" v-html="dimensao_ativa.description">
            </v-flex>
            <v-flex text-xs-center xs12 md3 :class="{'px-3': $vuetify.breakpoint.mdAndDown, 'px-4': $vuetify.breakpoint.lgAndUp}" >
              <v-layout v-if="ind_principais && ind_principais.length > 0 && unlockLoading" row wrap justify-center>
                <flpo-minicard
                  v-for="(miniCardPrincipal, indexMinicardsPrincipal) in ind_principais"
                  :key="'minicard_principal_'+indexMinicardsPrincipal"
                  :structure="miniCardPrincipal" :customFunctions="custom_functions"
                  :customParams="customParams" :row-class="miniCardPrincipal.rowClass"
                  @showSnackbar="snackAlert">
                </flpo-minicard>
              </v-layout>
            </v-flex>
            <v-flex xs12 md4 lg3 :class="{'px-3': $vuetify.breakpoint.mdAndDown, 'px-4': $vuetify.breakpoint.lgAndUp}">
              <v-flex pt-0 column wrap v-if="sections && sections.length > 0" > 
                <v-flex v-for="(cardLink, cardLinkIndx) in cardLinks"
                  :key="cardLink.id ? cardLink.id : ('sec' + cardLinkIndx)" py-0>
                  <!--<v-icon color="accent">arrow_right</v-icon>-->
                  <a v-if="cardLink.id" class="accent--text subheading" v-on:click="scrollTo('anchor_' + cardLink.id)">
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
      <v-layout v-if="sections && sections.length > 0" class="bg-page grey lighten-2" column pa-0 ma-0>
        <v-layout v-for="(secao, indexSecao) in sections"  
          :key="secao.id"
          row wrap>
          <v-layout column :id="secao.id" :style="'background-color:' + $colorsService.constructor.assessZebraBG(indexSecao, $vuetify.theme) + ';'">
            <v-flex xs12>
              <div
                :class="'display-2-obs pt-5 pb-3  ml-5 pl-3 font-weight-bold ' + $colorsService.constructor.assessZebraTitle(indexSecao, $vuetify.theme)">
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
              <v-layout column v-if="unlockLoading && secao.cards && secao.cards.length > 0 && customParams.localidade">
                <v-flex xs12 
                  v-for="(card, cardIndex) in secao.cards"
                  :key="card.id">
                  <v-layout :id="'anchor_' + card.id" ma-0 pa-0
                    :style="card.type != 'headline' && card.type != 'text' && card.type != 'presentation' ? 'min-height:500px;': ''">
                    <v-layout v-if="card.type && (card.type == 'text' || card.type == 'presentation')" :id="card.id" px-4 pb-4>
                      <flpo-composite-text
                        :structure="card.description"
                        :custom-params = "customParams"
                        :custom-functions = "custom_functions"
                        :section-index="indexSecao"
                        @showSnackbar="snackAlert">
                      </flpo-composite-text>
                    </v-layout>
                    <v-layout v-else-if="card.type && card.type == 'headline'"
                      pt-5 pb-3 ml-5 pl-2
                      :class="'display-2-obs font-weight-bold ' + $colorsService.constructor.assessZebraTitle(indexSecao, $vuetify.theme)"
                      v-html="card.title.fixed">
                    </v-layout>
                    <flpo-story-card-autofill
                      v-else-if="card.autoFill && topology && ((indexSecao*100) + cardIndex <= visibleCardMaxIndex)"
                      :structure="card"
                      :custom-params = "customParams"
                      :custom-functions = "custom_functions"
                      :topology = "topology"
                      :section-index="indexSecao"
                      @showSnackbar="snackAlert">
                    </flpo-story-card-autofill>
                    <flpo-story-card-multiple-charts
                      v-else-if="card.type && card.type == 'multiple-charts' && topology && ((indexSecao*100) + cardIndex  <= visibleCardMaxIndex)"
                      :structure="card"
                      :custom-params = "customParams"
                      :custom-functions = "custom_functions"
                      :topology = "topology"
                      :section-index="indexSecao"
                      @showBugDialog="openBugDialog"
                      @showSnackbar="snackAlert"
                      @showAuthenticatioDialog="openAuthenticatioDialog">
                    </flpo-story-card-multiple-charts>
                    <flpo-story-card
                      v-else-if="topology && ((indexSecao*100) + cardIndex  <= visibleCardMaxIndex)"
                      :structure="card"
                      :custom-params = "customParams"
                      :custom-functions = "custom_functions"
                      :topology = "topology"
                      :section-index="indexSecao"
                      @showBugDialog="openBugDialog"
                      @showSnackbar="snackAlert"
                      @showAuthenticatioDialog="openAuthenticatioDialog">
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
    <v-layout  v-if="!unlockLoading" align-center justify-center row fill-height class= "loadingPanel">
      <v-progress-circular
        :size="120"
        :width="8"
        color="grey lighten-1"
        indeterminate>
        Carregando dados
      </v-progress-circular>
    </v-layout>
    <v-dialog width="500px" v-model="compareDialog">
        <v-card>
          <v-card-title class="headline-obs">Comparar com:</v-card-title>
          <v-card-text>
          <v-layout align-right row wrap>
            <v-flex xs12>
              <v-autocomplete
                v-if="auOptions.length > 0"
                :items="computedSearchItems"
                persistent-hint
                v-model="idLocalidade_compare"
                item-text="label"
                :placeholder="localidade ? localidade.scope: ''"
                item-value="id"
                :filter="customFilter"
                @blur="idLocalidade_compare = null"
                class="input-group--focused global-search"
                return-object>
                <template slot="item" slot-scope="data">
                  <template v-if="auOptions.length < 2">
                    <v-list-tile-content>
                      <v-progress-circular :size="20" indeterminate color="primary">
                      </v-progress-circular>
                    </v-list-tile-content>
                  </template>
                  <template v-else>
                    <!--<v-list-tile-avatar>
                      <v-icon>{{ data.item.icon }}</v-icon>
                    </v-list-tile-avatar>-->
                    <v-list-tile-content>
                      <v-list-tile-title v-html="data.item.label"></v-list-tile-title>
                      <!--<v-list-tile-sub-title v-html="data.item.detail"></v-list-tile-sub-title>-->
                    </v-list-tile-content>
                  </template>
                </template>  
              </v-autocomplete>
            </v-flex>
            <v-flex xs12 text-xs-right>
              <v-btn small class="theme--light" color="accent"
                @click.native="compareDialog = false">
                <v-icon left>close</v-icon>
                Fechar
              </v-btn>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
  import axios from 'axios'

  import BaseStoryView from './BaseStoryView.vue';
  import NumberTransformService from '../assets/service/singleton/numberTransformService'

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
        isPageBottom: true,
        cardLinks: [],
        totalLinksSections: 0,
        unlockLoading: false,
        thematicDatasetQuantity: 0,
        thematicLoaded: 0,
        // isFavorite: false,
        visibleCardMaxIndex: 1, //dois primeiros cards
        auOptions: [],
        compareDialog: false,

        // Compare data
        sections_compare: [],
        idLocalidade_compare: null,
        localidade_compare: null,
        masterIndicator_compare: null,
        presentation_compare: null,
        ind_principais_compare:[],
        topology_compare: null,
        thematicDatasets: [],

        // Functions
        // TODO Migrate gradually to prototype objects
        custom_functions: {
          concat_values(indicador, value1, value2, value3 = "", value4 = "", value5 = "") {return value1 + ' ' + value2 + ' ' + value3 + ' ' + value4 + ' ' + value5; },
          calc_subtraction: function(a, b, c = 0) {  return a - (b - c); },
          calc_complemetary_absolut_from_percentage: function(percentage, abs_total) {
            return (abs_total * (100 - percentage)) / 100;
          },
          oppose: function(d, prop_ref, value_ref, prop_val) {
            if (d[prop_ref] == value_ref) {
              return -d[prop_val];
            }
            return d[prop_val];
          },
          get_bin: function(d,value,bins=[10,50,100,500]){
            // [10,50,100,500,1000,2000,5000,10000,20000,40000,50000]
            if (value == 0){
              return "Nenhum"
            }
            for (let i in bins){
              if (value <= bins[i]) {
                if (i == 0){
                  return "Até " + bins[i].toLocaleString('pt-br', {maximumFractionDigits: 0});
                } else {
                  return "De " + (bins[i-1]+1).toLocaleString('pt-br', {maximumFractionDigits: 0}) + " a " + bins[i].toLocaleString('pt-br', {maximumFractionDigits: 0});
                }
              }
            }
            // return "Mais de " + bins[bins.length-1].toLocaleString('pt-br', {maximumFractionDigits: 0});
            return value;
          },
          get_age_class: function(d,age_bin){
            if (["90 ou mais","80 a 89","70 a 79", "60 a 69"].includes(age_bin)){
              return "Idosos";
            } else {
              return "Não Idosos";
            }
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
          get_detail_value: function(d, class_indicador, value, rank_br, rank_uf, media_br, media_uf){
            let detail = "";
            // if ( type !== "(Índice)" && desc !== "PIB PER CAPITA"){
            //   detail =  NumberTransformService.formatNumber( d.pct_br, "porcentagem",2,1,false,false,false) + "BR " + 
            //     NumberTransformService.formatNumber( d.pct_uf, "porcentagem", 2,1,false,false,false) + "UF<br/>";
            // }
            if ((class_indicador == "bom" && value < media_br) || 
               (class_indicador == "ruim" && value > media_br)){
              detail += "<span class='red--text'>" + NumberTransformService.formatNumber( rank_br, "inteiro", 0) + "º no BR</span>";
            } else {
              detail += NumberTransformService.formatNumber( rank_br, "inteiro", 0) + "º no BR";
            }
            detail += " e ";
            if ((class_indicador == "bom" && value < media_uf) || 
               (class_indicador == "ruim" && value > media_uf)){
              detail += "<span class='red--text'>" + NumberTransformService.formatNumber( rank_uf, "inteiro", 0) + "º na UF</span>";
            } else {
              detail += NumberTransformService.formatNumber( rank_uf, "inteiro", 0) + "º na UF";
            }
            return detail;
          },
          get_formatted_value: function(d, value, type){
              switch(type) {
                  case '(Quantidade)':
                      return NumberTransformService.formatNumber(
                              value, "inteiro", 0);
                  case '(Índice)':
                      if(d.ds_indicador.startsWith('IDH ')){
                        if (value < 0.5){
                          return NumberTransformService.formatNumber(value, "real", 3) + " (Muito baixo)";
                        } else if (value < 0.6){
                          return NumberTransformService.formatNumber(value, "real", 3) + " (Baixo)";
                        } else if (value < 0.7){
                          return NumberTransformService.formatNumber(value, "real", 3) + " (Médio)";
                        } else if (value < 0.8){
                          return NumberTransformService.formatNumber(value, "real", 3) + " (Alto)";
                        } else {
                          return NumberTransformService.formatNumber(value, "real", 3) + " (Muito alto)";
                        }
                      } else {
                        return NumberTransformService.formatNumber(
                                value, "real", 3);
                      }
                    
                  case '(em R$ x 1.000)':
                      return NumberTransformService.formatNumber(
                              value, "monetario", 2, 1000, {format: 'monetario', precision: 1}, false,  false);
                  case '(R$)':
                      return NumberTransformService.formatNumber(
                              value, "monetario", 2, 1, null, false,  false);
                  case '(Pessoas)':
                      return NumberTransformService.formatNumber(
                              value, "inteiro", 0);
                  case '(Razão)':
                      return NumberTransformService.formatNumber(
                              value, "real", 1);
                  case '(Admitidos - Desligados)':
                      return NumberTransformService.formatNumber(
                              value, "inteiro", 0);
                  case '':
                    if (d.ds_indicador.startsWith('Remuneração Média ')){
                      return NumberTransformService.formatNumber(
                              value, "monetario", 2, 1, {format: 'monetario', precision: 1}, false,  false);
                    } else {
                      return value.toString();
                    }
                  default:
                      return value.toString();
              }
          },
          calc_subtraction_ds: function(d, a, b) { return a - b; },
          calc_addition_ids_ds: function(d, a, b, multiplier=10000000) { return a*multiplier + b; },
          calc_addition: function(a, b) { return a + b; },
          calc_percentage: function(parte,total) { return parte / total * 100},
          calc_percentage_val1: function(val1,val2) { return val1 / (val1 + val2) * 100},
          calc_percentage_2values: function(val1,val2,total) { return (val1 + val2) / total * 100},
          calc_proportion: function(dividendo, divisor) { return dividendo / divisor; },
          calc_proportion_ds: function(d,dividendo, divisor) { 
            return divisor==0 ? null:dividendo / divisor; 
          },
          get_flag_value: function(d) {return (d.vl_indicador == 0) ? d.ds_indicador_radical + ": NÃO" : d.ds_indicador_radical + ": SIM";},
          get_flag_number: function(d,a){ return a>=0 ? 'Positivo':'Negativo'; },
          get_te_label: function(d,campo) {
              switch(d[campo]) {
                  case 'te_nat':
                      return 'Vítimas que nasceram na localidade';
                  case 'te_res':
                      return 'Vítimas que residem na localidade';
                  case 'te_rgt':
                      return 'Vítimas resgatadas na localidade';
                  case 'te_sit_trab_resgatados':
                      return 'Vítimas resgatadas na localidade';
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
          get_proportional_indicator_uf: function(d,campo='vl_indicador', media="media_uf", except_ind=null) { 
            if (except_ind && d.cd_indicador == except_ind) {
              return d[campo];
            }
            return Math.log(((d[campo] - d[media]) / d[media]) + 1.01); 
          },
          get_log: function(d,campo='vl_indicador', except_ind=null) { 
            if (except_ind && d.cd_indicador == except_ind) {
              return d[campo];
            }
            return Math.log(d[campo] + 0.01); 
          },
          get_round: function(d, campo='vl_indicador') { 
            return Math.round(d[campo]); 
          },
          get_number: function(d,val) { 
            return parseFloat(val); 
          },
          get_week_status: function(d, reg_week){
            Date.prototype.getWeekNumber = function(){
              let dt = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
              let dayNum = dt.getUTCDay() || 7;
              dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
              let yearStart = new Date(Date.UTC(dt.getUTCFullYear(),0,1));
              return Math.ceil((((dt - yearStart) / 86400000) + 1)/7)
            };
            let week = new Date().getFullYear() * 100 + new Date().getWeekNumber()
            if (reg_week == week){
              return "Semana corrente";
            } else {
              return "Semana completa";
            }
          },
          get_week_year: function(d, week, week_start){
            let wee_start_ISO = new Date(week_start).toISOString().substring(0,10);
            return  wee_start_ISO.substring(0,4) + '-' + week.toString().padStart(2, '0');
          },
          get_bipolar_scale: function(d, prop, origin = 0) {
            if (d[prop] == null) return null;
            let val = d[prop] - origin;
            if (val > 0) {
              return Math.log(val / d.maxVal + 1.0001);
            }
            if (val < 0) {
               return d.minVal == 0 ? -Math.log(Math.abs(val) + 1.0001) : -Math.log(Math.abs(val) / Math.abs(d.minVal) + 1.0001);
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
          get_uti_level: (d, value) => {
            if (value == null) return "Não informado";
            if (value < 1) return "Abaixo do recomendado"; 
            if (value <= 3) return "Dentro do recomendado"; 
            if (value > 3) return "Acima do recomendado"; 
          },          
          remove_year: function(d){ return String(d.ds_indicador_radical).replace(d.nu_competencia,"").replace("  "," ")},
          absolute: function(d, campo="vl_indicador") { return Math.abs(d[campo]); },
          to_upper_ds: function(d,value_field){
            return d[value_field].toUpperCase();
          },
          format_month_ds: function(d,month_ym){
            let ym = typeof(month_ym) == "number"? month_ym.toString(): month_ym;
            return ym.substr(4,2) + "/" + ym.substr(0,4);
          },
          format_quarter_ds: function(d,quarter_yq){
            let yq = typeof(quarter_yq) == "number"? quarter_yq.toString(): quarter_yq;
            return yq.substr(5,1) + "º Trimestre " + yq.substr(0,4);
          },
          format_quarter_ds_short: function(d,quarter_yq){
            let yq = typeof(quarter_yq) == "number"? quarter_yq.toString(): quarter_yq;
            return yq.substr(5,1) + "º T " + yq.substr(0,4);
          },
          concat_descriptions: function(d) {
            return d.desc_indicador + " - " + d.ds_indicador_radical;
          },
          replace_text: function(d,field,text,text_replace){
            return d[field].replace(text,text_replace);
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
        }
      }
    },
   
    created () {
      let tmpIdObs = this.$observatories.constructor.identifyObservatory(this.$route.path.split('/')[1]);
      this.$dimensions.getDimensions(tmpIdObs)
        .then((result) => this.setSiblingDimensions(result));
      this.idObservatorio = tmpIdObs;
      
      this.$yamlFetcherService.loadYaml("br/observatorio/" + tmpIdObs)
        .then((result) => { 
          let scope = this.getEscopo(this.$route.params.idLocalidade);
          let auId = this.getIdLocalidadeFromRoute(this.$route.params.idLocalidade);
          let msgErro = this.getMensagemErro(this.$route.params.idLocalidade);
        
          let compareScope, compareAuId;
          if (this.$route.query.compare) {
            compareScope = this.getEscopo(this.$route.query.compare);
            compareAuId = this.getIdLocalidadeFromRoute(this.$route.query.compare);
          }

          let thematicDatasets = ['centralindicadores'];
          if (result && result.tematicos) {
            for (let indxTematico in result.tematicos){
              thematicDatasets.push(result.tematicos[indxTematico].dataset);
            }
          }
          
          let indicadoresTematicos = this.$indicatorsModel.getMultipleGlobalDatasets(thematicDatasets, scope, auId);
          let datasetPromises = [];

          if (indicadoresTematicos instanceof Promise || indicadoresTematicos.then) datasetPromises.push(indicadoresTematicos);
          
          if (this.$route.query.compare) {
            let indicadoresTematicosCompare = this.$indicatorsModel.getMultipleGlobalDatasets(thematicDatasets, compareScope, compareAuId, "_compare");
            if (indicadoresTematicosCompare instanceof Promise || indicadoresTematicosCompare.then) datasetPromises.push(indicadoresTematicosCompare);
          }

          if (datasetPromises.length == 0) {
            this.keepLoading();
          } else {
            Promise.all(datasetPromises).then(
              (result) => { this.keepLoading(); },
              (error) => { this.sendError(msgErro); }
            );
          }

          this.thematicDatasets = thematicDatasets;
          this.$emit('alterToolbar', result.theme.toolbar);
        });
    },
    watch: {
      idLocalidade_compare(newVal, oldVal) {
        if (newVal && (this.$route.query.compare == null || this.$route.query.compare == undefined)) {
          let url = "";
          if (this.$route.path == this.$route.fullPath) { //não tem dimensão informada na url
            url = this.$route.fullPath.replace('/localidade/','/localidadecompare/') + '?compare=' + newVal.id;
          } else {
            url = this.$route.fullPath.replace('/localidade/','/localidadecompare/') + '&compare=' + newVal.id;
          }
          this.$navigationManager.constructor.pushRoute(this.$router, url);
        }
      },
      localidade: function(){
        this.$emit('alterMiddleToolbar', { "localidade": this.localidade });
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
      },
      computedSearchItems: function() {
        if (this.idLocalidade) {
          if (this.idLocalidade.length == 7){ //município
          let items = this.auOptions;
          return items.filter(function(el) {
            return el.scope == "mun";
          })
          } else if (this.idLocalidade.length == 2){ //UF
            let items = this.auOptions;
            return items.filter(function(el) {
              return el.scope == "uf";
            })
          }
        }
      },
      
    },
    mounted: function() {
      if (!this.$analysisUnitModel.isCurrent(this.$route.params.idLocalidade)) {
        this.$analysisUnitModel.setCurrentAnalysisUnit(this.$route.params.idLocalidade);
      }
      
      this.checkCurrentAnalysisUnit();
      window.addEventListener('scroll', this.setVisibleCardMaxIndex);
      window.addEventListener('resize', this.resizeFirstSection);
      this.resizeFirstSection();

      this.$analysisUnitModel.isCurrent(this.$route.params.idLocalidade);
    },
    beforeDestroy () {
      window.removeEventListener('scroll', this.setVisibleCardMaxIndex);
      window.removeEventListener('resize', this.resizeFirstSection);
    },
    methods: {
      setSiblingDimensions(content) {
        let dimensoesTmp = [];
        for (let dim of content.dimensoes) {
          if (!dim.blocked) {
            dimensoesTmp.push(dim);
          }
        }
        this.dimensoes = dimensoesTmp;
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
        let tmpIdObs = this.$observatories.constructor.identifyObservatory(this.$route.path.split('/')[1]);
        
        this.setActiveDim(this.$route.params.idLocalidade, tmpIdObs, this.$route.query.dimensao);

        // this.$yamlFetcherService.loadYaml("br/autocard").then((result) => { this.customParams.deck = result; });

        // Carrega a topologia do município
        if (this.$route.params.idLocalidade == 0){ //Brasil
          // this.selectCoords("/static/topojson/country.json");
          this.selectCoords("br", "uf", 0);
        } else if (this.$route.params.idLocalidade.includes("mptreg") || this.$route.params.idLocalidade.includes("MPTREG")) {
          this.selectCoords("uf", "municipio", this.$analysisUnitModel.getUFFromPlace(this.$route.params.idLocalidade));
        } else if (this.$route.params.idLocalidade.includes("prt") || this.$route.params.idLocalidade.includes("PRT") ||
                   this.$route.params.idLocalidade.includes("ptm") || this.$route.params.idLocalidade.includes("PTM")) {
          this.selectCoords("uf", "municipio", this.$analysisUnitModel.getUFFromPlace(this.$route.params.idLocalidade));
        } else if (this.$route.params.idLocalidade.length == 1){ //Região
          this.selectCoords("regiao", "uf",this.$route.params.idLocalidade);
          // this.selectCoords("/static/topojson/regiao.json");
        } else if (this.$route.params.idLocalidade.length == 2){ //Estado
          this.selectCoords("uf", "municipio", this.$route.params.idLocalidade);
        } else if (this.$route.params.idLocalidade.length == 4){ //Mesorregião
          this.selectCoords("uf", "mesorregiao", this.$route.params.idLocalidade.substring(0, 2));
        } else if (this.$route.params.idLocalidade.length == 5){ //Microrregião
          this.selectCoords("uf", "microrregiao", this.$route.params.idLocalidade.substring(0, 2));
        } else {
          this.selectCoords("uf", "municipio", this.$route.params.idLocalidade.substring(0, 2));
        }

        // Carrega a topologia do município de comparação
        if (this.$route.query.compare) {
          if (this.$route.query.compare == 0){ //Brasil
            // this.selectCoords("/static/topojson/country.json");
            this.selectCoords("br", "uf", 0, "_compare");
          } else if (this.$route.query.compare.includes("mptreg") || this.$route.query.compare.includes("MPTREG")) {
            this.selectCoords("uf", "municipio", this.getUFFromPlace(this.$route.query.compare), "_compare");
          } else if (this.$route.query.compare.includes("prt") || this.$route.query.compare.includes("PRT") ||
                    this.$route.query.compare.includes("ptm") || this.$route.query.compare.includes("PTM")) {
            this.selectCoords("uf", "municipio", this.getUFFromPlace(this.$route.query.compare), "_compare");
          } else if (this.$route.query.compare.length == 1){ //Região
            this.selectCoords("regiao", "uf",this.$route.params.idLocalidade, "_compare");
            // this.selectCoords("/static/topojson/regiao.json");
          } else if (this.$route.query.compare.length == 2){ //Estado
            this.selectCoords("uf", "municipio", this.$route.query.compare, "_compare");
          } else if (this.$route.query.compare.length == 4){ //Mesorregião
            this.selectCoords("uf", "mesorregiao", this.$route.query.compare.substring(0, 2), "_compare");
          } else if (this.$route.query.compare.length == 5){ //Microrregião
            this.selectCoords("uf", "microrregiao", this.$route.query.compare.substring(0, 2), "_compare");
          } else {
            this.selectCoords("uf", "municipio", this.$route.query.compare.substring(0, 2), "_compare");
          }
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
          if (this.$route.query.compare) {
            this.$router.push('/localidade/'+idLocalidade+'?dimensao='+this.dimensao_ativa.id+'&compare='+this.$route.query.compare);
            this.$router.go('/localidade/'+idLocalidade+'?dimensao='+this.dimensao_ativa.id+'&compare='+this.$route.query.compare);
          } else {
            this.$router.push('/localidade/'+idLocalidade+'?dimensao='+this.dimensao_ativa.id);
            this.$router.go('/localidade/'+idLocalidade+'?dimensao='+this.dimensao_ativa.id);
          }
        }
      },

      loadDimCustomParams(params){
        for (let param of params){
          this.fillDataStructure(
            param, this.customParams,
            this.custom_functions, this.addDimCustomParams
          );          
        }
      },

      addDimCustomParams(dataset, args, structure, addedParams, metadata){
        this.customParams[structure.name] = dataset[0];
      },

      flagThematicLoaded() {
        ++this.thematicLoaded;
      },

      loadLayout(idLocalidade, idDimensao, idObservatorio = null) {
        this.idLocalidade = idLocalidade;
        this.idLocalidade_compare = this.$route.query.compare;

        this.customParams.idLocalidade = idLocalidade;
        this.customParams.idLocalidade_compare = this.$route.query.compare;

        // if (idLocalidade.length > 2) {
        this.customParams.cd_uf = this.idLocalidade.substring(0,2);
        if (this.idLocalidade_compare) this.customParams.cd_uf_compare = this.idLocalidade_compare.substring(0,2);
        // }
        if (idLocalidade.length > 6) {
          this.customParams.idLocalidadeD6 = this.idLocalidade.substring(0,6);
          if (this.idLocalidade_compare) this.customParams.idLocalidade_compareD6 = this.idLocalidade_compare.substring(0,6);
        }

        this.fetchDataLocalidade(this.idLocalidade);
        if (this.idLocalidade_compare) this.fetchDataLocalidade(this.idLocalidade_compare, 'localidade_compare');

        let escopo = this.getEscopo(this.idLocalidade);
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
        let escopo = this.getEscopo(this.idLocalidade);
        this.dimStruct = content;

        if (content.params){
          this.loadDimCustomParams(content.params);
        }

        let thematicDatasets = ['centralindicadores'];
        if (content && content.tematicos) {
          for (let tematico of content.tematicos){
            thematicDatasets.push(tematico.dataset);
          }
        }

        this.thematicDatasets = Object.assign(this.thematicDatasets, thematicDatasets);

        let datasetPromises = [];
        let indicadoresTematicos = this.$indicatorsModel.getMultipleGlobalDatasets(thematicDatasets, escopo, this.idLocalidade);
        if (indicadoresTematicos instanceof Promise || indicadoresTematicos.then) datasetPromises.push(indicadoresTematicos);

        if (this.$route.query.compare) {
          let indicadoresTematicosCompare = this.$indicatorsModel.getMultipleGlobalDatasets(thematicDatasets, escopo, this.idLocalidade_compare, "_compare");
          if (indicadoresTematicosCompare instanceof Promise || indicadoresTematicosCompare.then) datasetPromises.push(indicadoresTematicosCompare); 
        }

        if (datasetPromises.length == 0) {
          this.keepLoadingDimension();
        } else {
          Promise.all(datasetPromises).then(
            (result) => { this.keepLoadingDimension(); },
            (error) => { this.sendError('Falha ao carregar indicadores temáticos'); });
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

        this.fillDataStructure(
          this.dimStruct.master, this.customParams,
          this.customFunctions, this.setMasterIndicator // Defaults to masterIndicator
        );

        if (this.$route.query.compare) { // In comparison view
          this.sections_compare = this.changeToCompareStructure(this.sections);
          this.ind_principais_compare = this.changeToCompareStructure(this.ind_principais);
          this.presentation_compare = JSON.parse(JSON.stringify(this.dimStruct.presentation).replace(/centralindicadores/g,"centralindicadores_compare").replace(/idLocalidade/g,"idLocalidade_compare"));
            
          let dimStructMasterCompare = JSON.parse(JSON.stringify(this.dimStruct.master).replace(/centralindicadores/g,"centralindicadores_compare").replace(/idLocalidade/g,"idLocalidade_compare"));
          this.fillDataStructure(
            dimStructMasterCompare, this.customParams,
            this.customFunctions, this.setMasterIndicator, {indicator_var: 'masterIndicator_compare'}
          );
        }
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

      fetchDataLocalidade(idLocalidade, nm_var = 'localidade') {
        let localidade = {};
        var url = null;
        //axios(this.$axiosCallSetupService.getAxiosOptions("/municipios?categorias=nm_municipio,cd_uf,nm_uf,sigla_uf,lat,long,ano_instalacao,ano_extincao,altitude&filtros=eq-cd_municipio_ibge-" + idLocalidade))
        if (idLocalidade == 0){ //Brasil
          localidade = {
            id_localidade: 0,
            nm_localidade: 'Brasil',
            tipo: '',
            img: "/static/thumbs/municipios/" + idLocalidade + ".jpg"
          };

          this[nm_var] = localidade;
          this.customParams[nm_var] = localidade;
        } else if (idLocalidade.includes("mptreg") || idLocalidade.includes("MPTREG")) {
          localidade = this.$analysisUnitModel.getPRTPTMInstance(this, idLocalidade.substring(0,6), idLocalidade.substring(6));

          this[nm_var] = localidade;
          this.customParams[nm_var] = localidade;
        } else if (idLocalidade.includes("prt") || idLocalidade.includes("PRT") ||
                   idLocalidade.includes("ptm") || idLocalidade.includes("PTM")) {
          url = "/municipios?categorias=cd_unidade,nm_unidade,cd_uf&agregacao=distinct&filtros=eq-cd_unidade-" + idLocalidade.substring(3);
          axios(this.$axiosCallSetupService.getAxiosOptions(url))
            .then(result => {
              var infoUnidade = result.data.dataset;
              if (infoUnidade.length > 0) {
                localidade = {
                  id_localidade: infoUnidade[0].cd_unidade,
                  nm_localidade: infoUnidade[0].nm_unidade,
                  tipo: idLocalidade.substring(0,3)
                };

                this[nm_var] = localidade;
                this.customParams[nm_var] = localidade;
              }
            }, error => {
              console.error(error.toString());
              this.sendError("Falha ao buscar total das localidades");
              reject({ code: 500 });
            });
        } else if (idLocalidade.length == 1){ //Região
          localidade = {
            id_localidade: idLocalidade,
            nm_localidade: this.$analysisUnitModel.getRegion(idLocalidade),
            tipo: '',
            img: "/static/thumbs/municipios/" + idLocalidade + ".jpg"
          };

          this[nm_var] = localidade;
          this.customParams[nm_var] = localidade;
        } else if (idLocalidade.length == 2){ //Estado
          url = "/municipios?categorias=cd_uf,nm_uf&agregacao=distinct&filtros=eq-cd_uf-" + idLocalidade;
          axios(this.$axiosCallSetupService.getAxiosOptions(url))
            .then(result => {
              localidade = result.data.dataset[0];
              localidade.id_localidade = localidade.cd_uf;
              localidade.nm_localidade = localidade.nm_uf;
              localidade.tipo = 'UF';
              localidade.img = "/static/thumbs/municipios/" + idLocalidade + ".jpg";
              
              this[nm_var] = localidade;
              this.customParams[nm_var] = localidade;
            }, error => {
              console.error(error.toString());
              this.sendError("Falha ao buscar dados do município");
            });
        } else if (idLocalidade.length == 4){ //Mesorregião
          url = "/municipios?categorias=cd_mesorregiao,nm_mesorregiao&agregacao=distinct&filtros=eq-cd_mesorregiao-" + idLocalidade;
          axios(this.$axiosCallSetupService.getAxiosOptions(url))
            .then(result => {
              localidade = result.data.dataset[0];
              localidade.id_localidade = localidade.cd_mesorregiao;
              localidade.nm_localidade = localidade.nm_mesorregiao;
              localidade.tipo = 'Mesorregião';
              localidade.img = "/static/thumbs/municipios/" + idLocalidade + ".jpg";
              
              this[nm_var] = localidade;
              this.customParams[nm_var] = localidade;
            }, error => {
              console.error(error.toString());
              this.sendError("Falha ao buscar dados da mesorregião");
            });
        } else if (idLocalidade.length == 5){ //Microrregião
          url = "/municipios?categorias=cd_microrregiao,nm_microrregiao&agregacao=distinct&filtros=eq-cd_microrregiao-" + idLocalidade;
          axios(this.$axiosCallSetupService.getAxiosOptions(url))
            .then(result => {
              localidade = result.data.dataset[0];
              localidade.id_localidade = localidade.cd_microrregiao;
              localidade.nm_localidade = localidade.nm_microrregiao;
              localidade.tipo = 'Microrregião';
              localidade.img = "/static/thumbs/municipios/" + idLocalidade + ".jpg";
              
              this[nm_var] = localidade;
              this.customParams[nm_var] = localidade;
            }, error => {
              console.error(error.toString());
              this.sendError("Falha ao buscar dados da microrregião");
            });
        } else {
          url = "/municipio/" + idLocalidade;
          axios(this.$axiosCallSetupService.getAxiosOptions(url))
            .then(result => {
              localidade = result.data[0];
              localidade.id_localidade = localidade.cd_municipio_ibge_dv;
              localidade.nm_localidade = localidade.nm_municipio_uf;
              localidade.tipo = 'Município';
              localidade.img = "/static/thumbs/municipios/" + idLocalidade + ".jpg";
              
              this[nm_var] = localidade;
              this.customParams[nm_var] = localidade;
            }, error => {
              console.error(error.toString());
              this.sendError("Falha ao buscar dados do município");
            });
        }
      },

      setMasterIndicator(base_object_list, rules, structure, metadata) {
        let masterVar = (metadata && metadata.indicator_var) ? metadata.indicator_var : 'masterIndicator';
        if (typeof base_object_list == 'string') {
          this[masterVar] = base_object_list;
        } else {
          let finalText = this.$textTransformService.replaceArgs(
            structure.template,
            this.$indicatorsModel.indicatorsToValueArray(
              rules, 
              this.customFunctions, 
              base_object_list,
              this.sendInvalidInterpol
            ),
            this.sendInvalidInterpol
          );
          this[masterVar] = finalText;
        }
        this.unlockLoading = true;
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
        let viewEndpoint = this.$route.query.compare ? 'localidadecompare' : 'localidade';
        if (idDimensao) urlComplemento = '&dimensao=' + idDimensao;
        if (this.$route.query.compare) urlComplemento += '&compare=' + this.idLocalidade_compare;
        this.$router.push("/" + this.$observatories.constructor.identifyObservatoryById(idObservatorio) + "/" + viewEndpoint + "/" + idLocalidade + "?" + urlComplemento);
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
            title: this.$textTransformService.applyInterpol(
                structure,
                this.customParams,
                this.customFunctions,
                base_object,
                this.sendInvalidInterpol
                )}
            // title: this.$textTransformService.replaceArgs(
            //   structure.template,
            //   this.$indicatorsModel.indicatorsToValueArray(
            //     structure.args, 
            //     this.customFunctions, 
            //     base_object_list,
            //     this.sendInvalidInterpol
            //   ),
            // this.sendInvalidInterpol
            // )
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

      changeToCompareStructure(struct){}, // Only needed in comparison extension

      openCompareDialog() {
        let auOptions = null;
        while (auOptions == null) {
          auOptions = this.$analysisUnitModel.getSearchDataset();
          setTimeout(() => {}, 10);
        }
        if ((auOptions instanceof Promise) || auOptions.then) {
          auOptions.then((result) => { this.auOptions = result });
        } else if (Array.isArray(auOptions) && auOptions.length > 0) {
          let first = auOptions[0];
          if ((first instanceof Promise) || first.then) {
            Promise.all(auOptions)
              .then((results) => {
                this.auOptions = this.$analysisUnitModel.getOptions();
                this.compareDialog = true;
              })
              .catch((error) => {
                this.auOptions = this.$analysisUnitModel.getOptions();
                this.sendError("Falha ao buscar lista das localidades");
              });
          } else {
            this.auOptions = auOptions;  
            this.compareDialog = true;
          }
        } else {
          this.auOptions = auOptions;
          this.compareDialog = true;
        }
      }

      // TODO Revisar isso aqui, jogando para algum controle de preferências (App-wide) do usuário logado
      // toggleFavorite() {
      //   if (this.isFavorite) {
      //     if (this.$cookies.isKey("currentAnalysisUnit")) {
      //       this.$cookies.remove("currentAnalysisUnit");
      //     }
      //     this.$store.state.favLocation = null;
      //   } else {
      //     this.$cookies.set("currentAnalysisUnit", this.$route.params.idLocalidade, -1);
      //     this.$store.state.favLocation = this.$route.params.idLocalidade;
      //   }
      //   this.isFavorite = !this.isFavorite;
      // }
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
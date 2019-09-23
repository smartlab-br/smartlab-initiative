<script>
  import axios from 'axios'

  import FLPOBaseLayout from './FLPOBaseLayout.vue';

  export default {
    extends: FLPOBaseLayout,
    props: ['selectedPlace', 'chartPosition'],
    data () {
      return {
        customFilters: {},
        reactiveFilter: null
      }
    },
    created () {

      let structure = this.structure;
      if (structure.card_template) { // API Card
        let url = this.$textTransformService.replaceArgs(
          "/cardtemplate/{0}?datasource={1}&cd_indicador='{2}'&cd_analysis_unit={3}",
          [ structure.card_template,
            structure.datasource,
            structure.cd_indicador,
            this.selectedPlace ? this.selectedPlace : this.customParams.idLocalidade ]
        );
        if (structure.coefficient) url = url + "&coefficient=" + structure.coefficient;
        if (structure.term) {
          if (typeof structure.term == "string") {
            url = url + "&term=" + structure.term;
          } else if (structure.term.template){
            url = url + "&term=" + this.$textTransformService.applyInterpol(
                                                  structure.term,
                                                  this.customParams,
                                                  this.customFunctions,
                                                  {});
          }
        }
        axios(this.$axiosCallSetupService.getAxiosOptions(url))
          .then(result => {
            structure = Object.assign(structure, result.data);
            this.structure = structure;
            this.completeStructure();
            this.fillDataStructure(
              this.structure.title, this.customParams,
              this.customFunctions, this.setComplexAttribute,
              { attribute: 'cmpTitle' }
            );
            this.fillDataStructure(
              this.structure.title_comment, this.customParams,
              this.customFunctions, this.setComplexAttribute,
              { attribute: 'cmpTitleComment' }
            );
            this.fetchData();
          }, error => {
            console.error(error.toString());
            this.sendError("Falha ao buscar dados de card");
            reject({ code: 500 });
          });
      } else {
        this.completeStructure();
        this.fillDataStructure(
          this.structure.title, this.customParams,
          this.customFunctions, this.setComplexAttribute,
          { attribute: 'cmpTitle' }
        );
        this.fillDataStructure(
          this.structure.title_comment, this.customParams,
          this.customFunctions, this.setComplexAttribute,
          { attribute: 'cmpTitleComment' }
        );
        this.fetchData();
      }
      
    },
    computed: {
      loadingStatusDataset: function() {
        if (this.errorDataset) return 'ERROR';
        if (this.dataset !== null && this.dataset !== undefined) {
          return 'SUCCESS';
        }
        return 'LOADING';
      }
    },
    mounted: function() {
      // this.fetchData();
    },
    methods: {
      removeFormatItems(headers){
        let items = JSON.parse(JSON.stringify(headers));
        for(var item in items){
          items[item].value = String(items[item].value).replace("fmt_","");
        }
        return items;
      },
      
      indicatorClass(previous_class, value, target, curve, threshold=null) {
        return previous_class + ' red';
      },

      changeTextToInvalidInterpol(payload) {
        this.invalidInterpol = true;
      },

      setReferenceInStructure(){
        if(!this.structure.info || this.structure.info[this.structure.info.length-1].title != "Referência"){
          let indTitle = [];
          let indText = [];
          let indMinicards = [];
          let indGrafico = [];
          let textReference = "";
          if(this.structure.type && this.structure.type == "multiple-charts"){
            for(let chart in this.structure.charts){
              indGrafico.push.apply(indGrafico,this.getIndicatorsFromStructure(this.structure.charts[chart]));
            }
            if (indGrafico.length > 0){
              indGrafico = indGrafico.filter(function (value, index, self) { 
                return self.indexOf(value) === index;
                });
              textReference = "Gráfico/Mapa: " + indGrafico.join(", ")
            }
          } else {
            indGrafico.push.apply(indGrafico,this.getIndicatorsFromStructure(this.structure));
            if (indGrafico.length > 0){
              textReference = "Gráfico/Mapa: " + indGrafico.join(", ")
            }
          }
          if (this.structure.title){
              indTitle.push.apply(indTitle,this.getIndicatorsFromStructure(this.structure.title));
          }
          if (this.structure.title_comment){
              indTitle.push.apply(indTitle,this.getIndicatorsFromStructure(this.structure.title_comment));
          }
          if (indTitle.length > 0){
            indTitle = indTitle.filter(function (value, index, self) { 
              return self.indexOf(value) === index;
              });
            textReference += "<br/>Título/Subtítulo: " + indTitle.join(", ")
          }

          for(let itemDescription in this.structure.description){
            if (this.structure.description[itemDescription].type == "text"){
              indText.push.apply(indText,this.getIndicatorsFromStructure(this.structure.description[itemDescription].content));
            }else if (this.structure.description[itemDescription].type == "minicards"){
              for(let minicard in this.structure.description[itemDescription].cards){
                indMinicards.push.apply(indMinicards,this.getIndicatorsFromStructure(this.structure.description[itemDescription].cards[minicard]));
              }
            }
          }
          if (indMinicards.length > 0){
            indMinicards = indMinicards.filter(function (value, index, self) { 
              return self.indexOf(value) === index;
              });
            textReference += "<br/>Minicards: " + indMinicards.join(", ")
          }
          if (indText.length > 0){
            indText = indText.filter(function (value, index, self) { 
              return self.indexOf(value) === index;
              });
            textReference += "<br/>Texto: " + indText.join(", ")
          }

          if(textReference.length > 0){
            let infoRef = {title: "Referência", type: "text", content:{fixed:textReference}};
            if (!this.structure.info){
              this.structure.info = [];
            }
            this.structure.info.push(infoRef);
          }
        }
      },

      getIndicatorsFromStructure(structItem){
        let indicadores = [];
        let url = "";
        let urlIndicadores = "";
        for(let item in structItem){
          if(item == "preloaded"){
            if(Array.isArray(structItem[item].id)){
              indicadores.push.apply(indicadores,structItem[item].id);
            } else {
              indicadores.push(structItem[item].id);
            }
          }
          if(item == "api"){
            let structApi = structItem[item];

						if (!Array.isArray(structApi)) {
              structApi = [structApi];
            }

            for(let structApiItem of structApi){
              if (structApiItem.template){
                url = structApiItem.template;
              } else{
                url = structApiItem.fixed;
              }

              let patterns = [ '-cd_indicador-', '-cd_indicador_spai-' ];
              for (let pattern of patterns) {
                let indexCdIndicador = url.indexOf(pattern);
                if (indexCdIndicador != -1) {
                  indexCdIndicador += pattern.length;
                  if (url.indexOf(',',indexCdIndicador) != -1){
                    urlIndicadores = url.substring(indexCdIndicador,url.indexOf(',',indexCdIndicador));
                  } else if (url.indexOf('&',indexCdIndicador) != -1){
                    urlIndicadores = url.substring(indexCdIndicador,url.indexOf('&',indexCdIndicador));
                  } else {
                    urlIndicadores = url.substring(indexCdIndicador);
                  }
                  urlIndicadores = urlIndicadores.replace(/'/g,"");
                  urlIndicadores = urlIndicadores.split("-");
                  indicadores.push.apply(indicadores,urlIndicadores);
                }  
              }
            }
          }
        }
        indicadores = indicadores.filter(function (value, index, self) { 
          return self.indexOf(value) === index;
          });
        return indicadores;
      },

      setFilter(payload) {

        //Limpa filtros dos selects que tem payload como pai (parent)
        for (let item of this.structure.description) {
          if (item.type &&  item.type == "select" && payload.id.includes(item.parent)){
            this.customFilters[item.selection.rules.api.args[0].named_prop] = null;
          }
        }

        if (payload.type && payload.type === 'switch-group') {
          this.customParams.enabled = payload.enabled;
        } else if (payload.type && payload.type === 'check') {
          this.customFilters[payload.id] = payload.value;
        } else if (payload.type && payload.type === 'radio') {
          this.customParams.enabled = payload.enabled;
          if (payload.item == null || payload.item == undefined){
            this.customFilters.radioApi = null;
          } else {
            this.customFilters.radioApi = payload.item.api;
            this.customFilters.filterUrl = "";
          }
        } else if (payload.type && payload.type === 'slider') {
          if (Array.isArray(payload.value)){
            this.customFilters.value_min = payload.value[0];
            this.customFilters.value_max = payload.value[1];
          } else {
            this.customFilters.value = payload.value;
          }
        } else {
          //Registra no customFilters
          if (payload.item == null || payload.item == undefined){
            this.customFilters[payload.rules.api.args[0].named_prop] = null;
          } else {
            let item_value = "";
            if (Array.isArray(payload.item)){
              let value = "";
              let value_label = "";
              let i = 0
              for (let item of payload.item){
                item_value = item[payload.rules.api.args[0].named_prop];
                if(typeof item_value === 'string'){
                  //substitui a vírgula e o hífen por '\,' e '\-'
                  item_value = item_value.replace(/,/g,"\\,"); 
                  item_value = item_value.replace(/-/g,"\\-"); 
                
                  if (i == 0) {
                    value += "'" + item_value + "'";
                    value_label += item.label;
                  } else {
                    value += "-'" + item_value + "'";
                    value_label += ", " + item.label;
                  }
                } else {
                  if (i == 0) {
                    value += item_value;
                    value_label += item.label;
                  } else {
                    value += "-" + item_value;
                    value_label += ", " + item.label;
                  }
                }
                i++;
              }
              this.customFilters[payload.rules.api.args[0].named_prop] = value;
              this.customFilters[payload.rules.api.args[0].named_prop + "_label"] = value_label;
            } else {
              item_value = payload.item[payload.rules.api.args[0].named_prop];
              if(typeof item_value === 'string'){
                //substitui a vírgula e o hífen por '\,' e '\-'
                item_value = item_value.replace(/,/g,"\\,"); 
                item_value = item_value.replace(/-/g,"\\-"); 
              }
              this.customFilters[payload.rules.api.args[0].named_prop] = item_value;
              this.customFilters[payload.rules.api.args[0].named_prop + "_label"] = payload.item.label;
            }
          }
        }
      },

      getFilters() {
        let filterText = "";
        let filterUrl = "";
        for (let filter of this.structure.description) {
          if (filter.group == null || filter.group == undefined || filter.group == this.activeGroup){
            if (filter.type == "slider" || filter.type == "select"){
              if (this.customFilters[filter.selection.rules.api.args[0].named_prop]){
                filter.selection.rules.api.template = filterUrl + filter.selection.rules.filter
                filterUrl = this.$textTransformService.applyInterpol(filter.selection.rules.api, {}, this.customFunctions, this.customFilters);
                filterText += "<br/>" + (filter.title ? filter.title + ": " : filter.label ? filter.label+ ": " : "");
                if (filter.type == "slider"){
                  if (filter.selection.rules.api.args.length > 1){
                    if (this.customFilters[filter.selection.rules.api.args[0].named_prop] != this.customFilters[filter.selection.rules.api.args[1].named_prop]) {
                      filterText += this.customFilters[filter.selection.rules.api.args[0].named_prop] + " a " + this.customFilters[filter.selection.rules.api.args[1].named_prop];
                    } else {
                      filterText += this.customFilters[filter.selection.rules.api.args[0].named_prop];
                    }
                  } else {
                    filterText += this.customFilters[filter.selection.rules.api.args[0].named_prop];
                  }
                } else {
                  filterText += this.customFilters[filter.selection.rules.api.args[0].named_prop + "_label"];
                }
              }
            } else if (filter.type == "check"){
              if (this.customFilters[filter.id]){
                filterUrl = filterUrl + filter.selection.rules.filter;
                filterText += "<br/>" + filter.selection.rules.filter_text;
              }
            }
          }
        }
        this.customFilters.filterUrl = filterUrl;
        this.customFilters.filterText = filterText;
        return filterUrl;
      },

      triggerDefaultSelect(payload){
        this.setFilter(payload);
      },

      triggerSelect(payload) {
        this.setFilter(payload);
        this.reactiveFilter = payload.item ? payload.item : payload.value;
        this.updateDataStructure(payload);
      },

    }
  }
</script>

<style>

  .title-comment {
    display: block;
    font-family: Palanquin, Calibri, sans-serif !important;
    font-size: 0.857rem;
    font-weight: 200;
    line-height: 1rem;
    color: rgb(239,97,69);
  }

  .sankey-link:hover {
    stroke-opacity: .5 !important;
  }
  
</style>

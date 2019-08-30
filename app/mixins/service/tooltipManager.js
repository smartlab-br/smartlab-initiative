// import colors from 'vuetify/es5/util/colors'

const TooltipManager = {
  install(Vue, options) {
    Vue.mixin({
      data() {
        return {
        }
      },
      methods: {
        removeFromLabel(label,removed_text_list){
          for(var indxText in removed_text_list){
            if (Array.isArray(label)){
              for(var label_item in label){
                label[label_item] = String(label[label_item]).replace(removed_text_list[indxText],"");
              }
            } else {
              label = String(label).replace(removed_text_list[indxText],"");
            }
          }
          return label;
        },
        
        defaultTooltip(d, tooltip_list = [], removed_text_list = [], options = null) { 
          let text = "";
          let table = "";
          let value = "";
          let filter = "";

          if (options && options.filterText){
            filter = "<br/><hr class='tooltip_divider'>";
            filter += "<br/>Considerados os seguintes filtros: " + options.filterText;
          }
          
          for(var item in tooltip_list){
            value = this.removeFromLabel(d[tooltip_list[item].value],removed_text_list);
            if (tooltip_list[item].format){
              let formatRules = tooltip_list[item];
              value = this.$numberTransformService.formatNumber(
                value, formatRules.format, formatRules.precision, formatRules.multiplier, formatRules.collapse, formatRules.signed, formatRules.uiTags
              );
            }

            
            if (value == 'null') {
              if (options != null && options.null_value != null) {
                value = options.null_value;
              }
            }

            table = "<table width='100%'>";
            if(item == 0){ //Título
              if (options && options.clickable && options.type == "bubbles"){ // leaflet bubbles
                text += "<p class='text-xs-right ma-0'><a href='" + this.getUrlByPlace(d.cd_mun_ibge) + "' class='primary--text font-weight-black'>IR PARA</a></p>";
              }
              text += "<p class='headline-obs'><b>" + value + "</b></p>";
              text += "<hr class='tooltip_divider'>";
            } else {
              if (Array.isArray(value)){
                for(var value_item_tb in value){
                  table += "<tr><td class='font-weight-bold'>" + tooltip_list[item].text + ":</td><td class='text-xs-right'>" + value[value_item_tb] + "</td></tr>";
                }
              } else {
                table += "<tr><td class='font-weight-bold'>" + tooltip_list[item].text + ":</td><td class='text-xs-right'>" + value + "</td></tr>";
              }

            }
            table += "</table>";
            text += table;
          }

        
          if (text == '') text = 'Tooltip!';
          text += filter; 
          if (options && options.clickable && options.type != "bubbles"){ //topojson
            text += "<br/><hr class='tooltip_divider'>";
            text += "<br/><em>Clique na unidade geográfica para carregá-la</em>";
          }
          return text;
        },
        getUrlByPlace(idLocalidade){
          let obsAtual = this.identifyObservatory(this.$route.path.split('/')[1]);
          
          let url = '';
          url = "/" + this.identifyObservatoryById(obsAtual) + '/localidade/' + idLocalidade + '?';  

          if (this.$route.query && this.$route.query.dimensao) {
            url = url + '&dimensao=' + this.$route.query.dimensao;
          }
          return url;
        }
      }
    })
  }
}

export default TooltipManager;
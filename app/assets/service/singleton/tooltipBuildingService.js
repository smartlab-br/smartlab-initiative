import NumberTransformService from "./numberTransformService";

class TooltipBuilingService {
  constructor() {
    this.numberTransformService = new NumberTransformService();
  }

  removeFromLabel(label,removed_text_list){
    for(let indxText in removed_text_list){
      if (Array.isArray(label)){
        for(let label_item in label){
          label[label_item] = String(label[label_item]).replace(removed_text_list[indxText],"");
        }
      } else {
        label = String(label).replace(removed_text_list[indxText],"");
      }
    }
    return label;
  }
  
  defaultTooltip(d, route, tooltip_list = [], removed_text_list = [], options = null) { 
    let text = "";
    let table = "";
    let value = "";
    let filter = "";

    if (options && options.filterText){
      filter = "<br/><hr class='tooltip_divider'>";
      filter += "<br/>Considerados os seguintes filtros: " + options.filterText;
    }
    
    for(let item in tooltip_list){
      value = this.removeFromLabel(d[tooltip_list[item].value],removed_text_list);
      if (tooltip_list[item].format){
        let formatRules = tooltip_list[item];
        value = this.numberTransformService.formatNumber(
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
          text += "<p class='text-xs-right ma-0'><a href='" + this.getUrlByPlace(d.cd_mun_ibge, route) + "' class='primary--text font-weight-black'>IR PARA</a></p>";
        }
        text += "<p class='headline-obs'><b>" + value + "</b></p>";
        text += "<hr class='tooltip_divider'>";
      } else {
        if (Array.isArray(value)){
          for(let value_item_tb in value){
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
  }

  getUrlByPlace(idLocalidade, route){
    let obsAtual = this.identifyObservatory(route.path.split('/')[1]);
    
    let url = '';
    url = "/" + this.identifyObservatoryById(obsAtual) + '/localidade/' + idLocalidade + '?';  

    if (route.query && route.query.dimensao) {
      url = url + '&dimensao=' + route.query.dimensao;
    }
    return url;
  }
}

export default TooltipBuilingService;
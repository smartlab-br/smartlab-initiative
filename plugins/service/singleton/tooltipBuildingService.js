// import NumberTransformService from './numberTransformService'
// import ObservatoriesModel from '../../model/singleton/observatoriesModel'

export class TooltipBuildingService {

  constructor(context) {
    this.context = context;
    this.removeFromLabel = this.removeFromLabel.bind(this)
    this.defaultTooltip = this.defaultTooltip.bind(this)
  }

  removeFromLabel (label,removed_text_list) {
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
    // let table = "";
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
        value = this.context.$numberTransformService.formatNumber(
          value, formatRules.format, formatRules.precision, formatRules.multiplier, formatRules.collapse, formatRules.signed, formatRules.uiTags
        );
      }

      
      if (value == 'null') {
        if (options != null && options.null_value != null) {
          value = options.null_value;
        }
      }

      if(item == 0){ //Título
        if (options && options.clickable && options.visibleLayers){ // leaflet
          text += "<p class='text-xs-right ma-0'><a href='" + TooltipBuildingService.getUrlByPlace(d.cd_mun_ibge?d.cd_mun_ibge:d.cd_municipio_ibge_dv, route) + "' class='primary--text font-weight-black'>IR PARA</a></p>";
        }
        text += "<p class='headline-obs'><b>" + value + "</b></p>";
        text += "<hr class='tooltip_divider'>";
        text += "<table width='100%' style='max-width:350px'>";
      } else {
        if (!Array.isArray(value)){
        //   for(let value_item_tb in value){
        //     table += "<tr><td class='font-weight-bold'>" + tooltip_list[item].text + ":</td><td class='text-xs-right'>" + value[value_item_tb] + "</td></tr>";
        //   }
        // } else {
          text += "<tr style='vertical-align:top'><td class='font-weight-bold'>" + tooltip_list[item].text + ":</td><td class='text-xs-right'>" + value + "</td></tr>";
        }

      }
    }
    if (tooltip_list && tooltip_list.length > 0){
      text += "</table>";
    }
    
    if (text == '') text = 'Tooltip!';
    text += filter; 
    if (options && options.clickable && options.visibleLayers == undefined){ //topojson
      text += "<br/><hr class='tooltip_divider'>";
      text += "<br/><em>Clique na unidade geográfica para carregá-la</em>";
    }
    return text;
  }

  defaultLeafletTooltip(target, route, tooltip_list = [], removed_text_list = [], options = null) { 
    let d = target.options.rowData;
    target.unbindPopup();
    target.bindPopup(TooltipBuildingService.defaultTooltip(d, route, tooltip_list, removed_text_list, options)).openPopup();
  }

  getUrlByPlace(idLocalidade, route){
    let obsAtual = this.context.$observatories.identifyObservatory(route.path.split('/')[1]);
    
    let url = '';
    url = "/" + this.context.$observatories.identifyObservatoryById(obsAtual) + '/localidade/' + idLocalidade + '?';  

    if (route.query && route.query.dimensao) {
      url = url + '&dimensao=' + route.query.dimensao;
    }
    return url;
  }
}

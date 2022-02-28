import { NumberTransformService } from "plugins/service/numberTransform"
import { ObservatoryService } from "plugins/service/observatory"

class TooltipBuildingService {
  constructor() {}

  static removeFromLabel(label: string | string[], removed_text_list: string[]){
    for(const rem of removed_text_list){
      if (Array.isArray(label)){
        for(let label_item in label){
          label[label_item] = String(label[label_item]).replace(rem,"");
        }
      } else {
        label = String(label).replace(rem,"");
      }
    }
    return label;
  }
  
  static defaultTooltip(d: any, route: any, tooltip_list: any[] = [], removed_text_list: string[] = [], options: any = null) { 
    let text = "";
    // let table = "";
    let value = "";
    let filter = "";

    if (options && options.filterText){
      filter = "<br/><hr class='tooltip_divider'>";
      filter += "<br/>Considerados os seguintes filtros: " + options.filterText;
    }
    
    let isFirst: boolean = true
    for(const tooltip of tooltip_list){
      value = TooltipBuildingService.removeFromLabel(d[tooltip.value],removed_text_list) as string;
      if (tooltip.format){
        let formatRules = tooltip;
        value = NumberTransformService.formatNumber({
          valor: parseFloat(value),
          formato: formatRules.format,
          casasDecimais: formatRules.precision,
          multiplier: formatRules.multiplier,
          collapse: formatRules.collapse,
          signed: formatRules.signed,
          uiTags: formatRules.uiTags
        }).toString();
      }

      
      if (value == 'null') {
        if (options != null && options.null_value != null) {
          value = options.null_value;
        }
      }

      if(isFirst){ //Título
        if (options && options.clickable && options.visibleLayers){ // leaflet
          text += "<p class='text-xs-right ma-0'><a href='" + TooltipBuildingService.getUrlByPlace(d.cd_mun_ibge?d.cd_mun_ibge:d.cd_municipio_ibge_dv, route) + "' class='primary--text font-weight-black'>IR PARA</a></p>";
        }
        text += "<p class='headline-obs'><b>" + value + "</b></p>";
        text += "<hr class='tooltip_divider'>";
        text += "<table width='100%' style='max-width:350px'>";
        isFirst = false
      } else {
        if (!Array.isArray(value)){
        //   for(let value_item_tb in value){
        //     table += "<tr><td class='font-weight-bold'>" + tooltip_list[item].text + ":</td><td class='text-xs-right'>" + value[value_item_tb] + "</td></tr>";
        //   }
        // } else {
          text += "<tr style='vertical-align:top'><td class='font-weight-bold'>" + tooltip.text + ":</td><td class='text-xs-right'>" + value + "</td></tr>";
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

  static defaultLeafletTooltip(target: any, route: any, tooltip_list: any[] = [], removed_text_list: string[] = [], options: any = null) { 
    let d = target.options.rowData;
    target.unbindPopup();
    target.bindPopup(TooltipBuildingService.defaultTooltip(d, route, tooltip_list, removed_text_list, options)).openPopup();
  }

  static getUrlByPlace(idLocalidade: string, route: any){
    let obsAtual: string = ObservatoryService.identifyObservatory(route.path.split('/')[1]);
    
    let url = '';
    url = "/" + ObservatoryService.identifyObservatoryById(obsAtual) + '/localidade/' + idLocalidade + '?';  

    if (route.query && route.query.dimensao) {
      url = url + '&dimensao=' + route.query.dimensao;
    }
    return url;
  }
}

export default TooltipBuildingService;
import { NumberTransformService } from "./numberTransform"
// import { Smartlab } from "../../model/smartlab"
// import { useMainStore } from "~/store"
// const store = useMainStore()

export class TooltipBuildingService {

  static removeFromLabel(label: string | string[], removed_text_list: string[]){
    for(const rem of removed_text_list){
      if (Array.isArray(label)){
        for(const label_item in label){
          label[label_item] = String(label[label_item]).replace(rem,"")
        }
      } else {
        label = String(label).replace(rem,"")
      }
    }
    return label
  }
  
  static defaultTooltip(d: any, route: any, store: any, tooltip_list: any[] | null = [], removed_text_list: string[] = [], options: any = null) { 
    let text = ""
    // let table = ""
    let value = ""
    let filter = ""

    if (options && options.filterText){
      filter = "<br/><hr class='tooltip_divider'>"
      filter += "<br/>Considerados os seguintes filtros: " + options.filterText
    }
    
    let isFirst: boolean = true
    if (tooltip_list) {
      for(const tooltip of tooltip_list){
        value = TooltipBuildingService.removeFromLabel(d[tooltip.value],removed_text_list) as string
        if (tooltip.format){
          const formatRules = tooltip
          value = (new NumberTransformService).formatNumber(
            parseFloat(value),
            formatRules.format,
            formatRules.precision,
            formatRules.multiplier,
            formatRules.collapse,
            formatRules.signed,
            formatRules.uiTags
          ).toString()
        }

        
        if (value == "null") {
          if (options != null && options.null_value != null) {
            value = options.null_value
          }
        }

        if(isFirst){ //Título
          if (options && options.clickable && options.visibleLayers){ // leaflet
            text += "<p class='text-xs-right ma-0'><a href='" + TooltipBuildingService.getUrlByPlace(d.cd_mun_ibge?d.cd_mun_ibge:d.cd_municipio_ibge_dv, route, store) + "' class='text-primary font-weight-black'>IR PARA</a></p>"
          }
          text += "<p class='headline-obs'><b>" + value + "</b></p>"
          text += "<hr class='tooltip_divider'>"
          text += "<table width='100%' style='max-width:350px'>"
          isFirst = false
        } else {
          if (!Array.isArray(value)){
            text += "<tr style='vertical-align:top'><td class='font-weight-bold'>" + tooltip.text + ":</td><td class='text-xs-right'>" + value + "</td></tr>"
          } else {
            text += "<tr style='vertical-align:top'><td class='font-weight-bold'>" + tooltip.text + ":</td><td class='text-xs-right'>" + value.join(", ") + "</td></tr>"
          }
        }
      }
      
      if (tooltip_list && tooltip_list.length > 0){
        text += "</table>"
      }
    }
    
    if (text == "") text = "Tooltip!"
    text += filter
    if (options && options.clickable && options.visibleLayers == undefined){ //topojson
      text += "<br/><hr class='tooltip_divider'>"
      text += "<br/><em>Clique na unidade geográfica para carregá-la</em>"
    }
    return text
  }

  static defaultLeafletTooltip(target: any, route: any, tooltip_list: any[] = [], removed_text_list: string[] = [], options: any = null) { 
    const d = target.options.rowData
    target.unbindPopup()
    target.bindPopup(TooltipBuildingService.defaultTooltip(d, route, tooltip_list, removed_text_list, options)).openPopup()
  }

  static getUrlByPlace(idLocalidade: string, route: any, store: any){
  
    let url = ""
    url = store.currentObs.to + "/localidade/" + idLocalidade + "?"

    if (route.query && route.query.dimensao) {
      url = url + "&dimensao=" + route.query.dimensao
    }
    return url
  }
}
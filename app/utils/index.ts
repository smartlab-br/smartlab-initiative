export { ColorsService } from "./service/singleton/colors"
export { NumberTransformService } from "./service/singleton/numberTransform"
export { DateFormatService } from "./service/singleton/dateFormat"
export { ObjectTransformService } from "./service/singleton/objectTransform"
export { TextTransformService } from "./service/singleton/textTransform"

/** Converte classes CSS do Vuetify 2 para Vuetify 3 */
export const normalizeCls = (cls: string): string =>
  cls
    .replace(/\btext-xs-center\b/g, 'text-center')
    .replace(/\btext-xs-left\b/g, 'text-left')
    .replace(/\btext-xs-right\b/g, 'text-right')
    .replace(/\btext-sm-center\b/g, 'text-sm-center')
    .replace(/\btext-md-center\b/g, 'text-md-center')
export { UrlTransformService } from "./service/singleton/urlTransform"
// export { Smartlab } from "./model/smartlab"
export { TooltipBuildingService } from "./service/singleton/tooltipBuilding"
export { YamlFetcherService } from "./service/singleton/yamlFetcher"
export { ChartBuilderService } from "./service/singleton/chartBuilder"
export { GeneralChartBuilderService } from "./service/chart/generalChartBuilder"

export { IDH } from "./model/idh"
export { Indicators } from "./model/indicators"
export { AnalysisUnit } from "./model/analysisUnit"
// export { Dimensions } from "./model/dimensions"


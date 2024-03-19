import colors from "vuetify/lib/util/colors.mjs"
import { type ThemeDefinition, useTheme } from "vuetify"
import  * as d3chrom  from "d3-scale-chromatic"

export class ColorsService {
  // constructor() {}
  
  static getColorScale(scale: string | null = null, type: string | null = "categorical", order: string = "asc", levels: number | null = null) {
    let size: number | null = null
    if (!order) order = "asc"
    if (!type) type = "categorical"

    if (!scale) {
      if (type == "categorical") scale = "Set3"
      if (type == "singleHue") scale = "Blues"
      if (type == "divergent") scale = "RdYlBu"
    }

    if (type !== "categorical") size = levels ? levels : 8

    let scl: string[] | string[][] = d3chrom[`scheme${scale}` as keyof typeof d3chrom] as string[] | string[][]
    if (!scl) {
      if (type == "categorical") scale = "Set3"
      if (type == "singleHue") scale = "Blues"
      if (type == "divergent") scale = "RdYlBu"
      scl = d3chrom[`scheme${scale}` as keyof typeof d3chrom] as string[] | string[][]
    }

    if (size) scl = scl[size] as string[]

    return order == "desc" ? scl.slice().reverse() : scl
  }

  static getColorFromScale(scale: string, position: number, levels: number) {
    const scaleFunction: (t: number) => string = d3chrom[`interpolate${scale}` as keyof typeof d3chrom] as (t: number) => string
    return scaleFunction(position / levels)
  }

  static getColorFromCategoricalScale(scale: string, position: number) {
    const schemeArray: string[] = d3chrom[`scheme${scale}` as keyof typeof d3chrom] as string[]
    return schemeArray[position % schemeArray.length]
  }
  
  // static rgb2hex(rgb: string){
  //   const rgbMatch = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i)
  //   return (rgbMatch && rgbMatch.length === 4) ? "#" +
  //     ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  //     ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  //     ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : ""
  // }

  static changeTheme(obsId: string | null = null) {
    return (obsId) ? useTheme().global.name.value = obsId : useTheme().global.name.value = "default"
  }

  static getThemeFromId (id: string) {
    const themes = useTheme().computedThemes.value
    if (id) {
      return Object.assign({}, themes[id].colors ? themes[id].colors : themes["default"].colors)
    } else {
      return Object.assign({}, themes["default"].colors)
    }
  }

  static getCurrentTheme () {
    return useTheme().current.value.colors
  }

  static assessZebraBG(index: number, theme: ThemeDefinition) {
    if (theme === null || theme === undefined) { theme = useTheme().current.value }
    if (index % 2 == 0) {
      return theme.colors && theme.colors.background  ? theme.colors.background : ""
    } else {
      return theme.colors && theme.colors.background2 ? theme.colors.background2 : ""
    }
  }

  static getClassIfIsDark(hex: string | null, index: number, theme: ThemeDefinition){
    let bgColor: string
    if (hex == null) {
      if (index != null) {
        bgColor = ColorsService.assessZebraBG(index, theme)
      } else {
        return ""
      }
    } else {
      bgColor = hex
    }
    bgColor = bgColor.replace("#", "")
    
    const c_r = parseInt(bgColor.substr(0, 2), 16)
    const c_g = parseInt(bgColor.substr(2, 2), 16)
    const c_b = parseInt(bgColor.substr(4, 2), 16)
    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000

    if (brightness < 155) return "theme--dark"
    return ""
  }

  static assessZebraTitle(index: number = 0, theme: ThemeDefinition) {
    if (ColorsService.getClassIfIsDark(ColorsService.assessZebraBG(index, theme), index, theme) == "theme--dark") return "text-white"
    return ""
  }

  static assessZebraTitleColor(index: number = 0, opacity: number | null = null, theme: ThemeDefinition) {
    if (ColorsService.getClassIfIsDark(ColorsService.assessZebraBG(index, theme), index, theme) == "theme--dark"){
      if (opacity == null) return "white"
      return "rgba(255, 255, 255, " + opacity + ")"
    }
    if (opacity == null) return "black"
    return "rgba(0, 0, 0, " + opacity + ")"
  }

  static assessZebraAxesColor(index: number = 0, theme: ThemeDefinition) {
    if (ColorsService.getClassIfIsDark(ColorsService.assessZebraBG(index, theme), index, theme) == "theme--dark") return "white"
    return colors.grey.base
  }
}

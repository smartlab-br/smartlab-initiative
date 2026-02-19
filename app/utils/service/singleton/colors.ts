import colors from "vuetify/lib/util/colors.mjs"
import { type ThemeDefinition, useTheme } from "vuetify"
import  * as d3chrom  from "d3-scale-chromatic"

export const ColorsService = {
  getColorScale(
    scale: string | null = null,
    type: string | null = "categorical",
    order: string = "asc",
    levels: number | null = null
  ) {
    let size: number | null = null
    if (!order) order = "asc"
    if (!type) type = "categorical"

    if (!scale) {
      if (type == "categorical") scale = "Set3"
      if (type == "singleHue") scale = "Blues"
      if (type == "divergent") scale = "RdYlBu"
    }

    if (type !== "categorical") size = levels ?? 8

    let scl: string[] | string[][] = d3chrom[`scheme${scale}` as keyof typeof d3chrom] as string[] | string[][]
    if (!scl) {
      if (type == "categorical") scale = "Set3"
      if (type == "singleHue") scale = "Blues"
      if (type == "divergent") scale = "RdYlBu"
      scl = d3chrom[`scheme${scale}` as keyof typeof d3chrom] as string[] | string[][]
    }

    if (size) scl = scl[size] as string[]

    return order == "desc" ? scl.slice().reverse() : scl
  },

  getColorFromScale(scale: string, position: number, levels: number) {
    const scaleFunction: (t: number) => string = d3chrom[`interpolate${scale}` as keyof typeof d3chrom] as (t: number) => string
    return scaleFunction(position / levels)
  },

  getColorFromCategoricalScale(scale: string, position: number) {
    const schemeArray: string[] = d3chrom[`scheme${scale}` as keyof typeof d3chrom] as string[]
    return schemeArray[position % schemeArray.length]
  },

  // rgb2hex(rgb: string){
  //   const rgbMatch = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i)
  //   return (rgbMatch && rgbMatch.length === 4) ? "#" +
  //     ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  //     ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  //     ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : ""
  // },

  changeTheme(obsId: string | null = null) {
    const theme = useTheme()
    theme.change(obsId ?? "default")
    return theme.global.name.value
  },

  getThemeFromId(id: string) {
    const themes = useTheme().computedThemes.value
    return { ...(themes[id]?.colors ?? themes["default"]?.colors)}
  },

  getCurrentThemeColors() {
    return useTheme().current.value.colors
  },

  assessZebraBG(index: number, themeColors: ThemeDefinition["colors"]) {
    themeColors ??= useTheme().current.value.colors;
    if (index % 2 == 0) {
      return themeColors.background ? themeColors.background : ""
    } else {
      return themeColors.background2 ? themeColors.background2 : ""
    }
  },

  getClassIfIsDark(hex: string | null, index: number, theme: ThemeDefinition) {
    let bgColor: string
    if (hex == null) {
      if (index == null) {
        return ""
      } else {
        bgColor = ColorsService.assessZebraBG(index, theme.colors)
      }
    } else {
      bgColor = hex
    }
    bgColor = bgColor.replace("#", "")

    const c_r = Number.parseInt(bgColor.substring(0, 2), 16)
    const c_g = Number.parseInt(bgColor.substring(2, 4), 16)
    const c_b = Number.parseInt(bgColor.substring(4, 6), 16)
    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000

    if (brightness < 155) return "theme--dark"
    return ""
  },

  assessZebraTitle(index: number, theme: ThemeDefinition) {
    if (
      ColorsService.getClassIfIsDark(
        ColorsService.assessZebraBG(index, theme.colors),
        index,
        theme
      ) == "theme--dark"
    )
      return "text-white"
    return ""
  },

  assessZebraTitleColor(index: number, opacity: number | null, theme: ThemeDefinition) {
    if (
      ColorsService.getClassIfIsDark(
        ColorsService.assessZebraBG(index, theme.colors),
        index,
        theme
      ) == "theme--dark"
    ) {
      if (opacity == null) return "white"
      return "rgba(255, 255, 255, " + opacity + ")"
    }
    if (opacity == null) return "black"
    return "rgba(0, 0, 0, " + opacity + ")"
  },

  assessZebraAxesColor(index: number, theme: ThemeDefinition) {
    if (
      ColorsService.getClassIfIsDark(
        ColorsService.assessZebraBG(index, theme.colors),
        index,
        theme
      ) == "theme--dark"
    )
      return "white"
    return colors.grey.base
  }
}

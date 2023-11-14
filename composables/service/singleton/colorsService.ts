import colors from "vuetify/lib/util/colors.mjs"
import { type ThemeDefinition } from "vuetify"
import * as d3chrom from "d3-scale-chromatic"

interface IDictThemeLibrary {
  [key: string]: ThemeDefinition;
}

const THEME_LIBRARY: IDictThemeLibrary = {
  default: {
    colors: {
      primary: colors.grey.darken4,
      secondary: colors.grey.darken3,
      accent: colors.cyan.accent1,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.grey.darken4,
      background: "#EFEFEF",
      background2: colors.grey.lighten2
    }
  },
  td: {
    colors: {
      primary: colors.blueGrey.darken4,
      secondary: colors.blueGrey.lighten4,
      accent: colors.cyan.accent4,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.blueGrey.darken4,
      background: "#EFEFEF",
      background2: colors.grey.lighten2
    }
  },
  te: {
    colors: {
      primary: colors.brown.darken4,
      secondary: colors.brown.lighten4,
      accent: colors.cyan.accent4,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.brown.darken4,
      background: "#EFEFEF",
      background2: colors.grey.lighten2
    }
  },
  sst: {
    colors: {
      primary: colors.teal.darken4,
      secondary: colors.teal.lighten4,
      accent: colors.orange.accent2,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.teal.darken4,
      background: "#EFEFEF",
      background2: colors.grey.lighten2
    }
  },
  ti: {
    colors: {
      primary: colors.lightBlue.darken4,
      secondary: colors.blue.lighten4,
      accent: colors.orange.accent2,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.lightBlue.darken4,
      background: "#EFEFEF",
      background2: colors.grey.lighten2
    }
  },
  des: {
    colors: {
      primary: colors.deepPurple.darken4,
      secondary: colors.deepPurple.lighten4,
      accent: colors.yellow.accent4,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.deepPurple.darken4,
      background: "#EFEFEF",
      background2: colors.grey.lighten2
    }
  },
  cov: {
    colors: {
      primary: colors.deepOrange.darken4,
      secondary: colors.deepOrange.lighten4,
      accent: colors.teal.accent4,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.deepOrange.darken4,
      background: "#EFEFEF",
      background2: colors.grey.lighten2
    }
  },
  est: {
    colors: {
      primary: colors.blueGrey.darken4,
      secondary: colors.blueGrey.lighten4,
      accent: colors.cyan.accent4,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.blueGrey.darken4,
      background: "#EFEFEF",
      background2: colors.grey.lighten2
    }
  }
}

export class ColorsService {
  // constructor() {}
  
  static getColorScale(scale: string | null = null, type: string = "categorical", order: string = "asc", levels: number | null = null) {
    let size: number | null = null
    if (!order) order = "asc"
    if (!type) type = "categorical"

    if (!scale) {
      if (type == "categorical") scale = "Set3"
      if (type == "singleHue") scale = "Blues"
      if (type == "divergent") scale = "RdYlBu"
    }

    if (type !== "categorical") size = levels ? levels : 8
    
    let scl: any = d3chrom[`scheme${scale}` as keyof typeof d3chrom]
    if (!scl) {
      if (type == "categorical") scale = "Set3"
      if (type == "singleHue") scale = "Blues"
      if (type == "divergent") scale = "RdYlBu"
      scl = d3chrom[`scheme${scale}` as keyof typeof d3chrom]
    }

    if (size) scl = scl[size]
    return order == "desc" ? scl.reverse() : scl
  }

  // static getColorFromScale(scale: string, position: number, levels: number, order: string = "asc") {
  //   let scaleFunction: any = d3chrom[`interpolate${scale}` as keyof typeof d3chrom]
  //   return scaleFunction(position / levels)
  // }

  // static getColorFromCategoricalScale(scale: string, position: number) {
  //   let schemeArray: any = d3chrom[`scheme${scale}` as keyof typeof d3chrom]
  //   return schemeArray[position % schemeArray.length]
  // }
  
  // static rgb2hex(rgb: string){
  //   const rgbMatch = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i)
  //   return (rgbMatch && rgbMatch.length === 4) ? "#" +
  //     ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  //     ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  //     ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : ""
  // }

  static getThemeFromId(id: string) {
    return (id && THEME_LIBRARY[id]) ? THEME_LIBRARY[id] : THEME_LIBRARY["default"]
  }

  static assessZebraBG(index: number, theme: ThemeDefinition) {
    if (theme === null || theme === undefined) { theme = THEME_LIBRARY["default"] }
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
    if (ColorsService.getClassIfIsDark(ColorsService.assessZebraBG(index, theme), index, theme) == "theme--dark") return "white--text"
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

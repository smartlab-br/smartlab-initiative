import colors from 'vuetify/es5/util/colors'
import * as d3chrom from 'd3-scale-chromatic'

class Theme {
  primary: string
  secondary: string
  accent: string
  error: string
  warning: string
  info: string
  success: string
  toolbar: string
  background: string
  background2: string

  constructor(
    primary: string, secondary: string, accent: string, error: string, 
    warning: string, info: string, success: string, toolbar: string,
    background: string, background2: string) {
    this.primary = primary
    this.secondary = secondary
    this.accent = accent
    this.error = error
    this.warning = warning
    this.info = info
    this.success = success
    this.toolbar = toolbar
    this.background = background
    this.background2 = background2
  }
}

interface IDictThemeLibrary {
  [key: string]: Theme;
}

const THEME_LIBRARY: IDictThemeLibrary = {
  default: new Theme(
    colors.grey.darken4, colors.grey.darken3, colors.cyan.accent1,
    colors.red.base, colors.amber.base, colors.blue.base, colors.green.base,
    colors.grey.darken4, "#EFEFEF", colors.grey.lighten2
  ),
  td: new Theme(
    colors.blueGrey.darken4, colors.blueGrey.lighten4, colors.cyan.accent4,
    colors.red.base, colors.amber.base, colors.blue.base, colors.green.base,
    colors.blueGrey.darken4, "#EFEFEF", colors.grey.lighten2
  ),
  te: new Theme(
    colors.brown.darken4, colors.brown.lighten4, colors.cyan.accent4,
    colors.red.base, colors.amber.base, colors.blue.base, colors.green.base,
    colors.brown.darken4, "#EFEFEF", colors.grey.lighten2
  ),
  sst: new Theme(
    colors.teal.darken4, colors.teal.lighten4, colors.orange.accent2,
    colors.red.base, colors.amber.base, colors.blue.base, colors.green.base,
    colors.teal.darken4, "#EFEFEF", colors.grey.lighten2
  ),
  ti: new Theme(
    colors.lightBlue.darken4, colors.blue.lighten4, colors.orange.accent2,
    colors.red.base, colors.amber.base, colors.blue.base, colors.green.base,
    colors.lightBlue.darken4, "#EFEFEF", colors.grey.lighten2
  ),
  des: new Theme(
    colors.deepPurple.darken4, colors.deepPurple.lighten4, colors.yellow.accent4,
    colors.red.base, colors.amber.base, colors.blue.base, colors.green.base,
    colors.deepPurple.darken4, "#EFEFEF", colors.grey.lighten2
  ),
  cov: new Theme(
    colors.deepOrange.darken4, colors.deepOrange.lighten4, colors.teal.accent4,
    colors.red.base, colors.amber.base, colors.blue.base, colors.green.base,
    colors.deepOrange.darken4, "#EFEFEF", colors.grey.lighten2
  ),    
  est: new Theme(
    colors.blueGrey.darken4, colors.blueGrey.lighten4, colors.cyan.accent4,
    colors.red.base, colors.amber.base, colors.blue.base, colors.green.base,
    colors.blueGrey.darken4, "#EFEFEF", colors.grey.lighten2
  )
}

interface IScale {
  [key: number]: string
}

type TInterpolateFunction = (a: number) => string

class ColorsService {
  // constructor() {}
  
  static getColorScale(scale: string | null = null, type: string = 'categorical', order: string = 'asc', levels: number | null = null) {
    let size = null;
    if (!order) order = 'asc';
    if (!type) type = 'categorical';

    if (!scale) {
      if (type == 'categorical') scale = 'Set3';
      if (type == 'singleHue') scale = 'Blues';
      if (type == 'divergent') scale = 'RdYlBu';
    }

    if (type !== 'categorical') size = levels ? levels : 8;
    
    let scl: any = d3chrom[`scheme${scale}` as keyof typeof d3chrom];
    if (!scl) {
      if (type == 'categorical') scale = 'Set3';
      if (type == 'singleHue') scale = 'Blues';
      if (type == 'divergent') scale = 'RdYlBu';
      scl = d3chrom[`scheme${scale}` as keyof typeof d3chrom];
    }

    if (size) scl = scl[size];
    return order == 'desc' ? scl.reverse() : scl
  }

  static getColorFromScale(scale: string, position: number, levels: number, order: string = 'asc') {
    let scaleFunction: any = d3chrom[`interpolate${scale}` as keyof typeof d3chrom]
    return scaleFunction(position / levels);
  }

  static getColorFromCategoricalScale(scale: string, position: number) {
    let schemeArray: any = d3chrom[`scheme${scale}` as keyof typeof d3chrom];
    return schemeArray[position % schemeArray.length];
  }
  
  static rgb2hex(rgb: string){
    let rgbMatch = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgbMatch && rgbMatch.length === 4) ? "#" +
      ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
  }

  static getThemeFromId(id: string) {
    return (id && THEME_LIBRARY[id]) ? THEME_LIBRARY[id] : THEME_LIBRARY["default"]
  }

  static assessZebraBG(index: number, theme: string | null) {
    let thm: Theme = theme && THEME_LIBRARY[theme] ? THEME_LIBRARY[theme] : THEME_LIBRARY["default"]
    let alternativa = index % 2;
    if (alternativa == 1) return thm.background2;
    return thm.background;
  }

  static getClassIfIsDark(hex: string, index: number, theme: string | null){
    if (hex == null) {
      if (index != null) {
        hex = ColorsService.assessZebraBG(index, theme);
      } else {
        return "";
      }
    }
    hex = hex.replace('#', '');
    
    const c_r = parseInt(hex.substr(0, 2), 16);
    const c_g = parseInt(hex.substr(2, 2), 16);
    const c_b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;

    if (brightness < 155) return "theme--dark";
    return "";          
  }

  static assessZebraTitle(index: number = 0, theme: string | null = null) {
    if (ColorsService.getClassIfIsDark(ColorsService.assessZebraBG(index, theme), index, theme) == "theme--dark") return 'white--text';
    return '';
  }

  static assessZebraTitleColor(index: number = 0, opacity: number | null = null, theme: string | null = null) {
    if (ColorsService.getClassIfIsDark(ColorsService.assessZebraBG(index, theme), index, theme) == "theme--dark"){
      if (opacity == null) return 'white';
      return "rgba(255, 255, 255, " + opacity + ")";
    }
    if (opacity == null) return 'black';
    return "rgba(0, 0, 0, " + opacity + ")";
  }

  static assessZebraAxesColor(index: number = 0, theme: string | null = null) {
    if (ColorsService.getClassIfIsDark(ColorsService.assessZebraBG(index, theme), index, theme) == "theme--dark") return 'white';
    return colors.grey.base;
  }
}

const getColorsService = function({ app, store }: any, inject: any) {
  // Inject $hello(msg) in Vue, context and store.
  inject('getColorsService', ColorsService)
}

export default function({ app }: any, inject: any) {
  inject('getColorsService', ColorsService)
}
export { ColorsService }
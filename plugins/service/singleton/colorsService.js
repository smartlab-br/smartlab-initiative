import colors from 'vuetify/es5/util/colors'
import * as d3chrom from 'd3-scale-chromatic'

export class ColorsService {
  _themeLibrary = {
    default: {
      primary: colors.grey.darken4,
      secondary: colors.grey.darken3,
      accent: colors.cyan.accent1,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.grey.darken4,
      background: '#EFEFEF',
      background2: colors.grey.lighten2
    },
    td: {
      primary: colors.blueGrey.darken4,
      secondary: colors.blueGrey.lighten4,
      accent: colors.cyan.accent4,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.blueGrey.darken4,
      background: '#EFEFEF',
      background2: colors.grey.lighten2
    },
    te: {
      primary: colors.brown.darken4,
      secondary: colors.brown.lighten4,
      accent: colors.cyan.accent4,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.brown.darken4,
      background: '#EFEFEF',
      background2: colors.grey.lighten2
    },
    sst: {
      primary: colors.teal.darken4,
      secondary: colors.teal.lighten4,
      accent: colors.orange.accent2,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.teal.darken4,
      background: '#EFEFEF',
      background2: colors.grey.lighten2
    },
    ti: {
      primary: colors.lightBlue.darken4,
      secondary: colors.blue.lighten4,
      accent: colors.orange.accent2,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.lightBlue.darken4,
      background: '#EFEFEF',
      background2: colors.grey.lighten2
    },
    des: {
      primary: colors.deepPurple.darken4,
      secondary: colors.deepPurple.lighten4,
      accent: colors.yellow.accent4,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.deepPurple.darken4,
      background: '#EFEFEF',
      background2: colors.grey.lighten2
    },
    cov: {
      primary: colors.deepOrange.darken4,
      secondary: colors.deepOrange.lighten4,
      accent: colors.teal.accent4,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.deepOrange.darken4,
      background: '#EFEFEF',
      background2: colors.grey.lighten2
    },
    est: {
      primary: colors.blueGrey.darken4,
      secondary: colors.blueGrey.lighten4,
      accent: colors.cyan.accent4,
      error: colors.red.base,
      warning: colors.amber.base,
      info: colors.blue.base,
      success: colors.green.base,
      // Custom
      toolbar: colors.blueGrey.darken4,
      background: '#EFEFEF',
      background2: colors.grey.lighten2
    }
  }

  constructor () {
    this.assessZebraTitleColor = this.assessZebraTitleColor.bind(this)
  }

  getColorScale (scale = null, type = 'categorical', order = 'asc', levels = null) {
    let size = null
    if (order === undefined || order === null) {
      order = 'asc'
    }

    if (type === null || type === undefined) { type = 'categorical' }

    if (scale === null || scale === undefined) {
      if (type == 'categorical') { scale = 'Set3' }
      if (type == 'singleHue') { scale = 'Blues' }
      if (type == 'divergent') { scale = 'RdYlBu' }
    }

    if (type !== 'categorical') {
      size = levels || 8
    }

    let scl = d3chrom['scheme' + scale]
    if (scl === null || scl === undefined) {
      if (type == 'categorical') { scale = 'Set3' }
      if (type == 'singleHue') { scale = 'Blues' }
      if (type == 'divergent') { scale = 'RdYlBu' }
      scl = d3chrom['scheme' + scale]
    }

    if (size) { scl = scl[size] }
    if (order == 'desc') {
      const scl2 = []
      for (let n = scl.length - 1; n >= 0; n--) {
        scl2.push(scl[n])
      }
      return scl2
    }
    return scl
  }

  getColorFromScale (scale, position, levels, order = 'asc') {
    const schemeName = 'interpolate' + scale
    return d3chrom[schemeName](position / levels)
  }

  getColorFromCategoricalScale (scale, position) {
    const schemeName = 'scheme' + scale
    const schemeArray = d3chrom[schemeName]
    return schemeArray[position % schemeArray.length]
  }

  rgb2hex (rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i)
    return (rgb && rgb.length === 4)
      ? '#' +
      ('0' + parseInt(rgb[1], 10).toString(16)).slice(-2) +
      ('0' + parseInt(rgb[2], 10).toString(16)).slice(-2) +
      ('0' + parseInt(rgb[3], 10).toString(16)).slice(-2)
      : ''
  }

  getThemeFromId (id) {
    if (id) {
      return Object.assign({}, this._themeLibrary[id] ? this._themeLibrary[id] : this._themeLibrary.default)
    } else {
      return Object.assign({}, this._themeLibrary.default)
    }
  }

  assessZebraBG (index, theme) {
    if (theme === null || theme === undefined) { theme = this._themeLibrary.default }
    const alternativa = index % 2
    if (alternativa == 1) { return theme.background2 }
    return theme.background
  }

  getClassIfIsDark (hex, index, theme) {
    if (hex == null) {
      if (index != null) {
        hex = this.assessZebraBG(index, theme)
      } else {
        return ''
      }
    }
    hex = hex.replace('#', '')

    const c_r = parseInt(hex.substr(0, 2), 16)
    const c_g = parseInt(hex.substr(2, 2), 16)
    const c_b = parseInt(hex.substr(4, 2), 16)
    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000

    if (brightness < 155) { return 'theme--dark' }
    return ''
  }

  assessZebraTitle (index = 0, theme = null) {
    if (this.getClassIfIsDark(this.assessZebraBG(index, theme), theme) == 'theme--dark') { return 'white--text' }
    return ''
  }

  assessZebraTitleColor (index = 0, opacity = null, theme = null) {
    if (this.getClassIfIsDark(this.assessZebraBG(index, theme), theme) == 'theme--dark') {
      if (opacity == null) { return 'white' }
      return 'rgba(255, 255, 255, ' + opacity + ')'
    }
    if (opacity == null) { return 'black' }
    return 'rgba(0, 0, 0, ' + opacity + ')'
  }

  assessZebraAxesColor (index = 0, theme = null) {
    if (this.getClassIfIsDark(this.assessZebraBG(index, theme), theme) == 'theme--dark') { return 'white' }
    return colors.grey.base
  }
}

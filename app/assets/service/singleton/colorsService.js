import * as d3chrom from 'd3-scale-chromatic'

class ColorsService {
  constructor() {}
  
  getColorScale(scale = null, type = 'categorical', order = 'asc', levels = null) {
    let size = null;
    if (order === undefined || order === null) {
      order = 'asc';
    }
    
    if (type === null || type === undefined) type = 'categorical';

    if (scale === null || scale === undefined) {
      if (type == 'categorical') scale = 'Set3';
      if (type == 'singleHue') scale = 'Blues';
      if (type == 'divergent') scale = 'RdYlBu';
    }

    if (type !== 'categorical') {
      size = levels ? levels : 8;
    }

    let scl = d3chrom["scheme" + scale];
    if (size) scl = scl[size];
    if (order == 'desc') {
      let scl2 = [];
      for (var n = scl.length -1; n >= 0; n--) {
        scl2.push(scl[n]);
      }
      return scl2;
    }
    return scl;
  }

  getColorFromScale(scale, position, levels, order = 'asc') {
    let schemeName = "interpolate" + scale;
    return d3chrom[schemeName](position / levels);
  }

  getColorFromCategoricalScale(scale, position) {
    let schemeName = "scheme" + scale;
    let schemeArray = d3chrom[schemeName];
    return schemeArray[position % schemeArray.length];
  }
  
  rgb2hex(rgb){
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
      ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
  }
}

export default ColorsService;
const D3PlusChartBuilderService = require('./d3plusChartBuilderService')

class StackedLineChartBuilderService extends D3PlusChartBuilderService {
  prepareChart (viz, slicedDS, containerId, options, additionalOptions) {
    if (options.id === null || options.id === undefined) {
      for (const row of slicedDS) {
        if (options.id === null || options.id === undefined) { row.series_id = '1' }
      }
    }

    const grafico = viz
      .select(containerId) // container DIV to hold the visualization
      .data(slicedDS) // data to use with the visualization
      .label((d) => { return additionalOptions.cleanLabel(d[options.text], options.removed_text_list) })
      .groupBy(options.id) // key for which our data is unique on
      .y(options.y) // key to use for y-axis
      .x(options.x) // key to use for x-axis
      .detectResize(true)

    return grafico
  }

  generateViz (options, additionalOptions) {
    const tooltip_function = additionalOptions.tooltipFunction
    const tooltip_context = additionalOptions.context ? additionalOptions.context : null
    const removed_text_list = options.removed_text_list

    let xConfig = this.constructor.getDefaultXYConfig(additionalOptions.axesStrokeClass)
    let yConfig = this.constructor.getDefaultXYConfig(additionalOptions.axesStrokeClass)

    if (options.x_options && options.x_options.axis === false) { xConfig = this.constructor.getTransparentXYConfig() }
    if (options.y_options && options.y_options.axis === false) { yConfig = this.constructor.getTransparentXYConfig() }

    const areaConfig = {
      strokeWidth: options.stroke ? options.stroke : 2,
      labelConfig: { fontFamily: additionalOptions.fontFamily ? additionalOptions.fontFamily : this._fontFamily }
    }

    if (options.colorScale) {
      areaConfig.stroke = additionalOptions.colorHandlers.getColorScale(options.colorScale.name)
    } else if (options.color !== null && options.color !== undefined) {
      areaConfig.stroke = options.color
    }

    let viz = new this.d3plus.StackedArea()
      .noDataHTML(this.noDataMessage)
      .loadingHTML(this.loadingMessage)
      .shapeConfig({
        labelConfig: { fontFamily: additionalOptions.fontFamily ? additionalOptions.fontFamily : this._fontFamily },
        Area: areaConfig
      })
      .legendConfig({
        shapeConfig: {
          labelConfig: { fontColor: additionalOptions.colorHandlers.assessZebraTitleColor(additionalOptions.sectionIndex, null, additionalOptions.theme) }
        }
      })
      .xConfig(xConfig)
      .yConfig(yConfig)
      .tooltipConfig({
        body: function (d) {
          if (tooltip_function instanceof String) {
            return tooltip_context[tooltip_function].apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options])
          } else {
            return tooltip_function.apply(tooltip_context, [d, additionalOptions.route, additionalOptions.headers, removed_text_list, options])
          }
        },
        title: function (d) {
          return ''
        }
      })

    if (options.legend !== null && options.legend !== undefined && options.legend) {
      viz = viz.legend({ value: true, filters: true })
    }
    if (options.format !== null && options.format !== undefined) {
      viz = viz.format(options.format)
    }

    // Definições da legenda
    if (options.hide_legend !== null && options.hide_legend !== undefined && options.hide_legend) {
      viz = viz.legend(false)
    } else if (options.legend !== null && options.legend !== undefined && options.legend) {
      viz = viz.legend({ value: true, filters: true })
    } else if (options.legend !== null && options.legend !== undefined && !options.legend) {
      viz = viz.legend({ value: false })
    }

    return viz
  }
}

module.exports = StackedLineChartBuilderService

import { LeafletChartBuilderService } from "./leafletChartBuilderService"
import * as L from "leaflet"

class ExtendedCircle extends L.Circle { 
  constructor(latlng: L.LatLngExpression, options?: L.CircleOptions & { rowData?: any, customOptions?: any }) {
    super(latlng, options)
  }
}

export class BubblesChartBuilderService extends LeafletChartBuilderService {
  radius: { multiplier: number; base: number }
  constructor () {
    super()
    this.radius = { multiplier: 1600000, base: 5000 }
    // this.fCircleSize = this.d3.scaleLog().range([1, 4001])
  }

  fillLayers (dataset: any, options: any) {
    // Sets the bubbles size handlers
    if (options && options.radius && options.radius.multiplier) { this.radius.multiplier = options.radius.multiplier }
    if (options && options.radius && options.radius.base) { this.radius.base = options.radius.base }

    // if (boundsZoom == null) { boundsZoom = this.chart.getZoom() }
    let boundsZoom: number = 1
    if (options.idAU) {
      boundsZoom = options.idAU == "0" ? 1 : 7
    } else {
      const bounds = this.getBounds(dataset, options)
      if (this.chart){
        boundsZoom = bounds ? this.chart.getBoundsZoom(bounds) : 1
      }
    }
    const zoomIndex: number = boundsZoom > 5 ? Math.pow(boundsZoom / 4, 4) : 1

    const multiplier: number = this.radius.multiplier / zoomIndex

    const value_field: string = options.value_field ? options.value_field : "api_calc_ln_norm_pos_part"
    const id_field: string = options.id_field ? options.id_field : "cd_indicador"

    for (const ident of options.indicadores) {
      const group = new this.L.FeatureGroup()
      if (this.chart) {
        group.addTo(this.chart)
      }      
      this.layers[ident] = group
    }

    // Iterates over the dataset, to build each circle and apply to the respective layer
    for (const each_row of dataset) {
      if (each_row[options.lat] && each_row[options.long] &&
                each_row[options.lat] != 0 && each_row[options.long] != 0) {
        // Iterates over the layers
        for (const [pos, ident] of options.indicadores.entries()) {
          // Checks if the row is for the layer (moves to next if different)
          if (ident != each_row[id_field]) { continue }

          // Gets the value for each layer
          const value = each_row[value_field]

          // Builds the circle
          const eachCircle = new ExtendedCircle(
            [each_row[options.lat], each_row[options.long]],
            {
              rowData: each_row,
              color: options.color != null
                ? options.color
                : (options.colorArray != null
                  ? options.colorArray[pos]
                  : (each_row.color != null ? each_row.color : "#4A148C")
                ),
              weight: options.weight != null ? options.weight : (each_row.weight != null ? each_row.weight : 1),
              fillColor: options.fillColor != null
                ? options.fillColor
                : (options.colorArray != null
                  ? options.colorArray[pos]
                  : (each_row.fillColor != null ? each_row.fillColor : "#4A148C")
                ),
              fillOpacity: options.fillOpacity != null
                ? options.fillOpacity
                : (each_row.fillOpacity != null ? each_row.fillOpacity : 0.3),
              radius: value != null ? value > 0 ? value * multiplier + this.radius.base : 0 : 0,
              customOptions: options
            }
          ).on("click", this.circleClick)

          eachCircle.addTo(this.layers[ident])
        }
      }
    }

    this.adjustVisibleLayers(options.visibleLayers)
  }

  adjustVisibleLayers (enabled: any) {
    this.additionalOptions.visibleLayers = enabled
    const bounds = this.L.latLngBounds([])
    for (const indx in enabled) {
      if (enabled[indx]) {
        this.chart?.addLayer(this.layers[indx])
        bounds.extend(this.layers[indx].getBounds())
      } else {
        this.chart?.removeLayer(this.layers[indx])
      }
      // this.visibleLayers[indx] = options.enabled[indx];
    }
    this.fitBounds(bounds)
  }

  getBounds (dataset: any, options: any) {
    const bounds = this.L.latLngBounds([])
    for (const each_row of dataset) {
      bounds.extend([each_row[options.lat], each_row[options.long]])
    }
    return bounds
  }
}

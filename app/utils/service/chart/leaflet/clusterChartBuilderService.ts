import { MarkerClusterGroup } from "leaflet"
import { LeafletChartBuilderService } from "./leafletChartBuilderService"
import * as L from "leaflet"

class ExtendedMarker extends L.Marker { 
  constructor(latlng: L.LatLngExpression, options?: L.MarkerOptions & { rowData?: any, customOptions?: any }) {
    super(latlng, options)
  }
}

export class ClusterChartBuilderService extends LeafletChartBuilderService {

  fillLayers (dataset: any, options: any) {
    // default icon = blue
    const defaultIcon = new this.L.Icon({
      iconUrl: "/markers/marker-icon-2x-blue.png",
      shadowUrl: "/markers/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })

    if (options.markerIcons && options.indicadores) {
      for (const indicator of options.indicadores) {
        if (options.markerIcons[indicator] && typeof options.markerIcons[indicator] === "string") {
          options.markerIcons[indicator] = new this.L.Icon({
            iconUrl: "/markers/marker-icon-2x-" + options.markerIcons[indicator].toString() + ".png",
            shadowUrl: "/markers/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        }
      }
    }

    const mapLayer: MarkerClusterGroup = this.L.markerClusterGroup()
    const id_field: string = options.id_field ? options.id_field : "cd_indicador"

    for (const each_row of dataset) {
      if (options.visibleLayers[each_row[id_field]]) {
        mapLayer.addLayer(
          new ExtendedMarker(
            [each_row[options.lat], each_row[options.long]],
            {
              rowData: each_row,
              icon: (options.markerIcons && options.markerIcons[each_row[id_field]] && typeof options.markerIcons[each_row[id_field]] !== "string") ? options.markerIcons[each_row[id_field]] : defaultIcon,
              customOptions: options
            }
          ).on("click", this.circleClick)
        )
      }
    }

    this.mapLayer = mapLayer
    this.chart?.addLayer(mapLayer)
    this.fitBounds(mapLayer.getBounds())
  }

  adjustVisibleLayers (enabled: any) {
    this.chart?.removeLayer(this.mapLayer)
    this.additionalOptions.visibleLayers = enabled
    this.fillLayers(this.dataset, Object.assign(this.options, this.additionalOptions))
  }
}

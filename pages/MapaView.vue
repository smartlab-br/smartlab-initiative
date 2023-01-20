<template>
  <v-layout row wrap class="map_geo_full">
    <v-flex xs4 class="pa-4 filter_section">
      <v-layout class="headline-obs">
        Apresentação
      </v-layout>

      <!-- Tipo de mapa a ser plotado -->
      <v-autocomplete
        v-model="mapType"
        :items="mapTypes"
        label="Tipo de Mapa"
        item-text="name"
        item-value="id"
        return-object
      />

      <v-layout class="headline-obs">
        Dados
      </v-layout>

      <!-- Área do mapa que deve ser estudada -->
      <v-layout row wrap>
        <v-autocomplete
          v-model="place"
          :items="places"
          label="Escopo"
          item-text="label"
          item-value="id"
          return-object
        >
          <template slot="item" slot-scope="data">
            <template>
              <v-list-tile-avatar>
                <v-icon>{{ data.item.icon }}</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title v-html="data.item.label" />
                <v-list-tile-sub-title v-html="data.item.detail" />
              </v-list-tile-content>
            </template>
          </template>
        </v-autocomplete>
        <v-progress-circular
          v-if="placesStatus !== 'SUCCESS'"
          size="20"
          class="mt-4"
          :indeterminate="placesStatus == 'LOADING'"
          :value="placesStatus == 'LOADING' ? 0 : 100"
          :color="placesStatus == 'ERROR' ? 'error' :
            (placesStatus == 'LOADING' ? 'warning' : 'success')"
          background-color="primary"
        />
      </v-layout>

      <!-- Agregação dos dados de indicador (uf, microrregião etc) -->
      <v-autocomplete
        v-model="mapAggregation"
        :items="mapAggregations"
        label="Agregação"
        item-text="name"
        item-value="id"
        return-object
      />

      <!-- Indicadores a serem apresentados -->
      <v-layout class="title-obs">
        Indicadores
      </v-layout>
      <!-- Múltiplos indicadores quando for mapa de bolhas -->
      <v-list v-show="mapType == null || mapType == undefined || mapType.id == 'bubbles'">
        <v-divider />
        <v-list-tile
          v-for="eachSelectedIndicator in selectedIndicators"
          :key="'sel_indic_' + eachSelectedIndicator.id"
        >
          <v-list-tile-action>
            <v-switch
              v-model="eachSelectedIndicator.visible"
              class="ma-0"
              :color="eachSelectedIndicator.color !== null ? eachSelectedIndicator.color : 'primary'"
              @change="toggleLayer(eachSelectedIndicator)"
            />
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ eachSelectedIndicator.id }}
            </v-list-tile-title>
            <v-list-tile-sub-title>
              {{ eachSelectedIndicator.label }}
            </v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-icon @click="removeLayer(eachSelectedIndicator)">
              delete
            </v-icon>
          </v-list-tile-action>
        </v-list-tile>
        <v-divider />
        <v-list-tile>
          <v-list-tile-content>
            <v-layout row wrap pt-1>
              <v-autocomplete
                v-model="indicator"
                :items="indicators"
                label="Adicione um Indicador"
                item-text="label"
                item-value="id"
                return-object
                @change="addLayer()"
              >
                <template slot="item" slot-scope="data">
                  <template>
                    <v-list-tile-avatar>
                      <v-icon>{{ data.item.icon }}</v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                      <v-list-tile-title v-html="data.item.label" />
                      <v-list-tile-sub-title v-html="data.item.detail" />
                    </v-list-tile-content>
                  </template>
                </template>
              </v-autocomplete>
              <v-progress-circular
                v-if="indicatorsStatus !== 'SUCCESS'"
                size="20"
                class="mt-4"
                :indeterminate="indicatorsStatus == 'LOADING'"
                :value="indicatorsStatus == 'LOADING' ? 0 : 100"
                :color="indicatorsStatus == 'ERROR' ? 'error' :
                  (indicatorsStatus == 'LOADING' ? 'warning' : 'success')"
                background-color="primary"
              />
            </v-layout>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider />
      </v-list>
      <!-- Único indicador, caso contrário -->
      <v-layout v-show="mapType && mapType.id != 'bubbles'" row wrap>
        <v-autocomplete
          v-model="indicator"
          :items="indicators"
          label="Selecione um Indicador"
          item-text="label"
          item-value="id"
          return-object
          @change="addLayer()"
        >
          <template slot="item" slot-scope="data">
            <template>
              <v-list-tile-avatar>
                <v-icon>{{ data.item.icon }}</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title v-html="data.item.label" />
                <v-list-tile-sub-title v-html="data.item.detail" />
              </v-list-tile-content>
            </template>
          </template>
        </v-autocomplete>
        <v-progress-circular
          v-if="indicatorsStatus !== 'SUCCESS'"
          size="20"
          class="mt-4"
          :indeterminate="indicatorsStatus == 'LOADING'"
          :value="indicatorsStatus == 'LOADING' ? 0 : 100"
          :color="indicatorsStatus == 'ERROR' ? 'error' :
            (indicatorsStatus == 'LOADING' ? 'warning' : 'success')"
          background-color="primary"
        />
      </v-layout>

      <v-layout class="headline-obs">
        Filtros
      </v-layout>

      <!-- Filtro geral de ano -->
      <v-layout v-if="filters && filters.year" column>
        <FLPOSliderEmitter
          :custom-params="customParams"
          :structure="descSection"
          :custom-functions="customFunctions"
          @selection="triggerSelect"
        />
      </v-layout>

      <!-- Gatilho da renderização do mapa com os parâmetros -->
      <v-btn @click="filter">
        Aplicar >
      </v-btn>
    </v-flex>
    <v-flex xs8 class="pa-0">
      <div v-if="indicator" id="map" ref="map" class="map_container fill-height" />
    </v-flex>
    <v-layout
      v-show="checkLoading"
      pa-3
      row
      wrap
      justify-center
      align-center
      fill-height
      class="loading"
    >
      <v-progress-circular
        :size="120"
        :width="8"
        color="primary"
        indeterminate
      >
        Atualizando o mapa...
      </v-progress-circular>
    </v-layout>
  </v-layout>
</template>

<script>
// import axios from 'axios'
// import * as d3 from 'd3'
// import * as d3chrom from 'd3-scale-chromatic'
// import * as d3plus from 'd3plus'

export default {
  data () {
    return {
    //   show: false,
    //   municipio: null,
    //   dataset: {},
    //   filters: {},
    //   options: {
    //     tiles_url: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
    //     tiles_attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    //     topo_key: "codarea",
    //     lat: "latitude",
    //     long: "longitude",
    //     value: "valor",
    //     tooltip_function: data => {
    //       return "I am a circle.";
    //     },
    //     radiusMultiplier: 100000, // Multiplica o valor do log do indicador normalizado (em metros)
    //     radiusBase: 20000 // Define um tamanho mínimo para as bolhas (em metros)
    //   },
    //   leafletMap: null,
    //   topoMap: null,
    //   colorArray: null,
    //   mapTypes: [
    //     { id: "bubbles", name: "Bolhas" },
    //     { id: "cluster", name: "Grupos" },
    //     { id: "heat", name: "Calor" },
    //     { id: "poligonos", name: "Polígonos" }
    //   ],
    //   mapAggregations: [
    //     { id: "regiao", name: "Região" },
    //     { id: "uf", name: "Unidade Federativa" },
    //     { id: "mesorregiao", name: "Mesorregião" },
    //     { id: "microrregiao", name: "Microrregião" },
    //     { id: "municipio", name: "Município" }
    //   ],
    //   mapType: null,
    //   mapAggregation: null,
    //   indicators: [],
    //   selectedIndicators: [],
    //   indicatorsStatus: "LOADING",
    //   indicator: null,
    //   additionalIndicators: [],
    //   places: [],
    //   placesStatus: "LOADING",
    //   place: null,

    //   layers: {},
    //   loadedLayers: null
    }
  },
  // created() {
  //   this.$indicatorsModel.buildIndicatorsOptions(this, this.$observatories.identifyObservatory(this.$route.path.split('/')[1]))
  //     .then((result) => {
  //       for (let option of result) {
  //         this.indicators.push(option);
  //         if (this.indicator == null && option.id == this.$route.params.nmIndicador) {
  //           this.indicator = option;
  //           option.color = this.colorArray[0];
  //           option.visible = true;
  //           this.selectedIndicators[0] = option;
  //         }
  //         if (this.additionalIndicators) {
  //           for (let indxAdditionalInd in this.additionalIndicators) {
  //             if (this.additionalIndicators[indxAdditionalInd].id == option.id
  //               && this.selectedIndicators[indxAdditionalInd + 1] == null) {
  //               option.color = this.colorArray[indxAdditionalInd + 1];
  //               option.visible = true;
  //               this.selectedIndicators[indxAdditionalInd + 1] = option;
  //             }
  //           }
  //         }
  //       }
  //     })
  //     .catch((error) => { this.sendError("Falha ao carregar as opções de indicadores"); });

  //   this.$analysisUnitModel.buildPlacesOptions()
  //     .then((response) => { this.setPlaceStatusOption(this.$analysisUnitModel.getOptions()); });

  //   var tp = this.$route.query.type;
  //   if (tp === undefined) {
  //     tp = "poligonos";
  //   }
  //   for (var indxTypes in this.mapTypes) {
  //     if (this.mapTypes[indxTypes].id == tp) {
  //       this.mapType = this.mapTypes[indxTypes];
  //       break;
  //     }
  //   }

  //   var aggr = this.$route.query.aggregation;
  //   if (aggr === undefined) {
  //     aggr = "municipio";
  //   }
  //   for (var indxAggr in this.mapAggregations) {
  //     if (this.mapAggregations[indxAggr].id == aggr) {
  //       this.mapAggregation = this.mapAggregations[indxAggr];
  //       break;
  //     }
  //   }

  //   if (
  //     this.$route.query.adicionais !== null &&
  //     this.$route.query.adicionais !== undefined
  //   ) {
  //     this.additionalIndicators = this.$route.query.adicionais.split(",");
  //   }
  // },
  // computed: {
  //   checkLoading: function() {
  //     if (this.mapType == null || this.mapType.id == 'bubbles') {
  //       return this.loadedLayers != this.selectedIndicators.length;
  //     }
  //     if (this.mapType && this.mapType.id != 'poligonos') {
  //       return this.loadedLayers != 1;
  //     }
  //     return false;
  //   }
  // },
  // mounted: function() {
  //   require("leaflet/dist/leaflet.js");
  //   require('leaflet-easyprint/dist/bundle.js')
  //   require('leaflet.heat/dist/leaflet-heat.js');
  //   require('leaflet.markercluster/dist/leaflet.markercluster.js');

  //   this.reloadMap();

  //   if (this.$route.query.adicionais) {
  //     this.fetchDataArray([this.$route.params.nmIndicador].concat(this.additionalIndicators));
  //   } else {
  //     this.fetchDataArray([this.$route.params.nmIndicador]);
  //   }
  // },
  methods: {
    // pushPlaceOption(option) {
    //   if (option.type == "place") {
    //     this.places.push(option);
    //     if (
    //       this.place === null &&
    //       (option.id == this.$route.params.scope ||
    //         (option.id == 0 &&
    //           (this.$route.params.scope === null ||
    //             this.$route.params.scope === undefined)))
    //     ) {
    //       this.place = option;
    //     }
    //   }
    // },

    // setPlaceStatusOption(obj) {
    //   if (obj.id == "places") {
    //     this.placesStatus = obj.value;
    //   }
    // },

    // reloadMap() {
    //   if (this.leafletMap !== null && this.leafletMap !== undefined) {
    //     this.leafletMap.off();
    //     this.leafletMap.remove();
    //     this.leafletMap = null;
    //   }

    //   var chartContainer = d3.select('map');

    //   if (chartContainer != null) {
    //     chartContainer.innerHTML = "";
    //   }

    //   if (this.mapType == null || this.mapType.id != "poligonos") {
    //     this.colorArray = d3chrom.schemeDark2;

    //     var leaflet_map = L.map("map").setView([-15.793889, -47.882778], 4);

    //     L.tileLayer(this.options.tiles_url, {
    //       attribution: this.options.tiles_attribution
    //     }).addTo(leaflet_map);

    //     this.leafletMap = leaflet_map;
    //   } else {
    //     let topoFile = "/topojson/" + this.mapAggregation.id + "/" + this.place.scope + "/" + this.place.id + ".json";
    //     axios.get(topoFile)
    //       .then(response => {
    //         this.topology = response.data;
    //       }
    //     );
    //   }
    // },

    // generateLeafletLayer(fullDS, value_field, indicador, pos) {
    //   let dataset = fullDS.data;

    //   var tooltip_function = this.options.tooltip_function ? this.options.tooltip_function : this.defaultTooltip;
    //   var headers = this.headers;
    //   var removed_text_list = this.options.removed_text_list;

    //   var circles = [];

    //   if (this.mapType == null || this.mapType.id == 'bubbles') {
    //     for(let each_row in dataset) {

    //       if (dataset[each_row][this.options.lat] &&
    //           dataset[each_row][this.options.long]) {
    //         var eachCircle = L.circle(
    //           [dataset[each_row][this.options.lat], dataset[each_row][this.options.long]],
    //           {
    //             color: this.colorArray[pos],
    //             weight: this.options.weight != null ? this.options.weight : (dataset[each_row].weight != null ? dataset[each_row].weight : 0),
    //             fillColor: this.colorArray[pos],
    //             fillOpacity: 0.7,
    //             radius: dataset[each_row][value_field] != null ? dataset[each_row][value_field] * this.options.radiusMultiplier + this.options.radiusBase : 0
    //           }
    //         ).bindPopup(tooltip_function(dataset[each_row], headers, removed_text_list));
    //         circles.push(eachCircle);
    //       }
    //     }
    //     let group = L.layerGroup(circles)
    //       .on('add', this.addLoadedLayer)
    //       .on('remove', this.subLoadedLayer);

    //     this.layers[indicador] = group;
    //     group.addTo(this.leafletMap);
    //   } else if (this.mapType && this.mapType.id == 'heat') {
    //     var heatPoints = [];
    //     for (let each_row in dataset) {
    //       heatPoints.push([
    //         dataset[each_row][this.options.lat],
    //         dataset[each_row][this.options.long],
    //         dataset[each_row][this.options.value_field]
    //       ]);
    //     }

    //     let group = L.heatLayer(heatPoints, {radius: 25})
    //       .on('add', this.addLoadedLayer)
    //       .on('remove', this.subLoadedLayer);

    //     group.addTo(this.leafletMap);
    //   } else if (this.mapType && this.mapType.id == 'cluster') {
    //     var markers = L.markerClusterGroup();
    //     for (let each_row in dataset) {
    //       markers.addLayer(
    //         L.marker([
    //           dataset[each_row][this.options.lat],
    //           dataset[each_row][this.options.long]
    //         ])
    //       );
    //     }

    //     markers = markers
    //       .on('add', this.addLoadedLayer)
    //       .on('remove', this.subLoadedLayer);

    //     markers.addTo(this.leafletMap);
    //   } else if (this.mapType && this.mapType.id == 'poligonos') {
    //     // https://blog.webkid.io/maps-with-leaflet-and-topojson/
    //     // Gera o range
    //     var range = [null, null];
    //     for (let each_row in dataset) {
    //       if (range[0] === null || range[0] > dataset[each_row][this.options.value_field]) {
    //         range[0] = dataset[each_row][this.options.value_field];
    //       }
    //       if (range[1] === null || range[1] < dataset[each_row][this.options.value_field]) {
    //         range[1] = dataset[each_row][this.options.value_field];
    //       }
    //     }

    //     this.range = range;

    //     L.TopoJSON = L.GeoJSON.extend({
    //       addData: function(jsonData) {
    //         if (jsonData.type === 'Topology') {
    //           for (var key in jsonData.objects) {
    //             var geojson = topojson.feature(jsonData, jsonData.objects[key]);
    //             L.GeoJSON.prototype.addData.call(this, geojson);
    //           }
    //         }
    //         else {
    //           L.GeoJSON.prototype.addData.call(this, jsonData);
    //         }
    //       }
    //     });

    //     let layer = new L.TopoJSON();
    //     layer.addData(this.topology);
    //     layer.addTo(this.leafletMap);
    //     layer.eachLayer(this.handlePoligon);
    //   }
    // },

    // addLoadedLayer(event) {
    //   if (this.loadedLayers == null) this.loadedLayers = 0;
    //   this.loadedLayers++;
    // },
    // subLoadedLayer(event) {
    //   if (this.loadedLayers == null) this.loadedLayers = 0;
    //   this.loadedLayers--;
    // },

    // toggleLayer(indicator) {
    //   if (this.mapType == null || this.mapType.id == 'bubbles') {
    //     if (indicator.visible) {
    //       this.leafletMap.addLayer(this.layers[indicator.id]);
    //     } else {
    //       this.leafletMap.removeLayer(this.layers[indicator.id]);
    //     }
    //   }
    // },

    // removeLayer(indicator) {
    //   if (this.mapType == null || this.mapType.id == 'bubbles') {
    //     this.leafletMap.removeLayer(this.layers[indicator.id]);
    //     this.layers[indicator.id] = null;
    //     this.selectedIndicators.splice(indicator.label, 1);
    //     this.reloadMap();
    //     let arrIndicatorsIds = []
    //     for (let indxInd in this.selectedIndicators) {
    //       arrIndicatorsIds.push(this.selectedIndicators[indxInd].id);
    //       this.selectedIndicators[indxInd].color = this.colorArray[indxInd];
    //     }
    //     this.fetchDataArray(arrIndicatorsIds);
    //   }
    // },

    // addLayer() {
    //   if (this.mapType == null || this.mapType.id == 'bubbles') {
    //     this.indicator.visible = true;
    //     this.indicator.color = this.colorArray[this.selectedIndicators.length];
    //     this.selectedIndicators.push(this.indicator);
    //     this.fetchData(this.indicator.id, this.selectedIndicators.length - 1);
    //   }
    // },

    // filter() {
    //   let arrIndicatorsIds = [];
    //   this.reloadMap();
    //   if (this.mapType == null || this.mapType.id == 'bubbles') {
    //     for (let indxInd in this.selectedIndicators) {
    //       arrIndicatorsIds.push(this.selectedIndicators[indxInd].id);
    //       this.selectedIndicators[indxInd].color = this.colorArray[indxInd];
    //     }
    //   } else {
    //     arrIndicatorsIds.push(this.indicator.id);
    //   }
    //   this.fetchDataArray(arrIndicatorsIds);
    // },

    // selectCoords(aggr) {
    //   var coords = "";
    //   switch (aggr.id) {
    //     case "microrregiao":
    //       coords = "/topojson/microrregiao.json";
    //       break;
    //     case "mesorregiao":
    //       coords = "/topojson/mesorregiao.json";
    //       break;
    //     case "municipio":
    //       coords = "/topojson/municipio.json";
    //       break;
    //     default:
    //       coords = "/topojson/uf.json";
    //   }
    //   return coords;
    // },

    // generateTopoMap(dataset, value_field = 'vl_lognormal') {
    //   let viz = new d3plus.Geomap()
    //     .shapeConfig({
    //       labelConfig: { fontFamily: "titulos-observatorio" },
    //       Path: {
    //         fillOpacity: 0.9,
    //         //strokeWidth: function(d) { return d[options.id_field] == idLocalidade ? 5 : 0.2 },
    //         stroke: 'black'
    //       }
    //     })
    //     .tileUrl('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}')
    //     .topojson(this.topology)
    //     .tooltipConfig({
    //       // body: function(d) {
    //       //   return tooltip_function(d, headers, removed_text_list)
    //       // },
    //       title: function(d) {
    //         return "";
    //       }
    //     })
    //     .colorScalePosition("right")
    //     .colorScaleConfig({
    //       color: this.$colorsService.getColorScale("Blues", "singleHue", "asc", 9),
    //       axisConfig: {
    //         labels: [],
    //         gridConfig: {stroke: "transparent"},
    //         ticks: [],
    //         barConfig: {"stroke-width": 0}
    //       }
    //     })
    //     .colorScale(value_field)
    //     .select("#map")  // container DIV to hold the visualization
    //     .data(dataset)  // data to use with the visualization
    //     .groupBy('cd_place')         // key for which our data is unique on
    //     .topojsonId((t) => { return t.properties[this.options.topo_key]; })
    //     // .height(parseInt(size.height))
    //     // .width(parseInt(size.width))
    //     .render();

    //   return viz;
    // },

    // fetchDataArray(arrIndicators) {
    //   for (var indIndex = 0; indIndex < arrIndicators.length; indIndex++) {
    //     this.fetchData(arrIndicators[indIndex], indIndex);
    //   }
    // },

    // fetchData(indicador, pos, value_field = 'valor') {
    //   // Defines the observatory namespace
    //   let urlPrefix = this.$observatories.identifyObservatory(this.$route.path.split('/')[1]);
    //   if (urlPrefix && urlPrefix == 'td') {
    //     urlPrefix = '';
    //   } else {
    //     urlPrefix = '/' + urlPrefix;
    //   }
    //   // Default: municipio
    //   var url = urlPrefix +
    //   "/indicadoresmunicipais?categorias=cd_municipio_ibge_dv-cd_place,nm_municipio-nm_place,nm_indicador,ds_indicador_radical-indicador,nu_competencia-ano,ds_fonte,cd_dimensao,vl_indicador-valor,latitude,longitude&valor=nu_competencia&agregacao=max&filtros=eq-cd_indicador-'" +
    //     indicador +
    //     "'";
    //   if (this.mapAggregation.id == "regiao") {
    //     url =
    //       "/indicadoresregionais?categorias=cd_regiao-cd_place,nm_regiao-nm_place,nm_indicador,ds_indicador_radical-indicador,nu_competencia-ano,ds_fonte,cd_dimensao,ds_grupo,ds_subgrupo,ds_operador,vl_indicador-valor&valor=nu_competencia&agregacao=max&filtros=eq-nm_indicador-'" +
    //       indicador +
    //       "'";
    //   } else if (this.mapAggregation.id == "microrregiao") {
    //     url =
    //       "/indicadoresmicrorregionais?categorias=cd_microrregiao-cd_place,nm_microrregiao-nm_place,nm_indicador,ds_indicador_radical-indicador,nu_competencia-ano,ds_fonte,cd_dimensao,ds_grupo,ds_subgrupo,ds_operador,vl_indicador-valor&valor=nu_competencia&agregacao=max&filtros=eq-nm_indicador-'" +
    //       indicador +
    //       "'";
    //   } else if (this.mapAggregation.id == "uf") {
    //     url =
    //       "/indicadoresestaduais?categorias=cd_uf,sg_uf-cd_place,nm_uf-nm_place,nm_indicador,ds_indicador_radical-indicador,nu_competencia-ano,ds_fonte,cd_dimensao,ds_grupo,ds_subgrupo,ds_operador,vl_indicador-valor&valor=nu_competencia&agregacao=max&filtros=eq-nm_indicador-'" +
    //       indicador +
    //       "'";
    //   } else if (this.mapAggregation.id == "mesorregiao") {
    //     url =
    //       "/indicadoresmesorregionais?categorias=cd_mesorregiao-cd_place,nm_mesorregiao-nm_place,nm_indicador,ds_indicador_radical-indicador,nu_competencia-ano,ds_fonte,cd_dimensao,ds_grupo,ds_subgrupo,ds_operador,vl_indicador-valor&valor=nu_competencia&agregacao=max&filtros=eq-nm_indicador-'" +
    //       indicador +
    //       "'";
    //   }

    //   // Limitação do escopo
    //   var appendUrl = "";
    //   var scopeId =
    //     this.place !== null && this.place !== undefined
    //       ? this.place.id
    //       : this.$route.params.scope;
    //   if (scopeId === null || scopeId === undefined || scopeId == 0) {
    //     // Brasil
    //   } else if (scopeId.toString().length == 1) {
    //     // Região
    //     if (this.mapAggregation.id == "regiao") {
    //       appendUrl = ",and,eq-cd_regiao-" + scopeId;
    //     } else if (this.mapAggregation.id == "uf") {
    //       appendUrl =
    //         ",and,ge-cd_uf-" + scopeId + "0,and,le-cd_uf-" + scopeId + "9";
    //     } else if (this.mapAggregation.id == "mesorregiao") {
    //       appendUrl =
    //         ",and,ge-cd_mesorregiao-" +
    //         scopeId +
    //         "000,and,le-cd_mesorregiao-" +
    //         scopeId +
    //         "999";
    //     } else if (this.mapAggregation.id == "microrregiao") {
    //       appendUrl =
    //         ",and,ge-cd_microrregiao-" +
    //         scopeId +
    //         "0000,and,le-cd_microrregiao-" +
    //         scopeId +
    //         "9999";
    //     } else if (this.mapAggregation.id == "municipio") {
    //       appendUrl =
    //         ",and,ge-cd_municipio_ibge_dv-" +
    //         scopeId +
    //         "000000,and,le-cd_municipio_ibge_dv-" +
    //         scopeId +
    //         "999999";
    //     } else {
    //       this.sendError("Agregação máxima para uma região: Região");
    //     }
    //   } else if (scopeId.toString().length == 2) {
    //     // UF
    //     if (this.mapAggregation.id == "uf") {
    //       appendUrl = ",and,eq-cd_uf-" + scopeId;
    //     } else if (this.mapAggregation.id == "mesorregiao") {
    //       appendUrl =
    //         ",and,ge-cd_mesorregiao-" +
    //         scopeId +
    //         "00,and,le-cd_mesorregiao-" +
    //         scopeId +
    //         "99";
    //     } else if (this.mapAggregation.id == "microrregiao") {
    //       appendUrl =
    //         ",and,ge-cd_microrregiao-" +
    //         scopeId +
    //         "000,and,le-cd_microrregiao-" +
    //         scopeId +
    //         "999";
    //     } else if (this.mapAggregation.id == "municipio") {
    //       appendUrl =
    //         ",and,ge-cd_municipio_ibge_dv-" +
    //         scopeId +
    //         "00000,and,le-cd_municipio_ibge_dv-" +
    //         scopeId +
    //         "99999";
    //     } else {
    //       this.sendError(
    //         "Agregação máxima para uma Unidade Federativa: Unidade Federativa"
    //       );
    //     }
    //   } else if (scopeId.toString().length == 4) {
    //     // Mesorregião
    //     if (this.mapAggregation.id == "mesorregiao") {
    //       appendUrl = ",and,eq-cd_mesorregiao-" + scopeId;
    //     } else if (this.mapAggregation.id == "microrregiao") {
    //       // TODO a microrregiao tem que guardar elo com a mesorregião
    //       appendUrl =
    //         ",and,ge-cd_microrregiao-" +
    //         scopeId +
    //         "0,and,le-cd_microrregiao-" +
    //         scopeId +
    //         "9";
    //     } else if (this.mapAggregation.id == "municipio") {
    //       appendUrl = ",and,eq-cd_mesorregiao-" + scopeId;
    //     } else {
    //       this.sendError("Agregação máxima para uma mesorregião: Mesorregião");
    //     }
    //   } else if (scopeId.toString().length == 5) {
    //     // Microrregião
    //     if (
    //       this.mapAggregation.id == "microrregiao" ||
    //       this.mapAggregation.id == "municipio"
    //     ) {
    //       appendUrl = ",and,eq-cd_microrregiao-" + scopeId;
    //     } else {
    //       this.sendError(
    //         "Agregação máxima para uma microrregião: Microrregião"
    //       );
    //     }
    //   } else if (scopeId.toString().length == 7) {
    //     // Município
    //     if (this.mapAggregation.id == "municipio") {
    //       appendUrl = ",and,eq-cd_municipio_ibge_dv-" + scopeId;
    //     } else {
    //       this.sendError("Agregação máxima para uma município: Município");
    //     }
    //   }

    //   url += appendUrl;

    //   axios(this.$axiosCallSetupService.getAxiosOptions(url)).then(
    //     result => {
    //       let dataset = JSON.parse(result.data).dataset;
    //       // Percorre o dataset, calculando o log do valor normalizado para cálculo do tamanho da bolhas e escala de cores.
    //       // Obtém o min e o max
    //       var minMax = this.$indicatorsModel.getMinMax(dataset, value_field);

    //       // Aplica o log sobre o valor normalizado
    //       for (let indxDS in dataset) {
    //         if (dataset[indxDS][value_field] != null) {
    //           dataset[indxDS].vl_lognormal = Math.log(
    //             // Adiciona valor irrisório apenas para mover a curva, impedindo que cruze o eixo
    //             (parseFloat(dataset[indxDS][value_field]) / minMax[1]) + 1.0001
    //           );
    //         }
    //       }

    //       // Armazena localmente o dataset obtido, usando o ID do indicador como chave
    //       dataset[indicador.id] = {
    //         data: dataset,
    //         metadata: JSON.parse(result.data).metadata //,
    //         //color: { color: this.colorArray[pos], fillColor: this.colorArray[pos], fillOpacity: 0.5 }
    //       };

    //       if (this.mapType == null || this.mapType.id != "poligonos") {
    //         this.generateLeafletLayer(
    //           {
    //             data: dataset,
    //             metadata: JSON.parse(result.data).metadata,
    //             color: {
    //               color: this.colorArray[pos],
    //               fillColor: this.colorArray[pos],
    //               fillOpacity: 0.5
    //             }
    //           },
    //           'vl_lognormal',
    //           indicador,
    //           pos
    //         );
    //         //layer.addTo(this.leafletMap);
    //       } else {
    //         this.topoMap = this.generateTopoMap(dataset);
    //       }
    //     },
    //     error => {
    //       console.error(error.toString());
    //       this.sendError("Falha ao buscar dados do indicador");
    //       return null;
    //     }
    //   );
    // }
  }
}
</script>

<style>
  /* @import "leaflet/dist/leaflet.css";
  @import "leaflet.markercluster/dist/MarkerCluster.css";
  @import "leaflet.markercluster/dist/MarkerCluster.Default.css";

  .map_geo_full {
    position: fixed;
    height: 100vh;
    z-index: 99;
  }

  .map_geo_full .loading{
    background-color: rgba(255, 255, 255, 0.7);
    position: absolute;
    width: 100%;
    top: 0;
    z-index: +1;
  }

  .map_geo_full .filter_section {
    overflow: scroll;
  } */
</style>

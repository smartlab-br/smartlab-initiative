<template>
  <v-layout pa-3>
    <div :id="id" :ref="id" class="map_geo">
    </div>
  </v-layout>
</template>

<script>
  import * as d3 from 'd3'
  import * as d3chrom from 'd3-scale-chromatic'
  import axios from 'axios'

  export default {
    data () {
      return {
        d3: null,
        leafletMap: null,
        topoJSON: null,
        range: [null, null],
        defaultMarker: null,
        visibleLayers: {},
        layers: {},
        mapLayer: null,
        heightProportion: 1.618 //Proporção Áurea
      }
    },
    props: ['dataset', 'id', 'options', 'customParams', 'customFunctions',
            'topology', 'headers', 'selectedPlace'],
    watch: {
      dataset: function (nuDS, oldDS) {
        this.reloadMap();
      }
    },
    created() {
      if (this.options.tiles_url === null || this.options.tiles_url === undefined) {
        this.options.tiles_url = 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png';
      }
      if (this.options.tiles_attribution === null || this.options.tiles_attribution === undefined) {
        this.options.tiles_attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
      }
      if(this.options.height_proportion){
        this.heightProportion = this.options.height_proportion;
      }
      this.options.clickable = this.options.clickable == true || this.options.clickable == undefined  ? true : false;
    },
    mounted: function() {
      require('../../node_modules/leaflet/dist/leaflet.js');
      require('../../node_modules/leaflet-easyprint/dist/bundle.js')
      require('../../node_modules/leaflet.heat/dist/leaflet-heat.js');
      require('../../node_modules/leaflet.markercluster/dist/leaflet.markercluster.js');
      delete L.Icon.Default.prototype._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
      });
      
      // var containerId = "#" + this.id;
      let chartContainer = document.getElementById(this.id);
      // var width = parseInt(chartContainer.offsetWidth);
      let height = parseInt(chartContainer.offsetWidth / this.heightProportion);
      chartContainer.style.height = height + "px";

      if (this.options.colorArray === null || this.options.colorArray === undefined) {
        this.options.colorArray = d3chrom.schemeDark2;
      }

      let leaflet_map = L.map(this.id).setView([-15.793889, -47.882778], 5);
      leaflet_map.options.minZoom = 4;
      if (this.options.type == 'bubbles' || this.options.type == null) {
        this.fCircleSize = d3.scaleLog().range([1, 4001]);
      }

      let bounds = new L.LatLngBounds(
        [this.customParams.limCoords.ymin, this.customParams.limCoords.xmin],
        [this.customParams.limCoords.ymax, this.customParams.limCoords.xmax]
      );

      leaflet_map.fitBounds(bounds, { padding: [10, 10] });

      // Adiciona o marker do município apenas se houver idLocalidade
      if (this.options.hide_place_marker == undefined || !this.options.hide_place_marker){
        let placeId;
        if (this.selectedPlace) {
          placeId = this.selectedPlace;
        } else if (this.customParams && this.customParams.idLocalidade) { // Município
          placeId = this.customParams.idLocalidade;
        }
        
        if (placeId && placeId.length == 7) {
          let findLoc = this.$analysisUnitModel.findPlaceByID(placeId);
          if (findLoc && (findLoc instanceof Promise || findLoc.then)) {
            findLoc.then(response => {
              this.addDeafultMarker(response, leaflet_map);
            })
            .catch(error => { this.sendError(error); });
          } else {
            this.addDeafultMarker(findLoc, leaflet_map);
          }
        }
      }
          
      // let tileLayer = L.tileLayer(
      //   this.options.tiles_url,
      //   { attribution: this.options.tiles_attribution }
      // ).addTo(leaflet_map);

      let tileLayer = this.createTileLayer()
      tileLayer.addTo(leaflet_map)
      this.createPrintPlugin(tileLayer).addTo(leaflet_map);

      this.leafletMap = leaflet_map;

      this.fillLayers(leaflet_map.getBoundsZoom(bounds));

      window.addEventListener('resize', this.resizeMapArea);
    },
    beforeDestroy: function() {
      window.removeEventListener('resize', this.resizeMapArea);
    },
    methods: {
      sendError(message) {
        this.$emit('showSnackbar', { color : 'error', text: message });
      },

      sendMapLoaded(){
        this.$emit('map-loaded');        
      },

      createTileLayer() {
        L.TileLayer.ShowAsDiv = L.TileLayer.extend({
          createTile: function (coords, done) {
              let tile = document.createElement('div');
          
              if (this.options.crossOrigin) {
                tile.crossOrigin = '';
              }
              
              tile.style.backgroundImage = "url('"+this.getTileUrl(coords)+"')";
              tile.style.visibility = 'inherit'; 
          
              return tile;
          },
        });

        L.tileLayer.showAsDiv = function(args) {
            return new L.TileLayer.ShowAsDiv(args);
        };

        return L.tileLayer.showAsDiv(
          this.options.tiles_url,
          { attribution: this.options.tiles_attribution,
            crossOrigin: true }
        );
      },

      createPrintPlugin(tileLayer) {
        let printPlugin = L.easyPrint({
          tileLayer: tileLayer,
          sizeModes: ['Current'],
          filename: 'teste',
          exportOnly: true,
          hideControlContainer: true
        });
        this.printPlugin = printPlugin;
        return printPlugin;
      },

      fillLayers(boundsZoom = null) {
        // Generates the chart based on the type
        let dataset = this.dataset;
        
        if (this.options.type == 'bubbles' || this.options.type == null) {
          // Sets the bubbles size handlers
          let multiplier = 1600000; // Default radius multiplier
          if (this.options && this.options.radius && this.options.radius.multiplier) {
            multiplier = this.options.radius.multiplier;
          }
          let base = 5000; // Default radius base
          if (this.options && this.options.radius && this.options.radius.base) {
            base = this.options.radius.base;
          }
          if (boundsZoom == null) {
            boundsZoom = this.leafletMap.getZoom();
          }

          let zoomIndex = boundsZoom > 5 ? Math.pow(boundsZoom/4,4) : 1;
          // let zoomIndex = Math.pow(boundsZoom/4,4);
          
          // Modifying handlers according to current zoom level

          multiplier = multiplier / zoomIndex;

          // console.log(this.leafletMap.getZoom());
          // console.log(boundsZoom);
          // console.log(zoomIndex);
          // console.log(multiplier);
          // console.log(base);
          // console.log(this.leafletMap.getZoom());
          let circleDataPoint = L.Circle.extend({
            rowData: null
          });

          let value_field = this.options.value_field ? this.options.value_field : 'api_calc_ln_norm_pos_part';
          let id_field = this.options.id_field ? this.options.id_field : 'cd_indicador';
          let min_field = this.options.min_field ? this.options.min_field : 'calc_min_part';

          // TODO - Analisar se é necessário getMinMaxEachIndicator

          // // Prepares the dataset, if the layers have no range
          if (min_field == 'minVal' || !value_field.includes('api_calc_')) {  
            dataset = this.getMinMaxEachIndicator(dataset, value_field);
          }
          
          // Prepares the layers
          for (const ident of this.options.indicadores) {
            let group = L.layerGroup();
            group.addTo(this.leafletMap);
            this.layers[ident] = group;
            if (this.visibleLayers[ident] == null || this.visibleLayers[ident] == undefined) {
              this.visibleLayers[ident] = true;
            }
            // let minMax = this.getMinMax(dataset, value_field);
          }

          // Iterates over the dataset, to build each circle and apply to the respective layer
          for(let each_row of dataset) {
            if (each_row[this.options.lat] &&
                each_row[this.options.long] &&
                each_row[this.options.lat] != 0 &&
                each_row[this.options.long] != 0) {
              // Iterates over the layers
              for (const [pos, ident] of this.options.indicadores.entries()) {
                // Checks if the row is for the layer (moves to next if different)
                if (ident != each_row[id_field]) continue;

                // Gets the value for each layer
                let value = each_row[value_field];
                
                // Builds the circle
                let eachCircle = new circleDataPoint(
                  [each_row[this.options.lat], each_row[this.options.long]],
                  { rowData: each_row,
                    color: this.options.color != null ? 
                            this.options.color : 
                            (this.options.colorArray != null ? 
                              this.options.colorArray[pos] :
                              (each_row.color != null ? 
                                each_row.color : 
                                '#4A148C'
                              )
                            ),
                    weight: this.options.weight != null ? this.options.weight : (each_row.weight != null ? each_row.weight : 0),
                    fillColor: this.options.fillColor != null ?
                                this.options.fillColor : 
                                (this.options.colorArray != null ?
                                  this.options.colorArray[pos] :
                                  (each_row.fillColor != null ?
                                    each_row.fillColor :
                                    '#4A148C'
                                  )
                                ),
                    fillOpacity: this.options.fillOpacity != null ? 
                                  this.options.fillOpacity : 
                                  (each_row.fillOpacity != null ? 
                                    each_row.fillOpacity :
                                    0.5
                                  ),
                    radius: value != null ? value > 0 ? value * multiplier + base : base : 0
                  }
                ).on("click", this.circleClick);

                // if (this.visibleLayers[ident]) {
                eachCircle.addTo(this.layers[ident]);
                // }
              }
            }
          }
          this.adjustVisibleLayers();
        } else if (this.options.type == 'heat') {
          if (this.visibleLayers[this.options.indicadores[0]] == null || this.visibleLayers[this.options.indicadores[0]] == undefined) {
            for (let indx in this.options.indicadores) {
              if (indx == 0 && (this.visibleLayers[this.options.indicadores[indx]] == null || this.visibleLayers[this.options.indicadores[indx]] == undefined)) {
                this.visibleLayers[this.options.indicadores[indx]] = true;
              } else {
                this.visibleLayers[this.options.indicadores[indx]] = false;
              }
            }
          }
          let heatPoints = [];
          let id_field = this.options.id_field ? this.options.id_field : 'cd_indicador';
          for (let each_row of dataset) {
            if (this.visibleLayers[each_row[id_field]]) {
              heatPoints.push([
                each_row[this.options.lat],
                each_row[this.options.long],
                each_row[this.options.value_field]
              ]);
            }
          }
          this.mapLayer = L.heatLayer(heatPoints, {radius: 25, maxZoom:14}).addTo(this.leafletMap);
        } else if (this.options.type == 'cluster') {
          
          //default icon = blue
          let defaultIcon = new L.Icon({
                              iconUrl: '/static/markers/marker-icon-2x-blue.png',
                              shadowUrl: '/static/markers/marker-shadow.png',
                              iconSize: [25, 41],
                              iconAnchor: [12, 41],
                              popupAnchor: [1, -34],
                              shadowSize: [41, 41]
                            });

          if (this.visibleLayers[this.options.indicadores[0]] == null || this.visibleLayers[this.options.indicadores[0]] == undefined) {
            for (let indx in this.options.indicadores) {
              let indicator = this.options.indicadores[indx];
              if(this.options.markerIcons && this.options.markerIcons[indicator]){
                this.options.markerIcons[indicator] = new L.Icon({
                              iconUrl: '/static/markers/marker-icon-2x-'+ this.options.markerIcons[indicator].toString() +'.png',
                              shadowUrl: '/static/markers/marker-shadow.png',
                              iconSize: [25, 41],
                              iconAnchor: [12, 41],
                              popupAnchor: [1, -34],
                              shadowSize: [41, 41]
                            });
              } 

              if (this.options.show_all || (indx == 0 && (this.visibleLayers[indicator] == null || this.visibleLayers[indicator] == undefined))) {
                this.visibleLayers[indicator] = true;
              } else {
                this.visibleLayers[indicator] = false;
              }
            }
          }
          this.mapLayer = L.markerClusterGroup();
          let id_field = this.options.id_field ? this.options.id_field : 'cd_indicador';
          for (let each_row of dataset) {
            if (this.visibleLayers[each_row[id_field]]) {
              this.mapLayer.addLayer(
                L.marker([
                  each_row[this.options.lat],
                  each_row[this.options.long]
                ],{rowData: each_row, icon: this.options.markerIcons ? this.options.markerIcons[each_row[id_field]]: defaultIcon}).on("click", this.circleClick)
              );
            }
          }
          this.leafletMap.addLayer(this.mapLayer);
        } else if (this.options.type == 'poligonos') {
          // https://blog.webkid.io/maps-with-leaflet-and-topojson/
          // Gera o range
          let range = [null, null];
          for (let each_row of dataset) {
            if (range[0] === null || range[0] > each_row[this.options.value_field]) {
              range[0] = each_row[this.options.value_field];
            }
            if (range[1] === null || range[1] < each_row[this.options.value_field]) {
              range[1] = each_row[this.options.value_field];
            }
          }

          this.range = range;

          L.TopoJSON = L.GeoJSON.extend({  
            addData: function(jsonData) {    
              if (jsonData.type === 'Topology') {
                for (let key in jsonData.objects) {
                  let geojson = topojson.feature(jsonData, jsonData.objects[key]);
                  L.GeoJSON.prototype.addData.call(this, geojson);               
                }
              }    
              else {
                L.GeoJSON.prototype.addData.call(this, jsonData);
              }
            }  
          });
          
          let layer = new L.TopoJSON();
          layer.addData(this.topology);
          layer.addTo(this.leafletMap);
          layer.eachLayer(this.handlePoligon);
        }
        this.sendMapLoaded();
      },

      resizeMapArea() {
        // var containerId = "#" + this.id;
        let chartContainer = document.getElementById(this.id);
        // var width = parseInt(chartContainer.offsetWidth);
        let height = parseInt(chartContainer.offsetWidth / this.heightProportion);
        chartContainer.style.height = height + "px";
      },

      handlePoligon(layer) {
        //const randomValue = Math.random();
        // Se for usar polígonos no leaflet, verificar a necessidade de usar essas variáveis
        // var tooltip_function = this.options.tooltip_function ? this.options.tooltip_function : this.defaultTooltip;
        // var headers = this.headers;
        // var removed_text_list = this.options.removed_text_list;

        let value = null;
        for (let each_row of this.dataset) {
          if (each_row[this.options.id_field] == layer.feature.id) {
            if (this.options.scale_order !== null && this.options.scale_order === 'ASC') {
              value = (each_row[this.options.value_field] - this.range[0]) / (this.range[1] - this.range[0]);
            } else if (this.options.scale_order !== null) {
              value = 1 - (each_row[this.options.value_field] - this.range[0]) / (this.range[1] - this.range[0]);
            }
            let fillColor = (value != null ? this.d3chrom.interpolateRdYlBu(value) : 'transparent');

            //layer.bindPopup("Carregando...");
            // var rowData = each_row;
            
            // Se for usar polígonos no leaflet, verificar como instanciar a função fora do loop
            // layer.on('click', function(e) {
            //   let popup = e.target.getPopup();
            //   popup.setContent(tooltip_function(rowData, headers, removed_text_list));
            //   popup.update();
            // });
            
            layer.setStyle({
              fillColor: fillColor,
              fillOpacity: 0.8,
              color: fillColor,
              weight: 1,
              opacity: 0.9
            });

            layer.on({
              mouseover: function() {
                this.setStyle({
                  weight: 4,
                  opacity: 1,
                  fillOpacity: 1
                });
              },
              mouseout: function() {
                this.setStyle({
                  weight: 1,
                  opacity: 0.9,
                  fillOpacity: 0.8
                });
              },
            });

            break;
          }
        }

        if (!value) {
          layer.setStyle({
            fillColor: 'transparent',
            fillOpacity: 0,
            color: 'transparent',
            weight: 0,
            opacity: 0
          });
        }
      },

      circleClick(e) {
        let tooltip_function = this.options.tooltip_function ? this[this.options.tooltip_function] : this.defaultLeafletTooltip;
        let tooltip_context = this.options.tooltip_function ? this : this.$tooltipBuildingService;
        tooltip_function.apply(tooltip_context, [e.target, this.$route, this.headers, this.options.removed_text_list, this.options]);
      },

      changeCursor(image){
        this.$refs[this.id].style.cursor = image;
      },

      obsTETooltip(target, route, tooltip_list = [], removed_text_list = [], options = null){
        let url = "/te/indicadoresmunicipais/rerank?categorias=cd_mun_ibge,cd_uf,cd_indicador,nm_municipio_uf,nu_competencia_max,nu_competencia_min&valor=vl_indicador&agregacao=sum&filtros=nn-vl_indicador,and,in-cd_indicador-'te_ope'-'te_rgt'-'te_nat'-'te_res'-'te_inspecoes'-'te_insp_rgt',and,post-eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
        // let url = "/te/indicadoresmunicipais?categorias=cd_mun_ibge,nm_municipio_uf,nu_competencia_max,nu_competencia_min&valor=vl_indicador&agregacao=sum&pivot=cd_indicador&filtros=nn-vl_indicador,and,in-cd_indicador-'te_ope'-'te_rgt'-'te_nat'-'te_res'-'te_inspecoes',and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
        let urlIndicadores = "/indicadoresmunicipais?categorias=cd_indicador,ds_indicador_radical,nu_competencia,nu_competencia_max,nu_competencia_min,vl_indicador&filtros=nn-vl_indicador,and,in-cd_indicador-'06_01_09_01'-'01_16_02_00'-'01_15_01_00'-'01_14_13_00',and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge+",and,eq-nu_competencia-nu_competencia_max&ordenacao=ds_indicador_radical";
        let text = "";
        if (options && options.clickable){
          text += "<p class='text-xs-right ma-0'><a href='" + this.$tooltipBuildingService.getUrlByPlace(target.options.rowData.cd_mun_ibge, route) + "' class='primary--text font-weight-black'>IR PARA</a></p>";
        }
        if (this.customParams.filterUrl && this.customParams.filterUrl != ""){
          url = url + this.customParams.filterUrl;
          text += "Considerados os seguintes filtros: " + this.customParams.filterText;
        }
        this.changeCursor('wait');
        axios.all([axios(this.$axiosCallSetupService.getAxiosOptions(url)),
                   axios(this.$axiosCallSetupService.getAxiosOptions(urlIndicadores))])
          .then(axios.spread((result, resultIndicadores) => {
            let dt = JSON.parse(result.data).dataset;
            let dtIndicadores = JSON.parse(resultIndicadores.data).dataset;
            // let source = JSON.parse(result.data).metadata.fonte;
            let ano_min = this.customParams.value_min ? this.customParams.value_min : dt[0].nu_competencia_min;
            let ano_max = this.customParams.value_max ? this.customParams.value_max : dt[0].nu_competencia_max;

            text += "<p class='headline-obs'>Município: <b>" + dt[0].nm_municipio_uf + "</b></p>";
            text += "<table width='100%'>";
            let vl_ope = 0;
            let vl_inspecoes = 0;
            let vl_insp_rgt = 0;
            let vl_rgt = 0;
            let vl_rgt_rank_uf = 0;
            let vl_rgt_pct_uf = 0;
            let vl_rgt_rank_br = 0;
            let vl_rgt_pct_br = 0;
            let vl_nat = 0;
            let vl_nat_rank_uf = 0;
            let vl_nat_pct_uf = 0;
            let vl_nat_rank_br = 0;
            let vl_nat_pct_br = 0;
            let vl_res = 0;
            let vl_res_rank_uf = 0;
            let vl_res_pct_uf = 0;
            let vl_res_rank_br = 0;
            let vl_res_pct_br = 0;
            for (let item of dt){
              switch(item.cd_indicador){
                case "te_ope": // Operações
                  vl_ope = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0;
                break;
                case "te_inspecoes": // Inspeções
                  vl_inspecoes = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0;
                break;
                case "te_insp_rgt": // Inspeções com resgate
                  vl_insp_rgt = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0;
                break;
                case "te_rgt": // Resgates
                  vl_rgt = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0;
                  vl_rgt_rank_uf = item.rerank_rank_uf ? this.$numberTransformService.formatNumber(item.rerank_rank_uf,"inteiro") : 0;
                  vl_rgt_rank_br = item.rerank_rank_br ? this.$numberTransformService.formatNumber(item.rerank_rank_br,"inteiro") : 0;
                  vl_rgt_pct_uf = item.rerank_rank_uf ? this.$numberTransformService.formatNumber(item.rerank_perc_uf,"porcentagem",2,100) : 0;
                  vl_rgt_pct_br = item.rerank_rank_br ? this.$numberTransformService.formatNumber(item.rerank_perc_br,"porcentagem",3,100) : 0;
                break;
                case "te_nat": // Resgatados Naturais
                  vl_nat = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0;
                  vl_nat_rank_uf = item.rerank_rank_uf ? this.$numberTransformService.formatNumber(item.rerank_rank_uf,"inteiro") : 0;
                  vl_nat_rank_br = item.rerank_rank_br ? this.$numberTransformService.formatNumber(item.rerank_rank_br,"inteiro") : 0;
                  vl_nat_pct_uf = item.rerank_rank_uf ? this.$numberTransformService.formatNumber(item.rerank_perc_uf,"porcentagem",2,100) : 0;
                  vl_nat_pct_br = item.rerank_rank_br ? this.$numberTransformService.formatNumber(item.rerank_perc_br,"porcentagem",3,100) : 0;
                break;
                case "te_res": // Resgatados Residentes
                  vl_res = item.agr_sum_vl_indicador ? item.agr_sum_vl_indicador : 0;
                  vl_res_rank_uf = item.rerank_rank_uf ? this.$numberTransformService.formatNumber(item.rerank_rank_uf,"inteiro") : 0;
                  vl_res_rank_br = item.rerank_rank_br ? this.$numberTransformService.formatNumber(item.rerank_rank_br,"inteiro") : 0;
                  vl_res_pct_uf = item.rerank_rank_uf ? this.$numberTransformService.formatNumber(item.rerank_perc_uf,"porcentagem",2,100) : 0;
                  vl_res_pct_br = item.rerank_rank_br ? this.$numberTransformService.formatNumber(item.rerank_perc_br,"porcentagem",3,100) : 0;
                break;
              }
            }

            text += "<tr><td class='font-weight-bold green--text accent-4'>OPERAÇÕES E RESGATES</td></tr>";
            text += "<tr><td>" + this.$numberTransformService.formatNumber(vl_ope,"inteiro") + " operações</td></tr>";
            text += "<tr><td>" + this.$numberTransformService.formatNumber(vl_rgt,"inteiro") + " resgates</td></tr>";
            if (vl_rgt != 0){
              text += "<tr><td>" + vl_rgt_rank_uf + "ª posição no Estado com " + vl_rgt_pct_uf + " do total</td></tr>";
              text += "<tr><td>" + vl_rgt_rank_br + "ª posição no Brasil com " + vl_rgt_pct_br + " do total</td></tr>";
            }
            if (vl_ope != 0){
              text += "<tr><td>" + this.$numberTransformService.formatNumber(vl_rgt/vl_ope,"real",2) + " resgates por operação (envolvendo " + vl_inspecoes + " inspeções/fiscalizações)</td></tr>";
            }
            if (vl_inspecoes != 0){
              text += "<tr><td>" + this.$numberTransformService.formatNumber(vl_insp_rgt/vl_inspecoes,"real",2,100) + "% de inspeções/fiscalizações com resgates</td></tr>";
            }
            text += "<tr><td class='font-weight-bold red--text'>RESGATADOS NATURAIS</td></tr>";
            text += "<tr><td>" + this.$numberTransformService.formatNumber(vl_nat,"inteiro") + " trabalhadores regatados nascidos no município em destaque</td></tr>";
            if (vl_nat != 0){
              text += "<tr><td>" + vl_nat_rank_uf + "ª posição no Estado com " + vl_nat_pct_uf + " do total</td></tr>";
              text += "<tr><td>" + vl_nat_rank_br + "ª posição no Brasil com " + vl_nat_pct_br + " do total</td></tr>";
            }
            text += "<tr><td class='font-weight-bold light-blue--text'>RESGATADOS RESIDENTES</td></tr>";
            text += "<tr><td>" + this.$numberTransformService.formatNumber(vl_res,"inteiro") + " trabalhadores resgatados que declararam residir, no momento do resgate, no município em destaque</td></tr>";
            if (vl_res != 0){
              text += "<tr><td>" + vl_res_rank_uf + "ª posição no Estado com " + vl_res_pct_uf + " do total</td></tr>";
              text += "<tr><td>" + vl_res_rank_br + "ª posição no Brasil com " + vl_res_pct_br + " do total</td></tr>";
            }
            // text += "<tr><td><br/>Fonte: "+ source +"</td></tr>";
            text += "<tr><td><br/>Fonte: COETE e Seguro Desemprego do Trabalhador Resgatado (MTb)</td></tr>";
            text += "<tr><td>Período: "+ ano_min + (ano_min != ano_max ? " a "+ ano_max : "") +"</td></tr>";

            text += "<tr><td class='font-weight-bold'><br/>INDICADORES MUNICIPAIS:</td></tr>";
            for (let item of dtIndicadores){
              switch(item.cd_indicador){
                case "01_15_01_00": // População
                  text += "<tr><td>" + item.ds_indicador_radical + ": " + this.$numberTransformService.formatNumber(item.vl_indicador,"inteiro") + " ("+ item.nu_competencia +")</td></tr>";
                  break;
                case "06_01_09_01": // IDHM
                  text += "<tr><td>" + item.ds_indicador_radical + ": " + this.$numberTransformService.formatNumber(item.vl_indicador,"real",3) + " ("+ item.nu_competencia +")</td></tr>";
                  break;
                case "01_14_13_00": // Proporção Pobreza
                  text += "<tr><td>" + item.ds_indicador_radical + ": " + this.$numberTransformService.formatNumber(item.vl_indicador,"porcentagem") + " ("+ item.nu_competencia +")</td></tr>";
                  break;
                case "01_16_02_00": // PIB per capita
                  text += "<tr><td>" + item.ds_indicador_radical + ": " + this.$numberTransformService.formatNumber(item.vl_indicador,"monetario",2) + " ("+ item.nu_competencia +")</td></tr>";
                  break;
              }
            }
            text += "</table>";
            target.bindPopup(text).openPopup();
            this.changeCursor('');
          }, error => {
            this.changeCursor('');
            console.error(error.toString());
            this.sendError("Erro ao carregar dataset tooltip");
          }));
      },

      obsTITooltip(target, route, tooltip_list = [], removed_text_list = [], options = null){
        // let urlSinan = "/indicadoresmunicipais?categorias=nm_municipio_uf,ds_agreg_primaria,ds_fonte,nu_competencia_min,nu_competencia_max&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'06_05_13_00',and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
        let urlCatMenores = "/sst/cats?categorias=1&valor=nm_municipio_uf,cd_municipio_ibge&agregacao=COUNT&filtros=lt-idade_cat-18,and,eq-cd_municipio_ibge_dv-"+ target.options.rowData.cd_mun_ibge;
        let urlProvaBrasil = "/ti/provabrasil?categorias=nm_municipio_uf,nu_ano_prova_brasil-nu_competencia&valor=vl_indicador&agregacao=sum&filtros=nn-vl_indicador,and,ne-vl_indicador-0,and,eq-nu_ano_prova_brasil-2017,and,eq-cd_tr_fora-1,and,eq-cd_municipio_ibge_dv-"+ target.options.rowData.cd_mun_ibge;
        let urlPotAprendizes = "/indicadoresmunicipais?categorias=nm_municipio_uf,nu_competencia,ds_fonte&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'12_03_03_00',and,eq-nu_competencia-nu_competencia_max,and,eq-cd_municipio_ibge_dv-"+ target.options.rowData.cd_mun_ibge;
        let urlTENascimento = "/te/indicadoresmunicipais?categorias=nm_municipio_uf&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'te_nat_idade',and,lt-cast(ds_agreg_primaria as smallint)-18,and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
        // let urlTEResidencia = "/te/indicadoresmunicipais?categorias=nm_municipio_uf&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'te_res_idade',and,lt-cast(ds_agreg_primaria as smallint)-18,and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
        let urlMapear = "/ti/mapear?categorias=nm_municipio_uf&agregacao=count&filtros=eq-cd_municipio_ibge_dv-"+ target.options.rowData.cd_mun_ibge;
        let urlCenso = "/indicadoresmunicipais?categorias=nm_municipio_uf,ds_agreg_primaria,ds_fonte,nu_competencia&valor=vl_indicador&agregacao=sum&filtros=eq-cd_indicador-'06_01_01_01',and,eq-nu_competencia-nu_competencia_max,and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
        let urlCensoAgro = "/ti/censoagromunicipal?categorias=nm_municipio_uf,qt_ocupados_menores14&filtros=eq-cod_mun-"+ target.options.rowData.cd_mun_ibge;
        let text = "";
        if (options && options.clickable){
          text += "<p class='text-xs-right ma-0'><a href='" + this.$tooltipBuildingService.getUrlByPlace(target.options.rowData.cd_mun_ibge, route) + "' class='primary--text font-weight-black'>IR PARA</a></p>";
        }
        if (this.customParams.filterUrl && this.customParams.filterUrl != ""){
          // urlSinan = urlSinan + this.customParams.filterUrl;
          urlCatMenores = urlCatMenores + this.customParams.filterUrl;
          urlProvaBrasil = urlProvaBrasil + this.customParams.filterUrl;
          urlPotAprendizes = urlPotAprendizes + this.customParams.filterUrl;
          urlTENascimento = urlTENascimento + this.customParams.filterUrl;
          // urlTEResidencia = urlTEResidencia + this.customParams.filterUrl;
          urlMapear = urlMapear + this.customParams.filterUrl;
          urlCenso = urlCenso + this.customParams.filterUrl;
          urlCensoAgro = urlCensoAgro + this.customParams.filterUrl;
          text += "Considerados os seguintes filtros: " + this.customParams.filterText;
        }
        axios.all([
                  //  axios(this.$axiosCallSetupService.getAxiosOptions(urlSinan)),
                   axios(this.$axiosCallSetupService.getAxiosOptions(urlCatMenores)),
                   axios(this.$axiosCallSetupService.getAxiosOptions(urlProvaBrasil)),
                   axios(this.$axiosCallSetupService.getAxiosOptions(urlPotAprendizes)),
                   axios(this.$axiosCallSetupService.getAxiosOptions(urlTENascimento)),
                  //  axios(this.$axiosCallSetupService.getAxiosOptions(urlTEResidencia)),
                   axios(this.$axiosCallSetupService.getAxiosOptions(urlMapear)),
                   axios(this.$axiosCallSetupService.getAxiosOptions(urlCenso)),
                   axios(this.$axiosCallSetupService.getAxiosOptions(urlCensoAgro))])
          .then(axios.spread((
                              // resultSinan, 
                              resultCatMenores, 
                              resultProvaBrasil, 
                              resultPotAprendizes, 
                              resultTENascimento, 
                              // resultTEResidencia, 
                              resultMapear, 
                              resultCenso, 
                              resultCensoAgro) => {
            // let dtSinan = JSON.parse(resultSinan.data).dataset[0];
            let dtProvaBrasil = JSON.parse(resultProvaBrasil.data).dataset[0];
            let dtCatMenores = JSON.parse(resultCatMenores.data).dataset[0];
            let dtPotAprendizes = JSON.parse(resultPotAprendizes.data).dataset[0];
            let dtTENascimento = JSON.parse(resultTENascimento.data).dataset[0];
            // let dtTEResidencia = JSON.parse(resultTEResidencia.data).dataset[0];
            let dtMapear = JSON.parse(resultMapear.data).dataset[0];
            let dtCenso = JSON.parse(resultCenso.data).dataset[0];
            let dtCensoAgro = JSON.parse(resultCensoAgro.data).dataset[0];
            let municipio = dtCenso && dtCenso.nm_municipio_uf ? dtCenso.nm_municipio_uf : dtProvaBrasil && dtProvaBrasil.nm_municipio_uf ? dtProvaBrasil.nm_municipio_uf : dtCatMenores && dtCatMenores.nm_municipio_uf ? dtCatMenores.nm_municipio_uf : dtSinan.nm_municipio_uf;

            text += "<p class='headline-obs ma-0'>Município: <b>" + municipio + "</b></p>";
            text += "<table width='100%'>";
            text += "<tr><td class='font-weight-bold indigo--text darken-2'>CRIANÇAS E ADOLESCENTES OCUPADOS</td></tr>";
            text += "<tr><td>" + (dtCenso && dtCenso.agr_sum_vl_indicador ? this.$numberTransformService.formatNumber(dtCenso.agr_sum_vl_indicador,"inteiro") + " crianças e adolescentes ocupados entre 10 e 17 anos" : "Nenhum registro de crianças e adolescentes ocupados entre 10 e 17 anos") + "</td></tr>";
            text += "<tr><td>Fonte: IBGE - Censo Demográfico 2010</td></tr>";
            text += "<tr><td class='font-weight-bold purple--text'>TRABALHANDO FORA DE CASA</td></tr>";
            text += "<tr><td>" + (dtProvaBrasil && dtProvaBrasil.agr_sum_vl_indicador ? this.$numberTransformService.formatNumber(dtProvaBrasil.agr_sum_vl_indicador,"inteiro") + " declararam trabalhar fora de casa" : "Nenhum estudante declarou trabalhar fora de casa") + "</td></tr>";
            text += "<tr><td>Fonte: Prova Brasil 2017 (5º e 9º ano)</td></tr>";
            text += "<tr><td class='font-weight-bold cyan--text darken-2'>CRIANÇAS E ADOLESCENTES OCUPADOS EM ESTABELECIMENOS AGROPECUÁRIOS</td></tr>";
            text += "<tr><td>" + (dtCensoAgro && dtCensoAgro.qt_ocupados_menores14 ? this.$numberTransformService.formatNumber(dtCensoAgro.qt_ocupados_menores14,"inteiro") + " menores de 14 anos ocupados em estabelecimentos agropecuários" : "Nenhum registro de menores de 14 anos ocupados em estabelecimentos agropecuários") + "</td></tr>";
            text += "<tr><td>Fonte: IBGE - Censo Agropecuário 2017</td></tr>";
            text += "<tr><td class='font-weight-bold'>SOFRENDO ACIDENTES</td></tr>";
            text += "<tr><td class='font-weight-bold brown--text'>COM VÍNCULOS DE EMPREGO</td></tr>";
            text += "<tr><td>" + (dtCatMenores && dtCatMenores.agr_count_cd_municipio_ibge ? this.$numberTransformService.formatNumber(dtCatMenores.agr_count_cd_municipio_ibge,"inteiro") + " notificações de acidentes de menores de 18 anos" : "Não houve notificações de acidentes de menores de 18 anos")+ "</td></tr>";
            text += "<tr><td>Fonte: CATWEB 2012 a 2018</td></tr>";
            // text += "<tr><td class='font-weight-bold orange--text'>SEGUNDO AS NOTIFICAÇÕES SINAN</td></tr>";
            // text += "<tr><td>" + (dtSinan && dtSinan.agr_sum_vl_indicador ? this.$numberTransformService.formatNumber(dtSinan.agr_sum_vl_indicador,"inteiro") + " notificações relacionadas ao trabalho de "+ dtSinan.ds_agreg_primaria : "Não houve notificações relacionadas ao trabalho de Crianças e Adolescentes ( 0 a 17 anos)") +"</td></tr>";
            // text += "<tr><td>Fonte: MS - SINAN 2007 a 2018</td></tr>";
            text += "<tr><td class='font-weight-bold'>EXPLORADOS PELO TRABALHO ESCRAVO</td></tr>";
            text += "<tr><td class='font-weight-bold red--text'>LOCAL DE NASCIMENTO</td></tr>";
            text += "<tr><td>" + (dtTENascimento && dtTENascimento.agr_sum_vl_indicador ? this.$numberTransformService.formatNumber(dtTENascimento.agr_sum_vl_indicador,"inteiro") + " menores resgatados do trabalho escravo são naturais do município" : "Não houve menores resgatados do trabalho escravo naturais desse município")+ "</td></tr>";
            text += "<tr><td>Fonte: Seguro Desemprego, 2003-2018</td></tr>";
            // text += "<tr><td class='font-weight-bold light-blue--text'>LOCAL DE RESIDÊNCIA</td></tr>";
            // text += "<tr><td>" + (dtTEResidencia && dtTEResidencia.agr_sum_vl_indicador ? this.$numberTransformService.formatNumber(dtTEResidencia.agr_sum_vl_indicador,"inteiro") + " menores resgatados do trabalho escravo são residentes do município" : "Não houve menores resgatados do trabalho escravo residentes nesse município")+ "</td></tr>";
            // text += "<tr><td>Fonte: Seguro Desemprego, 2003-2018</td></tr>";
            text += "<tr><td class='font-weight-bold'>RISCOS DE EXPLORAÇÃO SEXUAL COMERCIAL</td></tr>";
            text += "<tr><td>" + (dtMapear && dtMapear.agr_count ? this.$numberTransformService.formatNumber(dtMapear.agr_count,"inteiro") + " pontos de riscos de exploração sexual de menores em rodovias federais do município" : "Não foram registrados locais de riscos de exploração sexual de menores em rodovias federais do município")+ "</td></tr>";
            text += "<tr><td>Fonte: Mapear/PRF</td></tr>";
            text += "<tr><td class='font-weight-bold green--text accent-4'>POTENCIAL DE COTAS DE APRENDIZAGEM</td></tr>";
            text += "<tr><td>" + (dtPotAprendizes && dtPotAprendizes.agr_sum_vl_indicador ? this.$numberTransformService.formatNumber(dtPotAprendizes.agr_sum_vl_indicador,"inteiro") + " vagas de cotas de aprendizagem" : "Nenhuma vaga de cotas de aprendizagem") + "</td></tr>";
            text += "<tr><td>Fonte: RAIS/Ministério da Economia, 2019</td></tr>";
            text += "</table>";
            target.bindPopup(text).openPopup();
          }))
      },

      obsSSTTooltip(target, route, tooltip_list = [], removed_text_list = [], options = null) {
        let text = "";
        if (options && options.clickable){
          text += "<p class='text-xs-right ma-0'><a href='" + this.$tooltipBuildingService.getUrlByPlace(target.options.rowData.cd_municipio_ibge_dv, route) + "' class='primary--text font-weight-black'>IR PARA</a></p>";
        }
        if (target.options.rowData.codigo == "sinan"){
          let urlIndicadores = "/indicadoresmunicipais?categorias=nm_municipio_uf,ds_agreg_primaria,ds_fonte&valor=vl_indicador&agregacao=sum&ordenacao=ds_agreg_primaria&filtros=nn-vl_indicador,and,ne-vl_indicador-0,and,in-cd_indicador-'06_05_01_00'-'06_05_02_00'-'06_05_03_00'-'06_05_04_00'-'06_05_05_00'-'06_05_06_00'-'06_05_07_00'-'06_05_08_00'-'06_05_09_00'-'06_05_11_00'-'06_05_12_00',and,ge-nu_competencia-'2012',and,eq-cd_mun_ibge-"+ target.options.rowData.cd_mun_ibge;
//          if (this.customParams.filterUrl && this.customParams.filterUrl != ""){
//            url = url + this.customParams.filterUrl;
//            text = "Considerados os seguintes filtros: " + this.customParams.filterText;
//          }
          axios.all([axios(this.$axiosCallSetupService.getAxiosOptions(urlIndicadores))])
            .then(axios.spread((resultIndicadores) => {
              let dtIndicadores = JSON.parse(resultIndicadores.data).dataset;

              text += "<p class='headline-obs'>Município: <b>" + dtIndicadores[0].nm_municipio_uf + "</b></p>";
              text += "<table width='100%'>";
              text += "<tr><td colspan='2' class='font-weight-bold'>As Notificações no Sistema de Informação de Agravos de Notificação (Sinan) para a localidade apresentaram os seguintes números:</td></tr>";
              for (let item of dtIndicadores){
                text += "<tr><td class='font-weight-bold purple--text accent-4'>" + item.ds_agreg_primaria + ":</td><td class='text-xs-right'>" + this.$numberTransformService.formatNumber(item.agr_sum_vl_indicador,"inteiro") + "</td></tr>";
              }
              text += "<tr><td>Fonte: "+ dtIndicadores[0].ds_fonte +"</td></tr>";
              text += "<tr><td>Período: 2012 a 2018</td></tr>";              
              text += "</table>";
              target.bindPopup(text).openPopup();
            }, error => {
              console.error(error.toString());
              this.sendError("Erro ao carregar dataset tooltip");
            }));
        } else {
        let urlPeriodo = "";
        let urlTipo = "";
        let urlAtividade = "";
        let urlObs1 = "";
        let urlObs2 = "";
        let txtTipoTitulo = "";
        let txtTipoQtde = "";
        let txtColor = "";
        let filtro = "";
        if (this.customParams.filterUrl && this.customParams.filterUrl != ""){
          filtro = this.customParams.filterUrl;
          text += "Considerados os seguintes filtros: " + this.customParams.filterText;
        }
        
        if (target.options.rowData.codigo == "cat"){  
          urlPeriodo = "/sst/cats?categorias=1&valor=ano_cat&agregacao=min,max";
          urlTipo = "/sst/cats?categorias=ds_natureza_lesao-nm_tipo&agregacao=COUNT&filtros=eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro + "&ordenacao=-agr_count&limit=5";
          txtTipoTitulo = "ACIDENTES DE TRABALHO"
          txtTipoQtde = this.$numberTransformService.formatNumber(target.options.rowData.agr_count_cd_municipio_ibge,"inteiro") + " registros de acidentes de trabalho";
          txtColor = "red--text darken-4"
          urlAtividade = "/sst/cats?categorias=ds_cnae_classe_cat-nm_atividade&agregacao=COUNT&filtros=ne-ds_cnae_classe_cat-'null',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro + "&ordenacao=-agr_count&limit=5";
          urlObs1 = "/sst/cats?categorias=cd_municipio_ibge&agregacao=COUNT&filtros=lt-idade_cat-18,and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro;
          urlObs2 = "/sst/cats?categorias=cd_municipio_ibge&agregacao=COUNT&filtros=eq-cd_indica_obito-'S',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro;
        } else if (target.options.rowData.codigo == "mortes"){  
          urlPeriodo = "/sst/cats?categorias=1&valor=ano_cat&agregacao=min,max";
          urlTipo = "/sst/cats?categorias=ds_natureza_lesao-nm_tipo&agregacao=COUNT&filtros=eq-cd_indica_obito-'S',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro + "&ordenacao=-agr_count&limit=5";
          txtTipoTitulo = "ACIDENTES DE TRABALHO COM MORTES"
          txtTipoQtde = this.$numberTransformService.formatNumber(target.options.rowData.agr_count_cd_municipio_ibge,"inteiro") + " registros de acidentes de trabalho com mortes.";
          txtColor = "black--text"
          urlAtividade = "/sst/cats?categorias=ds_cnae_classe_cat-nm_atividade&agregacao=COUNT&filtros=eq-cd_indica_obito-'S',and,ne-ds_cnae_classe_cat-'null',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro + "&ordenacao=-agr_count&limit=5";
          urlObs1 = "/sst/cats?categorias=cd_municipio_ibge&agregacao=COUNT&filtros=eq-cd_indica_obito-'S',and,lt-idade_cat-18,and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro;
          urlObs2 = "/sst/cats?categorias=cd_municipio_ibge&agregacao=COUNT&filtros=eq-cd_indica_obito-'S',and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro;
        } else {
          urlPeriodo = "/sst/beneficios?categorias=1&valor=ano_beneficio&agregacao=min,max";
          urlTipo = "/sst/beneficios?categorias=cd_agrupamento_categoria_cid-nm_tipo&agregacao=COUNT&filtros=eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + ",and,eq-cd_especie_beneficio-91"+ filtro + "&ordenacao=-agr_count&limit=5";
          txtTipoTitulo = "AFASTAMENTOS INSS (B91)"
          txtTipoQtde = this.$numberTransformService.formatNumber(target.options.rowData.agr_count_cd_municipio_ibge,"inteiro") + " afastamentos acidentários superiores a 15 dias(auxílio-doença por acidente de trabalho).";
          txtColor = "light-blue--text"
          urlAtividade = "/sst/beneficios?categorias=ds_cnae_classe-nm_atividade&agregacao=COUNT&filtros=ne-ds_cnae_classe-'null',and,eq-cd_especie_beneficio-91,and,eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + filtro +  "&ordenacao=-agr_count&limit=5";
          urlObs1 = "/sst/beneficios?categorias=cd_municipio_ibge&valor=qt_despesa_total&agregacao=SUM&filtros=eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + ",and,eq-cd_especie_beneficio-91"+ filtro ;
          urlObs2 = "/sst/beneficios?categorias=cd_municipio_ibge&valor=qt_dias_perdidos&agregacao=SUM&filtros=eq-cd_municipio_ibge-" + target.options.rowData.cd_mun_ibge + ",and,eq-cd_especie_beneficio-91"+ filtro ;
        }
        axios.all([axios(this.$axiosCallSetupService.getAxiosOptions(urlPeriodo)),
                   axios(this.$axiosCallSetupService.getAxiosOptions(urlTipo)),
                   axios(this.$axiosCallSetupService.getAxiosOptions(urlAtividade)),
                   axios(this.$axiosCallSetupService.getAxiosOptions(urlObs1)),
                   axios(this.$axiosCallSetupService.getAxiosOptions(urlObs2))])
          .then(axios.spread((resultPeriodo, resultTipo, resultAtividade, resultObs1, resultObs2) => {

            let dtPeriodo = JSON.parse(resultPeriodo.data);
            let dtTipo = JSON.parse(resultTipo.data).dataset;
            let dtAtividade = JSON.parse(resultAtividade.data).dataset;
            let dtObs1 = JSON.parse(resultObs1.data).dataset;
            let dtObs2 = JSON.parse(resultObs2.data).dataset;


            text += "<p class='title-obs'>Município: <b>" + target.options.rowData.nm_municipio_uf + "</b></p>";
            text += "<table width='100%'>";
            text += "<tr><td colspan='2' class='font-weight-bold "+ txtColor +"'>" + txtTipoTitulo + "</td></tr>";
            text += "<tr><td colspan='2'>" + txtTipoQtde + "</td></tr>";
            text += "<tr><td colspan='2' class='font-weight-bold "+ txtColor +"'>Destacaram-se as seguintes ocorrências:</td></tr>";
            for (let item of dtTipo){
              text += "<tr><td><b>" + item.nm_tipo + "</b> :</td><td class='text-xs-right'>" + this.$numberTransformService.formatNumber(item.agr_count,"inteiro") + "</td></tr>";
            }
            text += "<tr><td colspan='2' class='font-weight-bold "+ txtColor +"'>Atividade Econômicas mais frequentes envolvidas:</td></tr>";
            for (let item of dtAtividade){
              text += "<tr><td><b>" + item.nm_atividade + "</b> :</td><td class='text-xs-right'>" + this.$numberTransformService.formatNumber(item.agr_count,"inteiro") + "</td></tr>";
            }
            text += "<tr><td colspan='2'><br/></td></tr>";
            let ano_min = "";
            let ano_max = "";
            if (target.options.rowData.codigo == "cat" || target.options.rowData.codigo == "mortes"){  
              ano_min = this.customParams.value_min_ano_cat ? this.customParams.value_min_ano_cat : dtPeriodo.dataset[0].agr_min_ano_cat;
              ano_max = this.customParams.value_max_ano_cat ? this.customParams.value_max_ano_cat : dtPeriodo.dataset[0].agr_max_ano_cat;
              if(dtObs1.length > 0){
                text += "<tr><td colspan='2'>" + this.$numberTransformService.formatNumber(dtObs1[0].agr_count,"inteiro") +" ocorrências envolveram menores de 18 anos.</td></tr>";
              }
              if(dtObs2.length > 0 && target.options.rowData.codigo == "cat"){
                text += "<tr><td colspan='2'>Foram reportadas, ainda, "+ this.$numberTransformService.formatNumber(dtObs2[0].agr_count,"inteiro") +" mortes.</td></tr>";
              }
              text += "<tr><td colspan='2'><br/>Fonte: "+ dtPeriodo.metadata.fonte +"</td></tr>";
              text += "<tr><td colspan='2'>Período: " + ano_min + (ano_min != ano_max ? " a " + ano_max : "") +"</td></tr>";
            } else {
              ano_min = this.customParams.value_min_ano_beneficio ? this.customParams.value_min_ano_beneficio : dtPeriodo.dataset[0].agr_min_ano_beneficio;
              ano_max = this.customParams.value_max_ano_beneficio ? this.customParams.value_max_ano_beneficio : dtPeriodo.dataset[0].agr_max_ano_beneficio;
              text += "<tr><td colspan='2'>O impacto previdenciário dos afastamentos acidentários no município foi de " + this.$numberTransformService.formatNumber(dtObs1[0].agr_sum_qt_despesa_total,"monetario",2) +" , com a perda de "+ this.$numberTransformService.formatNumber(dtObs2[0].agr_sum_qt_dias_perdidos,"inteiro") +" dias de trabalho.</td></tr>";
              text += "<tr><td colspan='2'><br/>Fonte: "+ dtPeriodo.metadata.fonte +"</td></tr>";
              text += "<tr><td colspan='2'>Período: " + ano_min + (ano_min != ano_max ? " a " + ano_max : "") +"</td></tr>";
            }
            text += "</table>";

            target.bindPopup(text).openPopup();
          }, error => {
            console.error(error.toString());
            this.sendError("Erro ao carregar dataset tooltip");
          }));
        }
      },

      defaultLeafletTooltip(target, route, tooltip_list = [], removed_text_list = [], options = null) { 
        let d = target.options.rowData;
        target.unbindPopup();
        target.bindPopup(this.$tooltipBuildingService.defaultTooltip(d, route, tooltip_list, removed_text_list, options)).openPopup();
      },

      addDeafultMarker(localidade, map) {
        let icon = L.icon({
            iconUrl: '/static/markers/black.png',
            
            iconSize:     [25, 25], // size of the icon
            iconAnchor:   [9, 24], // point of the icon which will correspond to marker's location
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });
        this.defaultMarker = L.marker([localidade.latitude, localidade.longitude], { icon: icon }).addTo(map);
      },

      download() {
        // var d3plusExport = require('../node_modules/d3plus-export/build/d3plus-export.min.js');
        // let svg = document.getElementById(this.id).getElementsByTagName('svg')[0];
        // d3plusExport.saveElement(svg, { filename: this.id });

        // Inclusão de opção de baixar o gráfico
        // let printPlugin = L.easyPrint({
        //   sizeModes: ['Current']
        // }).addTo(this.leafletMap); 

        console.log(this.printPlugin);
        this.printPlugin.printMap('CurrentSize', 'teste');
      },

      reloadMap() {
        if (this.leafletMap !== null && this.leafletMap !== undefined) {
          this.leafletMap.off();
          this.leafletMap.remove();
          this.leafletMap = null;
        }

        this.layers = [];
        let chartContainer = document.getElementById(this.id);
        
        if (chartContainer != null) {
          chartContainer.innerHTML = "";
        
          // var width = parseInt(chartContainer.offsetWidth);
          let height = parseInt(chartContainer.offsetWidth / this.heightProportion);
          chartContainer.style.height = height + "px";
          
          let leaflet_map = L.map(this.id).setView([-15.793889, -47.882778], 5);
          leaflet_map.options.minZoom = 4;
          // L.tileLayer(
          //   this.options.tiles_url,
          //   // { attribution: this.options.tiles_attribution }
          // ).addTo(leaflet_map);

          let tileLayer = this.createTileLayer()
          tileLayer.addTo(leaflet_map)
          this.createPrintPlugin(tileLayer).addTo(leaflet_map);
          this.leafletMap = leaflet_map;

          if (this.customParams.limCoords.ymin != null){
            let bounds = new L.LatLngBounds(
              [this.customParams.limCoords.ymin, this.customParams.limCoords.xmin],
              [this.customParams.limCoords.ymax, this.customParams.limCoords.xmax]
            );
            // console.log(this.customParams.limCoords);
            leaflet_map.fitBounds(bounds, { padding: [10, 10] });
            this.fillLayers(leaflet_map.getBoundsZoom(bounds));
          } else {
            this.fillLayers();
          }

        }
      },

      adjustVisibleLayers() {
        if(this.options.type == "bubbles" && this.customParams.enabled){
          for (let indx in this.customParams.enabled) {
            // Verifica quais parâmetros mudaram
            // if (this.customParams.enabled[indx] != this.visibleLayers[indx]) {
            if (this.customParams.enabled[indx]) {
              this.leafletMap.addLayer(this.layers[indx]);
            } else {
              this.leafletMap.removeLayer(this.layers[indx]);
            }
            this.visibleLayers[indx] = this.customParams.enabled[indx];
            // }
          }
        } else if(this.options.type == "heat" || this.options.type == "cluster"){
          this.leafletMap.removeLayer(this.mapLayer);
          this.visibleLayers = this.customParams.enabled;
          this.fillLayers();
        }
      }
    }
  }
</script>

<style>
  @import "../../node_modules/leaflet/dist/leaflet.css";
  @import "../../node_modules/leaflet.markercluster/dist/MarkerCluster.css";
  @import "../../node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css";

  .leaflet-container {
        font-family: Palanquin !important;
  }
  .leaflet-interactive {
    cursor: pointer;
  }  
</style>
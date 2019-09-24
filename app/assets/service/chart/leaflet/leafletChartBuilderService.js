import GeneralChartBuilderService from '../generalChartBuilderService'

import * as d3chrom from 'd3-scale-chromatic'

import TooltipBuildingService from '../../singleton/tooltipBuildingService'

class LeafletChartBuilderService extends GeneralChartBuilderService {
    tiles = {
        url: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
	clickable = true
	layers = {}
    L = require('../../../../node_modules/leaflet/dist/leaflet.js');
    
    constructor() {
        super();
        this.L = Object.assign(this.L, require('../../../../node_modules/leaflet-easyprint/dist/bundle.js'));
        this.L = Object.assign(this.L, require('../../../../node_modules/leaflet.heat/dist/leaflet-heat.js'));
        this.L = Object.assign(this.L, require('../../../../node_modules/leaflet.markercluster/dist/leaflet.markercluster.js'));
    }

    generateChart(containerId, dataset, options, additionalOptions) {
        let chartContainer = document.getElementById(containerId);
        //if (chartContainer.innerHTML != '') throw 'Mapa já instanciado!';
        
        // Replacing defaults
        if (options.tiles_url) this.tiles.url = options.tiles_url;
        if (options.tiles_attribution) this.tiles.attribution = options.tiles_attribution;
        if (options.height_proportion) this.heightProportion = options.height_proportion;
        if (options.clickable && options.clickable === false) this.clickable = false;

        delete this.L.Icon.Default.prototype._getIconUrl;
  
        this.L.Icon.Default.mergeOptions({
			iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
			iconUrl: require('leaflet/dist/images/marker-icon.png'),
			shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        });
        
        let height = parseInt(chartContainer.offsetWidth / this.heightProportion);
        chartContainer.style.height = height + "px";
  
        if (options.colorArray === null || options.colorArray === undefined) options.colorArray = d3chrom.schemeDark2;
  
        let leaflet_map = this.L.map(containerId).setView([-15.793889, -47.882778], 5);
		leaflet_map.options.minZoom = 4;
		
		let bounds;
		if (additionalOptions.limCoords) {
			bounds = new this.L.LatLngBounds(
				[additionalOptions.limCoords.ymin, additionalOptions.limCoords.xmin],
				[additionalOptions.limCoords.ymax, additionalOptions.limCoords.xmax]
			);
			leaflet_map.fitBounds(bounds, { padding: [10, 10] });
		}
  
		// Adiciona o marker do município apenas se houver idLocalidade
		// TODO Check possible problem with promise
        if (options.hide_place_marker == undefined || !options.hide_place_marker){
          if (additionalOptions && additionalOptions.idAU && additionalOptions.idAU.length == 7) {
            let findLoc = additionalOptions.au;
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
            
        let tileLayer = this.createTileLayer(options);
        tileLayer.addTo(leaflet_map)
        this.createPrintPlugin(tileLayer).addTo(leaflet_map);

        additionalOptions.containerId = containerId;
  
		leaflet_map = this.fillLayers(leaflet_map, dataset, Object.assign(options, additionalOptions), bounds ? leaflet_map.getBoundsZoom(bounds) : null);
  
		window.addEventListener('resize', this.resizeMapArea, null, containerId);
		
		return leaflet_map;
    }

    circleClick(e) {
        let tooltip_function = e.target.options.customOptions.tooltipFunction;
        let tooltip_context = e.target.options.customOptions.context ? e.target.options.customOptions.context : null;
        tooltip_function.apply(
            tooltip_context,
            [ e.target,
              e.target.options.customOptions.route,
              e.target.options.customOptions.headers,
              e.target.options.customOptions.removed_text_list,
              e.target.options.customOptions
            ]
        );
    }

    createTileLayer(options) {
        this.L.TileLayer.ShowAsDiv = this.L.TileLayer.extend({
            createTile: function (coords, done) {
                let tile = document.createElement('div');
          
                if (options.crossOrigin) tile.crossOrigin = '';
              
                tile.style.backgroundImage = "url('"+this.getTileUrl(coords)+"')";
                tile.style.visibility = 'inherit'; 
          
                return tile;
            }
        });

        var L = this.L;
        this.L.tileLayer.showAsDiv = function(args) { return new L.TileLayer.ShowAsDiv(args); };

        return this.L.tileLayer.showAsDiv(
            this.tiles.url,
            { attribution: this.tiles.attribution, crossOrigin: true }
        );
    }

    createPrintPlugin(tileLayer) {
        let printPlugin = this.L.easyPrint({
            tileLayer: tileLayer,
            sizeModes: ['Current'],
            filename: 'teste',
            exportOnly: true,
            hideControlContainer: true
        });
        // TODO Check when used
        // this.printPlugin = printPlugin;
        return printPlugin;
    }

    resizeMapArea(id) {
        let chartContainer = document.getElementById(id);
        let height = parseInt(chartContainer.offsetWidth / this.heightProportion);
        chartContainer.style.height = height + "px";
    }

	addDeafultMarker(localidade, map) {
		let icon = this.L.icon({
			iconUrl: '/static/markers/black.png',
			
			iconSize:     [25, 25], // size of the icon
			iconAnchor:   [9, 24], // point of the icon which will correspond to marker's location
			popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		});
		this.defaultMarker = this.L.marker([localidade.latitude, localidade.longitude], { icon: icon }).addTo(map);
	}

	download(printPlugin) {
        // var d3plusExport = require('../node_modules/d3plus-export/build/d3plus-export.min.js');
        // let svg = document.getElementById(this.id).getElementsByTagName('svg')[0];
        // d3plusExport.saveElement(svg, { filename: this.id });

        // Inclusão de opção de baixar o gráfico
        // let printPlugin = this.L.easyPrint({
        //   sizeModes: ['Current']
        // }).addTo(this.leafletMap); 

        printPlugin.printMap('CurrentSize', 'teste');
	}

	reloadMap(map, containerId, dataset, options, additionalOptions) {
        if (map !== null && map !== undefined) {
          map.off();
          map.remove();
          map = null;
		}
		
        let chartContainer = document.getElementById(containerId);

        if (chartContainer != null) {
			chartContainer.innerHTML = "";
			
			// var width = parseInt(chartContainer.offsetWidth);
			let height = parseInt(chartContainer.offsetWidth / this.heightProportion);
			chartContainer.style.height = height + "px";
			
			if (options.colorArray === null || options.colorArray === undefined) options.colorArray = d3chrom.schemeDark2;

			let leaflet_map = this.L.map(containerId).setView([-15.793889, -47.882778], 5);
			leaflet_map.options.minZoom = 4;

			let bounds;
			if (additionalOptions.limCoords) {
				bounds = new this.L.LatLngBounds(
					[additionalOptions.limCoords.ymin, additionalOptions.limCoords.xmin],
					[additionalOptions.limCoords.ymax, additionalOptions.limCoords.xmax]
				);
				// console.log(this.customParams.limCoords);
				leaflet_map.fitBounds(bounds, { padding: [10, 10] });
			}

			// Adiciona o marker do município apenas se houver idLocalidade
			// TODO Check possible problem with promise
			if (options.hide_place_marker == undefined || !options.hide_place_marker){
				if (additionalOptions && additionalOptions.idAU && additionalOptions.idAU.length == 7) {
					let findLoc = additionalOptions.au;
					if (findLoc && (findLoc instanceof Promise || findLoc.then)) {
						findLoc.then(response => { this.addDeafultMarker(response, leaflet_map); })
							.catch(error => { this.sendError(error); });
					} else {
						this.addDeafultMarker(findLoc, leaflet_map);
					}
				}
			}

			let tileLayer = this.createTileLayer(options);
        	tileLayer.addTo(leaflet_map)
        	this.createPrintPlugin(tileLayer).addTo(leaflet_map);
  
			leaflet_map = this.fillLayers(leaflet_map, dataset, Object.assign(options, additionalOptions), bounds ? leaflet_map.getBoundsZoom(bounds) : null);

			return leaflet_map;
		}
      }

	  // TODO Decouple
	  adjustVisibleLayers(map, options) {
        map.removeLayer(this.mapLayer);
        // this.visibleLayers = this.customParams.enabled;
        this.fillLayers();
      }
}

export default LeafletChartBuilderService
<script>
  import * as d3 from 'd3'
  import * as d3plus from 'd3plus'
  import FLPOBaseChart from '../FLPOBaseChart.vue';

  export default {
    props: ['selectedPlace'],
    extends: FLPOBaseChart,
    data () {
      return { 
        viz: null
      }
    },
    created() {
      // Ajusta o tiles
      if (this.options.tiles_url === null || this.options.tiles_url === undefined) { 
        this.options.tiles_url = 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
        //this.options.tiles_url = 'https://maps.tilehosting.com/styles/bright/{z}/{x}/{y}.png?key=lV7KSuXrAcGDiOLPf6kh';
        //this.options.tiles_url = 'https://tiledbasemaps.arcgis.com/arcgis/rest/services/World_Terrain_Base/MapServer/{z}/{y}/{x}';
      }
    },
    methods: {
      prepareChart(viz, slicedDS, containerId, options) {

        if(!options.colorScale){ //default
          options.colorScale = {};
          options.colorScale.type = 'singleHue';
          options.colorScale.order = 'asc';
        } else if(options.colorScale.type == null || options.colorScale.type == undefined){
          options.colorScale.type = 'singleHue';
        }

        if (options.colorScale.type == "fixed"){
          viz = viz.shapeConfig({ 
            Path: {
              fill: function(d) { 

                let color = options.colorScale.color_array[d[options.value_field]];
                return color ? color : "transparent";
              }
            }
          })
          .legend(false);
        } else if (options.colorScale.type == "bipolar"){
          viz = viz.shapeConfig({ 
            Path: {
              fill: function(d) { 
                let color = options.colorScale.color_array.zero;
                if (d[options.value_field] > 0) {
                  color = options.colorScale.color_array.positive;
                } else if (d[options.value_field] < 0) {
                  color = options.colorScale.color_array.negative;
                }
                return color;
                // let color = options.colorScale.color_array[d[options.value_field]];
                // return color ? color : "transparent";
              }
            }
          })
          .legend(false);
        } else {

          let aColorScale = this.$colorsService.getColorScale(options.colorScale.name, options.colorScale.type, options.colorScale.order, 9);

          let distValues = [];
          for (let reg of slicedDS) {  
            if (!distValues.includes(reg[options.value_field])){
              distValues.push(reg[options.value_field]);
            }
            if (distValues.length > 2){
              break;
            }
          }


          // if (distValues.length == 2){
          if (distValues.length > 1){
            aColorScale = aColorScale.slice(1,-1);
          } else if (distValues.length == 1){
            if (options.single_data_color && options.single_data_color[distValues[0]]) {
              aColorScale = options.single_data_color[distValues[0]];
            } else if (options.single_data_color && options.single_data_color.default) {
              aColorScale = options.single_data_color.default;
            } else {
              aColorScale = aColorScale[4];
            }
          }

          var objAxisConfig = this.getTransparentXYConfig();
          //objAxisConfig.shapeConfig.labelConfig.fontColor = "transparent";
          if (options.colorScale && options.colorScale.inv_function) {
            var inv_tickFn = this.customFunctions[options.colorScale.inv_function.name];
            var inv_args = [];
            for (var indxInvArg in options.colorScale.inv_function.args) {
              if (options.colorScale.inv_function.args[indxInvArg].fixed) {
                inv_args.push(options.colorScale.inv_function.args[indxInvArg].fixed);
              } else if (options.colorScale.inv_function.args[indxInvArg].first_row_prop) {
                inv_args.push(this.dataset[0][options.colorScale.inv_function.args[indxInvArg].first_row_prop]);
              }
            }            
            objAxisConfig.tickFormat = (t) => {
              let t_args = inv_args.slice();
              t_args.unshift(t);
              return inv_tickFn.apply(null, t_args);
            };
          }


          if(distValues.length != 1){
            viz = viz.colorScaleConfig({
              color: aColorScale,
              axisConfig: objAxisConfig,            
              rectConfig: { stroke: this.$colorsService.assessZebraTitleColor(this.sectionIndex, null, this.$vuetify.theme) }
            });
            viz = viz.colorScale(options.value_field);
          } else {
            viz = viz.shapeConfig({ 
              Path: {
                fill: function(d) { return d[options.value_field] ? aColorScale: "transparent"; }
              }
            })
            .legend(false);
          }
        } 
        // else if (options.colorScale.type != "fixed"){
        //   viz = viz.shapeConfig({ 
        //     Path: {
        //       fill: function(d) { 

        //         let color = options.colorScale.color_array[d[options.value_field]];
        //         return color ? color : "transparent";
        //       }
        //     }
        //   })
        //   .legend(false);
        // }
        let grafico = viz
            .select(containerId)  // container DIV to hold the visualization
            .data(slicedDS)  // data to use with the visualization
            .groupBy(options.id_field)         // key for which our data is unique on
            .topojsonId((t) => { return t.properties[options.topo_key]; })
            .detectResize(true);
            

        let searchFunction = this.searchAnalysisUnit;
        let clickedPlace = "";
        let hasTouch = this.hasTouch;
        if (options.clickable){
          viz = viz.on("click", function(d) {
                if (clickedPlace == d[options.id_field] || !hasTouch()) {
                  let place = {};
                  place.id = String(d[options.id_field]);
                  place.to = '/localidade/' + d[options.id_field] + '?';
                  if (this._tooltip) {
                          this._tooltipClass.data([]).render();
                  }                
                  searchFunction(place);
                }
                clickedPlace = d[options.id_field];
              });     
        }  
        return grafico;
      },

      hasTouch() { //identify touchable devices (mobile and tablet)
        return (('ontouchstart' in window) ||       // html5 browsers
                (navigator.maxTouchPoints > 0) ||   // future IE
                (navigator.msMaxTouchPoints > 0));  // current IE10
      },

      // postGenerate(){
      //   let containerId = "#" + this.id;
      //   let viz = this.viz ? this.viz : this.generateViz(this.options);
      //   let localidade = this.customParams.localidade;
      //   let projection = viz.projection();

      //   if(localidade && localidade.longitude && localidade.latitude){
      //     let marks = [{long: localidade.longitude, lat: localidade.latitude}];
      //     setTimeout(function(containerId, marks, projection) {
      //       let svgSelect = containerId + " svg";
      //       let svg = d3.select(svgSelect);
      //       svg.selectAll(".mark")
      //           .data(marks)
      //           .enter()
      //           .append("image")
      //           .attr('class','mark')
      //           .attr('width', 20)
      //           .attr('height', 20)
      //           .attr("xlink:href",'/static/markers/black.png')
      //           .attr("transform", (d) => {return 'translate('+projection([d.long,d.lat])+')'});
      //     }, 50, containerId, marks, projection);
      //   }
      // },

      // generateViz(options){
      //   if (options.topology) {
      //     axios.get(options.topology)
      //       .then(response => {
      //         return this.generateVizWithTopology(options, response.data);
      //       });
      //   } else {
      //     return this.generateVizWithTopology(options, this.topology);
      //   }
      // },

      generateViz(options) {
        var tooltip_function = options.tooltip_function ? options.tooltip_function : this.$tooltipBuildingService.defaultTooltip;
        let tooltip_context = options.tooltip_function ? this : this.$tooltipBuildingService;
        options.clickable = options.clickable == true || options.clickable == undefined  ? true : false;
        var headers = this.headers;
        var route = this.$route;
        var removed_text_list = options.removed_text_list;

        var idLocalidade = this.selectedPlace ? this.selectedPlace : this.customParams.idLocalidade;
        // var idField = options.id_field;
        // var longField = options.long ? options.long : 'longitude';
        // var latField = options.lat ? options.lat : 'latitude';

        var viz = new d3plus.Geomap()
          .shapeConfig({ 
            labelConfig: {
              fontFamily: "titulos-observatorio"
            },
            Path: {
              fillOpacity: 0.9,
              strokeWidth: function(d) { return (idLocalidade !== null && idLocalidade !== undefined && (d[options.id_field] == idLocalidade || (d.properties && d.properties[options.topo_key] == idLocalidade) ) )  ? 5 : 0.2 },
              stroke: 'black'
            }
            // Circle: {
            //   strokeWidth: 3,
            //   stroke: 'black'
            // }
          })
          .tileUrl(options.tiles_url)
          .topojson(this.options.topology && this.options.topology == 'uf' ? this.topologyUf : this.topology) 
          .tooltipConfig({
            body: function(d) {
              return tooltip_function.apply(tooltip_context, [d, route, headers, removed_text_list, options]);
            },
            title: function(d) {
              return "";
            }
          })
          .colorScalePosition("right");

          // .point(function(d) {
          //   return idLocalidade == d[idField] ?  [d[longField], d[latField]] : null; 
          // });

        return viz;
      }
    }
  }
</script>

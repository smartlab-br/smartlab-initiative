import axios from 'axios'
import * as yaml from 'js-yaml'

const ViewConfReader = {
	install(Vue, options) {
		Vue.mixin({
			data() {
				return {
					errorMessage: null,
					leafletBasedCharts: ['MAP_BUBBLES', 'MAP_HEAT', 'MAP_CLUSTER', 'MAP_MIGRATION', 'MAP_POLYGON', 'MIXED_MAP']
				}
			},
			methods: {
				async loadYamlArray(currentStruct, yamlArray, finalCbFunction) {
					let promises = [];
					let promises_alt = [];
					
					let basePath = this.$store.state.GIT_VIEWCONF_TAG_URL ? this.$store.state.GIT_VIEWCONF_TAG_URL : "/static/smartlab-initiative-viewconf/";
					
					// TODO Need to intercept 404 errors thrown to the browser console.
					for (let yamlConfIndex in yamlArray) {	
						promises[yamlConfIndex] = new Promise(
							function(resolve, reject) {
								axios.get(basePath + yamlArray[yamlConfIndex].main + ".yaml")
									.then(response => {
										resolve(yaml.safeLoad(response.data, { json: true }))
									}).catch(error => { resolve(null); });
							}
						);

						if (yamlArray[yamlConfIndex].alt) {
							promises_alt[yamlConfIndex] = new Promise(
								function(resolve, reject) {
									axios.get(basePath + yamlArray[yamlConfIndex].alt + ".yaml")
										.then(response => {
											resolve(yaml.safeLoad(response.data, { json: true }));
										}).catch(error => { resolve(null); });
								}
							);
						}
					}

					// Define a execução após a realização de todos os promises
					Promise.all(promises).then(
						(structs) => {
							let checked = [];
							let result = currentStruct ? currentStruct : {};
							for (let structIndx in structs) {
								if (structs[structIndx]) {
									checked.push(structIndx);
									result = Object.assign(result, structs[structIndx]);
								}
							}
							
							Promise.all(promises_alt).then(
								(structs_alt) => {
									for (let structIndx in structs_alt) {
										if (structs_alt[structIndx] && !checked.includes(structIndx)) {
											result = Object.assign(result, structs_alt[structIndx]);
										}
									}
									finalCbFunction(result);
								}
							);
						}
					);
				},

				fillDataStructure(structure, customParams, customFunctions,
								  cbFunction, addedParams) {
					if (structure !== null && structure !== undefined) {
						let msgError = "Falha ao carregar dados do componente.";
						let fnSendDataStructureError = this.sendDataStructureError;
						if (addedParams && addedParams.msgError){
							msgError = addedParams.msgError;
						}

						if (addedParams && addedParams.endpoint) {
							// Endpoint que sobrescreve a definição do structure.api.
							// Normalmente associado ao algum comportamento reativo,
							// como filtro.
							if (!Array.isArray(structure.api)) {
								// If the structure defines a single API call, execute the
								// callback after the axios call.
								axios(this.$axiosCallSetupService.getAxiosOptions(addedParams.endpoint))
								.then(result => {
									cbFunction(
										this.reformDataset(
											result.data.dataset,
											structure.api.options,
											customFunctions,
											customParams
										),
										structure.args,
										structure,
										addedParams,
										result.data.metadata
									);
								}
							 	).catch(error => { 
									console.log(error);
									fnSendDataStructureError(msgError); 
								});
							} else {
								// If the structure defines a single API call, execute the
								// callback after all the axios calls are resolved.
								let promises = [];
								let fnReformDataset = this.reformDataset;
								for (let indexApi in addedParams.endpoint) {
									let apiCall = this.$axiosCallSetupService.getAxiosOptions(addedParams.endpoint[indexApi]);
									// Cria um promise
									let promise = new Promise(
										function(resolve, reject) {
											axios(apiCall)
											.then(result => {
												resolve(
													fnReformDataset(
														result.data.dataset,
														structure.api[indexApi].options,
														customFunctions,
														customParams
													)
												);
											}).catch(error => { 
												console.log(error);
												fnSendDataStructureError(msgError); 
											});
										}
									);
									// Adiciona o promise à lista da espera
									promises.push(promise);
								}

								// Define a execução após a realização de todos os promises
								Promise.all(promises).then(
									(datasets) => {
										let fullDS = [];
										for (let dataset of datasets) {
											fullDS = fullDS.concat(dataset);
										}
										if (structure.api_options) {
											fullDS = fnReformDataset(
												fullDS,
												structure.api_options,
												customFunctions,
												customParams
											)											
										}
										cbFunction(
											fullDS,
											structure.args,
											structure,
											addedParams,
											null // Sem metadata nesses casos
										);
									}
								).catch(error => { 
									console.log(error);
									fnSendDataStructureError(msgError); 
								});
						
							}

						} else if (addedParams && addedParams.react &&
							structure.api_reactive !== null && structure.api_reactive !== undefined) {
							// If the structure defines an API call, execute the
							// callback after the axios call.
							let fusionParams = Object.assign(customParams, addedParams.react);
							let url = this.$textTransformService.applyInterpol(structure.api_reactive, {}, customFunctions, fusionParams);
							axios(this.$axiosCallSetupService.getAxiosOptions(url))
							.then(result => {
								cbFunction(
									this.reformDataset(
										result.data.dataset,
										structure.api_reactive.options,
										customFunctions,
										customParams
									),
									structure.args,
									structure,
									addedParams,
									result.data.metadata
								);
							}).catch(error => { 
								console.log(error);
								fnSendDataStructureError(msgError); 
							});
						} else if (structure.fixed !== null && structure.fixed !== undefined) {
							// Apply callback on fixed value
							cbFunction(structure.fixed, structure.args, structure, addedParams);
						} else if (structure.function) {
							// Runs function with args defines in yaml structure
							cbFunction(
								this.$objectTransformService.runNamedFunction(
									structure, null,
									Object.assign({}, customFunctions)
								),
								structure.args,
								structure,
								addedParams
							);
						} else if (structure.preloaded) {
							// If the structure defines the usage of preloaded indicators.
							if (!this[structure.preloaded.function] && structure.preloaded.function == 'slice') {
								cbFunction(
									this.reformDataset(
										this.$indicatorsModel.slice(
											structure.preloaded, 
											customParams && customParams[structure.preloaded.prop] ? customParams[structure.preloaded.prop] : this.$indicatorsModel.getGlobalDatasets()[structure.preloaded.prop].ds,
											Object.assign({}, customFunctions, customParams)
										),
										structure.preloaded.options,
										customFunctions
									),
									structure.args,
									structure,
									addedParams
								);
							} else {
								cbFunction(
									this.reformDataset(
										this[structure.preloaded.function](
											structure.preloaded, 
											customParams && customParams[structure.preloaded.prop] ? customParams[structure.preloaded.prop] : this.$indicatorsModel.getGlobalDatasets()[structure.preloaded.prop].ds,
											Object.assign({}, customFunctions, customParams)
										),
										structure.preloaded.options,
										customFunctions
									),
									structure.args,
									structure,
									addedParams
								);
							}
						} else if (structure.api !== null && structure.api !== undefined) {
							if (!Array.isArray(structure.api)) {
								// If the structure defines a single API call, execute the
								// callback after the axios call.
								let url = this.$textTransformService.applyInterpol(structure.api, {}, customFunctions, customParams);
								axios(this.$axiosCallSetupService.getAxiosOptions(url))
								.then(result => {
									cbFunction(
										this.reformDataset(
											result.data.dataset,
											structure.api.options,
											customFunctions,
											customParams
										),
										structure.args,
										structure,
										addedParams,
										result.data.metadata
									);
								}).catch(error => { 
									console.log(error);
									fnSendDataStructureError(msgError); 
								});
							} else {
								// If the structure defines a single API call, execute the
								// callback after all the axios calls are resolved.
								let promises = [];
								let fnReformDataset = this.reformDataset;
								for (let eachApi of structure.api) {
									let apiCall = this.$axiosCallSetupService.getAxiosOptions(this.$textTransformService.applyInterpol(eachApi, {}, customFunctions, customParams));
									// Cria um promise
									let promise = new Promise(
										function(resolve, reject) {
											axios(apiCall)
											.then(result => {
												resolve(
													fnReformDataset(
														result.data.dataset,
														eachApi.options,
														customFunctions,
														customParams
													)
												);
											}).catch(error => { 
												console.log(error);
												fnSendDataStructureError(msgError); 
											});
										}
									);
									// Adiciona o promise à lista da espera
									promises.push(promise);
								}

								// Define a execução após a realização de todos os promises
								Promise.all(promises).then(
									(datasets) => {
										let fullDS = [];
										for (let dataset of datasets) {
											fullDS = fullDS.concat(dataset);
										}
										if (structure.api_options) {
											fullDS = fnReformDataset(
												fullDS,
												structure.api_options,
												customFunctions,
												customParams
											)											
										}
										cbFunction(
											fullDS,
											structure.args,
											structure,
											addedParams,
											null // Sem metadata nesses casos
										);
									}
								).catch(error => { 
									console.log(error);
									fnSendDataStructureError(msgError); 
								});
							}
						} else if (structure.chart_data) { // Estrutura obtida de uma chamada de API
							cbFunction(
								this.reformDataset(
									structure.chart_data.dataset,
									structure.reform_options,
									customFunctions,
									customParams
								),
								structure.args,
								structure,
								addedParams,
								structure.chart_data.metadata
							);
						} else {
							// Apply callback without data
							cbFunction(structure.fixed, structure.args, structure, addedParams);
						}
					}
				},

				sendDataStructureError(error = "Falha ao carregar dados do componente."){
					this.sendError(error);
					this.errorMessage = error;
				},

				reformDataset(dataset, reformOptions, customFunctions, customParams = {}) {
					if (reformOptions) {
						// Adiciona o mínimo e o máximo ao dataset
						if (reformOptions.recalc_min_max) {
							let minmax_field = (reformOptions.minmax_field) ? reformOptions.minmax_field : 'vl_indicador';
							dataset = this.$indicatorsModel.getMinMaxEachIndicator(dataset, minmax_field);
						}

						if (reformOptions.combine) {
							dataset = dataset.concat(this.$indicatorsModel.combineIndicators(dataset, reformOptions.combine, customFunctions, reformOptions.place_id_field));

							// Faz um slice, se declarado
							if (reformOptions.slice) {
                				dataset = this.$indicatorsModel.slice(reformOptions.slice, dataset, {});
							}
						}
						
						// Melts the dataset (ruws to columns)
						if (reformOptions.melt) {
							dataset = this.$indicatorsModel.melt(
								dataset,
								reformOptions.melt.value_field,
								reformOptions.melt.layer_fields,
								reformOptions.melt.layer_field,
								reformOptions.melt.label_fields,
								reformOptions.melt.label_field,
								reformOptions.melt.value_function
							);
						}
		
						for (var indx in reformOptions.calcs) {
							let nuField = 'calc_' + reformOptions.calcs[indx].id;
							for (let eachRow in dataset) {
								if (reformOptions.calcs[indx].function) {
									dataset[eachRow][nuField] = this.$objectTransformService.runNamedFunction(
										reformOptions.calcs[indx], dataset[eachRow],
										customFunctions, [dataset[eachRow]], customParams);
								}
								
								if(reformOptions.calcs[indx].format){
									dataset[eachRow][nuField] = this.$numberTransformService.constructor.formatNumber(
										dataset[eachRow][nuField], reformOptions.calcs[indx].format,
										reformOptions.calcs[indx].precision, reformOptions.calcs[indx].multiplier,
										reformOptions.calcs[indx].collapse, reformOptions.calcs[indx].signed,
										reformOptions.calcs[indx].uiTags
									);                  
								}
							}

							// Adiciona o mínimo e o máximo ao dataset
							if (reformOptions.calcs[indx].recalc_min_max) {
								dataset = this.$indicatorsModel.getMinMaxEachIndicator(dataset, nuField);
							}
						}

						for (let indxClone in reformOptions.clone) {
							dataset.map((reg) => {
								reg[reformOptions.clone[indxClone].new_column] = reg[reformOptions.clone[indxClone].id];
							  });  

						}

						for (var indxFmts in reformOptions.formatters) {
							let nuField = 'fmt_' + reformOptions.formatters[indxFmts].id;
							let formatRules = reformOptions.formatters[indxFmts];
							for (let eachRow in dataset) {
								if (formatRules.format == 'auto') {
									formatRules = this.$textTransformService.getFormatRules(formatRules, dataset[eachRow]);
								}
								dataset[eachRow][nuField] = this.$numberTransformService.constructor.formatNumber(
									dataset[eachRow][reformOptions.formatters[indxFmts].id], 
									formatRules.format, 
									formatRules.precision, 
									formatRules.multiplier, 
									formatRules.collapse,
									formatRules.signed,
									formatRules.uiTags
								);
							}

							// Adiciona o mínimo e o máximo ao dataset
							if (reformOptions.formatters[indxFmts].recalc_min_max) {
								dataset = this.$indicatorsModel.getMinMaxEachIndicator(dataset, nuField);
							}
						}
		
						// if (reformOptions.cast) {
						// 	console.log(reformOptions);
						// 	dataset = this.$indicatorsModel.cast(
						// 		dataset,
						// 		reformOptions.cast.col_fields,
						// 		reformOptions.value_field ? reformOptions.value_field : 'vl_indicador',
						// 		reformOptions.cast.layer_field ? reformOptions.layer_field : 'cd_indicador'
						// 	);
						// }

						if (reformOptions.order_field !== null && reformOptions.order_field !== undefined) {
							dataset = this.$indicatorsModel.sortObject(dataset, reformOptions.order_field);
						}
					}
					
					return dataset;
				},

				autoFillLayout(base_object_list, rules, preloaded, addedParams = null, metadata = null) {
					let localFunctions = this.customFunctions;
					if (base_object_list && base_object_list.length > 0) {
						let base_object = base_object_list[0];
						for (var ruleIndx in rules) {
							var prop = '';
							if (rules[ruleIndx].fixed) {
									prop = rules[ruleIndx].fixed;
							} else if (rules[ruleIndx].named_prop) {
									prop = base_object[rules[ruleIndx].named_prop];
							} else if (rules[ruleIndx].function) {
								prop = this.$objectTransformService.runNamedFunction(rules[ruleIndx], base_object, localFunctions);
							}

							if ((prop === null || prop === undefined) && rules[ruleIndx].default) {
								prop = rules[ruleIndx].default;
							} else if (rules[ruleIndx].format !== null && rules[ruleIndx].format !== undefined) {
								let formatRules = rules[ruleIndx];
								if (rules[ruleIndx].format == 'auto') {
									formatRules = this.$textTransformService.getFormatRules(rules[ruleIndx], base_object);
								}
								prop = this.$numberTransformService.constructor.formatNumber(
									prop, formatRules.format, formatRules.precision,
									formatRules.multiplier, formatRules.collapse, formatRules.signed,
									formatRules.uiTags
								);
							}

							if (addedParams && addedParams.innerProp) {
								this[addedParams.innerProp][rules[ruleIndx].prop] = prop;
							} else {
								this[rules[ruleIndx].prop] = prop;
							}
						}
					}
				},

				getApiUrl(scope, thematic = false, added_filters = null, agregacao = null) {
					let url =  '/';
					let obsAtual = this.$observatories.constructor.identifyObservatory(this.$route.path.split('/')[1]);
					if (thematic && obsAtual && obsAtual != 'td') {
					  url += obsAtual + '/';
					}
			
					let resource = this.getResourceParamsFromScope(scope);
					url += (resource ? resource.res : 'indicadoresmunicipais');
			
					url += '?categorias=' + (resource ? resource.cats : 'cd_mun_ibge,nm_municipio,ds_indicador,cd_indicador,nu_competencia,ds_fonte,media_uf,rank_uf,rank_br');
					
					if (agregacao) {
						url += '&valor=vl_indicador&agregacao=' + agregacao;
					} else {
						url += ',vl_indicador';
					}

					let filters = this.getFiltersfFromRoute();
					url += '&filtros=' + (filters ? filters : 'eq-cd_mun_ibge-') + this.getIdLocalidadeFromRoute(this.$route.params.idLocalidade);
			
					if (added_filters && added_filters != '') {
					  if (filters && filters != '') {
						url += ',and,';
					  }
					  url += added_filters;
					}
					return url;
				},
			
				getResourceParamsFromScope(scope) {
					if (scope == null || scope == '') scope = this.getEscopo(this.$route.params.idLocalidade);
					switch (scope) {
					  case 'municipio':
						return {
						  res: 'indicadoresmunicipais',
						  cats: 'cd_mun_ibge,nm_municipio,ds_indicador,cd_indicador,nu_competencia,ds_fonte,media_uf,rank_uf,rank_br'
						}
					  case 'uf': 
						return {
						  res: 'indicadoresestaduais',
						  cats: 'cd_mun_ibge,ds_indicador,cd_indicador,nu_competencia,ds_fonte,rank_br'
						}
					  case 'br': 
						return {
						  res: 'indicadoresnacionais',
						  cats: 'cd_mun_ibge,ds_indicador,cd_indicador,nu_competencia,ds_fonte'
						}
					}
					return null;
				},
			
				getFiltersfFromRoute() {
					let reach = this.getEscopo(this.$route.params.idLocalidade);
			
					switch(reach) {
					  case 'brasil':
						return null;
					  case 'prtptm':
						return 'eq-cd_unidade-';
					  case 'estado':
						return 'eq-cd_uf-';
					  default:
						return 'eq-cd_mun_ibge-';
					}
				},

				getEscopo(idLocalidade) {
					if (idLocalidade == 0) return 'brasil';
					if (idLocalidade.includes("mptreg") || idLocalidade.includes("MPTREG")) return 'mptreg';
					if (idLocalidade.includes("prt") || idLocalidade.includes("PRT") ||
						idLocalidade.includes("ptm") || idLocalidade.includes("PTM")) return 'prtptm';
					switch (idLocalidade.length) {
					  case 1:
						return 'regiao';
					  case 2:
						return 'estado';
					  case 4:
						return 'mesorregiao';
					  case 5:
						return 'microrregiao';
					}
					return 'municipio';
				},
			
				getIdLocalidadeFromRoute(idLocalidade) {
					if (idLocalidade == 0) return 0; // Brasil
					if (idLocalidade.includes("mptreg") || idLocalidade.includes("MPTREG")) {
					  return idLocalidade.substring(6);
					}
					if (idLocalidade.includes("prt") || idLocalidade.includes("PRT") ||
						idLocalidade.includes("ptm") || idLocalidade.includes("PTM")) {
					  return idLocalidade.substring(3);
					} 
					return idLocalidade;
				},

				setDataset(dataset, rules, structure, addedParams, metadata) {
				
					let options = structure.chart_options;
					if (options === null || options === undefined) {
					  options = structure.options;
					}

					let limCoords = { xmin: null, ymin: null, xmax: null, ymax: null }; // Obtém coordenadas limítrofes (se mapa)
					for (var eachRow in dataset) {
					  if (options.pct_field !== null && options.pct_field !== undefined) {
						dataset[eachRow].pct_indicador = dataset[eachRow][options.pct_field];
					  }
					  if (structure.chart_type == 'TREEMAP' && options.format_function !== null && options.format_function !== undefined) {
						if (this.customFunctions && this.customFunctions[options.format_function]) {
						  dataset[eachRow][options.id] = this.customFunctions[options.format_function](dataset[eachRow], options);
						} else {
						  dataset[eachRow][options.id] = this[options.format_function](dataset[eachRow], options);
						}
					  }
				
					  // Obtém coordenadas limítrofes (se mapa leaflet)
					  if (this.leafletBasedCharts.includes(structure.chart_type)) { 
							let lat = 0
							let long = 0
							let lat_source = 0
							let long_source = 0
							if (structure.chart_type == 'MAP_MIGRATION'){
								lat = parseFloat(dataset[eachRow][options.target.lat]);
								long = parseFloat(dataset[eachRow][options.target.long]);
								lat_source = parseFloat(dataset[eachRow][options.source.lat]);
								long_source = parseFloat(dataset[eachRow][options.source.long]);
							} else {
								lat = parseFloat(dataset[eachRow][options.lat]);
								long = parseFloat(dataset[eachRow][options.long]);
							}
							// Ignora os pontos 0x0
							if (lat != 0 && long != 0) {
								if (limCoords.xmin === null || limCoords.xmin === undefined) { // Primeiro valor de indicador
									limCoords.xmin = long;
									limCoords.xmax = long;
									limCoords.ymin = lat;
									limCoords.ymax = lat;
								} else {
									if (limCoords.xmin > long) {
										limCoords.xmin = long;
									}
									if (limCoords.xmax < long) {
										limCoords.xmax = long;
									}
									if (limCoords.ymin > lat) {
										limCoords.ymin = lat;
									}
									if (limCoords.ymax < lat) {
										limCoords.ymax = lat;
									}
								}
							}
							if (lat_source != 0 && long_source != 0){
								if (limCoords.xmin === null || limCoords.xmin === undefined) { // Primeiro valor de indicador
									limCoords.xmin = long_source;
									limCoords.xmax = long_source;
									limCoords.ymin = lat_source;
									limCoords.ymax = lat_source;
								} else {								
									if (limCoords.xmin > long_source) {
										limCoords.xmin = long_source;
									}
									if (limCoords.xmax < long_source) {
										limCoords.xmax = long_source;
									}
									if (limCoords.ymin > lat_source) {
										limCoords.ymin = lat_source;
									}
									if (limCoords.ymax < lat_source) {
										limCoords.ymax = lat_source;
									}
								}
							}							
					  }
					}
					// caso o gráfico seja um mapa leaflet 
					if (this.leafletBasedCharts.includes(structure.chart_type)) {
						//zoom out se coordenadas de um único ponto
						if ((limCoords.xmin == limCoords.xmax) && (limCoords.ymin == limCoords.ymax)){
							limCoords.xmin = limCoords.xmin - 3
							limCoords.xmax = limCoords.xmax + 3
							limCoords.ymin = limCoords.ymin - 3
							limCoords.ymax = limCoords.ymax + 3
						}
						if (this.limCoords){
							this.limCoords = limCoords;
						} else {
							this.customParams.limCoords = limCoords;
						}
					}
				
					if (options.order_field !== null && options.order_field !== undefined) {
					  dataset = this.$indicatorsModel.sortObject(dataset, options.order_field);
					}
				
					if (addedParams && addedParams.id) {
					  //Mixed_map
					  if (this.dataset == null){
						  this.dataset = [];
						  this.metadata = [];
					  }
					  // Múltiplos gráficos ou mixed_map
					  this.dataset[addedParams.id] = dataset;
					  this.metadata[addedParams.id] = metadata;
					  this.triggerChartUpdates(addedParams.id, dataset, metadata);
					  this.datasetsComplete++;
					} else if (addedParams && addedParams.props) {
					  if (addedParams.props.dataset) this[addedParams.props.dataset] = dataset;
					  if (addedParams.props.metadata) this[addedParams.props.metadata] = metadata;
					} else {
					  // Dataset único
					  this.dataset = dataset;
					  this.metadata = metadata;
					}
				
					if (addedParams && addedParams.fnCallback) {
					  addedParams.fnCallback();
					}
				}
			}
		})
	}
}

export default ViewConfReader;
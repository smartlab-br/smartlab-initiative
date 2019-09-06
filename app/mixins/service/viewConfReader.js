import axios from 'axios'
import * as yaml from 'js-yaml'

const ViewConfReader = {
	install(Vue, options) {
		Vue.mixin({
			data() {
				return {
				}
			},
			methods: {
				async loadYaml(location, cbFunction) {
					let basePath = "/static/smartlab-initiative-viewconf/";
					if (this.$store && this.$store.state && this.$store.state.GIT_VIEWCONF_TAG_URL) {
						basePath = this.$store.state.GIT_VIEWCONF_TAG_URL;
					} else if (process.env.GIT_VIEWCONF_TAG_URL) {
						basePath = process.env.GIT_VIEWCONF_TAG_URL;
					}
					let response = await axios.get(basePath + location + ".yaml");
					if (cbFunction) cbFunction(yaml.safeLoad(response.data, { json: true }));
				},

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
											JSON.parse(result.data).dataset,
											structure.api.options,
											customFunctions
										),
										structure.args,
										structure,
										addedParams,
										JSON.parse(result.data).metadata
									);
								}
								);
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
														JSON.parse(result.data).dataset,
														structure.api[indexApi].options,
														customFunctions
													)
												);
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
										cbFunction(
											fullDS,
											structure.args,
											structure,
											addedParams,
											null // Sem metadata nesses casos
										);
									}
								);
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
										JSON.parse(result.data).dataset,
										structure.api_reactive.options,
										customFunctions
									),
									structure.args,
									structure,
									addedParams,
									JSON.parse(result.data).metadata
								);
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
											customParams && customParams[structure.preloaded.prop] ? customParams[structure.preloaded.prop] : this.$store.state.gDatasets[structure.preloaded.prop].ds,
											Object.assign({}, customFunctions)
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
											customParams && customParams[structure.preloaded.prop] ? customParams[structure.preloaded.prop] : this.$store.state.gDatasets[structure.preloaded.prop].ds,
											Object.assign({}, customFunctions)
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
											JSON.parse(result.data).dataset,
											structure.api.options,
											customFunctions
										),
										structure.args,
										structure,
										addedParams,
										JSON.parse(result.data).metadata
									);
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
														JSON.parse(result.data).dataset,
														eachApi.options,
														customFunctions
													)
												);
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
										cbFunction(
											fullDS,
											structure.args,
											structure,
											addedParams,
											null // Sem metadata nesses casos
										);
									}
								);
							}
						} else if (structure.chart_data) { // Estrutura obtida de uma chamada de API
							cbFunction(
								this.reformDataset(
									structure.chart_data.dataset,
									structure.reform_options,
									customFunctions
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

				reformDataset(dataset, options, customFunctions) {
					if (options) {
						// Adiciona o mínimo e o máximo ao dataset
						if (options.recalc_min_max) {
							let minmax_field = (options.minmax_field) ? options.minmax_field : 'vl_indicador';
							dataset = this.getMinMaxEachIndicator(dataset, minmax_field);
						}

						if (options.combine) {
							dataset = dataset.concat(this.$indicatorsModel.combineIndicators(dataset, options.combine, customFunctions, options.place_id_field));

							// Faz um slice, se declarado
							if (options.slice) {
                				dataset = this.$indicatorsModel.slice(options.slice, dataset, {});
							}
						}
						
						// Melts the dataset (ruws to columns)
						if (options.melt) {
							dataset = this.melt(
								dataset,
								options.melt.value_field,
								options.melt.layer_fields,
								options.melt.layer_field,
								options.melt.label_fields,
								options.melt.label_field,
								options.melt.value_function
							);
						}
		
						for (var indx in options.calcs) {
							let nuField = 'calc_' + options.calcs[indx].id;
							for (let eachRow in dataset) {
								if (options.calcs[indx].function) {
									dataset[eachRow][nuField] = this.$objectTransformService.runNamedFunction(
										options.calcs[indx], dataset[eachRow],
										customFunctions, [dataset[eachRow]]);
								}
								
								if(options.calcs[indx].format){
									dataset[eachRow][nuField] = this.$numberTransformService.formatNumber(
										dataset[eachRow][nuField], options.calcs[indx].format,
										options.calcs[indx].precision, options.calcs[indx].multiplier,
										options.calcs[indx].collapse, options.calcs[indx].signed,
										options.calcs[indx].uiTags
									);                  
								}
							}

							// Adiciona o mínimo e o máximo ao dataset
							if (options.calcs[indx].recalc_min_max) {
								dataset = this.getMinMaxEachIndicator(dataset, nuField);
							}
						}

						for (var indxFmts in options.formatters) {
							let nuField = 'fmt_' + options.formatters[indxFmts].id;
							let formatRules = options.formatters[indxFmts];
							for (let eachRow in dataset) {
								if (formatRules.format == 'auto') {
									formatRules = this.$textTransformService.getFormatRules(formatRules, dataset[eachRow]);
								}
								dataset[eachRow][nuField] = this.$numberTransformService.formatNumber(
									dataset[eachRow][options.formatters[indxFmts].id], 
									formatRules.format, 
									formatRules.precision, 
									formatRules.multiplier, 
									formatRules.collapse,
									formatRules.signed,
									formatRules.uiTags
								);
							}

							// Adiciona o mínimo e o máximo ao dataset
							if (options.formatters[indxFmts].recalc_min_max) {
								dataset = this.getMinMaxEachIndicator(dataset, nuField);
							}
						}
		
						// if (options.cast) {
						// 	console.log(options);
						// 	dataset = this.cast(
						// 		dataset,
						// 		options.cast.col_fields,
						// 		options.value_field ? options.value_field : 'vl_indicador',
						// 		options.cast.layer_field ? options.layer_field : 'cd_indicador'
						// 	);
						// }

						if (options.order_field !== null && options.order_field !== undefined) {
							dataset = this.sortObject(dataset, options.order_field);
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
								prop = this.$numberTransformService.formatNumber(
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
					let obsAtual = this.$observatories.identifyObservatory(this.$route.path.split('/')[1]);
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
			}
		})
	}
}

export default ViewConfReader;
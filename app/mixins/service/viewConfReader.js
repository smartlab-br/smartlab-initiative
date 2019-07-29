import axios from 'axios'
import * as yaml from 'js-yaml'

const ViewConfReader = {
	install(Vue, options) {
		Vue.mixin({
			data() {
				return { }
			},
			methods: {
				async loadYaml(location) {
					//location = "/br/about.yaml";
					let basePath = "https://raw.githubusercontent.com/smartlab-br/smartlab-initiative-viewconf/master";
					
					// if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
						// var request = new XMLHttpRequest();
						// request.open('GET', '/bar/foo.txt', false);  // `false` makes the request synchronous
						// request.send(null);

						// console.log(yaml.safeLoad(request.responseText));
						// return yaml.safeLoad(request.responseText);
						console.log(basePath + location);
						let response = await axios.get(basePath + location);
						console.log(response.data);
						this.about = yaml.safeLoad(response.data, { json: true });
						//console.log(this.about);
					// } else {
						//   this.data = require("json-loader!yaml-loader!../../trabalhodecente-viewconf/br/about.yaml");
					// }
					
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
								axios(this.getAxiosOptions(addedParams.endpoint))
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
									let apiCall = this.getAxiosOptions(addedParams.endpoint[indexApi]);
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
							let url = this.applyInterpol(structure.api_reactive, {}, customFunctions, fusionParams);
							axios(this.getAxiosOptions(url))
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
								this.runNamedFunction(
									structure, null,
									Object.assign({}, customFunctions)
								),
								structure.args,
								structure,
								addedParams
							);
						} else if (structure.preloaded) {
							// If the structure defines the usage of preloaded indicators.
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
						} else if (structure.api !== null && structure.api !== undefined) {
							if (!Array.isArray(structure.api)) {
								// If the structure defines a single API call, execute the
								// callback after the axios call.
								let url = this.applyInterpol(structure.api, {}, customFunctions, customParams);
								axios(this.getAxiosOptions(url))
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
									let apiCall = this.getAxiosOptions(this.applyInterpol(eachApi, {}, customFunctions, customParams));
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

				getFormatRules(structure, indicator = null) {
					let formatRules = structure;
					let autoType = indicator.ds_indicador_prefixo;

					// Verifica a precisão
					if (structure.precision == null || structure.precision == undefined) {
						if (autoType == '(Índice)') {
							formatRules.precision = 3;
						}
					}

					// Verifica o multiplicador
					if (structure.multiplier == null || structure.multiplier == undefined) {
						if (autoType == '(em R$ x 1.000)') {
							formatRules.multiplier = 1000;
						}
					}

					// Verifica o collapse
					// Todo collapse seguirá o default do format, exceto quando expressamente definido

					// Verifica o default
					if (structure.default == null || structure.default == undefined) {
						// Todo default será Sem Registros, salvo expresso no yaml
						formatRules.default = "Sem Registros";
					}

					// Verifica o tipo da formatação
					if (autoType == '(em R$ x 1.000)' || autoType == '(R$)') {
						formatRules.format = 'monetario';
					} else if (autoType == '(Índice)') {
						formatRules.format = 'real';
					} else if (autoType == '(Percentual)') {
						formatRules.format = 'porcentagem';
					}

					//verifica se as tags de UI devem ser geradas na formatação
					if (structure.uiTags == null || structure.uiTags == undefined) {
						formatRules.uiTags = true;
					}

					return formatRules;
				},

				reformDataset(dataset, options, customFunctions) {
					if (options) {
						// Adiciona o mínimo e o máximo ao dataset
						if (options.recalc_min_max) {
							let minmax_field = (options.minmax_field) ? options.minmax_field : 'vl_indicador';
							dataset = this.getMinMaxEachIndicator(dataset, minmax_field);
						}

						if (options.combine) {
							dataset = dataset.concat(this.combineIndicators(dataset, options.combine, customFunctions, options.place_id_field));

							// Faz um slice, se declarado
							if (options.slice) {
                				dataset = this.slice(options.slice, dataset, {});
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
									dataset[eachRow][nuField] = this.runNamedFunction(
										options.calcs[indx], dataset[eachRow],
										customFunctions, [dataset[eachRow]]);
								}
								
								if(options.calcs[indx].format){
									dataset[eachRow][nuField] = this.formatNumber(
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
									formatRules = this.getFormatRules(formatRules, dataset[eachRow]);
								}
								dataset[eachRow][nuField] = this.formatNumber(
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
					if (base_object_list && base_object_list.length > 0) {
						let base_object = base_object_list[0];
						for (var ruleIndx in rules) {
							var prop = '';
							if (rules[ruleIndx].fixed) {
									prop = rules[ruleIndx].fixed;
							} else if (rules[ruleIndx].named_prop) {
									prop = base_object[rules[ruleIndx].named_prop];
							} else if (rules[ruleIndx].function) {
								prop = this.runNamedFunction(rules[ruleIndx], base_object);
							}

							if ((prop === null || prop === undefined) && rules[ruleIndx].default) {
								prop = rules[ruleIndx].default;
							} else if (rules[ruleIndx].format !== null && rules[ruleIndx].format !== undefined) {
								let formatRules = rules[ruleIndx];
								if (rules[ruleIndx].format == 'auto') {
									formatRules = this.getFormatRules(rules[ruleIndx], base_object);
								}
								prop = this.formatNumber(
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

				runNamedFunction(struct, base_object, localFunctions = null, initialArgs = []) {
					// Runs function with args defines in yaml structure
					var args = initialArgs;
					
					for (var indx in struct.fn_args) {
						// Gets the args for the yaml-defined function
						if (struct.fn_args[indx].fixed != null && struct.fn_args[indx].fixed != undefined) {
							// Apply fized value to arg
							args.push(struct.fn_args[indx].fixed);
						} else if (struct.fn_args[indx].named_prop) {
							if (base_object) {
								args.push(base_object[struct.fn_args[indx].named_prop]);
							} else {
								args.push(undefined);
							}
						} else if (struct.fn_args[indx].function) {
							// If arg has an internal function defined with args, apply it
							args.push(this.runNamedFunction(struct.fn_args[indx], base_object));
						}
					}

					if (localFunctions && localFunctions[struct.function]) {
						// Checks if the function exist in the localFunctions argument
						return localFunctions[struct.function].apply(null, args);
					}
					if (this.customFunctions && this.customFunctions[struct.function]) {
						// Checks if the function exist in the customFunctions context attribute
						return this.customFunctions[struct.function].apply(null, args);
					}
					if (this[struct.function]) {
						// Runs function on context (this) otherwise
						return this[struct.function].apply(null, args);
					}
					
					// Returns null otherwise
					return null;
				},

				getApiUrl(scope, thematic = false, added_filters = null, agregacao = null) {
					let url =  '/';
					let obsAtual = this.identifyObservatory(this.$route.path.split('/')[1]);
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
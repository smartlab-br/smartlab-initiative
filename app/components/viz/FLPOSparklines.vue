<template>
  <v-layout column pa-2 max-width="100%">
    <v-card>
        <v-progress-linear v-show="!loaded"
          height="3"
          :indeterminate="!loaded"
          color="info">
        </v-progress-linear>
        <v-card-title>
        <v-text-field
            v-model="search"
            append-icon="search"
            label="Procurar"
            single-line
            hide-details
        />
        </v-card-title>
        <v-progress-linear v-if="!dataset"
          height="40"
          :indeterminate="!dataset"
          color="info">
          <p class="headline-obs text-xs-center">{{structure.title}}</p>
        </v-progress-linear>
        <v-data-table 
            v-if="dataset && structure.headers"
            :headers="removeFormatItems(structure.headers)"
            :items="dataset"
            :disable-initial-sort="disableInitialSort"
            :search="search"
            class="sparklines-grid elevation-1"
            style="width: 100%;"
            :rows-per-page-items='[10,50,100,200,500,{"text":"$vuetify.dataIterator.rowsPerPageAll","value":-1}]'
            :custom-sort="customSort"
            :pagination.sync="pagination"
            >

            <template slot="headers" slot-scope="props">
            <tr>
                <th scope="colgroup" class="headline-obs" :colspan="props.headers.length">{{structure.title}}</th>
            </tr>
            <tr>
                <th scope="colgroup" 
                v-for="header in props.headers"
                :key="header.text"
                :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
                @click="changeSort(header.value)"
                :width="header.width"
                >
                <v-icon small>arrow_upward</v-icon>
                {{ header.text }}<br/>
                {{ header.type == 'spark' ? "(" + first_cat[header.series] + " a " + last_cat[header.series] + ")" : "" }}
                </th>
            </tr>
            </template>            
            <template :headers="structure.headers" slot="items" slot-scope="props">
                <!-- v-for SEM BIND, pois está restrito ao contexto do template do data-table -->
                <td pa-0 v-for="(hdr, idxHdr) in structure.headers" :key="idxHdr" :style="(hdr.item_align?'text-align:'+hdr.item_align:'')">
                    <div px-2 class="sparkline" v-if="hdr.type && hdr.type == 'spark'">
                        <v-layout row nowrap v-if="(hdr.show_labels == undefined || hdr.show_labels)"> 
                            <v-flex v-if="props.item['sparkline_values_' + hdr.series].length > 1" 
                                xs2 xl2 micro-caption text-xs-right :style="'color:'+hdr.bgColor">
                                {{ hdr.format ? numberTransformService.formatNumber(
                                                    props.item['sparkline_values_' + hdr.series][0], hdr.format, hdr.precision, hdr.multiplier, hdr.collapse, hdr.signed, hdr.uiTags ) 
                                                : props.item['sparkline_values_' + hdr.series][0] 
                                }}
                            </v-flex>
                            <v-flex xs8 xl8>
                                <v-sparkline 
                                    :value="props.item['sparkline_values_'+ hdr.series]"
                                    :color="hdr.bgColor"
                                    :line-width="hdr.stroke?hdr.stroke:3"
                                    padding="8"
                                    height="45"
                                ></v-sparkline>
                            </v-flex>
                            <v-flex v-if="props.item['sparkline_values_' + hdr.series].length > 1" 
                                xs2 xl2 micro-caption text-xs-left :style="'color:'+hdr.bgColor">
                                {{ hdr.format ? numberTransformService.formatNumber(
                                                    props.item['sparkline_values_' + hdr.series][props.item['sparkline_values_' + hdr.series].length-1], 
                                                    hdr.format, hdr.precision, hdr.multiplier, hdr.collapse, hdr.signed, hdr.uiTags ) 
                                                : props.item['sparkline_values_' + hdr.series][props.item['sparkline_values_' + hdr.series].length-1]
                                }}
                            </v-flex>
                        </v-layout>
                        <v-layout row nowrap v-else> 
                            <v-flex xs12>
                                <v-sparkline 
                                    :value="props.item['sparkline_values_'+ hdr.series]"
                                    :color="hdr.bgColor"
                                    :line-width="hdr.stroke?hdr.stroke:3"
                                    padding="8"
                                    height="45"
                                ></v-sparkline>
                            </v-flex>
                        </v-layout>
                    </div>
                    <div v-else>
                        {{ props.item['fmt_' + hdr.value] ? props.item['fmt_' + hdr.value]: props.item[hdr.value] }}
                    </div>
                </td> 
            </template>
            <template slot="no-results">
                <v-alert :value="true" color="error" icon="warning">
                    Sua busca por "{{ search }}" não trouxe resultados.
                </v-alert>
            </template>            
        </v-data-table>
    </v-card>        
  </v-layout>
</template>

<script>
import FLPOBaseLayout from '../FLPOBaseLayout.vue';
import NumberTransformService from '../../assets/service/singleton/numberTransformService'

export default {
    extends: FLPOBaseLayout,
    data() {
        return {
            search: '',
            dataset: null,
            disableInitialSort: true,
            numberTransformService: NumberTransformService,
            pagination: {}, 
            first_cat: {},
            last_cat: {},
            loaded: true     
        }
    },
    props: ['refreshComponent', 'customFilters'],
    created () {
        this.fillDataStructure(this.structure, this.customParams,
        this.customFunctions, this.fillFromDataset, {});
    },
    watch: {
        refreshComponent: function(newVal, oldVal) {
            this.loaded = false;
            this.updateDataStructure(this.customFilters.filterUrl);
        }
    },
    methods: {
        customSort(items, index, isDesc) {
            let sort_field = index;
            if (index){
                for(let header of this.structure.headers){
                    if (header.value == index && header.sort_field){
                        sort_field = header.sort_field;
                        break;
                    }
                }
                items.sort((a, b) => {
                    if (!isDesc) {
                        return (a[sort_field] > b[sort_field]) ? 1 : -1 ;
                    } else {
                        return (a[sort_field] < b[sort_field]) ? 1 : -1 ;
                    }
                });
            }
            return items;
        },   
        changeSort (column) {
            if (this.pagination.sortBy === column) {
            this.pagination.descending = !this.pagination.descending
            } else {
            this.pagination.sortBy = column
            this.pagination.descending = false
            }
        },
        fillFromDataset(sourceDS, rules, sourceStructure, addedParams = null, metadata = null) {
            let hierarchicalDS = [];
            let allSeries = [];
            let series_first_cat = {};
            let series_last_cat = {};

            fromSource: for (let row of sourceDS) {
                if (!allSeries.includes(row[sourceStructure.series_field])){ //new series
                  allSeries.push(row[sourceStructure.series_field]);
                  series_first_cat[row[sourceStructure.series_field]] = parseInt(row[sourceStructure.category_field]);
                  series_last_cat[row[sourceStructure.series_field]] = parseInt(row[sourceStructure.category_field]);
                } else {
                    if (parseInt(row[sourceStructure.category_field]) < series_first_cat[row[sourceStructure.series_field]]){
                         series_first_cat[row[sourceStructure.series_field]] = parseInt(row[sourceStructure.category_field]);
                    }

                    if (parseInt(row[sourceStructure.category_field]) > series_last_cat[row[sourceStructure.series_field]]){
                         series_last_cat[row[sourceStructure.series_field]] = parseInt(row[sourceStructure.category_field]);
                    }
                }

                let entryValue = row[sourceStructure.value_field] ? row[sourceStructure.value_field] : 0;
                if (typeof entryValue !== "number") entryValue = parseFloat(entryValue);

                let entry = { id: sourceStructure.series_field, cat_value: parseInt(row[sourceStructure.category_field]), value: entryValue };
                
                for (let eachInHierarchy of hierarchicalDS) {
                    if (eachInHierarchy.id == row[sourceStructure.id_field]) { // found the instance

                        if (eachInHierarchy[row[sourceStructure.series_field]] == null) { // new series
                            
                            eachInHierarchy[row[sourceStructure.series_field]] = [entry];

                        } else { // Existing instance and series
                            eachInHierarchy[row[sourceStructure.series_field]].push(entry);

                        }
                        continue fromSource;
                    }    
                }

                // If not found, create a new instance and push to the dataset
                let nuInstance = row;
                nuInstance.id = row[sourceStructure.id_field];

                nuInstance[row[sourceStructure.series_field]] = [entry];
                hierarchicalDS.push(nuInstance);
            }

            let fillZeros = sourceStructure.fillZeros == undefined ? true : sourceStructure.fillZeros;
            this.createSparklineFields(hierarchicalDS, allSeries, series_first_cat, series_last_cat, sourceStructure, fillZeros);

            if (sourceStructure.category_type == "timestamp"){
                for(let serie of allSeries){
                    series_first_cat[serie] = new Date(series_first_cat[serie]).toISOString().substring(0,10)
                }
                for(let serie of allSeries){
                    series_last_cat[serie] = new Date(series_last_cat[serie]).toISOString().substring(0,10)
                }
            }
            this.first_cat = series_first_cat
            this.last_cat = series_last_cat
            
            if(sourceStructure.category_type == "timestamp" && sourceStructure.category_aggregation == "week"){
                for(let reg of hierarchicalDS){
                    for(let serie of allSeries){
                        let new_serie = [];
                        let sum_week = 0;
                        let weekday;
                        let first_reg = true;
                        let day_before = null;
                        let same_week = true;
                        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
                        for (let item of reg[serie]){
                            weekday = new Date(item.cat_value).getUTCDay();
                            //TODO - acrescentar verificação para mesma semana date-7?
                            if (day_before){
                                let days_diff = Math.floor((new Date(item.cat_value) - day_before) / _MS_PER_DAY);                                
                                if (new Date(item.cat_value) == day_before) {
                                    same_week = true;
                                } else if (weekday <= day_before.getUTCDay()){
                                    same_week = false;
                                } else if (days_diff > 6){
                                    same_week = false;
                                } else {
                                    same_week = true;
                                }
                            }
                            if (weekday == 0 || (day_before && !same_week) ){
                                if (!first_reg){
                                    new_serie.push(sum_week);
                                } 
                                sum_week = item.value;
                            } else {
                                sum_week += item.value;
                            }
                            first_reg = false;
                            day_before = new Date(item.cat_value);
                        }
                        // não conta a última semana
                        // new_serie.push(sum_week);
                        reg['sparkline_values_' + serie] = new_serie;
                        reg['last_value_' + serie] = new_serie[new_serie.length-1];
                    }
                }
            }

            //default order = last value in first series
            let order_field = 'last_value_' + allSeries[0];
            if (sourceStructure.order_field){
                order_field = sourceStructure.order_field;
            }
            let fnSorter = (a, b) => {
                return (a[order_field] < b[order_field]) ? 1 : -1 ;
            }

            hierarchicalDS.sort(fnSorter);
            this.dataset = hierarchicalDS;
            this.loaded = true;
            this.$emit('dataset-loaded', this.dataset);
        },

        createSparklineFields(dataset, seriesList, series_first_cat, series_last_cat, sourceStructure, fillZeros = true){
            for (let row of dataset){

                for (let series_value of seriesList){
                    let series = row[series_value];

                    // let sparkline_labels = [];
                    let sparkline_values = [];
                    let higher_cat = series_first_cat[series_value];
                    let higher_value = 0;
                    let total = 0;
                    
                    if (series){

                        series.sort(function(a,b){ 
                            return (a.cat_value > b.cat_value) ? 1 : -1 ;
                        });


                        let firstSeries = series[0];
                        
                        if (fillZeros){
                            if (firstSeries.cat_value > series_first_cat[series_value]){
                                for(let i = series_first_cat[series_value]; i < firstSeries.cat_value; i++){
                                    // sparkline_labels.push(i);
                                    sparkline_values.push(0);                                
                                }
                            }
                        }

                        // sparkline_labels.push(firstSeries.cat_value);
                        sparkline_values.push(firstSeries.value);  

                        higher_value = firstSeries.value;
                        higher_cat = firstSeries.cat_value;
                        total = firstSeries.value;

                        for(let k = 1; k < series.length; k++){
                            let seriesPrev = series[k-1];
                            if (fillZeros){
                                for(let j = seriesPrev.cat_value + 1; j < series[k].cat_value; j++){
                                    // sparkline_labels.push(j);
                                    sparkline_values.push(0);                                
                                }
                            }
                            // sparkline_labels.push(series[k].cat_value);
                            sparkline_values.push(series[k].value);    
                            total += series[k].value;
                            if (series[k].value > higher_value){
                                higher_value = series[k].value;
                                higher_cat = series[k].cat_value;
                            }                            
                        }

                        if (fillZeros){
                            let lastSeries = series[series.length - 1];
                            if (lastSeries.cat_value < series_last_cat[series_value]){
                                for(let i = lastSeries.cat_value + 1; i <= series_last_cat[series_value]; i++){
                                    // sparkline_labels.push(i);
                                    sparkline_values.push(0);                                
                                }
                            }
                        }
                        
                    } else { //multi series and current series not exists
                        row[series_value] = [];
                    }

                    // row['sparkline_labels_' + series_value] = sparkline_labels;
                    row['sparkline_values_' + series_value] = sparkline_values;
                    row['total_' + series_value] = total;
                    row['higher_value_' + series_value] = higher_value;
                    if (sourceStructure.category_type == "timestamp"){
                        higher_cat = new Date(higher_cat).toISOString().substring(0,10)
                    }

                    if(series){
                        row['series_length_' + series_value] = series.length;
                        row['last_value_' + series_value] = sparkline_values[sparkline_values.length-1];
                        row['higher_value_str_' + series_value] = NumberTransformService.formatNumber(higher_value, "inteiro") + " (" + higher_cat + ")";
                    } else {
                        row['last_value_' + series_value] = 0;
                        row['higher_value_str_' + series_value] = "";
                    }

                    for (let header of this.structure.headers){
                        if (header.format){
                            if (header.sort_field){
                                row['fmt_'+ header.sort_field] = NumberTransformService.formatNumber(
                                    row[header.sort_field], header.format, header.precision, header.multiplier, header.collapse, header.signed, header.uiTags );
                            } else {
                                row['fmt_'+ header.value] = NumberTransformService.formatNumber(
                                    row[header.value], header.format, header.precision, header.multiplier, header.collapse, header.signed, header.uiTags );
                            }
                        }
                    }

                    if(series && row['fmt_higher_value_' + series_value]){
                        row['higher_value_str_' + series_value] = row['fmt_higher_value_' + series_value] + " (" + higher_cat + ")";
                    } 


                }

            }

        },
        
        removeFormatItems(headers){
            let items = JSON.parse(JSON.stringify(headers));
            for(var item in items){
                items[item].value = String(items[item].value).replace("fmt_","");
            }
            return items;
        },

        updateDataStructure(filterUrl){
            let structReactive = Object.assign({},this.structure);
            structReactive.api = JSON.parse(JSON.stringify(this.structure.apiBase?this.structure.apiBase:this.structure.api));

            if (structReactive.api){
                if (!Array.isArray(structReactive.api)){
                    structReactive.api = [structReactive.api];
                }
                for(let struct of structReactive.api){
                    if (struct.fixed){
                    struct.fixed += filterUrl
                    } else if (struct.template){
                    struct.template += filterUrl
                    }
                }
            }        
            this.fillDataStructure(
            structReactive, this.customParams,
            this.customFunctions, this.fillFromDataset
            );
      }
    }
}
</script>

<style scoped>
  .sparkline-value {
    font-family: Lato, Calibri, sans-serif !important;
    font-weight: 300;
    font-size: 2.2rem;
    line-height: 2rem;
  }
  .sparkline-value span {
    text-transform: uppercase;
    font-size: 1.2rem;
    line-height: 0;
  } 
  .sparkline .sparkline-detail {
    font-size: 0.8rem;
    font-weight: 400;
  }
  .sparkline svg {
    height: 100%;
  }
  .sparklines-grid table.v-table tbody td{
    padding: 0 5px;
  }
</style>
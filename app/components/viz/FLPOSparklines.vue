<template>
  <v-layout column pa-2 max-width="100%">
        <v-progress-linear v-if="!dataset"
          height="5"
          :indeterminate="!dataset"
          color="info">
        </v-progress-linear>
        <!--@update:pagination="triggerChartUpdates()"-->
        <v-data-table v-if="dataset && structure.headers"
            :headers="removeFormatItems(structure.headers)"
            :items="dataset"
            :disable-initial-sort="disableInitialSort"
            class="sparklines-grid elevation-1"
            style="width: 100%;"
            :rows-per-page-items='[10,50,100,200,500,{"text":"$vuetify.dataIterator.rowsPerPageAll","value":-1}]'
            :custom-sort="customSort"
            :pagination.sync="pagination"
            >

            <template slot="headers" slot-scope="props">
            <tr>
                <th
                v-for="header in props.headers"
                :key="header.text"
                :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
                @click="changeSort(header.value)"
                :width="header.width"
                >
                <v-icon small>arrow_upward</v-icon>
                {{ header.type != 'spark' ? header.text : header.text + " (" + first_cat[header.series] + '-' + last_cat[header.series] + ')' }}
                </th>
            </tr>
            </template>            
            <template :headers="structure.headers" slot="items" slot-scope="props">
                <!-- v-for SEM BIND, pois está restrito ao contexto do template do data-table -->
                <td pa-0 v-for="(hdr, idxHdr) in structure.headers" :key="idxHdr" :style="(hdr.item_align?'text-align:'+hdr.item_align:'')">
                        <!--
                    <v-layout row nowrap pa-0 fill-height>

                            <v-flex xs4 xl5 text-xs-right>
                                {{ props.item[hdr.value] }}
                            </v-flex>
                        -->
                        <!--
                            <v-flex xs8 pa-1 fill-height column text-xs-center class="sparkline"
                                :style="'color: ' + hdr.color + '; background-color: ' + hdr.bgColor">
                                <div :class="'sparkline-value ' + (hdr.item_class != null ? hdr.item_class : '')"
                                    v-html="props.item[hdr.value] ? props.item[hdr.value] : '&nbsp;'">
                                </div>
                                <div v-if="hdr.detail" title="Variação início/fim (%)"
                                    :class="'sparkline-detail ' + (hdr.detail_class != null ? hdr.detail_class : '')"
                                    v-html="props.item['str_' + hdr.detail] ? props.item['str_' + hdr.detail] : '&nbsp;'">
                                </div>
                            </v-flex>
                            <v-flex xs4 class="sparkline">
                                <v-layout fill-height
                                    v-if="structure && structure.chart_options !== null && validCharts.includes(structure.chart_type)"
                                    class="spark"
                                    ref = "chartRef"
                                    :class = "leafletBasedCharts.includes(structure.chart_type) ? 'map_geo' : ''"
                                    :id="'spark_' + hdr.series + '_' + props.item.id">
                                </v-layout>
                            </v-flex>

                                        :labels="props.item['sparkline_labels_' + hdr.series]"
                        -->
                        <!--
                            <v-flex xs2 text-xs-center>
                                {{ (props.item['total_'+ hdr.series]?props.item['total_'+ hdr.series]: 0) }}
                            </v-flex>
                            <v-flex xs4 px-2 class="sparkline">
                        -->
                        <div px-2 class="sparkline" v-if="hdr.type && hdr.type == 'spark'">
                            <v-layout row nowrap> 
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
                        </div>
                        <!--
                                                    
                            <v-flex xs2 text-xs-center caption>
                                {{ (props.item['higher_value_'+ hdr.series] !== 0 ? props.item['higher_value_'+ hdr.series] + "(" + props.item['higher_cat_'+ hdr.series] + ")": "") }}
                            </v-flex>
                        -->
                        <!--
                        <div v-else-if="typeof props.item[hdr.value] === 'string' && props.item[hdr.value].includes('</')"
                            :class="(hdr.item_class != null ? hdr.item_class : '')"
                            v-html="props.item[hdr.value]">
                        </div>
                        -->
                        <div v-else>
                            {{ props.item['fmt_' + hdr.value] ? props.item['fmt_' + hdr.value]: props.item[hdr.value] }}
                        </div>
                    <!--
                    </v-layout>
                    -->
                </td> 
            </template>
        </v-data-table>
  </v-layout>
</template>

<script>
import FLPOBaseLayout from '../FLPOBaseLayout.vue';
import NumberTransformService from '../../assets/service/singleton/numberTransformService'

export default {
    extends: FLPOBaseLayout,
    data() {
        return {
            dataset: null,
            disableInitialSort: true,
            numberTransformService: NumberTransformService,
            pagination: {}, 
            first_cat: {},
            last_cat: {}        
        }
    },
    created () {
        this.fillDataStructure(this.structure, {}, {}, this.fillFromDataset, {});
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

                            // eachInHierarchy['total_' + row[sourceStructure.series_field]] = entry.value;
                            // eachInHierarchy['stats_' + row[sourceStructure.series_field]] = {
                            //     initialValue: entry.value,
                            //     finalValue: entry.value,
                            //     initialCat: entry.cat_value,
                            //     finalCat: entry.cat_value
                            // };
                        } else { // Existing instance and series
                            eachInHierarchy[row[sourceStructure.series_field]].push(entry);

                            // eachInHierarchy['total_' + row[sourceStructure.series_field]] = eachInHierarchy['total_' + row[sourceStructure.series_field]] + entry.value;

                            // if (eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialCat > entry.cat_value) {
                            //     eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue = entry.value;
                            //     eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialCat = entry.cat_value;
                            // }
                            // if (eachInHierarchy['stats_' + row[sourceStructure.series_field]].finalCat < entry.cat_value) {
                            //     eachInHierarchy['stats_' + row[sourceStructure.series_field]].finalValue = entry.value;
                            //     eachInHierarchy['stats_' + row[sourceStructure.series_field]].finalCat = entry.cat_value;
                            // }

                            // if (eachInHierarchy[row[sourceStructure.series_field]].length > 1 &&
                            //     eachInHierarchy['stats_' + row[sourceStructure.series_field]] &&
                            //     eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue != 0) {
                            //     eachInHierarchy['stats_' + row[sourceStructure.series_field]].deltaPerc = (eachInHierarchy['stats_' + row[sourceStructure.series_field]].finalValue - eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue) / eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue * 100;
                            //     eachInHierarchy['deltaPerc_' + row[sourceStructure.series_field]] = (eachInHierarchy['stats_' + row[sourceStructure.series_field]].finalValue - eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue) / eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue * 100;
                                // Delta % for sorter
                                // if (row[sourceStructure.series_field] == sourceStructure.sorter.indicador) {
                                //     eachInHierarchy.deltaPerc = (eachInHierarchy['stats_' + row[sourceStructure.series_field]].finalValue - eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue) / eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue * 100;
                                // }
                                // Delta % string formatters
                            //     eachInHierarchy['str_deltaPerc_' + row[sourceStructure.series_field]] = this.$numberTransformService.constructor.formatNumber(eachInHierarchy['deltaPerc_' + row[sourceStructure.series_field]], 'porcentagem');
                            // }
                        }
                        continue fromSource;
                    }    
                }

                // If not found, create a new instance and push to the dataset
                let nuInstance = row;
                nuInstance.id = row[sourceStructure.id_field];

                // nuInstance['total_' + row[sourceStructure.series_field]] = entry.value;
                nuInstance[row[sourceStructure.series_field]] = [entry];
                // nuInstance['stats_' + row[sourceStructure.series_field]] = {
                //     initialValue: entry.value,
                //     finalValue: entry.value,
                //     initialCat: entry.cat_value,
                //     finalCat: entry.cat_value
                // };                
                hierarchicalDS.push(nuInstance);
            }

            // let fnSorter = (a, b) => {
            //     if (a.deltaPerc && b.deltaPerc) {
            //         return - (a.deltaPerc - b.deltaPerc);
            //     }
            //     if (a.deltaPerc) return -1;
            //     if (b.deltaPerc) return 1;
            //     return 0;
            // }
          
            this.createSparklineFields(hierarchicalDS, allSeries, series_first_cat, series_last_cat);
            this.first_cat = series_first_cat;
            this.last_cat = series_last_cat;

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

        },

        createSparklineFields(dataset, seriesList, series_first_cat, series_last_cat, fillZeros = true){
            for (let row of dataset){

                for (let series_value of seriesList){
                    let series = row[series_value];

                    let sparkline_labels = [];
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
                                    sparkline_labels.push(i);
                                    sparkline_values.push(0);                                
                                }
                            }
                        }

                        sparkline_labels.push(firstSeries.cat_value);
                        sparkline_values.push(firstSeries.value);  

                        higher_value = firstSeries.value;
                        higher_cat = firstSeries.cat_value;
                        total = firstSeries.value;

                        for(let k = 1; k < series.length; k++){
                            let seriesPrev = series[k-1];
                            if (fillZeros){
                                for(let j = seriesPrev.cat_value + 1; j < series[k].cat_value; j++){
                                    sparkline_labels.push(j);
                                    sparkline_values.push(0);                                
                                }
                            }
                            sparkline_labels.push(series[k].cat_value);
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
                                    sparkline_labels.push(i);
                                    sparkline_values.push(0);                                
                                }
                            }
                        }
                        
                    } else { //multi series and current series not exists
                        row[series_value] = [];
                    }

                    row['sparkline_labels_' + series_value] = sparkline_labels;
                    row['sparkline_values_' + series_value] = sparkline_values;
                    row['total_' + series_value] = total;
                    row['higher_value_' + series_value] = higher_value;
                    if(series){
                        row['last_value_' + series_value] = sparkline_values[sparkline_values.length-1];
                        row['higher_value_str_' + series_value] = higher_value + " (" + higher_cat + ")";
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

            // return dataset;

        },

        // triggerChartUpdates() {
        //     // Transform color array into a dictionary
        //     let colorDict = {};
        //     if (this.structure.chart_options.colorArray && this.structure.chart_options.indicadores) {
        //         for (let indx in this.structure.chart_options.indicadores) {
        //             colorDict[this.structure.chart_options.indicadores[indx]] = this.structure.chart_options.colorArray[indx];
        //         }
        //     }

        //     // Generate charts
        //     setTimeout(() => {

        //         let chart_headers = [
        //                                 {"text": "", "value": "cat_value"},
        //                                 {"text": "", "value": "value"}
        //                             ]
        //         let structChart = Object.assign({}, this.structure);
        //         structChart.headers = chart_headers;

        //         for (let sparkline of this.$el.getElementsByClassName("spark")) {
        //             let splitElementId = sparkline.id.split("_");
        //             let idFromElementId = splitElementId[splitElementId.length - 1];
        //             for (let row of this.dataset) {
        //                 if (row.id == idFromElementId) { // Id from row matches element id on page
        //                     let seriesFromElementId = splitElementId.slice(1, splitElementId.length -1).join('_');
        //                     if (row[seriesFromElementId] == null) break; // Break if series dataset is non-existent

        //                     let options = Object.assign({}, this.structure.chart_options);

        //                     if (Object.keys(colorDict).length > 0) {
        //                         delete options.colorArray;
        //                         delete options.indicadores;
        //                         options.color = colorDict[seriesFromElementId].toString();
        //                     }
                            
        //                     this.chartGen(
        //                         sparkline.id,
        //                         this.structure.chart_type,
        //                         structChart,
        //                         options,
        //                         row[seriesFromElementId],
        //                         this.metadata,
        //                         this.sectionIndex ? this.sectionIndex : 0
        //                     ).then(
        //                         (chartHandler) => {},
        //                         (reject) => { this.sendError(reject); }
        //                     );
        //                 }
        //             }
        //         }
        //     }, 0);
        // },
        
        removeFormatItems(headers){
            let items = JSON.parse(JSON.stringify(headers));
            for(var item in items){
                items[item].value = String(items[item].value).replace("fmt_","");
            }
            return items;
        },
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
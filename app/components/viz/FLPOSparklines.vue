<template>
  <v-layout column pa-2>
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
            >

            <template :headers="structure.headers" slot="items" slot-scope="props">
                <!-- v-for SEM BIND, pois está restrito ao contexto do template do data-table -->
                <td pa-0 v-for="hdr in structure.headers" :style="(hdr.width?'width:' + hdr.width + ';' :'') + (hdr.item_align?'text-align:'+hdr.item_align:'')">
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
                                {{ (props.item['totals_'+ hdr.series]?props.item['totals_'+ hdr.series]: 0) }}
                            </v-flex>
                            <v-flex xs4 px-2 class="sparkline">
                        -->
                        <div px-2 class="sparkline" v-if="hdr.type && hdr.type == 'spark'">
                            <v-layout row nowrap> 
                                <v-flex v-if="props.item['sparkline_values_' + hdr.series].length > 1" 
                                    xs2 xl1 caption text-xs-right :style="'color:'+hdr.bgColor">
                                    {{ props.item['sparkline_values_' + hdr.series][0] }}
                                </v-flex>
                                <v-flex xs8 xl10>
                                    <v-sparkline 
                                        :value="props.item['sparkline_values_'+ hdr.series]"
                                        :color="hdr.bgColor"
                                        :line-width="hdr.stroke?hdr.stroke:3"
                                        padding="8"
                                        height="45"
                                    ></v-sparkline>
                                </v-flex>
                                <v-flex v-if="props.item['sparkline_values_' + hdr.series].length > 1" 
                                    xs2 xl1 caption :style="'color:'+hdr.bgColor">
                                    {{ props.item['sparkline_values_' + hdr.series][props.item['sparkline_values_' + hdr.series].length-1] }}
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
                        <div v-else
                            :class="(hdr.item_class != null ? hdr.item_class : '')">
                            {{ props.item[hdr.value] }}
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

export default {
    extends: FLPOBaseLayout,
    data() {
        return {
            dataset: null,
            disableInitialSort: true
        }
    },
    created () {
        this.fillDataStructure(this.structure, {}, {}, this.fillFromDataset, {});
    },
    methods: {
        customSort(items, index, isDesc) {
            let sort_field = index;
            //for spark headers, sort by totals
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
        fillFromDataset(sourceDS, rules, sourceStructure, addedParams = null, metadata = null) {
            let hierarchicalDS = [];
            let allSeries = [];

            let firstCat = parseInt(sourceDS[0][sourceStructure.category_field_min]);
            let lastCat = parseInt(sourceDS[0][sourceStructure.category_field_max]);

            fromSource: for (let row of sourceDS) {
                if (!allSeries.includes(row[sourceStructure.series_field])) allSeries.push(row[sourceStructure.series_field]);

                let entryValue = row[sourceStructure.value_field] ? row[sourceStructure.value_field] : 0;
                if (typeof entryValue !== "number") entryValue = parseFloat(entryValue);

                let entry = { id: sourceStructure.series_field, cat_value: row[sourceStructure.category_field], value: entryValue };
                
                for (let eachInHierarchy of hierarchicalDS) {
                    if (eachInHierarchy.id == row[sourceStructure.id_field]) { // found the instance
                        if (eachInHierarchy[row[sourceStructure.series_field]] == null) { // new series
                            
                            eachInHierarchy[row[sourceStructure.series_field]] = [entry];

                            eachInHierarchy['totals_' + row[sourceStructure.series_field]] = entry.value;
                            eachInHierarchy['stats_' + row[sourceStructure.series_field]] = {
                                initialValue: entry.value,
                                finalValue: entry.value,
                                initialCat: entry.cat_value,
                                finalCat: entry.cat_value
                            };
                        } else { // Existing instance and series
                            eachInHierarchy[row[sourceStructure.series_field]].push(entry);

                            eachInHierarchy['totals_' + row[sourceStructure.series_field]] = eachInHierarchy['totals_' + row[sourceStructure.series_field]] + entry.value;

                            if (eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialCat > entry.cat_value) {
                                eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue = entry.value;
                                eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialCat = entry.cat_value;
                            }
                            if (eachInHierarchy['stats_' + row[sourceStructure.series_field]].finalCat < entry.cat_value) {
                                eachInHierarchy['stats_' + row[sourceStructure.series_field]].finalValue = entry.value;
                                eachInHierarchy['stats_' + row[sourceStructure.series_field]].finalCat = entry.cat_value;
                            }

                            if (eachInHierarchy[row[sourceStructure.series_field]].length > 1 &&
                                eachInHierarchy['stats_' + row[sourceStructure.series_field]] &&
                                eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue != 0) {
                                eachInHierarchy['stats_' + row[sourceStructure.series_field]].deltaPerc = (eachInHierarchy['stats_' + row[sourceStructure.series_field]].finalValue - eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue) / eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue * 100;
                                eachInHierarchy['deltaPerc_' + row[sourceStructure.series_field]] = (eachInHierarchy['stats_' + row[sourceStructure.series_field]].finalValue - eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue) / eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue * 100;
                                // Delta % for sorter
                                if (row[sourceStructure.series_field] == sourceStructure.sorter.indicador) {
                                    eachInHierarchy.deltaPerc = (eachInHierarchy['stats_' + row[sourceStructure.series_field]].finalValue - eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue) / eachInHierarchy['stats_' + row[sourceStructure.series_field]].initialValue * 100;
                                }
                                // Delta % string formatters
                                eachInHierarchy['str_deltaPerc_' + row[sourceStructure.series_field]] = this.$numberTransformService.constructor.formatNumber(eachInHierarchy['deltaPerc_' + row[sourceStructure.series_field]], 'porcentagem');
                            }
                        }
                        continue fromSource;
                    }    
                }

                // If not found, create a new instance and push to the dataset
                let nuInstance = row;
                nuInstance.id = row[sourceStructure.id_field];
                nuInstance['totals_' + row[sourceStructure.series_field]] = entry.value;
                nuInstance[row[sourceStructure.series_field]] = [entry];
                nuInstance['stats_' + row[sourceStructure.series_field]] = {
                    initialValue: entry.value,
                    finalValue: entry.value,
                    initialCat: entry.cat_value,
                    finalCat: entry.cat_value
                };                
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
          
            this.createSparklineFields(hierarchicalDS, firstCat, lastCat, allSeries);

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

        createSparklineFields(dataset, firstCat, lastCat, seriesList, fillZeros = true){
            for (let row of dataset){

                for (let series_value of seriesList){
                    let series = row[series_value];

                    let sparkline_labels = [];
                    let sparkline_values = [];
                    let higher_value = null;
                    let higher_cat = null;
                    
                    if (series){
                        higher_cat = firstCat;
                        higher_value = 0;

                        series.sort(function(a,b){ 
                            return (a.cat_value > b.cat_value) ? 1 : -1 ;
                        });


                        let firstSeries = series[0];
                        
                        if (fillZeros){
                            if (firstSeries.cat_value > firstCat){
                                for(let i = firstCat; i < firstSeries.cat_value; i++){
                                    sparkline_labels.push(i);
                                    sparkline_values.push(0);                                
                                }
                            }
                        }

                        sparkline_labels.push(firstSeries.cat_value);
                        sparkline_values.push(firstSeries.value);  

                        higher_value = firstSeries.value;
                        higher_cat = firstSeries.cat_value;

                        for(let k = 1; k < series.length; k++){
                            let seriesPrev = series[k-1];
                            if (series[k]){
                                if (fillZeros){
                                    for(let j = seriesPrev.cat_value + 1; j < series[k].cat_value; j++){
                                        sparkline_labels.push(j);
                                        sparkline_values.push(0);                                
                                    }
                                }
                                sparkline_labels.push(series[k].cat_value);
                                sparkline_values.push(series[k].value);    
                                if (series[k].value > higher_value){
                                    higher_value = series[k].value;
                                    higher_cat = series[k].cat_value;
                                }                            
                            }
                        }

                        if (fillZeros){
                            let lastSeries = series[series.length - 1];
                            if (lastSeries.cat_value < lastCat){
                                for(let i = lastSeries.cat_value + 1; i <= lastCat; i++){
                                    sparkline_labels.push(i);
                                    sparkline_values.push(0);                                
                                }
                            }
                        }
                        
                    } else {
                        row[series_value] = [];
                        row['totals_' + series_value] = 0;
                    }

                    row['sparkline_labels_' + series_value] = sparkline_labels;
                    row['sparkline_values_' + series_value] = sparkline_values;
                    row['higher_value_' + series_value] = higher_value;
                    if(higher_value){
                        row['last_value_' + series_value] = sparkline_values[sparkline_values.length-1];
                        row['higher_value_str_' + series_value] = higher_value + "(" + higher_cat + ")";
                    } else {
                        row['last_value_' + series_value] = 0;
                        row['higher_value_str_' + series_value] = "";
                    }

                }
            }

            // return dataset;

        },

        triggerChartUpdates() {
            // Transform color array into a dictionary
            let colorDict = {};
            if (this.structure.chart_options.colorArray && this.structure.chart_options.indicadores) {
                for (let indx in this.structure.chart_options.indicadores) {
                    colorDict[this.structure.chart_options.indicadores[indx]] = this.structure.chart_options.colorArray[indx];
                }
            }

            // Generate charts
            setTimeout(() => {

                let chart_headers = [
                                        {"text": "", "value": "cat_value"},
                                        {"text": "", "value": "value"}
                                    ]
                let structChart = Object.assign({}, this.structure);
                structChart.headers = chart_headers;

                for (let sparkline of this.$el.getElementsByClassName("spark")) {
                    let splitElementId = sparkline.id.split("_");
                    let idFromElementId = splitElementId[splitElementId.length - 1];
                    for (let row of this.dataset) {
                        if (row.id == idFromElementId) { // Id from row matches element id on page
                            let seriesFromElementId = splitElementId.slice(1, splitElementId.length -1).join('_');
                            if (row[seriesFromElementId] == null) break; // Break if series dataset is non-existent

                            let options = Object.assign({}, this.structure.chart_options);

                            if (Object.keys(colorDict).length > 0) {
                                delete options.colorArray;
                                delete options.indicadores;
                                options.color = colorDict[seriesFromElementId].toString();
                            }
                            
                            this.chartGen(
                                sparkline.id,
                                this.structure.chart_type,
                                structChart,
                                options,
                                row[seriesFromElementId],
                                this.metadata,
                                this.sectionIndex ? this.sectionIndex : 0
                            ).then(
                                (chartHandler) => {},
                                (reject) => { this.sendError(reject); }
                            );
                        }
                    }
                }
            }, 0);
        },
        
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
  table.v-table tbody td{
    padding: 0 5px;
  }
</style>
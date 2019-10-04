<template>
  <v-layout v-if="dataset && structure.headers">
        <v-data-table
            @update:pagination="triggerChartUpdates()"
            :headers="removeFormatItems(structure.headers)"
            :items="dataset"
            disable-initial-sort="true"
            class="elevation-1"
            style="width: 100%;">
            <template :headers="structure.headers" slot="items" slot-scope="props">
                <!-- v-for SEM BIND, pois está restrito ao contexto do template do data-table -->
                <td pa-0 v-for="hdr in structure.headers">
                    <div v-if="hdr.type && hdr.type == 'spark'">
                        <v-layout row fill-height>
                            <v-layout xs-6 py-3 fill-height column text-xs-center class="sparkline"
                                :style="'color: ' + hdr.color + '; background-color: ' + hdr.bgColor">
                                <div :class="'sparkline-value ' + (hdr.item_class != null ? hdr.item_class : '')"
                                    v-html="props.item[hdr.value]">
                                </div>
                                <div v-if="hdr.detail" 
                                    :class="'sparkline-detail ' + (hdr.detail_class != null ? hdr.detail_class : '')"
                                    v-html="props.item['str_' + hdr.detail]">
                                </div>
                            </v-layout>
                            <v-layout xs-6 column>
                                <v-layout fill-height
                                    v-if="structure && structure.chart_options !== null && validCharts.includes(structure.chart_type)"
                                    class="spark"
                                    ref = "chartRef"
                                    :class = "leafletBasedCharts.includes(structure.chart_type) ? 'map_geo' : ''"
                                    :id="'spark_' + hdr.series + '_' + props.item.id">
                                </v-layout>
                            </v-layout>
                        </v-layout>
                    </div>
                    <div v-else-if="typeof props.item[hdr.value] === 'string' && props.item[hdr.value].includes('</')"
                        :class="'sparkline-value ' + (hdr.item_class != null ? hdr.item_class : '')"
                        v-html="props.item[hdr.value]">
                    </div>
                    <div v-else
                        :class="'sparkline-value' + (hdr.item_class != null ? hdr.item_class : '')">
                        {{ props.item[hdr.value] }}
                    </div>
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
            dataset: null
        }
    },
    created () {
        this.fillDataStructure(this.structure, {}, {}, this.fillFromDataset, {});
    },
    methods: {
        fillFromDataset(sourceDS, rules, sourceStructure, addedParams = null, metadata = null) {
            let hierarchicalDS = [];
            let allSeries = [];

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

            let fnSorter = (a, b) => {
                if (a.deltaPerc && b.deltaPerc) {
                    return - (a.deltaPerc - b.deltaPerc);
                }
                if (a.deltaPerc) return -1;
                if (b.deltaPerc) return 1;
                return 0;
            }
            hierarchicalDS.sort(fnSorter);
            
            this.dataset = hierarchicalDS;
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
                                this.structure,
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
</style>
<template>
  <v-layout v-if="dataset && structure.headers">
        <v-data-table
            @update:pagination="triggerChartUpdates()"
            :headers="removeFormatItems(structure.headers)"
            :items="dataset"
            class="elevation-1"
            style="width: 100%;">
            <template :headers="structure.headers" slot="items" slot-scope="props">
                <!-- v-for SEM BIND, pois está restrito ao contexto do template do data-table -->
                <td v-for="hdr in structure.headers">
                    <div v-if="hdr.type && hdr.type == 'spark'">
                        <v-layout fill-height
                            v-if="structure && structure.chart_options !== null && validCharts.includes(structure.chart_type)"
                            ref = "chartRef"
                            :class = "leafletBasedCharts.includes(structure.chart_type) ? 'map_geo' : ''"
                            :id="'spark_' + hdr.series + '_' + props.item.id">
                        </v-layout>
                    </div>
                    <div v-else-if="typeof props.item[hdr.value] === 'string' && props.item[hdr.value].includes('</')"
                        :class="hdr.item_class != null ? hdr.item_class : ''"
                        v-html="props.item[hdr.value]">
                    </div>
                    <div v-else
                        :class="hdr.item_class != null ? hdr.item_class : ''">
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
    computed: {
    },
    mounted: function() {
    },
    watch: {
    //   dataset: function (nuDS, oldDS) {
    //     this.triggerChartUpdates();
    //   }
    },
    methods: {
        fillFromDataset(sourceDS, rules, sourceStructure, addedParams = null, metadata = null) {
            let hierarchicalDS = [];

            fromSource: for (let row of sourceDS) {
                let entryValue = row[sourceStructure.value_field] ? row[sourceStructure.value_field] : 0;
                if (typeof entryValue !== "number") entryValue = parseFloat(entryValue);

                let entry = { id: sourceStructure.series_field, cat_value: row[sourceStructure.category_field], value: entryValue };
                
                for (let eachInHierarchy of hierarchicalDS) {
                    if (eachInHierarchy.id == row[sourceStructure.id_field]) { // found the instance
                        if (eachInHierarchy[row[sourceStructure.series_field]] == null) { // new series
                            eachInHierarchy[row[sourceStructure.series_field]] = [entry];
                            eachInHierarchy['totals_' + row[sourceStructure.series_field]] = entry.value;
                        } else { // Existing instance and series
                            eachInHierarchy[row[sourceStructure.series_field]].push(entry);
                            eachInHierarchy['totals_' + row[sourceStructure.series_field]] = eachInHierarchy['totals_' + row[sourceStructure.series_field]] + entry.value;
                        }
                        continue fromSource;
                    }    
                }

                // If not found, create a new instance and push to the dataset
                let nuInstance = row;
                nuInstance.id = row[sourceStructure.id_field];
                nuInstance['totals_' + row[sourceStructure.series_field]] = entry.value;
                nuInstance[row[sourceStructure.series_field]] = [entry];
                hierarchicalDS.push(nuInstance);
            }

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
            for (let row of this.dataset) {
                for (let hdr of this.structure.headers) {
                    if (hdr.type && hdr.type == 'spark' && row[hdr.series]) {
                        let id = 'spark_' + hdr.series + '_' + row.id;

                        // if (document.getElementById(id)) {
                            let options = Object.assign({}, this.structure.chart_options);

                            if (Object.keys(colorDict).length > 0) {
                                delete options.colorArray;
                                delete options.indicadores;
                                options.color = colorDict[hdr.series].toString();
                            }
                            
                            this.chartGen(
                                id,
                                this.structure.chart_type,
                                this.structure,
                                options,
                                row[hdr.series],
                                this.metadata,
                                this.sectionIndex ? this.sectionIndex : 0
                            ).then(
                                (chartHandler) => {},
                                (reject) => { this.sendError(reject); }
                            );
                        // }
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
    }
}
</script>
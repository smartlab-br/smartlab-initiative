<template>
  <v-layout v-if="dataset && structure.headers">
        <v-data-table
        :headers="removeFormatItems(structure.headers)"
        :items="dataset"
        class="elevation-1">
            <template :headers="structure.headers" slot="items" slot-scope="props">
                <!-- v-for SEM BIND, pois está restrito ao contexto do template do data-table -->
                <td v-for="hdr in structure.headers">
                <div v-if="typeof props.item[hdr.value] === 'string' && props.item[hdr.value].includes('</')"
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
    props: ['structure'],
    created () {
      this.fillDataStructure(
        this.structure, {}, {}, this.fillFromDataset, {}
      );
    },
    computed: {
    },
    mounted: function() {
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

</style>
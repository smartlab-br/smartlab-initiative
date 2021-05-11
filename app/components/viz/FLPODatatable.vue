<template>
  <v-layout column pa-2 max-width="100%">
    <v-card>
        <v-card-title
            v-if="structure.search_position == 'top' || structure.search_position == undefined"
        >
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
            class="flpo-datatable-grid elevation-1"
            style="width: 100%;"
            :rows-per-page-items='[10,50,100,200,500,{"text":"Todos","value":-1}]'
            :pagination.sync="pagination"
            :loading="!loaded"
            :filter="replaceSpecialCharacters"
            no-data-text="Sem registros"
            rows-per-page-text="Registros por página"
        >
            <template 
                slot="headers" 
                slot-scope="props"
            >
            <tr>
                <th 
                    v-if="structure.search_position == 'left'"
                    scope="colgroup" 
                    class="caption" 
                    colspan="2">
                    <v-text-field
                        v-model="search"
                        append-icon="search"
                        label="Procurar"
                        single-line
                        hide-details
                        class='pa-2 ma-0'
                    />
                </th>
                <th 
                    scope="colgroup" 
                    class="headline-obs" 
                    :colspan="props.headers.length-((structure.search_position == 'left' || structure.search_position == 'right')?2:0)"
                >
                    {{structure.title}}
                </th>
                <th 
                    v-if="structure.search_position == 'right'"
                    scope="colgroup" 
                    class="caption" 
                    colspan="2">
                    <v-text-field
                        v-model="search"
                        append-icon="search"
                        label="Procurar"
                        single-line
                        hide-details
                        class='pa-2 ma-0'
                    />
                </th>
            </tr>
            <tr>
                <th scope="colgroup" 
                    v-for="(header, idxHeader) in props.headers"
                    :key="idxHeader"
                    :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
                    :width="header.width"
                    @click="changeSort(header.value)"
                >
                    <v-icon small>arrow_upward</v-icon>
                    <span class="word-wrap" v-html="header.text" />
                </th>
            </tr>
            </template>            
            <template 
                :headers="structure.headers" 
                slot="items" 
                slot-scope="props"
            >
                <td 
                    v-for="(hdr, idxHdr) in structure.headers" 
                    :key="idxHdr" 
                    :style="(hdr.item_align?'text-align:'+hdr.item_align:'')"
                    pa-0 
                >
                    <div 
                        :class="getCellClass(hdr.value, props.item[hdr.value])"
                    >
                        {{ (hdr.format && props.item['fmt_' + hdr.value]) ? props.item['fmt_' + hdr.value]: props.item[hdr.value] }}
                    </div>
                </td> 
            </template>
            <template slot="actions-prepend"                    
                v-if="structure.search_position == 'bottom'"
            >
                <v-text-field
                    v-model="search"
                    append-icon="search"
                    label="Procurar"
                    single-line
                    hide-details
                    class='pa-2 ma-0'
                />
            </template>
            <template slot="pageText"
                slot-scope="props"
            >
                {{ props.pageStart }} - {{ props.pageStop }} de {{ props.itemsLength }}
            </template>            
            <template 
                slot="no-results"
            >
                <v-alert 
                    :value="true" 
                    color="error" 
                    icon="warning"
                    outline
                >
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
            labels: {},
            baseHeaders: null,
            loaded: true     
        }
    },
    props: ['refreshComponent', 'customFilters'],
    created () {
        this.baseHeaders = this.structure.headers.map((x) => Object.assign({}, x));
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
        changeSort (column) {
            if (this.pagination.sortBy === column) {
            this.pagination.descending = !this.pagination.descending
            } else {
            this.pagination.sortBy = column
            this.pagination.descending = false
            }
        },
        fillFromDataset(sourceDS, rules, sourceStructure, addedParams = null, metadata = null) {
            if (this.structure.pivot){
                sourceDS = this.$indicatorsModel.cast(sourceDS, this.structure.col_fields, this.structure.value_field, this.structure.layer_field, this.structure.fmt_value_field);
                this.addHeadersFields(sourceDS[0]);
            }
            if (sourceStructure.order_field){
                let order_field = sourceStructure.order_field;
                let fnSorter = (a, b) => {
                    return (a[order_field] < b[order_field]) ? 1 : -1 ;
                }
                sourceDS.sort(fnSorter);
            }
            
            this.dataset = sourceDS;
            this.loaded = true;
            this.$emit('dataset-loaded', this.dataset);
        },

        addHeadersFields(row){
            // this.structure.headers = this.structure.headers.slice(0,this.baseHeaders.length);
            for (let field of Object.keys(row)){
                if (!this.structure.col_fields.includes(field) && !field.startsWith('fmt_')){
                    let header = {};
                    header.text = field;
                    header.align = 'center';
                    header.item_align = 'center';
                    header.value = this.structure.fmt_value_field ? "fmt_"+field : field;

                    this.structure.headers.push(header);
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
        },

        getCellClass(columnField, value){
            if (columnField.startsWith('fmt_last_rate_')){
                if (value.substr(0,1) == "+" || value.startsWith('de 0')){
                    return "red--text";
                } else if (value.substr(0,1) == "-" || value.endsWith('para 0')){
                    return "orange--text text--darken-1";
                } else if (value == 'sem incidência'){
                    return "grey--text";
                }
            } else if (columnField.startsWith('last_rate_')){
                if (value > 0){
                    return "red--text";
                } else if (value < 0){
                    return "orange--text text--darken-2";
                }
            }
            return '';
        },

        replaceSpecialCharacters (item, queryText) {
            let itemText = item? item.toString(): "";
            queryText = this.$textTransformService.replaceSpecialCharacters(queryText).toLowerCase();
            itemText = this.$textTransformService.replaceSpecialCharacters(itemText).toLowerCase();
            return itemText.indexOf(queryText) > -1 
        }
    }
}
</script>

<style scoped>
  .flpo-datatable-grid table.v-table tbody td{
    padding: 0 5px;
  }
  .flpo-datatable-grid table.v-table thead th{
    padding: 0 5px;
  }
  table thead tr th span.word-wrap {
    word-wrap: break-word;
    white-space: normal; 
  }  
</style>
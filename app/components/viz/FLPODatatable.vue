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
            :custom-sort="customSort"
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
            <tr class="flpo-datatable-head">
                <th scope="colgroup" 
                    v-for="(header, idxHeader) in props.headers"
                    :key="idxHeader"
                    :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
                    :width="header.width"
                    @click="changeSort(header.value)"
                >
                    <v-layout column>
                        <v-flex pb-0>
                            <span class="word-wrap" v-html="header.text" />
                        </v-flex>
                        <v-flex pt-0>
                            <v-icon small>arrow_upward</v-icon>
                        </v-flex>
                    </v-layout>
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
                    <div v-if="props.item[hdr.value] && props.item[hdr.value].toLowerCase() == 'sim'"
                    >
                        <v-tooltip bottom>
                            <v-icon 
                                slot="activator"
                            >
                                check
                            </v-icon>
                            Sim
                        </v-tooltip>
                    </div>
                    <div v-else-if="props.item[hdr.value] && props.item[hdr.value].toLowerCase() == 'não'"
                    >
                        <v-tooltip bottom>
                            <v-icon 
                                slot="activator"
                                color="red"
                            >
                                clear
                            </v-icon>
                            Não
                        </v-tooltip>
                    </div>
                    <div v-else-if="props.item[hdr.value] && props.item[hdr.value].toLowerCase() == 'não informado'"
                    >
                        <v-tooltip bottom>
                            <v-icon 
                                slot="activator"
                                color="grey lighten-2"
                            >
                                remove
                            </v-icon>
                            Não Informado
                        </v-tooltip>
                    </div>
                    <div v-else
                        :class="getCellClass(hdr.value, props.item[hdr.value])"
                    >
                        {{ (hdr.format && props.item['fmt_' + hdr.value]) ? props.item['fmt_' + hdr.value]: props.item[hdr.value] }}
                    </div>
                    <div class="flpo-datatable-detail no-wrap py-1"
                        v-if="props.item['det_' + hdr.value.replace('fmt_','')]"
                        v-html="props.item['det_' + hdr.value.replace('fmt_','')]"
                    >
                    </div>
                </td> 
            </template>
            <template slot="actions-prepend">
                <v-layout row>
                    <v-flex align-left>
                        <v-checkbox v-if="structure.check"
                            v-model="required_column"
                            :label="structure.check.label"
                            :value="structure.check.column"
                            class='pt-3 ma-0'
                        />
                    </v-flex>
                    <v-flex>
                        <v-text-field v-if="structure.search_position == 'bottom'"
                            v-model="search"
                            append-icon="search"
                            label="Procurar"
                            single-line
                            hide-details
                            class='pa-2 ma-0'
                        />
                    </v-flex>
                </v-layout>
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

export default {
    extends: FLPOBaseLayout,
    data() {
        return {
            search: '',
            dataset: null,
            data_items: null,
            disableInitialSort: true,
            pagination: {}, 
            baseHeaders: null,
            loaded: true,
            required_column: null     
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
        },
        required_column: function(newVal, oldVal){
            if (newVal){
                this.pagination.page = 1;
                this.dataset = this.dataset.filter(function(el) { 
                    return el[newVal] !== null && el[newVal] !== undefined
                })
            } else {
                this.dataset = this.data_items.slice();
            }
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
        customSort(items, index, isDesc){
            if (index){
                items.sort((a, b) => {
                    if (a[index] === b[index]) {
                        return 0;
                    }
                    else if (a[index] === null || a[index] === undefined) {
                        return 1;
                    }
                    else if (b[index] === null || b[index] === undefined) {
                        return -1;
                    } else if (!isDesc) {
                        return a[index] < b[index] ? -1 : 1;
                    } else {
                        return b[index] < a[index] ? -1 : 1;
                    }
                });
            }
            return items;
        },
        fillFromDataset(sourceDS, rules, sourceStructure, addedParams = null, metadata = null) {
            let order_field = null;
            let castResult = {}
            if (this.structure.pivot){
                castResult = this.$indicatorsModel.cast(sourceDS, this.structure.pivot.col_fields, this.structure.pivot.value_field, this.structure.pivot.layer_field, this.structure.pivot.fmt_value_field, this.structure.pivot.det_value_field);
                sourceDS = castResult.dataset;
                this.addHeadersFields(castResult.newCols);
                //default order - first pivot field
                order_field = this.structure.headers[this.baseHeaders.length].value.replace('fmt_','');
            }
            //default 
            if (sourceStructure.order_field){
                order_field = sourceStructure.order_field;
            }

            if (order_field){
                this.customSort(sourceDS,order_field,true);
            }
            
            this.dataset = sourceDS;
            this.data_items = sourceDS.slice();
            this.loaded = true;
            this.$emit('dataset-loaded', this.dataset);
        },

        addHeadersFields(newCols){
            // this.structure.headers = this.structure.headers.slice(0,this.baseHeaders.length);
            for (let col of newCols){
                let header = {};
                header.text = col;
                header.align = 'center';
                header.item_align = 'center';
                header.value = this.structure.pivot.fmt_value_field ? "fmt_"+col : col;
                this.structure.headers.push(header);
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
            if (columnField.indexOf('IDH Municipal') != -1 && value){
                if (value.indexOf("(Baixo)") !== -1 || value.indexOf("(Muito baixo)") !== -1){
                    return "red--text";
                }
            } else if (!isNaN(parseFloat(value)) && value < 0){
                    return "red--text";
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
  .flpo-datatable-detail{
    font-size: 0.65rem;
  }
  table thead tr th span.word-wrap {
    word-wrap: break-word;
    white-space: normal; 
  }  
  .flpo-datatable-head {
    border-bottom: 1px solid rgba(0,0,0,0.12);
  }
  
  .flpo-datatable-head th div{
    margin: 0px !important;
  }

  .flpo-datatable-grid .v-datatable__actions > div:first-child {
   justify-content: space-between !important;
  }

</style>
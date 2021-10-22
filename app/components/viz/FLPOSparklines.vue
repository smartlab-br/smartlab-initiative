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
            <p class="headline-obs text-xs-center" v-html="structure.title"/>
        </v-progress-linear>
        <v-data-table 
            v-if="dataset && structure.headers"
            :headers="removeFormatItems(structure.headers)"
            :items="dataset"
            :disable-initial-sort="disableInitialSort"
            :custom-sort="customSort"
            :search="search"
            class="sparklines-grid elevation-1"
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
                    <span class="word-wrap" v-html="structure.title" />
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
                <!-- v-for SEM BIND, pois está restrito ao contexto do template do data-table -->
                <td 
                    v-for="(hdr, idxHdr) in structure.headers" 
                    :key="idxHdr" 
                    :style="(hdr.item_align?'text-align:'+hdr.item_align:'')"
                    pa-0 
                >
                    <div 
                        v-if="hdr.type && hdr.type == 'spark'"
                        px-2 
                        class="sparkline" 
                    >
                        <v-layout 
                            v-if="(hdr.show_labels == undefined || hdr.show_labels)"
                            row 
                            nowrap 
                        > 
                            <v-flex 
                                v-if="props.item['sparkline_values_' + hdr.series].length > 1" 
                                xs2 
                                xl2 
                                micro-caption 
                                text-xs-right 
                                :style="'color:'+hdr.bgColor"
                            >
                                {{ hdr.format ? $numberTransformService.constructor.formatNumber(
                                                    props.item['sparkline_values_' + hdr.series][0], hdr.format, hdr.precision, hdr.multiplier, hdr.collapse, hdr.signed, hdr.uiTags ) 
                                                : props.item['sparkline_values_' + hdr.series][0] 
                                }}
                            </v-flex>
                            <v-flex 
                                xs8 
                                xl8
                            >
                                <v-sparkline 
                                    :value="props.item['sparkline_values_'+ hdr.series]"
                                    :color="hdr.bgColor"
                                    :line-width="hdr.stroke?hdr.stroke:3"
                                    stroke-linecap="round"
                                    padding="8"
                                    height="45"
                                    smooth
                                />
                            </v-flex>
                            <v-flex 
                                v-if="props.item['sparkline_values_' + hdr.series].length > 1" 
                                xs2 
                                xl2 
                                micro-caption 
                                text-xs-left 
                                :style="'color:'+hdr.bgColor"
                            >
                                {{ hdr.format ? $numberTransformService.constructor.formatNumber(
                                                    props.item['sparkline_values_' + hdr.series][props.item['sparkline_values_' + hdr.series].length-1], 
                                                    hdr.format, hdr.precision, hdr.multiplier, hdr.collapse, hdr.signed, hdr.uiTags ) 
                                                : props.item['sparkline_values_' + hdr.series][props.item['sparkline_values_' + hdr.series].length-1]
                                }}
                            </v-flex>
                        </v-layout>
                        <v-layout 
                            v-else
                            row 
                            nowrap 
                        > 
                            <v-flex 
                                xs12
                            >
                                <v-sparkline 
                                    :value="props.item['sparkline_values_'+ hdr.series]"
                                    :color="hdr.bgColor"
                                    :line-width="hdr.stroke?hdr.stroke:3"
                                    stroke-linecap="round"
                                    padding="8"
                                    height="45"
                                    smooth
                                />
                            </v-flex>
                        </v-layout>
                    </div>
                    <div 
                        v-else
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
import FLPODatatable from './FLPODatatable.vue';

export default {
    extends: FLPODatatable,
    data() {
        return {
            first_cat: {},
            last_cat: {},
            labels: {}
        }
    },
    methods: {
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
                    series_last_cat[serie] = new Date(series_last_cat[serie]).toISOString().substring(0,10)
                }
            }

            this.first_cat = series_first_cat
            this.last_cat = series_last_cat

            if(sourceStructure.category_type == "timestamp" && sourceStructure.category_aggregation == "week"){
                this.executeTimestampCategoryAggregation(hierarchicalDS, allSeries);
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

            this.addHeadersLabels(allSeries);
            
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
                        row['series_length_last_5_' + series_value] = series.filter(function(el) { return el.cat_value >= series_last_cat[series_value]-4;}).length;
                        row['fmt_higher_value_' + series_value] = this.$numberTransformService.constructor.formatNumber(higher_value, "inteiro") + " (" + higher_cat + ")";
                        let last_year_value = sparkline_values[sparkline_values.length-1];
                        let last_2_year_value = sparkline_values[sparkline_values.length-2];
                        row['last_value_' + series_value] = last_year_value;
                        row['last_2_value_' + series_value] = last_2_year_value;
                        if (last_year_value !== undefined && last_year_value !== 0 && 
                            last_2_year_value !== undefined && last_2_year_value !== 0){
                                let rate = last_year_value/last_2_year_value;
                                if (rate < 1){
                                    row['fmt_last_rate_' + series_value] = '-' + this.$numberTransformService.constructor.formatNumber((1 - rate)*100, "real") + '%';
                                    row['last_rate_' + series_value] = (1 - rate)*100*-1;
                                } else if (rate > 1){
                                    row['fmt_last_rate_' + series_value] = '+' + this.$numberTransformService.constructor.formatNumber((rate - 1)*100, "real") + '%';
                                    row['last_rate_' + series_value] = (rate - 1)*100;
                                } else {
                                    row['fmt_last_rate_' + series_value] = '0%';
                                    row['last_rate_' + series_value] = 0;
                                }                      
                        }else if (last_year_value !== undefined && last_year_value == 0 && 
                            last_2_year_value !== undefined && last_2_year_value !== 0){
                            row['fmt_last_rate_' + series_value] = 'de ' + this.$numberTransformService.constructor.formatNumber(last_2_year_value, "inteiro") + ' para 0';
                            row['last_rate_' + series_value] = null;
                        }else if (last_year_value !== undefined && last_year_value !== 0 && 
                            last_2_year_value !== undefined && last_2_year_value == 0){
                            row['fmt_last_rate_' + series_value] = 'de 0 para ' + this.$numberTransformService.constructor.formatNumber(last_year_value, "inteiro");
                            row['last_rate_' + series_value] = null;
                        }else {
                            row['fmt_last_rate_' + series_value] = 'sem incidência';
                            row['last_rate_' + series_value] = null;
                        }
                    } else {
                        row['last_value_' + series_value] = 0;
                        row['last_2_value_' + series_value] = 0;
                        row['fmt_higher_value_' + series_value] = "";
                        row['fmt_last_rate_' + series_value] = '';
                        row['last_rate_' + series_value] = null;
                    }

                    for (let header of this.structure.headers){
                        if (header.format){
                            row['fmt_'+ header.value] = row[header.value] != "" ? this.$numberTransformService.constructor.formatNumber(
                                row[header.value], header.format, header.precision, header.multiplier, header.collapse, header.signed, header.uiTags ) : "";
                        }
                    }

                }

            }

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

        addHeadersLabels(allSeries){
            //Creating headers labels
            for (let serie of allSeries){

                let last_2_cat = this.last_cat[serie] - 1;
                let last_5_cat = this.last_cat[serie] - 4;
                if (this.last_cat[serie] - this.first_cat[serie] < 4){
                   last_5_cat =  this.first_cat[serie];
                }
                this.labels['last_value_'+ serie + '_label'] = this.last_cat[serie];
                this.labels['last_2_value_'+ serie + '_label'] = last_2_cat;
                this.labels['last_rate_'+ serie + '_label'] = '(' + last_2_cat + '-' + this.last_cat[serie] + ')';
                this.labels['spark_'+ serie + '_label'] = ' (' + this.first_cat[serie] + ' a ' + this.last_cat[serie] + ')';
                this.labels['series_length_'+ serie + '_label'] = ' (' + this.first_cat[serie] + '-' + this.last_cat[serie] + ')';
                this.labels['series_length_last_5_'+ serie + '_label'] = ' (' + last_5_cat + '-' + this.last_cat[serie] + ')';
                
            }
            //Adding labels in headers text
            let i = 0;
            for (let header of this.structure.headers){
                if (header.type == 'spark'){
                    header.text = this.baseHeaders[i].text + this.labels['spark_' + header.series + '_label'];
                } else if (this.labels[header.value.replace('fmt_','') + '_label']){
                    header.text = this.baseHeaders[i].text + (this.baseHeaders[i].text !== '' && this.baseHeaders[i].text !== undefined?' ':'') + this.labels[header.value.replace('fmt_','')  + '_label'];
                }
                i++;
            }

        },

        executeTimestampCategoryAggregation(hierarchicalDS, allSeries){
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


    }
}
</script>

<style scoped>
  .sparkline{
      min-width: 150px;
  }
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
  .sparklines-grid table.v-table thead th{
    padding: 0 5px;
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

</style>
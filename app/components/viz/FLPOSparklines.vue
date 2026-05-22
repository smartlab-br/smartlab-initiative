<template>
  <div class="pa-2" style="max-width:100%;width:100%">
    <v-card>
      <v-card-title v-if="structure.search_position == 'top' || structure.search_position == undefined">
        <v-text-field
          v-model="search"
          append-inner-icon="mdi-magnify"
          label="Procurar"
          single-line
          hide-details
        />
      </v-card-title>

      <v-progress-linear v-if="!dataset" height="40" indeterminate color="info" />
      <p v-if="!dataset" class="headline-obs text-center" v-html="structure.title" />

      <v-data-table
        v-if="dataset && structure.headers"
        :headers="tableHeaders"
        :items="dataset ?? []"
        :search="search"
        :custom-filter="replaceSpecialCharacters"
        :items-per-page-options="itemsPerPageOptions"
        v-model:sort-by="sortBy"
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :loading="!loaded"
        no-data-text="Sem registros"
        items-per-page-text="Registros por página"
        class="sparklines-grid elevation-1"
        style="width: 100%;"
      >
        <template #headers="{ columns }">
          <tr>
            <th
              v-if="structure.search_position == 'left'"
              scope="colgroup"
              class="caption"
              colspan="2"
            >
              <v-text-field
                v-model="search"
                append-inner-icon="mdi-magnify"
                label="Procurar"
                single-line
                hide-details
                class="pa-2 ma-0"
              />
            </th>
            <th
              scope="colgroup"
              class="headline-obs"
              :colspan="columns.length - ((structure.search_position == 'left' || structure.search_position == 'right') ? 2 : 0)"
            >
              <span class="word-wrap" v-html="structure.title" />
            </th>
            <th
              v-if="structure.search_position == 'right'"
              scope="colgroup"
              class="caption"
              colspan="2"
            >
              <v-text-field
                v-model="search"
                append-inner-icon="mdi-magnify"
                label="Procurar"
                single-line
                hide-details
                class="pa-2 ma-0"
              />
            </th>
          </tr>
          <tr class="FLPODatatable-head">
            <th
              v-for="(header, idxHeader) in localHeaders"
              :key="idxHeader"
              scope="colgroup"
              :class="['column sortable', isSortedDesc(header) ? 'desc' : 'asc', isSortedBy(header) ? 'active' : '', header.align]"
              :width="header.width"
              @click="changeSort(header.value)"
            >
              <v-row no-gutters class="flex-column ma-0">
                <v-col class="pb-0">
                  <span class="word-wrap" v-html="header.text" />
                </v-col>
                <v-col class="pt-0">
                  <v-icon size="small">mdi-arrow-up</v-icon>
                </v-col>
              </v-row>
            </th>
          </tr>
        </template>

        <template #item="{ item }">
          <tr>
            <td
              v-for="(hdr, idxHdr) in localHeaders"
              :key="idxHdr"
              :class="hdr.align"
              :style="hdr.item_align ? 'text-align:' + hdr.item_align : ''"
              class="pa-0"
            >
              <div
                v-if="hdr.type && hdr.type == 'spark'"
                class="sparkline px-2"
              >
                <!-- Com labels (first/last values) -->
                <v-row
                  v-if="hdr.show_labels == undefined || hdr.show_labels"
                  no-gutters
                  class="flex-nowrap align-center"
                >
                  <v-col
                    v-if="(item as any)['sparkline_values_' + hdr.series]?.length > 1"
                    cols="2"
                    class="micro-caption text-right"
                    :style="'color:' + hdr.bgColor"
                  >
                    {{ hdr.format
                      ? numberTransformService.formatNumber(
                        (item as any)['sparkline_values_' + hdr.series][0],
                        hdr.format, hdr.precision, hdr.multiplier, hdr.collapse, hdr.signed, hdr.uiTags
                      )
                      : (item as any)['sparkline_values_' + hdr.series][0]
                    }}
                  </v-col>
                  <v-col cols="8">
                    <v-sparkline
                      :model-value="(item as any)['sparkline_values_' + hdr.series]"
                      :color="hdr.bgColor"
                      :line-width="hdr.stroke || 3"
                      stroke-linecap="round"
                      :padding="8"
                      :height="45"
                      smooth
                    />
                  </v-col>
                  <v-col
                    v-if="(item as any)['sparkline_values_' + hdr.series]?.length > 1"
                    cols="2"
                    class="micro-caption text-left"
                    :style="'color:' + hdr.bgColor"
                  >
                    {{ hdr.format
                      ? numberTransformService.formatNumber(
                        (item as any)['sparkline_values_' + hdr.series][(item as any)['sparkline_values_' + hdr.series].length - 1],
                        hdr.format, hdr.precision, hdr.multiplier, hdr.collapse, hdr.signed, hdr.uiTags
                      )
                      : (item as any)['sparkline_values_' + hdr.series][(item as any)['sparkline_values_' + hdr.series].length - 1]
                    }}
                  </v-col>
                </v-row>
                <!-- Sem labels -->
                <v-row v-else no-gutters>
                  <v-col cols="12">
                    <v-sparkline
                      :model-value="(item as any)['sparkline_values_' + hdr.series]"
                      :color="hdr.bgColor"
                      :line-width="hdr.stroke || 3"
                      stroke-linecap="round"
                      :padding="8"
                      :height="45"
                      smooth
                    />
                  </v-col>
                </v-row>
              </div>
              <div
                v-else
                :class="getCellClass(hdr.value, (item as any)[hdr.value])"
              >
                {{ (hdr.format && (item as any)['fmt_' + hdr.value]) ? (item as any)['fmt_' + hdr.value] : (item as any)[hdr.value] }}
              </div>
            </td>
          </tr>
        </template>

        <template #tfoot>
          <tr>
            <td colspan="15">
              <v-row>
                <v-col cols="4">
                  <v-checkbox
                    v-if="structure.check"
                    v-model="requiredColumn"
                    :label="structure.check.label"
                    :value="structure.check.column"
                    class="pt-3 ma-0 FLPODatatable-checkbox"
                  />
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    v-if="structure.search_position == 'bottom'"
                    v-model="search"
                    append-inner-icon="mdi-magnify"
                    label="Procurar"
                    single-line
                    hide-details
                    class="pa-2 ma-0"
                  />
                </v-col>
              </v-row>
            </td>
          </tr>
        </template>

        <template #no-results>
          <v-alert color="error" icon="mdi-alert" variant="outlined">
            Sua busca por "{{ search }}" não trouxe resultados.
          </v-alert>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { NumberTransformService } from '~/utils/service/singleton/numberTransform'
import { TextTransformService } from '~/utils/service/singleton/textTransform'

interface Props {
  structure: any
  customParams?: Record<string, any>
  refreshComponent?: any
  customFilters?: Record<string, any>
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'dataset-loaded': [dataset: any[]] }>()

const { $fillDataStructure } = useNuxtApp()
const numberTransformService = new NumberTransformService()
const textTransformService = new TextTransformService()

const search = ref('')
const dataset = ref<any[] | null>(null)
const dataItems = ref<any[] | null>(null)
const loaded = ref(true)
const localHeaders = ref<any[]>([])
const baseHeaders = ref<any[]>([])
const sortBy = ref<Array<{ key: string; order: 'asc' | 'desc' }>>([])
const itemsPerPage = ref(10)
const page = ref(1)
const requiredColumn = ref<string | number | null>(null)
const firstCat = ref<Record<string, any>>({})
const lastCat = ref<Record<string, any>>({})
const labels = ref<Record<string, string>>({})

const itemsPerPageOptions = [
  { value: 10, title: '10' },
  { value: 50, title: '50' },
  { value: 100, title: '100' },
  { value: 200, title: '200' },
  { value: 500, title: '500' },
  { value: -1, title: 'Todos' },
]

const tableHeaders = computed(() =>
  localHeaders.value.map((h: any) => ({
    key: String(h.value || h.key || '').replace('fmt_', ''),
    title: h.text || h.title || '',
    sortable: false,
  }))
)

const changeSort = (column: string) => {
  const key = String(column || '').replace('fmt_', '')
  const existing = sortBy.value.find(s => s.key === key)
  if (existing) {
    sortBy.value = existing.order === 'asc' ? [{ key, order: 'desc' }] : []
  } else {
    sortBy.value = [{ key, order: 'asc' }]
  }
}

const isSortedBy = (header: any): boolean => {
  const key = String(header.value || header.key || '').replace('fmt_', '')
  return sortBy.value.some(s => s.key === key)
}

const isSortedDesc = (header: any): boolean => {
  const key = String(header.value || header.key || '').replace('fmt_', '')
  return sortBy.value.find(s => s.key === key)?.order === 'desc'
}

const replaceSpecialCharacters = (value: any, queryText: string): boolean => {
  let itemText = value ? value.toString() : ''
  queryText = textTransformService.replaceSpecialCharacters(queryText).toLowerCase()
  itemText = textTransformService.replaceSpecialCharacters(itemText).toLowerCase()
  return itemText.includes(queryText)
}

const getCellClass = (columnField: string, value: any): string => {
  if (columnField?.startsWith('fmt_last_rate_')) {
    if (value?.startsWith('+') || value?.startsWith('de 0')) return 'text-red'
    if (value?.startsWith('-') || value?.endsWith('para 0')) return 'text-orange-darken-1'
    if (value === 'sem dados') return 'text-grey'
  } else if (columnField?.startsWith('last_rate_')) {
    if (value > 0) return 'text-red'
    if (value < 0) return 'text-orange-darken-2'
  }
  return ''
}

const addHeadersLabels = (allSeries: string[]) => {
  const lastCatVal = lastCat.value
  const firstCatVal = firstCat.value
  const labelsVal: Record<string, string> = {}

  for (const serie of allSeries) {
    const last_2_cat = lastCatVal[serie] - 1
    const last_5_cat = (lastCatVal[serie] - firstCatVal[serie] < 4)
      ? firstCatVal[serie]
      : lastCatVal[serie] - 4

    labelsVal['last_value_' + serie + '_label'] = lastCatVal[serie]
    labelsVal['last_2_value_' + serie + '_label'] = last_2_cat
    labelsVal['last_rate_' + serie + '_label'] = '(' + last_2_cat + '-' + lastCatVal[serie] + ')'
    labelsVal['spark_' + serie + '_label'] = ' (' + firstCatVal[serie] + ' a ' + lastCatVal[serie] + ')'
    labelsVal['series_length_' + serie + '_label'] = ' (' + firstCatVal[serie] + '-' + lastCatVal[serie] + ')'
    labelsVal['series_length_last_5_' + serie + '_label'] = ' (' + last_5_cat + '-' + lastCatVal[serie] + ')'
  }

  labels.value = labelsVal

  let i = 0
  for (const header of localHeaders.value) {
    if (header.type === 'spark') {
      header.text = baseHeaders.value[i].text + (labelsVal['spark_' + header.series + '_label'] ?? '')
    } else if (labelsVal[String(header.value).replace('fmt_', '') + '_label']) {
      const base = baseHeaders.value[i].text
      header.text = base + (base ? ' ' : '') + labelsVal[String(header.value).replace('fmt_', '') + '_label']
    }
    if (props.structure.hidden_cols?.includes(header.value)) {
      header.align = ' d-none'
    }
    i++
  }
}

const createSparklineFields = (
  ds: any[],
  seriesList: string[],
  series_first_cat: Record<string, any>,
  series_last_cat: Record<string, any>,
  sourceStructure: any,
  fillZeros = true
) => {
  for (const row of ds) {
    for (const series_value of seriesList) {
      const series = row[series_value]
      const sparkline_values: number[] = []
      let higher_cat = series_first_cat[series_value]
      let higher_value = 0
      let total = 0

      if (series) {
        series.sort((a: any, b: any) => (a.cat_value > b.cat_value) ? 1 : -1)

        const firstSeries = series[0]
        if (fillZeros && firstSeries.cat_value > series_first_cat[series_value]) {
          for (let i = series_first_cat[series_value]; i < firstSeries.cat_value; i++) {
            sparkline_values.push(0)
          }
        }
        sparkline_values.push(firstSeries.value)
        higher_value = firstSeries.value
        higher_cat = firstSeries.cat_value
        total = firstSeries.value

        for (let k = 1; k < series.length; k++) {
          const seriesPrev = series[k - 1]
          if (fillZeros) {
            for (let j = seriesPrev.cat_value + 1; j < series[k].cat_value; j++) {
              sparkline_values.push(0)
            }
          }
          sparkline_values.push(series[k].value)
          total += series[k].value
          if (series[k].value > higher_value) {
            higher_value = series[k].value
            higher_cat = series[k].cat_value
          }
        }

        if (fillZeros) {
          const lastSeries = series[series.length - 1]
          if (lastSeries.cat_value < series_last_cat[series_value]) {
            for (let i = lastSeries.cat_value + 1; i <= series_last_cat[series_value]; i++) {
              sparkline_values.push(0)
            }
          }
        }
      } else {
        row[series_value] = []
      }

      row['sparkline_values_' + series_value] = sparkline_values
      row['total_' + series_value] = total
      row['higher_value_' + series_value] = higher_value

      if (sourceStructure.category_type === 'timestamp') {
        higher_cat = new Date(higher_cat).toISOString().substring(0, 10)
      }

      if (series) {
        row['series_length_' + series_value] = series.length
        row['series_length_last_5_' + series_value] = series.filter(
          (el: any) => el.cat_value >= series_last_cat[series_value] - 4
        ).length
        row['fmt_higher_value_' + series_value] =
          numberTransformService.formatNumber(higher_value, 'inteiro') + ' (' + higher_cat + ')'

        const last_year_value = sparkline_values[sparkline_values.length - 1]
        const last_2_year_value = sparkline_values[sparkline_values.length - 2]
        row['last_value_' + series_value] = last_year_value
        row['last_2_value_' + series_value] = last_2_year_value

        if (last_year_value !== undefined && last_year_value !== 0 &&
            last_2_year_value !== undefined && last_2_year_value !== 0) {
          const rate = last_year_value / last_2_year_value
          if (rate < 1) {
            row['fmt_last_rate_' + series_value] = '-' + numberTransformService.formatNumber((1 - rate) * 100, 'real') + '%'
            row['last_rate_' + series_value] = (1 - rate) * 100 * -1
          } else if (rate > 1) {
            row['fmt_last_rate_' + series_value] = '+' + numberTransformService.formatNumber((rate - 1) * 100, 'real') + '%'
            row['last_rate_' + series_value] = (rate - 1) * 100
          } else {
            row['fmt_last_rate_' + series_value] = '0%'
            row['last_rate_' + series_value] = 0
          }
        } else if (last_year_value !== undefined && last_year_value == 0 &&
                   last_2_year_value !== undefined && last_2_year_value !== 0) {
          row['fmt_last_rate_' + series_value] = 'de ' + numberTransformService.formatNumber(last_2_year_value, 'inteiro') + ' para 0'
          row['last_rate_' + series_value] = null
        } else if (last_year_value !== undefined && last_year_value !== 0 &&
                   last_2_year_value !== undefined && last_2_year_value == 0) {
          row['fmt_last_rate_' + series_value] = 'de 0 para ' + numberTransformService.formatNumber(last_year_value, 'inteiro')
          row['last_rate_' + series_value] = null
        } else {
          row['fmt_last_rate_' + series_value] = 'sem dados'
          row['last_rate_' + series_value] = null
        }
      } else {
        row['last_value_' + series_value] = 0
        row['last_2_value_' + series_value] = 0
        row['fmt_higher_value_' + series_value] = ''
        row['fmt_last_rate_' + series_value] = ''
        row['last_rate_' + series_value] = null
      }

      for (const header of localHeaders.value) {
        if (header.format) {
          row['fmt_' + header.value] = row[header.value] != null && row[header.value] !== ''
            ? numberTransformService.formatNumber(
              row[header.value], header.format, header.precision,
              header.multiplier, header.collapse, header.signed, header.uiTags
            )
            : ''
        }
      }
    }
  }
}

const executeTimestampCategoryAggregation = (hierarchicalDS: any[], allSeries: string[]) => {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24
  for (const reg of hierarchicalDS) {
    for (const serie of allSeries) {
      const new_serie: number[] = []
      let sum_week = 0
      let weekday: number
      let first_reg = true
      let day_before: Date | null = null
      let same_week = true

      for (const item of reg[serie]) {
        weekday = new Date(item.cat_value).getUTCDay()
        if (day_before) {
          const days_diff = Math.floor((new Date(item.cat_value).getTime() - day_before.getTime()) / _MS_PER_DAY)
          if (new Date(item.cat_value).getTime() === day_before.getTime()) {
            same_week = true
          } else if (weekday <= day_before.getUTCDay()) {
            same_week = false
          } else if (days_diff > 6) {
            same_week = false
          } else {
            same_week = true
          }
        }
        if (weekday === 0 || (day_before && !same_week)) {
          if (!first_reg) new_serie.push(sum_week)
          sum_week = item.value
        } else {
          sum_week += item.value
        }
        first_reg = false
        day_before = new Date(item.cat_value)
      }
      reg['sparkline_values_' + serie] = new_serie
      reg['last_value_' + serie] = new_serie[new_serie.length - 1]
    }
  }
}

const updateDataStructure = (filterUrl: string) => {
  const structReactive = { ...props.structure }
  structReactive.api = JSON.parse(JSON.stringify(props.structure.apiBase ?? props.structure.api))
  if (structReactive.api) {
    if (!Array.isArray(structReactive.api)) structReactive.api = [structReactive.api]
    for (const struct of structReactive.api) {
      if (struct.fixed) struct.fixed += filterUrl
      else if (struct.template) struct.template += filterUrl
    }
  }
  $fillDataStructure(structReactive, props.customParams, fillFromDataset)
}

const fillFromDataset = (sourceDS: any[], _rules: any, sourceStructure: any, _addedParams: any = null, _metadata: any = null) => {
  const hierarchicalDS: any[] = []
  const allSeries: string[] = []
  const series_first_cat: Record<string, any> = {}
  const series_last_cat: Record<string, any> = {}

  fromSource: for (const row of sourceDS) {
    if (row[sourceStructure.series_field] == undefined) {
      const mun_row = hierarchicalDS.find(reg => reg[sourceStructure.id_field] === row[sourceStructure.id_field])
      if (mun_row) Object.assign(mun_row, row)
    } else {
      if (!allSeries.includes(row[sourceStructure.series_field])) {
        allSeries.push(row[sourceStructure.series_field])
        series_first_cat[row[sourceStructure.series_field]] = parseInt(row[sourceStructure.category_field])
        series_last_cat[row[sourceStructure.series_field]] = parseInt(row[sourceStructure.category_field])
      } else {
        if (parseInt(row[sourceStructure.category_field]) < series_first_cat[row[sourceStructure.series_field]]) {
          series_first_cat[row[sourceStructure.series_field]] = parseInt(row[sourceStructure.category_field])
        }
        if (parseInt(row[sourceStructure.category_field]) > series_last_cat[row[sourceStructure.series_field]]) {
          series_last_cat[row[sourceStructure.series_field]] = parseInt(row[sourceStructure.category_field])
        }
      }

      let entryValue = row[sourceStructure.value_field] ? row[sourceStructure.value_field] : 0
      if (typeof entryValue !== 'number') entryValue = parseFloat(entryValue)

      const entry = {
        id: sourceStructure.series_field,
        cat_value: parseInt(row[sourceStructure.category_field]),
        value: entryValue
      }

      for (const eachInHierarchy of hierarchicalDS) {
        if (eachInHierarchy.id == row[sourceStructure.id_field]) {
          if (eachInHierarchy[row[sourceStructure.series_field]] == null) {
            eachInHierarchy[row[sourceStructure.series_field]] = [entry]
          } else {
            eachInHierarchy[row[sourceStructure.series_field]].push(entry)
          }
          continue fromSource
        }
      }

      const nuInstance = { ...row }
      nuInstance.id = row[sourceStructure.id_field]
      nuInstance[row[sourceStructure.series_field]] = [entry]
      hierarchicalDS.push(nuInstance)
    }
  }

  const fillZeros = sourceStructure.fillZeros === undefined ? true : sourceStructure.fillZeros
  createSparklineFields(hierarchicalDS, allSeries, series_first_cat, series_last_cat, sourceStructure, fillZeros)

  if (sourceStructure.category_type === 'timestamp') {
    for (const serie of allSeries) {
      series_first_cat[serie] = new Date(series_first_cat[serie]).toISOString().substring(0, 10)
      series_last_cat[serie] = new Date(series_last_cat[serie]).toISOString().substring(0, 10)
    }
  }

  firstCat.value = series_first_cat
  lastCat.value = series_last_cat

  if (sourceStructure.category_type === 'timestamp' && sourceStructure.category_aggregation === 'week') {
    executeTimestampCategoryAggregation(hierarchicalDS, allSeries)
  }

  let order_field = 'last_value_' + allSeries[0]
  if (sourceStructure.order_field) order_field = sourceStructure.order_field
  hierarchicalDS.sort((a, b) => (a[order_field] < b[order_field]) ? 1 : -1)

  addHeadersLabels(allSeries)

  dataset.value = hierarchicalDS
  dataItems.value = [...hierarchicalDS]
  if (props.structure.check?.checked) {
    requiredColumn.value = props.structure.check.column
  }
  loaded.value = true
  emit('dataset-loaded', dataset.value)
}

watch(
  () => props.refreshComponent,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      loaded.value = false
      updateDataStructure(props.customFilters?.filterUrl)
    }
  }
)

watch(requiredColumn, (newVal) => {
  if (newVal) {
    page.value = 1
    const colId = isNaN(Number(newVal))
      ? String(newVal)
      : props.structure.headers[Number(newVal) - 1].value
    dataset.value = (dataItems.value ?? []).filter((el: any) =>
      el[colId] !== null && el[colId] !== undefined && el[colId].toString() !== '0'
    )
  } else {
    dataset.value = dataItems.value ? [...dataItems.value] : null
  }
})

onMounted(() => {
  baseHeaders.value = props.structure.headers.map((x: any) => ({ ...x }))
  localHeaders.value = props.structure.headers.map((x: any) => ({ ...x }))
  $fillDataStructure(props.structure, props.customParams, fillFromDataset, {})
})
</script>

<style scoped>
.sparkline {
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
.sparklines-grid :deep(table tbody td) {
  padding: 0 5px;
}
.sparklines-grid :deep(table thead th) {
  padding: 0 5px;
}
table thead tr th span.word-wrap {
  word-wrap: break-word;
  white-space: normal;
}
.FLPODatatable-head {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
.FLPODatatable-head th div {
  margin: 0 !important;
}
.FLPODatatable-checkbox :deep(label) {
  font-size: 12px !important;
}
</style>

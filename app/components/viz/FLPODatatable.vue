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
        class="FLPODatatable-grid elevation-1"
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
              <div v-if="(item as any)[hdr.value]?.toString().toLowerCase() == 'sim'">
                <v-tooltip location="bottom" text="Sim">
                  <template #activator="{ props: tooltipProps }">
                    <v-icon v-bind="tooltipProps">mdi-check</v-icon>
                  </template>
                </v-tooltip>
              </div>
              <div v-else-if="(item as any)[hdr.value]?.toString().toLowerCase() == 'não'">
                <v-tooltip location="bottom" text="Não">
                  <template #activator="{ props: tooltipProps }">
                    <v-icon v-bind="tooltipProps" color="red">mdi-close</v-icon>
                  </template>
                </v-tooltip>
              </div>
              <div v-else-if="(item as any)[hdr.value]?.toString().toLowerCase() == 'não informado'">
                <v-tooltip location="bottom" text="Não Informado">
                  <template #activator="{ props: tooltipProps }">
                    <v-icon v-bind="tooltipProps" color="grey-lighten-2">mdi-minus</v-icon>
                  </template>
                </v-tooltip>
              </div>
              <div
                v-else
                :class="getCellClass(hdr.value, (item as any)[hdr.value])"
              >
                {{ (hdr.format && (item as any)['fmt_' + hdr.value]) ? (item as any)['fmt_' + hdr.value] : (item as any)[hdr.value] }}
              </div>
              <div
                v-if="(item as any)['det_' + hdr.value?.replace('fmt_', '')]"
                class="FLPODatatable-detail no-wrap py-1"
                v-html="(item as any)['det_' + hdr.value?.replace('fmt_', '')]"
              />
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

        <template #no-data>
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
import { Indicators } from '~/utils/model/indicators'

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
const indicators = new Indicators()

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
  if (columnField?.includes('IDH Municipal') && value) {
    if (value.includes('(Baixo)') || value.includes('(Muito baixo)')) return 'text-red'
  } else if (!isNaN(parseFloat(value)) && value < 0) {
    return 'text-red'
  } else if (value && value.toString().length > 300) {
    return 'fixed-height'
  }
  return ''
}

const addHeadersFields = (newCols: string[]) => {
  for (const col of newCols) {
    const header: any = {}
    header.text = col
    if (props.structure.hidden_cols?.includes(col)) {
      header.align = ' d-none'
    } else {
      header.align = 'center'
      header.item_align = 'center'
    }
    header.value = props.structure.pivot?.fmt_value_field ? 'fmt_' + col : col
    localHeaders.value.push({ ...header })
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
  let order_field: string | null = null

  if (props.structure.pivot) {
    const castResult = indicators.cast(
      sourceDS,
      props.structure.pivot.col_fields,
      props.structure.pivot.value_field,
      props.structure.pivot.layer_field,
      props.structure.pivot.fmt_value_field,
      props.structure.pivot.det_value_field
    )
    sourceDS = castResult.dataset
    addHeadersFields(castResult.newCols)
    order_field = localHeaders.value[baseHeaders.value.length]?.value?.replace('fmt_', '') ?? null
  }

  if (sourceStructure.order_field) order_field = sourceStructure.order_field

  if (order_field) {
    const isDescOrder = !(props.structure.pivot?.order && props.structure.pivot.order === 'asc')
    sourceDS.sort((a, b) => {
      if (a[order_field!] === b[order_field!]) return 0
      if (a[order_field!] === null || a[order_field!] === undefined) return 1
      if (b[order_field!] === null || b[order_field!] === undefined) return -1
      return isDescOrder
        ? (b[order_field!] < a[order_field!] ? -1 : 1)
        : (a[order_field!] < b[order_field!] ? -1 : 1)
    })
  }

  // Format cells
  for (const row of sourceDS) {
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

  dataset.value = sourceDS
  dataItems.value = [...sourceDS]
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
.FLPODatatable-grid :deep(table tbody td) {
  padding: 0 5px;
}
.FLPODatatable-grid :deep(table thead th) {
  padding: 0 5px;
}
.FLPODatatable-detail {
  font-size: 0.65rem;
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

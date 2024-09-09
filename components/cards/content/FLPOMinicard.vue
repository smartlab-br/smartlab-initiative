<template>
  <v-col :class="(rowClass ? rowClass : 'pl-4 pr-0 pb-3 pt-3') + ' ' + cardClass">
    <v-row column :class="'minicard fill-height' + colorClass + ' ' + relevance">
      <div v-if="errorMessage" :class="'minicard-comment ' + commentColorClass" v-html="errorMessage" />

      <v-row v-if="structure?.desc_position == 'right'" class="align-center">
        <v-col class="minicard-value" v-html="value" />
        <v-col v-if="structure.desc_position == 'right'" class="pl-1 title-obs-desc minicard-description" v-html="description != null ? description.toUpperCase() : ''" />
      </v-row>

      <div v-else class="minicard-value" v-html="value" />

      <div v-if="dataset !== null && dataset.length > 1 && structure && structure.chart" class="minicard-chart">
        <div
          v-if="structure && structure.chart && structure.chart.type && $validCharts.includes(structure.chart.type)"
          :id="chartId"
          ref="chart"
          class="fill-height"
          :class="$leafletBasedCharts.includes(structure.chart.type) ? 'map_geo' : ''"
        />
      </div>

      <div v-if="structure?.desc_position != 'right'" class="title-obs-desc minicard-description" v-html="description != null ? description.toUpperCase() : ''" />

      <div :class="'minicard-comment ' + commentColorClass" v-html="comment" />
    </v-row>
  </v-col>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, onBeforeMount } from "vue"
import FLPOBaseLayout from "~/components/FLPOBaseLayout.vue"
import { useNuxtApp } from "#app"
import { TextTransformService } from "~/utils/service/singleton/textTransform"
import { NumberTransformService } from "~/utils/service/singleton/numberTransform"
import { Indicators } from "~/utils/model/indicators"

const textTransformService = new TextTransformService()
const numberTransformService = new NumberTransformService()
const indicators = new Indicators()

export default defineComponent({
  extends: FLPOBaseLayout,
  props: {
    rowClass: String,
    reactiveFilter: [String, Object, Array],
    customFilters: Object
  },
  setup(props) {
    const { $reformDataset, $fillDataStructure, $validCharts, $leafletBasedCharts, $chartGen } = useNuxtApp()
    const relevance = ref("")
    const description = ref("")
    const value = ref("")
    const comment = ref("")
    const cardClass = ref("")
    const colorClass = ref("")
    const commentColorClass = ref("")
    const dataset = ref<Record<string, any> | string | null>(null)
    const metadata = ref<Record<string, any> | null | undefined>(null)
    const errorMessage = ref<string | null>(null)

    const chartId = computed(() => {
      return props.structure?.chart ? "chart_" + props.structure.chart.id : undefined
    })

    const updateReactiveDataStructure = (filterUrl: string) => {
      let apiUrl = ""
      const namedProp = props.structure?.api_reactive.args[0]?.named_prop
      if (props.structure?.api_reactive && 
        props.customParams && 
        namedProp && 
        props.customParams[namedProp]) {
        apiUrl = textTransformService.applyInterpol(props.structure.api_reactive, props.customParams)
      } else {
        apiUrl = textTransformService.applyInterpol(props.structure?.apiBase ? props.structure.apiBase : props.structure?.api, props.customParams)
      }
      if (filterUrl) {
        apiUrl += filterUrl
      }
      $fetch(UrlTransformService.getApiUrl(apiUrl))
        .then((result: any) => {
          let datasetResult = $reformDataset(
            result.data.dataset,
            props.structure?.api.options,
            props.customParams
          )
          if (props.structure?.api_options) {
            datasetResult = $reformDataset(
              datasetResult,
              props.structure?.api_options,
              props.customParams
            )
          }
          if (props.structure){
            fillMinicard(
              datasetResult,
              props.structure.args,
              props.structure,
              undefined,
              result.data.metadata
            )
          }
        })
        .catch((_error) => {
          sendDataStructureError("Falha ao carregar dados do componente.")
        })
    }

    const triggerChartUpdates = () => {
      if (props.structure && props.structure.chart && props.structure.chart.options && props.structure.chart.type) {
        $chartGen(
          chartId.value,
          props.structure.chart.type,
          props.structure.chart,
          props.structure.chart.options,
          dataset.value,
          metadata.value,
          props.sectionIndex
        )
      }
    }

    const setDataset = (datasetValue: Record<string, any> | string, _rules: Record<string, any>, _structure:Record<string, any>, _addedParams?: Record<string, any> | string, metadataValue?: Record<string, any>) => {
      dataset.value = datasetValue
      metadata.value = metadataValue
      triggerChartUpdates()
    }

    const fillProp = (baseObjectList: Record<string, any> | string, args: Record<string, any>, _preloaded:Record<string, any>, addedParams?: Record<string, any> | string, _metadata?: Record<string, any>) => {
      if (typeof addedParams === "object" && addedParams !== null) {
        const rule = addedParams.rule
        if (rule.fixed !== undefined) {
          if (rule.format) {
            value.value = numberTransformService.formatNumber(rule.fixed, rule.format, rule.precision, rule.multiplier, rule.collapse, rule.signed, rule.uiTags)
          } else {
            value.value = rule.fixed
          }
        } else if (rule.template !== undefined) {
          super.setComplexAttribute(baseObjectList, [rule], rule, { attribute: rule.prop }, metadata)
        } else if (rule.id === undefined) {
          if (baseObjectList && typeof baseObjectList === "object" && baseObjectList.length > 0) {
            value.value = indicators.getAttributeFromIndicatorInstance(rule, baseObjectList[0])
          } else if (rule.default !== null && rule.default !== undefined) {
            value.value = rule.default
          } else {
            value.value = "Sem Registros"
          }
        } else {
          value.value = indicators.getIndicatorValueFromStructure(rule, baseObjectList)
        }
        
        if (rule.prop == "comment" && rule.color_changing) {
          let object = Array.isArray(baseObjectList) && baseObjectList.length > 0 ? baseObjectList[0] : baseObjectList || {}
          const baseValue = rule.color_changing.base_value_prop ? object[rule.color_changing.base_value_prop] : 0
          const comparedValue = object[rule.color_changing.compared_value_prop]
          const greaterThanColor: "red"|"green"|"blue" = rule.color_changing.gt_color || "green"
          const lowerThanColor: "red"|"green"|"blue" = rule.color_changing.lt_color || "red"
          const equalColor: "red"|"green"|"blue" = rule.color_changing.eq_color || "blue"
          const colors = {
            red: "red--text darken-1",
            green: "green--text darken-4",
            blue: "indigo--text darken-3"
          }
          commentColorClass.value = comparedValue > baseValue ? colors[greaterThanColor] : comparedValue == baseValue ? colors[equalColor] : colors[lowerThanColor]
        }
      }
    }

    const fillMinicard = (baseObjectList: Record<string, any> | string, rules: Record<string, any>, preloaded:Record<string, any>, addedParams?: Record<string, any> | string, _metadata?: Record<string, any>) => {
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i]
        if (rule.api) {
          $fillDataStructure(
            rule, props.customParams,
            fillProp,
            { rule }
          )
          continue
        }
        if (addedParams && typeof addedParams === "object") {
          addedParams.rule = rule
        } else {
          addedParams = { rule }
        }

        fillProp(baseObjectList, rule.args, preloaded, addedParams, metadata)
      }
    }

    const sendDataStructureError = (message: string) => {
      errorMessage.value = message
    }

    onBeforeMount(() => {
      relevance.value = props.structure?.relevance
      if (props.structure?.cls) cardClass.value = props.structure.cls
      if (props.structure?.color) colorClass.value = " " + props.structure.color
      $fillDataStructure(
        props.structure, 
        props.customParams,
        fillMinicard
      )
      if (props.structure?.chart) {
        $fillDataStructure(
          props.structure.chart, props.customParams,
          setDataset
        )
      }
    })

    watch(() => props.reactiveFilter, (newVal, oldVal) => {
      if (newVal != oldVal) {
        errorMessage.value = null
        if (props.structure?.reactive) {
          value.value = ""
          updateReactiveDataStructure(props.customFilters?.filterUrl)
        } else if (props.structure?.api_reactive) {
          $fillDataStructure(
            props.structure, props.customParams,
            fillMinicard,
            { react: newVal }
          )
          if (props.structure.chart) {
            $fillDataStructure(
              props.structure.chart, props.customParams,
              setDataset,
              { react: newVal }
            )
          }
        }
      }
    })

    return {
      relevance,
      description,
      value,
      comment,
      cardClass,
      colorClass,
      commentColorClass,
      dataset,
      metadata,
      errorMessage,
      chartId,
      triggerChartUpdates,
      setDataset,
      fillProp,
      fillMinicard,
      updateReactiveDataStructure,
      sendDataStructureError,
      $validCharts,
      $leafletBasedCharts
    }
  }
})
</script>
<style>
  .minicard {
    color: rgb(53,94,168,1);
  }
  .red.minicard, .light-blue.minicard, .green.minicard, .orange.minicard, .minicard.lead {
    color: white !important;
  }
  .minicard-chart {
    height: 50px;
  }
  .minicard-value {
    font-family: Lato, Calibri, sans-serif !important;
    font-weight: 300;
    font-size: 2.2rem;
    line-height: 2rem;
  }
  .minicard-value span {
    text-transform: uppercase;
    font-size: 1.2rem;
    line-height: 0;
  }
  .minicard .minicard-description {
    font-size: 0.8rem;
    font-weight: 400;
  }
  .minicard .minicard-comment {
    font-size: 0.857rem;
    font-weight: 200;
  }
  .minicard-comment span {
    text-transform: uppercase;
    line-height: 0;
  }

  .minicard.low {
    color: rgb(1,1,1,0.87);
  }

  .minicard.low .minicard-value {
    font-size:2.2rem;
  }

  .minicard.low .minicard-description {
    font-size: 0.8rem;
    line-height: 1rem;
    font-weight: 400;
  }

  .minicard.low .minicard-comment {
    font-size: 0.857rem;
  }

  .minicard .minicard-comment {
    color: rgb(239,97,69,1);
  }

  .minicard.lead .minicard-comment {
    color: white;
  }

  .minicard.lead {
    margin-top: 8px !important;
  }

</style>

<template>
  <v-flex :class="(rowClass ? rowClass : 'pl-4 pr-0 pb-3 pt-3') + ' ' + cardClass">
    <v-layout column :class="'minicard fill-height' + colorClass + ' ' + relevance">
      <div v-if="errorMessage" :class="'minicard-comment ' + commentColorClass" v-html="errorMessage" />
      <v-layout v-if="structure.desc_position == 'right'" row>
        <v-flex shrink class="minicard-value" v-html="value" />
        <v-flex v-if="structure.desc_position == 'right'" pl-1 class="title-obs-desc minicard-description" v-html="description != null ? description.toUpperCase() : ''" />
      </v-layout>
      <div v-else class="minicard-value" v-html="value" />
      <div v-if="dataset !== null && dataset.length > 1 && structure && structure.chart" class="minicard-chart">
        <v-layout
          v-if="structure && structure.chart && structure.chart.type && validCharts.includes(structure.chart.type)"
          :id="chartId"
          ref="chart"
          fill-height
          :class="leafletBasedCharts.includes(structure.chart.type) ? 'map_geo' : ''"
        />
      </div>
      <div v-if="structure.desc_position != 'right'" class="title-obs-desc minicard-description" v-html="description != null ? description.toUpperCase() : ''" />
      <div :class="'minicard-comment ' + commentColorClass" v-html="comment" />
    </v-layout>
  </v-flex>
</template>

<script>
import FLPOBaseLayout from '../../FLPOBaseLayout.vue'

export default {
  extends: FLPOBaseLayout,
  props: ['rowClass', 'reactiveFilter', 'customFilters'],
  data () {
    return {
      relevance: '',
      description: '',
      value: '',
      comment: '',
      cardClass: '',
      colorClass: '',
      commentColorClass: '',
      dataset: null,
      metadata: null,
      errorMessage: null
    }
  },
  computed: {
    chartId: function () {
      if (this.structure.chart) {
        return 'chart_' + this.structure.chart.id
      }
      return null
    }
  },
  watch: {
    reactiveFilter: function (newVal, oldVal) {
      if (newVal != oldVal) {
        this.errorMessage = null
        if (this.structure.reactive) {
          this.value = ''
          this.updateReactiveDataStructure(this.customFilters.filterUrl)
        } else if (this.structure.api_reactive) {
          this.fillDataStructure(
            this.structure, this.customParams,
            this.customFunctions, this.fillMinicard,
            { react: newVal }
          )
          if (this.structure.chart) {
            this.fillDataStructure(
              this.structure.chart, this.customParams,
              this.customFunctions, this.setDataset,
              { react: newVal }
            )
          }
        }
      }
    }
  },
  created () {
    this.relevance = this.structure.relevance
    if (this.structure.cls) { this.cardClass = this.structure.cls }
    if (this.structure.color) { this.colorClass = ' ' + this.structure.color }
    this.fillDataStructure(
      this.structure, this.customParams,
      this.customFunctions, this.fillMinicard
    )
    if (this.structure.chart) {
      this.fillDataStructure(
        this.structure.chart, this.customParams,
        this.customFunctions, this.setDataset
      )
    }
  },
  mounted: function () {
  },
  methods: {
    setDataset (dataset, rules, structure, addedParams, metadata) {
      this.dataset = dataset
      this.metadata = metadata
      this.triggerChartUpdates()
    },

    fillProp (base_object_list, args, preloaded, addedParams = null, metadata = null) {
      const rule = addedParams.rule

      // caso o campo tenha um texto fixo, o valor é ajustado e o loop segue para a próxima iteração
      if (rule.fixed !== undefined) {
        if (rule.format) {
          this[rule.prop] = this.$numberTransformService.formatNumber(rule.fixed, rule.format, rule.precision, rule.multiplier, rule.collapse, rule.signed, rule.uiTags)
        } else {
          this[rule.prop] = rule.fixed
        }
      } else if (rule.template !== undefined) { // caso o campo tenha um texto fixo, o valor é ajustado e o loop segue para a próxima iteração
        this.setComplexAttribute(base_object_list, [rule], rule, { attribute: rule.prop }, metadata)
      } else if (rule.id === undefined) { // caso um id de um indicador não tenha sido especificado, é porque somente um foi passado no preloaded
        // nesse caso, o valor é buscado na primeira posição da lista de indicadores e formatado caso a propriedade format tenha sido informada
        if (base_object_list && base_object_list.length > 0) {
          this[rule.prop] = this.$indicatorsModel.getAttributeFromIndicatorInstance(rule, this.customFunctions, base_object_list[0])
        } else if (rule.default !== null && rule.default !== undefined) {
          this[rule.prop] = rule.default
        } else {
          this[rule.prop] = 'Sem Registros' // sem registro
        }
      } else {
        // se o campo não é fixed ou tenha mais de um indicador informado no preloaded,
        // é necessário iterar a lista de indicadores para procurar qual está sendo especificado para o campo objeto da iteração
        this[rule.prop] = this.$indicatorsModel.getIndicatorValueFromStructure(rule, this.customFunctions, base_object_list)
      }

      // caso comment tenha a opção color_changing
      if (rule.prop == 'comment' && rule.color_changing) {
        let object = {}
        if (Array.isArray(base_object_list) && base_object_list.length > 0) {
          object = base_object_list[0]
        } else if (base_object_list !== null && base_object_list !== undefined) {
          object = base_object_list
        }

        const base_value = rule.color_changing.base_value_prop ? object[rule.color_changing.base_value_prop] : 0
        const compared_value = object[rule.color_changing.compared_value_prop]

        const greater_than_color = rule.color_changing.gt_color || 'green'
        const lower_than_color = rule.color_changing.lt_color || 'red'
        const equal_color = rule.color_changing.eq_color || 'blue'
        const colors = {
          red: 'red--text darken-1',
          green: 'green--text darken-4',
          blue: 'indigo--text darken-3'
        }

        let commentColorClass = ''

        if (compared_value > base_value) {
          commentColorClass = colors[greater_than_color]
        } else if (compared_value == base_value) {
          commentColorClass = colors[equal_color]
        } else {
          commentColorClass = colors[lower_than_color]
        }

        this.commentColorClass = commentColorClass
      }
    },

    fillMinicard (base_object_list, rules, preloaded, addedParams = null, metadata = null) {
      // o loop a seguir preenche os campos do minicard
      // inicialmente, é percorrida a lista de campos que são informados para preenchimento
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i]
        if (rule.api) {
          this.fillDataStructure(
            rule, this.customParams,
            this.customFunctions, this.fillProp,
            { rule }
          )
          continue
        }
        if (addedParams) {
          addedParams.rule = rule
        } else {
          addedParams = { rule }
        }

        this.fillProp(base_object_list, rule.args, preloaded, addedParams, metadata)
      }
    },

    triggerChartUpdates () {
      if (this.structure && this.structure.chart && this.structure.chart.options && this.structure.chart.type) {
        this.chartGen(
          this.chartId,
          this.structure.chart.type,
          this.structure.chart,
          this.structure.chart.options,
          this.dataset,
          this.metadata,
          this.sectionIndex)
      }
    },

    updateReactiveDataStructure (filterUrl) {
      let apiUrl = ''
      if (this.structure.api_reactive && this.customParams[this.structure.api_reactive.args[0].named_prop]) {
        apiUrl = this.$textTransformService.applyInterpol(this.structure.api_reactive, this.customParams, this.customFunctions)
      } else {
        apiUrl = this.$textTransformService.applyInterpol(this.structure.apiBase ? this.structure.apiBase : this.structure.api, this.customParams, this.customFunctions)
      }
      if (filterUrl) {
        apiUrl = apiUrl + filterUrl
      }
      this.$axios(this.$axiosCallSetupService.getAxiosOptions(apiUrl))
        .then((result) => {
          let dataset = this.reformDataset(
            result.data.dataset,
            this.structure.api.options,
            this.customFunctions,
            this.customParams
          )
          if (this.structure.api_options) {
            dataset = this.reformDataset(
              dataset,
              this.structure.api_options,
              this.customFunctions,
              this.customParams
            )
          }
          this.fillMinicard(
            dataset,
            this.structure.args,
            this.structure,
            null,
            result.data.metadata
          )
        }).catch((_error) => { this.sendDataStructureError('Falha ao carregar dados do componente.') })
    }
  }
}
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

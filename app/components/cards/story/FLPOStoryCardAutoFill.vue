<template>
  <div v-if="resultStructure" class="pa-0 ma-0">
    <FLPOStoryCardMultipleCharts
      v-if="resultStructure.type && resultStructure.type === 'multiple-charts'"
      :structure="resultStructure"
      :custom-params="customParams"
      :custom-functions="customFunctions"
      :topology="topology"
      :section-index="sectionIndex"
    />
    <FLPOStoryCard
      v-else
      :structure="resultStructure"
      :custom-params="customParams"
      :custom-functions="customFunctions"
      :topology="topology"
      :section-index="sectionIndex"
    />
  </div>
</template>

<script setup lang="ts">
import { useBaseLayout } from '~/composables/useBaseLayout'

defineOptions({ name: 'FLPOStoryCardAutoFill' })

interface Props {
  structure?: Record<string, any>
  customParams?: Record<string, any>
  customFunctions?: Record<string, any>
  topology?: Record<string, any>
  sectionIndex?: number
  selectedPlace?: string
  chartPosition?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['sendInvalidInterpol'])

const { setComplexAttribute } = useBaseLayout(computed(() => props.customParams), emit)

const resultStructure = ref<Record<string, any> | null>(null)

onMounted(() => {
  const tmpStruct = { ...props.structure } as Record<string, any>

  for (const indx in props.customParams?.deck) {
    const currentAutocard = props.customParams!.deck[indx]
    if (tmpStruct.cd_indicador === currentAutocard.cd_indicador_spai) {
      // Sets properties based on dataset sources
      const value_field = 'vl_indicador'
      const year_field = 'nu_competencia'
      const desc_field = 'ds_indicador_radical'
      const place_field = 'cd_mun_ibge'
      const source_desc_field = 'ds_fonte'

      // Sets the title
      tmpStruct.title = { fixed: currentAutocard.spai_ds }

      // Sets the info tooltip
      tmpStruct.info = [
        {
          type: 'text',
          content: {
            fixed: 'Teste texto fixo'
          }
        }
      ]

      // Checks if there's only one chart or multiple ones
      if (!tmpStruct.type || tmpStruct.type !== 'multiple-charts') {
        tmpStruct.chart_type = currentAutocard.visualizations[0].type

        // Sets the source for the chart
        tmpStruct.source = { desc_field: source_desc_field }

        // Sets the preloaded options
        if (currentAutocard.visualizations[0].loading && currentAutocard.visualizations[0].loading === 'pre') {
          tmpStruct.preloaded = {
            prop: currentAutocard.dataset_source,
            function: 'slice',
            id: [tmpStruct.cd_indicador],
            options: {
              formatters: [
                { id: value_field, format: 'auto' }
              ]
            }
          }
        // Sets the api loading options
        } else if (currentAutocard.visualizations[0].loading && currentAutocard.visualizations[0].loading === 'api') {
          tmpStruct.api = {
            api: { // TODO (generalize)
              template: "/indicadoresmunicipais?categorias=cd_mun_ibge,nm_municipio,cd_dimensao,ds_indicador_radical,cd_indicador,nu_competencia,ds_fonte,vl_indicador,media_uf,media_br,rank_uf,rank_br&filtros=eq-cd_uf-{0},and,eq-cd_indicador-'09_01_01_00',and,eq-nu_competencia-'2016'",
              args: [
                { named_prop: 'cd_uf' }
              ],
              options: {
                calcs: [
                  { id: 'deviation_cat', function: 'get_proportional_indicator_uf' }
                ],
                formatters: [
                  { id: 'vl_indicador', format: 'inteiro' },
                  { id: 'rank_br', format: 'inteiro' }
                ]
              }
            }
          }
        }

        // Creates a description block
        const description: any[] = []

        // Builds an instance of the minicards block
        const minicardBlock: any = { type: 'minicards', cards: [] }

        // Creates the first minicard
        const minicard1 = {
          relevance: 'high',
          cls: 'v-col-12', // Depends on the template
          api: { // Depends on the scope (br, uf, mun)
            template: "/indicadoresmunicipais?categorias=cd_mun_ibge,nm_municipio_uf&valor=vl_indicador&agregacao=SUM&filtros=eq-cd_mun_ibge-{0},and,eq-cd_indicador-'{1}'",
            args: [ // TODO (generalize)
              { named_prop: 'idLocalidade' },
              { value: currentAutocard.cd_indicador_spai }
            ]
          },
          args: [
            {
              prop: 'value',
              named_prop: 'agr_sum_vl_indicador', // TODO (generalize)
              format: 'auto',
              collapse: true,
              default: 'Sem Registros'
            },
            {
              prop: 'description',
              named_prop: 'nm_municipio_uf', // TODO (generalize)
              default: 'Sem Registros'
            }
          ]
        }
        minicardBlock.cards.push(minicard1)

        // TODO minicard2

        // Creates the third minicard
        const minicard3 = {
          relevance: 'low',
          cls: 'v-col-12 v-col-md-6', // Depends on the template
          api: {
            template: "/indicadoresmunicipais?categorias=cd_mun_ibge,nm_municipio_uf&valor=vl_indicador_uf&agregacao=SUM&filtros=eq-cd_mun_ibge-{0},and,eq-cd_indicador-'{1}'",
            args: [
              { named_prop: 'idLocalidade' },
              { value: currentAutocard.cd_indicador_spai }
            ]
          },
          args: [
            {
              prop: 'value',
              named_prop: 'agr_sum_vl_indicador_uf', // TODO (generalize)
              format: 'auto',
              collapse: true,
              default: 'Sem Registros'
            },
            {
              prop: 'description',
              fixed: 'B94 NA UF' // TODO (generalize)
            }
          ]
        }
        minicardBlock.cards.push(minicard3)

        // Creates the fourth minicard
        const minicard4 = {
          relevance: 'low',
          cls: 'v-col-12 v-col-md-6', // Depends on the template
          api: {
            template: "/indicadoresmunicipais?categorias=cd_mun_ibge,nm_municipio_uf&valor=vl_indicador_br&agregacao=SUM&filtros=eq-cd_mun_ibge-{0},and,eq-cd_indicador-'{1}'",
            args: [
              { named_prop: 'idLocalidade' },
              { value: currentAutocard.cd_indicador_spai }
            ]
          },
          args: [
            {
              prop: 'value',
              named_prop: 'agr_sum_vl_indicador_br', // TODO (generalize)
              format: 'auto',
              collapse: true,
              default: 'Sem Registros'
            },
            {
              prop: 'description',
              fixed: 'B94 NO PAÍS' // TODO (generalize)
            }
          ]
        }
        minicardBlock.cards.push(minicard4)

        // Adds the minicard block to the description
        description.push(minicardBlock)

        // Creates the text description block
        const textDescription = {
          type: 'text',
          title: '',
          content: {
            template: 'Teste',
            preloaded: {
              prop: currentAutocard.dataset_source,
              function: 'slice',
              id: [currentAutocard.cd_indicador_spai],
              year: 'mzx'
            },
            args: [
              { named_prop: 'nu_competencia_min' },
              { named_prop: 'nu_competencia_max' }
            ]
          }
        }
        description.push(textDescription)

        // Adds the description block to the card
        tmpStruct.description = description

        // Sets the chart options
        switch (currentAutocard.visualizations[0].type) {
          case 'BAR': {
            // Default values
            let id = year_field
            let x = year_field
            let text = year_field
            let y = value_field

            // Default horizontal orientation
            if (currentAutocard.visualizations[0].orientation === 'horizontal') {
              id = value_field
              x = value_field
              text = value_field
              y = year_field
            }

            tmpStruct.chart_options = {
              id,
              x,
              y,
              orientation: currentAutocard.visualizations[0].orientation ?? 'vertical',
              text,
              hide_legend: true,
              color: 'accent'
            }
            break
          }
          case 'MAP_TOPOJSON':
            tmpStruct.chart_options = {
              id_field: place_field,
              topo_key: 'codarea',
              value_field: 'calc_deviation_cat', // TODO (generalize)
              colorScale: { scale: 'linear', name: 'Reds' } // TODO (generalize)
            }
            break
        }

        // Creates the headers for the dialog grid
        tmpStruct.headers = [
          { title: 'Indicador', text: 'Indicador', align: 'start', key: desc_field, value: desc_field },
          { title: 'Ano', text: 'Ano', align: 'start', key: year_field, value: year_field },
          { title: 'Qtde', text: 'Qtde', key: 'fmt_' + value_field, value: 'fmt_' + value_field }
        ]
      }
    }
  }

  console.log(tmpStruct)
  resultStructure.value = tmpStruct
})
</script>

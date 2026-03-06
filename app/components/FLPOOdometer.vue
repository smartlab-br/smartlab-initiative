<template>
  <v-row v-if="shouldRender" class="pt-0">
    <v-col
      cols="12"
      :style="`background-color: ${bgColor || 'black'}; color: ${titleFontColor || 'white'}`"
    >
      <v-row
        class="pt-0 py-3"
        align="start"
        justify="center"
      >
        <v-col
          v-for="(odometer, odoIndex) in odometerItems"
          :key="'odo_'+odoIndex"
          :cols="$getColSize('xs',odometer.cls) || 12"
          :sm="$getColSize('sm',odometer.cls)"
          :md="$getColSize('md',odometer.cls)"
          :lg="$getColSize('lg',odometer.cls)"
          :xl="$getColSize('xl',odometer.cls)"
          class="px-2 py-2"
        >
          <v-row align="start" justify="center" class="fill-height">
            <v-col cols="12" class="pa-2 odometer-title text-center" style="overflow: visible;">
              <div 
                :id="'odm_' + odometer.id" 
                :ref="odometer.id" 
                :class="odometer.options?.cls_format || ''" 
                :style="`color: ${titleFontColor || 'white'}; font-size: 2rem; font-weight: bold; line-height: 1.2; padding: 0.5rem 0;`"
                v-html="numberTransformService.formatNumber(dtOdometros.find((odom: OdometerDataItem) => odom.cd_indicador == odometer.id_odometer)?.vl_estimado, odometer.options?.cls_format || 'inteiro')" 
              />
              <div :style="`color: ${titleFontColor || 'white'}; line-height: 1.4;`" v-html="odometer.title || ''" />
              <div v-if="odometer.show_pace && dtOdometros.length > 0" class="pa-0 odometer-title text-caption text-center" :style="`color: ${titleFontColor || 'white'}; line-height: 1.4;`">
              {{ odometer.pace_description || '' }}
              {{ numberTransformService.getPaceString((dtOdometros.find((odom: OdometerDataItem) => odom.cd_indicador == odometer.id_odometer) as OdometerDataItem).delta_por_ms || 0, true) }}
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
  <v-row v-if="shouldRender">
    <v-col class="py-3 px-0 title-obs">
      {{ commentTitle || '' }}
    </v-col>
    <v-col v-if="commentItems.length === odometerItems.length" cols="12" class="pb-2">
      <div
        v-for="(comment, commentIndex) in commentItems"
        :key="'comment_' + commentIndex"
      >
        <span v-html="`${commentIndex + 1}. ${comment}`" />
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// import Odometer from "odometer"
// import "odometer/themes/odometer-theme-car.css"
import { NumberTransformService } from "~/utils/service/singleton/numberTransform"
import { TextTransformService } from "~/utils/service/singleton/textTransform"
import { UrlTransformService } from "~/utils/service/singleton/urlTransform"

// Estendendo OdometerItemOptions para incluir campos runtime
interface OdometerRuntimeOptions extends OdometerItemOptions {
  start?: number
  pace?: number
  offset?: number
  theme?: string
  format?: string
  animation?: string
  updateRate?: number
}

interface CommentData {
  fixed?: number | string
  format?: string
  precision?: number
  multiplier?: number
  collapse?: {
    formato?: string
    casasDecimais?: number
    uiTags?: boolean
  } | null
  signed?: boolean
  uiTags?: boolean
  template?: string
}

const props = withDefaults(defineProps<{
  odometerItems: OdometerItem[]
  commentTitle?: string
  bgColor?: string
  titleFontColor?: string
}>(), {
  commentTitle: "",
  bgColor: "black",
  titleFontColor: "white"
})

const textTransformService = new TextTransformService()
const numberTransformService = new NumberTransformService()

const commentItems = ref<string[]>([])
const commentData = ref<string>("")
const dtOdometros = ref<OdometerDataItem[]>([])
const isLoading = ref(true)

const startCounter = (id: string, options: OdometerRuntimeOptions, comment: string | CommentData = "") => {
  if (comment && typeof comment !== 'string') {
    buildCommentData(comment)
  }

  // const _start = options.start + (options.offset || 0)
  
  // let element = props.odometerItems.find(item => item.id === id)?.ref
  // if (Array.isArray(element)) {
  //   element = element[0]
  // }
  // const odometer = new Odometer({
  //   el: element,
  //   theme: options.theme || 'car',
  //   format: options.format || '(.ddd)',
  //   animation: options.animation || 'count',
  //   value: start
  // })
  // odometer.render()
  // odometer.value_float = start
  // setInterval(updateOdometer, 5000, odometer, options)
}

// const updateOdometer = (odometer: any, options: OdometerOptions) => {
//   odometer.value_float += options.pace * (options.updateRate || 5000)
//   odometer.update(Math.trunc(odometer.value_float))
// }

const buildCommentData = (comment: CommentData) => {
  commentData.value = ""
  if (comment.fixed !== undefined) {
    if (comment.format) {
      const precision: number | null = comment.precision ?? null
      const multiplier: number | null = comment.multiplier ?? null
      const collapse: { formato?: string; casasDecimais?: number; uiTags?: boolean } | null = comment.collapse ?? null
      const signed: boolean = comment.signed ?? false
      const uiTags: boolean = comment.uiTags ?? true
      
      commentData.value = numberTransformService.formatNumber(
        comment.fixed, 
        comment.format, 
        precision, 
        multiplier, 
        collapse, 
        signed, 
        uiTags
      )
    } else {
      commentData.value = comment.fixed.toString()
    }
  } else if (comment.template !== undefined) { // caso o campo tenha um texto fixo, o valor é ajustado e o loop segue para a próxima iteração
    // super.setComplexAttribute(options, [comment], comment, { attribute: "commentData", attribRefs: {commentData: commentData} })
  }
  commentItems.value.push(commentData.value)
}

const shouldRender = computed(() => {
  const result = !isLoading.value && props.odometerItems && props.odometerItems.length > 0 && dtOdometros.value.length > 0
  console.log('shouldRender:', result, {
    isLoading: isLoading.value,
    hasOdometerItems: !!props.odometerItems,
    odometerItemsLength: props.odometerItems?.length,
    dtOdometrosLength: dtOdometros.value.length
  })
  return result
})

onMounted(async () => {
  console.log('FLPOOdometer montado, odometerItems:', props.odometerItems)
  
  try {
    const url = UrlTransformService.getApiUrl("/odometros/sst")
    console.log('Carregando odômetros de:', url)
    
    const result = await $fetch(url)
    console.log('Resultado API:', result)
    
    const data = JSON.parse(result as string)
    dtOdometros.value = data
    console.log('Dados processados:', dtOdometros.value)
    console.log('dtOdometros.length:', dtOdometros.value.length)

    if (dtOdometros.value && props.odometerItems) {
      props.odometerItems.forEach((odometer) => {
        console.log(`Procurando odômetro com id: ${odometer.id}, id_odometer: ${odometer.id_odometer}`)
        const curOdometro: OdometerDataItem = dtOdometros.value.find((odom: OdometerDataItem) => odom.cd_indicador == odometer.id_odometer) as OdometerDataItem
        console.log(`Odômetro ${odometer.id}:`, curOdometro)
        
        if (curOdometro && odometer.title) {
          odometer.title = textTransformService.applyInterpol(
            odometer.title,
            {},
            curOdometro,
            null)
        }

        if (curOdometro && odometer.options) {
          const options: OdometerRuntimeOptions = { 
            ...odometer.options,
            start: curOdometro.vl_estimado,
            pace: curOdometro.delta_por_ms
          }
          startCounter(odometer.id, options)
        }
      })
    }
  } catch (error) {
    console.error('Erro ao carregar odômetros:', error)
  } finally {
    isLoading.value = false
    console.log('isLoading definido como false')
    console.log('Estado final - isLoading:', isLoading.value, 'dtOdometros.length:', dtOdometros.value.length, 'odometerItems.length:', props.odometerItems?.length)
  }

  // props.odometerItems.forEach((odometer) => {
  //   if (odometer.api) {
  //     $fetch(UrlTransformService.getApiUrl(odometer.api.fixed)).then((result) => {
  //       const tickerData = JSON.parse(result.data).dataset[0]
  //       const options = { ...odometer.options }

  //       options.val_prop = tickerData[options.count_prop] || tickerData[options.val_prop]

  //       startCounter(odometer.id, options, odometer.comment)
  //     })
  //   }
  // })
})

onBeforeUnmount(() => {
  // clearInterval(updateOdometer)
})
</script>

<style>
  /* @import "odometer/themes/odometer-theme-car.css"; */

  .odometer {
    font-size: 1.5rem;
    font-weight: normal;
  }

  .monetario .odometer-inside:before {
    content: "R$";
  }

  .odometer .odometer-inside:before {
    display: inline-block;
    vertical-align: sup;
    opacity: .6;
    font-size: .85rem;
    margin-right: .12em;
  }

  .odometer-title {
    color: #eee0d3 !important;
  }

</style>

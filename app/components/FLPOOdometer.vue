<template>
  <v-row v-if="shouldRender" class="pt-0" no-gutters>
    <v-col
      cols="12"
      :style="`background-color: ${bgColor || 'black'}; color: ${titleFontColor || 'white'}`"
    >
      <v-row
        class="pt-0 py-3"
        align="start"
        justify="center"
        no-gutters
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
                :class="odometer.options?.cls_format || ''"
              />
              <div :style="`color: ${titleFontColor || 'white'}; line-height: 1.4; font-size: 0.8rem;`" v-html="odometer.title || ''" />
              <div v-if="odometer.show_pace && dtOdometros.length > 0" class="pa-0 odometer-title text-caption text-center" :style="`color: ${titleFontColor || 'white'}; line-height: 1.4; font-size: 0.75rem;`">
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
import { computed, nextTick } from 'vue'
import { NumberTransformService } from "~/utils/service/singleton/numberTransform"
import { TextTransformService } from "~/utils/service/singleton/textTransform"
import { UrlTransformService } from "~/utils/service/singleton/urlTransform"

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
const odoInstances = ref<Record<string, any>>({})
let timerInterval: ReturnType<typeof setInterval> | null = null

const getLiveValue = (odom: OdometerDataItem | undefined): number => {
  if (!odom) return 0
  return Math.trunc(odom.vl_estimado + odom.delta_por_ms * (Date.now() - odom.momento_ms))
}

const initOdometers = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const OdometerLib: any = (await import('odometer')).default
  await import('odometer/themes/odometer-theme-car.css')

  props.odometerItems.forEach((item) => {
    const el = document.getElementById('odm_' + item.id)
    if (!el) return
    const odomData = dtOdometros.value.find((odom) => odom.cd_indicador == item.id_odometer)
    const odo = new OdometerLib({
      el,
      theme: 'car',
      format: '(.ddd)',
      animation: 'count',
      value: getLiveValue(odomData)
    })
    odoInstances.value[item.id] = odo
  })

  timerInterval = setInterval(() => {
    props.odometerItems.forEach((item) => {
      const odo = odoInstances.value[item.id]
      if (!odo) return
      const odomData = dtOdometros.value.find((odom) => odom.cd_indicador == item.id_odometer)
      odo.update(getLiveValue(odomData))
    })
  }, 1000)
}

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
  return !isLoading.value && props.odometerItems && props.odometerItems.length > 0 && dtOdometros.value.length > 0
})

onMounted(async () => {
  try {
    const url = UrlTransformService.getApiUrl("/odometros/sst")
    const result = await $fetch(url)
    const data = JSON.parse(result as string)
    dtOdometros.value = data

    if (dtOdometros.value && props.odometerItems) {
      props.odometerItems.forEach((odometer) => {
        const curOdometro: OdometerDataItem = dtOdometros.value.find((odom: OdometerDataItem) => odom.cd_indicador == odometer.id_odometer) as OdometerDataItem

        if (curOdometro && odometer.title) {
          odometer.title = textTransformService.applyInterpol(
            odometer.title,
            {},
            curOdometro,
            null)
        }


      })
    }
  } catch (error) {
    console.error('Erro ao carregar odômetros:', error)
  } finally {
    isLoading.value = false
    await nextTick()
    await initOdometers()
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
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style>

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

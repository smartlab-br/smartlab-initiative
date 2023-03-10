<template>
  <v-layout row wrap align-center pt-0>
    <v-flex xs12 :style="'background-color:' + (bgColor ? bgColor : 'black') + ';color:'+ (titleFontColor ? titleFontColor : 'white')">
      <v-layout
        row
        wrap
        align-start
        justify-center
        pt-0
        py-3
      >
        <v-flex
          v-for="(odometer, odoIndex) of odometerItems "
          :key="'odo_'+odoIndex"
          :class="odometer.cls ? odometer.cls : 'xs12'"
          px-2
          py-2
        >
          <v-layout row wrap align-start justify-center fill-height>
            <v-flex xs12 text-xs-center>
              <div :id="'odm_' + odometer.id" :ref="odometer.id" :class="odometer.options.cls_format?odometer.options.cls_format:''" />
            </v-flex>
            <v-flex xs12 pa-0 class="odometer-title caption text-xs-center" v-html="odometer.title ? odometer.title : ''" />
            <v-flex v-if="odometer.show_pace && dtOdometros" xs12 pa-0 class="odometer-title caption text-xs-center">
              {{ odometer.pace_description ? odometer.pace_description : "" }} {{ $numberTransformService.getPaceString(dtOdometros[odometer.id_odometer].delta_por_ms, true) }}
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-flex>
    <v-flex py-3 px-0 class="title-obs">
      {{ commentTitle ? commentTitle : "" }}
    </v-flex>
    <v-flex v-if="comment_items.lenght == odometerItems.lenght" xs12 class="pb-2">
      <div
        v-for="(comment, commentIndex) of comment_items "
        :key="'comment_'+commentIndex"
        v-html="(commentIndex + 1) + '. ' + comment"
      />
    </v-flex>
  </v-layout>
</template>

<script>
import FLPOBaseLayout from './FLPOBaseLayout.vue'

export default {
  extends: FLPOBaseLayout,
  props: ['odometerItems', 'commentTitle', 'bgColor', 'titleFontColor'],
  data () {
    return {
      comment_items: [],
      commentData: null,
      dtOdometros: null
    }
  },
  mounted () {
    this.$axios(this.$axiosCallSetupService.getAxiosOptions('/odometros/sst', true))
      .then((result) => {
        let dtOdometros = JSON.parse(result.data)

        let objOdo = '{'
        for (const indxOdo in dtOdometros) {
          // console.log("{ "+ dtOdometros[indxOdo].cd_indicador + ":" + JSON.stringify(dtOdometros[indxOdo]) + "}");
          if (indxOdo != 0) {
            objOdo += ','
          }
          objOdo += '"' + dtOdometros[indxOdo].cd_indicador + '":' + JSON.stringify(dtOdometros[indxOdo])
        }
        objOdo += '}'
        dtOdometros = JSON.parse(objOdo)
        this.dtOdometros = dtOdometros
        // console.log(this.dtOdometros)

        for (const odometer of this.odometerItems) {
          odometer.title = this.$textTransformService.applyInterpol(
            odometer.title,
            {},
            [],
            dtOdometros[odometer.id_odometer],
            null
          )
          const options = Object.assign({}, odometer.options)
          options.start = dtOdometros[odometer.id_odometer].vl_estimado
          options.pace = dtOdometros[odometer.id_odometer].delta_por_ms
          this.startCounter(odometer.id, options)
        }
      })

    for (const odometer of this.odometerItems) {
      if (odometer.api) {
        const url = odometer.api.fixed
        this.$axios(this.$axiosCallSetupService.getAxiosOptions(url))
          .then((result) => {
            const options = Object.assign({}, odometer.options)

            const tickerData = JSON.parse(result.data).dataset[0]

            let max; let min = null
            if (options.date_part == 'ano') {
              max = new Date(parseInt(tickerData[options.max_date_prop].toString()), 11, 31, 23, 59, 59)
              options.max = tickerData[options.max_date_prop].toString()

              min = new Date(parseInt(tickerData[options.min_date_prop].toString()), 0, 1)
              options.min = tickerData[options.min_date_prop].toString()
            } else {
              max = new Date(
                parseInt(tickerData[options.max_date_prop].toString().substring(0, 4)),
                // parseInt(tickerData[this.options.max_date_prop].toString().substring(4, 6)) - 1,
                // parseInt(tickerData[this.options.max_date_prop].toString().substring(6))
                11, 31, 23, 59, 59
              )
              options.max = tickerData[options.max_date_prop].toString().substring(0, 4)

              min = new Date(
                parseInt(tickerData[options.min_date_prop].toString().substring(0, 4)),
                // parseInt(tickerData[this.options.min_date_prop].toString().substring(4, 6)) - 1,
                // parseInt(tickerData[this.options.min_date_prop].toString().substring(6))
                0, 1
              )
              options.min = tickerData[options.min_date_prop].toString().substring(0, 4)
            }

            options.val_prop = tickerData[options.count_prop] ? tickerData[options.count_prop] : tickerData[options.val_prop]

            const val = tickerData[options.count_prop] ? tickerData[options.count_prop] : 0
            const pace = (val + (options.offset ? options.offset : 0)) / (max.getTime() - min.getTime())
            options.pace = pace

            const interval = 1 / pace
            options.interval = interval
            options.str_interval = this.$numberTransformService.getPaceString(interval)

            const now = new Date()
            options.start = val + (now.getTime() - max.getTime()) * pace

            this.startCounter(odometer.id, options, odometer.comment)
          })
        // } else {
        //   this.startCounter(odometer.id, odometer.options);
      }
    }
  },
  destroyed () {
    clearInterval(this.updateOdometer)
  },
  methods: {
    startCounter (id, options, comment = '') {
      if (comment) { this.buildCommentData(comment, options) }

      const Odometer = require('odometer')

      let start = options.start
      if (options.offset) { start += options.offset }

      // console.log(this.$refs[id]);
      // console.log(start);

      let element = this.$refs[id]
      if (Array.isArray(element)) { element = element[0] }
      const odometer = new Odometer({
        el: element,
        theme: options.theme ? options.theme : 'car',
        format: options.format ? options.format : '(.ddd)',
        animation: options.animation ? options.animation : 'count',
        value: start
      })
      odometer.render()
      odometer.value_float = start
      setInterval(this.updateOdometer, 5000, odometer, options)
    },

    updateOdometer (odometer, options) {
      odometer.value_float = odometer.value_float + options.pace * (options.updateRate ? options.updateRate : 5000)
      odometer.update(Math.trunc(odometer.value_float))
    },

    buildCommentData (comment, options) {
      this.commentData = ''
      if (comment.fixed !== undefined) {
        if (comment.format) {
          this.commentData = this.$numberTransformService.formatNumber(comment.fixed, comment.format, comment.precision, comment.multiplier, comment.collapse, comment.signed, comment.uiTags)
        } else {
          this.commentData = comment.fixed
        }
      } else if (comment.template !== undefined) { // caso o campo tenha um texto fixo, o valor é ajustado e o loop segue para a próxima iteração
        this.setComplexAttribute(options, [comment], comment, { attribute: 'commentData' })
      }
      this.comment_items.push(this.commentData)
    }
  }
}
</script>

<style>
  @import "odometer/themes/odometer-theme-car.css";

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

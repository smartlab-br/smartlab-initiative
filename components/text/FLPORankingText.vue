<template>
  <v-layout rank ma-0 ml-2 py-3>
    <span v-if="national_rank !=''" v-html="cmpText" />
  </v-layout>
</template>

<script>
export default {
  props: ['id', 'structure', 'customParams', 'customFunctions'],
  data () {
    return {
      regional_rank: '',
      regional_total: '',
      regional_complementary_text: '',
      national_rank: '',
      national_total: '',
      national_complementary_text: ''
    }
  },
  computed: {
    cmpText: function () {
      if (this.regional_rank) {
        return this.regional_rank + 'º de ' + this.regional_total +
            ' na UF' + this.regional_complementary_text +
            '<br/>' + this.national_rank + 'º de ' + this.national_total + ' no Brasil' + this.national_complementary_text
      } else if (this.national_rank) {
        return this.national_rank + 'º de ' + this.national_total + ' no Brasil' + this.national_complementary_text
      }
      return null
    }
  },
  created () {
    if (this.structure.api || this.structure.preloaded) {
      this.fillDataStructure(
        this.structure, this.customParams,
        this.customFunctions, this.autoFillLayout
      )
    } else {
      for (const item of this.structure.args) {
        let value = item.fixed
        if (item.format) {
          value = this.$numberTransformService.formatNumber(
            value, item.format, item.precision, item.multiplier, item.collapse, item.signed, item.uiTags
          )
        }
        if ((value === null || value === undefined) && item.default != null && item.default != undefined) {
          value = item.default
        }
        this[item.prop] = value
      }
    }
  }
}
</script>

<style>
  .rank {
    display: inline-block !important;
    font-size: 1rem;
    color: rgb(68,114,196,1)
  }
</style>

<template>
  <svg
    :viewBox="'0 0 ' + cmpSize + ' ' + cmpSize"
    :width="cmpSize"
    :height="cmpSize"
    role="presentation"
    class="icon--inline"
    :fill="cmpFill"
  >
    <use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="'/icons/sprite/coord-sprites.svg#' + icon" />
  </svg>
</template>

<script>
// url: '/icons/sprite/coord-sprites.svg'
// import SvgSprite from 'vue-svg-sprite'

export default {
  props: ['icon', 'size', 'color', 'dir', 'fill'],
  computed: {
    cmpFill: function () {
      if (this.fill) { return this.fill }
      const thematic = this.$vuetify.theme[this.color]
      if (!thematic) {
        return 'rgba(0,0,0,0.54)'
      }
      return thematic
    },
    cmpSize: function () {
      if (this.size) {
        return this.size
      } else {
        return '24'
      }
    }
  }
}
</script>

<style>
</style>

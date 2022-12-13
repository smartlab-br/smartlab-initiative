<template>
  <v-layout row wrap class="pa-0">
    <v-flex fluid grid-list-lg xs12 overflow-hidden class="first-section pa-0" :style="displayHeight">
      <v-layout xs12 class="bg-zoom bg-parallax" v-if="observatorio"
        height="auto" :style="currentParallax"></v-layout>
      <v-layout xs12 class="bg-parallax ma-0"></v-layout>
      <v-layout row wrap px-3 align-center justify-center fill-height class="parallax-content">
        <v-flex shrink>
          <v-flex id="screenTitleSup" xs12 class="pb-0  headline ubuntu white--text text-xs-left">
            {{ observatorio ? observatorio.title_sup : '' }}
          </v-flex>
          <v-flex id="screenTitle" xs12 class="pb-0 pt-0 my-0 display-title ubuntu screen-title white--text text-xs-center">
            {{ observatorio ? observatorio.title : '' }}
          </v-flex>
          <v-flex v-if="observatorio.title_sub" id="screenTitleSub" xs12 class="pt-0  headline ubuntu white--text text-xs-right">
            {{ observatorio.title_sub }}
          </v-flex>
          <v-flex id="screenTitleSub" xs12 class="pb-4 pt-0 mb-5 title ubuntu white--text text-xs-right">
            <span class="soon">Em breve!</span>
          </v-flex>
        </v-flex>
        
      </v-layout>
    </v-flex>

  </v-layout>
</template>

<script>
  import BaseObservatorioView from './BaseObservatorioView.vue';

  export default {
    extends: BaseObservatorioView,
    data () {
      return {
        displayHeight: "auto",
        dims: null
      }
    },
    mounted: function() {
      this.resizeFirstSection();
      window.addEventListener('resize', this.resizeFirstSection);
      this.idLocalidade = this.$analysisUnitModel.getCurrentAnalysisUnit();
      this.checkCurrentAnalysisUnit();
      
    },
    computed: {
      currentParallaxFile: function() {
        return this.observatorio.map_image ? '/parallax/' + this.observatorio.map_image + '.jpg' : '';
      }
    },
    methods: {
      resizeFirstSection(){
        if (this.$vuetify.breakpoint.smAndDown){
          this.displayHeight = "auto";
        } else {
          this.displayHeight = "min-height:" + (window.innerHeight - 64) + "px";
        }
        
      }
    }
  }
</script>
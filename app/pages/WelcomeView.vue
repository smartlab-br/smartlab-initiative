<template>
  <v-layout row wrap class="pa-0">
    <v-flex fluid grid-list-lg xs12 overflow-hidden class="first-section pa-0" :style="displayHeight" style="overflow: hidden;">
      <!-- <v-parallax xs12 class="bg-parallax" height="auto" src="static/parallax/home.png"></v-parallax>-->
      <transition  v-if="parallaxFile" name="fade">
        <v-layout xs12 class="bg-zoom bg-parallax-home" height="auto" :style="currentParallax" v-show="backgroundVisible"></v-layout> 
      </transition>
      <!-- style="background-image:url('/static/parallax/td.jpg');background-position: center center; background-size: cover;" -->
      <v-layout xs12 class="bg-parallax-home ma-0"></v-layout>
      <v-layout row wrap fill-height align-center justify-center pa-0 class="parallax-content-home" v-if="observatorios">
        <v-flex id="screenTitle" xs12 class="white--text text-xs-center" style="line-height: normal;">
          <div class="display-4-obs ubuntu">Iniciativa SmartLab</div>
          <div class="display-1-obs ubuntu-condensed">Promoção do Trabalho Decente Guiada por Dados</div>
        </v-flex>
        <v-layout px-5 row wrap>
          <v-flex 
            v-for="(observatorio, indxObs) in observatorios"
            :key="'linked_card_obs_' + indxObs"
            :class="obsSliceClass"
            pa-3>
            <!--
              :icon = "observatorio.icon"
              :app-icon = "observatorio.appIcon"
              :media = "observatorio.media"
              :bg-color = "$observatories.getTheme(observatorio.id).primary"
            -->
            <flpo-linked-view-card
              :index-tab = "30 + indxObs"
              :tagColor = "observatorio.tagColor"
              :status = "observatorio.status"
              :to = "observatorio.to"
              :external = "observatorio.external"
              :title = "observatorio.short_desc"
              :ripple-color = "$observatories.getTheme(observatorio.id).primary"
              :title-color = "'white'"
              :blocked = "observatorio.status == 'EM BREVE'">
            </flpo-linked-view-card>
          </v-flex>
          <v-flex :class="obsSliceClass" pa-3>
            <flpo-linked-view-card
              :index-tab = "40"
              tagColor = "success"
              to = "/saibamais/smartlab"
              :external = "false"
              title = "Conheça"
              ripple-color = "grey--text darken-3"
              title-color = "white">
            </flpo-linked-view-card>
          </v-flex>
        </v-layout>
      </v-layout>
    </v-flex>
    <v-layout text-xs-center pa-0 ma-0
      class="footer-nav white--text">
      <v-layout row wrap caption>
        <v-layout column scroll-menu v-if="!isPageBottom" pa-2
          v-on:click="scrollDown()">
          Veja mais
          <v-icon dark>keyboard_arrow_down</v-icon>
        </v-layout>
      </v-layout>
    </v-layout>
  </v-layout>
</template>

<script>
  import BaseLandingView from './BaseLandingView.vue';
  
  export default {
    extends: BaseLandingView,
    data () {
      return {
        show: false,
        displayHeight: "auto",
        parceiros: null,
        conheca: null,
        history: null,
        isPageBottom: true,
        
        readMoreLimit: 437,
        
        observatorios: null,
        obsSlice: 0,
        obsSliceSize: 2,
        obsSliceClass: 'xs12 sm6 md4 xl2',
        obsMaxSlice: 3,

        parallaxFile: null,
        idParallaxfile: 0,
        background_images: [],
        backgroundVisible: true
        
      }
    },
    created () {
      
      let tmpObs = this.$observatories.getObservatories();
      if ((tmpObs instanceof Promise) || tmpObs.then) {
        tmpObs.then((result) => { this.observatorios = result });
      } else {
        this.observatorios = tmpObs;
      }

      if (this.$vuetify.breakpoint.smAndDown) {
        this.obsMaxSlice = 11;
        this.obsSlice = 0;
        this.obsSliceSize = 1;
      } 


      let tmpBackgroundImages = this.$observatories.getBackgroundImages(); 
      if ((tmpBackgroundImages instanceof Promise) || tmpBackgroundImages.then) {
        tmpBackgroundImages.then((result) => { 
          this.background_images = result 
          this.parallaxFile = this.background_images[this.idParallaxfile];
          setInterval(this.setParallaxFile,20000);
          });
      } else {
        this.background_images = tmpBackgroundImages;
        this.parallaxFile = this.background_images[this.idParallaxfile];
        setInterval(this.setParallaxFile,20000);
      }


    },
    mounted: function() {
      this.checkCurrentAnalysisUnit();

      // window.addEventListener('scroll', this.assessPageBottom);
      // this.assessPageBottom();
      this.$emit('alterToolbar', null);
      this.resizeFirstSection();
      window.addEventListener('resize', this.resizeFirstSection);
    },
    beforeDestroy: function() {
      window.removeEventListener('resize', this.resizeFirstSection);
    },
    computed: {
      currentParallax: function() {
        return "background-image:url('/static/parallax/" + this.parallaxFile + "');";
      },
    },
    methods: {
      setParallaxFile(){
        this.idParallaxfile++;
        this.backgroundVisible = false;
        if (this.idParallaxfile == this.background_images.length){
            this.idParallaxfile = 0;
        }
        setTimeout(()=> { 
          this.parallaxFile = this.background_images[this.idParallaxfile];
          this.backgroundVisible = true;
          }, 2000);
      },
      
      assessPageBottom() {
        this.isPageBottom = false;
        if (window && document) {
          if (window.scrollY == 0){ //início
            this.isPageBottom = false;
          }
          else{
            this.isPageBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight-1;
          }
        } 
      },

      scrollDown(){
        window.scrollBy(0, window.innerHeight / 2);        
      },
      
      customFilter (item, queryText, itemText) {
        queryText = this.$textTransformService.replaceArgs(queryText).toLowerCase();
        itemText = this.$textTransformService.replaceArgs(itemText).toLowerCase();
        return itemText.indexOf(queryText) > -1 
      },      
      buildShortText(fullText) {
        if (this.readMoreLimit) {
          if (fullText.length > parseInt(this.readMoreLimit)) {
            let endCharRegex = new RegExp("[.,!?;& \n\t\s](?!.*[.,!?;& \n\t\s])", "g");
            endCharRegex.exec(fullText.substring(0, this.readMoreLimit));
            return fullText.substring(0, endCharRegex.lastIndex) + "...";
          }
        }
      },

      toggleCollapseExpand(item) {
        item.collapsed = !item.collapsed;
      },

      cmpTextMoreLess(collapsed) {
        return collapsed ? "Leia mais" : "Leia menos";
      },
      assessMoreLess() {
        return this.collapsed ? "more" : "less";
      },

      resizeFirstSection(){
        if (this.$vuetify.breakpoint.smAndDown){
          this.displayHeight = "auto";
        } else {
          this.displayHeight = "min-height:" +  (window.innerHeight - 64)  + "px";
        }
        
      },

      swipeObs(direction) {
        if (direction == 'right' && this.obsSlice > 0) {
          this.obsSlice--;
        } else if (direction == 'left' && this.obsSlice < this.obsMaxSlice) {
          this.obsSlice++;
        }
      },

      shownObservatories() {
        if (this.$vuetify.breakpoint.smAndDown) {
          this.obsSliceClass = 'xs6';
          this.obsMaxSlice = 4;
          this.obsSliceSize = 1;
        } else {
          this.obsSliceClass = 'xs6 sm4 md3 lg2'; 
          this.obsMaxSlice = 3;
          this.obsSliceSize = 2;
        }

        if (this.obsSlice > this.obsMaxSlice) {
          this.obsSlice = this.obsMaxSlice;
        }
        
        let start = this.obsSlice;
        let stop = start + this.obsSliceSize;
        return this.observatorios.slice(start, stop);
      },

      replaceBrOnSmAndDown(text){
        if (this.$vuetify.breakpoint.smAndDown){
          text = text.replace("<br/>"," ");
        }
        return text;
      }
    }
  }
</script>

<style>
  .mainSearch .v-input__append-outer {
    z-index: 1 !important;
  }

  .search-group .input-group {
    padding: 0;
  }

  .search-group .input-group__details {
    display: none;
  }

  .radio label {
    font-family: titulos-observatorio, sans-serif !important;
    font-size: x-large;
  }
  
  .v-text-field.v-text-field--enclosed .v-text-field__details {
    display: none;
  }

  .screen-busca {
    background-color: rgba(256, 256, 256, 0.4);
    border-color: transparent !important;
  }

  .screen-busca.v-select--is-menu-active {
    background-color: rgba(256,256,256,0.7) !important;
  }

  .screen-busca .v-input__slot {
    border-color: transparent !important;
  }

  .screen-busca .v-icon {
    transform: none !important;
    -webkit-transform: none !important;
  }

  .timeline-item {
    align-self: center;
  }

  .nav_first_section {
    cursor: pointer !important;
  }

  .anchor-cards .container{
    color: black;
  }

  .footer-nav {
    position: fixed;
    bottom: 0;
    z-index: 99;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .footer-nav>.layout {
    flex: none;
    border-radius: 0.3rem 0.3rem 0 0;
    background-color: rgba(0,0,0,0.6);
  }

</style>
  

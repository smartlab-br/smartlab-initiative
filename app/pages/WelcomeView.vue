<template>
  <v-layout row wrap class="pa-0">
    <v-flex fluid grid-list-lg xs12 overflow-hidden class="first-section pa-0" :style="displayHeight">
      <transition  v-show="parallaxFile" name="fade">
        <v-layout xs12 class="bg-zoom" height="auto" :style="currentParallax" v-show="backgroundVisible"></v-layout> 
      </transition>
      <v-layout xs12 class="bg-home-shadow ma-0"></v-layout>
      <v-layout row wrap fill-height align-center justify-center pa-0 class="parallax-content-home">
        <v-flex id="screenTitle" xs12 class="white--text text-xs-center py-4 my-5" style="line-height: normal;">
          <div class="display-4-obs ubuntu">Iniciativa SmartLab</div>
          <div class="display-1-obs ubuntu-condensed">Promoção do Trabalho Decente Guiada por Dados</div>
        </v-flex>
        <v-layout px-5 :class="{'justify-center': $vuetify.breakpoint.xlOnly }" row wrap v-show="observatorios">
          <v-flex 
            v-for="(observatorio, indxObs) in observatorios"
            :key="'linked_card_obs_' + indxObs"
            :class="obsSliceClass"
            pa-3>
            <!--
              :icon = "observatorio.icon"
              :app-icon = "observatorio.app_icon"
              :media = "observatorio.media"
              :bg-color = "$observatories.getTheme(observatorio.id).primary"
            -->
            <flpo-linked-view-card
              :index-tab="30 + indxObs"
              :tagColor="observatorio.tagColor"
              :status="observatorio.status"
              :to="observatorio.to"
              :external="observatorio.external"
              :title="observatorio.short_desc"
              :ripple-color="$observatories.getTheme(observatorio.id).primary"
              :title-color="'white'"
              :blocked="observatorio.blocked"
              @showSnackbar="snackAlert"
            />
          </v-flex>
        </v-layout>
      </v-layout>
    </v-flex>
    <v-flex class="black--background">
      <v-layout 
        align-center 
        section
        v-for="(secao, indxSctn) in secoes"
        :key="indxSctn"
        v-show="secoes"
        :style="'background-image:url(\'' + secao.section_background + '\');'"
      >
        <v-layout 
            px-5 row wrap
            class="white--text"
        >
          <v-flex v-if="!secao.complement" xs12>
            <div class='section-title'>{{secao.title}}</div>
            <div class='section-description' v-html="secao.description"></div>
          </v-flex>
          <v-flex v-if="secao.complement" :class="(secao.cls ? secao.cls : 'xs9')">
            <div class='section-title'>{{secao.title}}</div>
            <div class='section-description'  v-html="secao.description"></div>
          </v-flex>
          <v-flex v-if="secao.complement" class="section-complement" :class="(secao.complement.cls ? secao.complement.cls : 'xs3')">
            <flpo-minicard
              v-for="(miniCard, indexMinicard) in secao.complement.minicards"
              :key="'minicard_'+indexMinicard"
              :structure="miniCard" 
              @showSnackbar="snackAlert">
            </flpo-minicard>
            

            <v-layout  
              v-for="(image, indexImage) in secao.complement.images"
              :key="'img_'+indexImage" 
              pa-0
              justify-center 
            >
              <div 
                class="image-container" 
                :style="'width:' + (image.width ? image.width : '')"
              >
                <div v-if="image.tag" class="layout caption font-weight-bold pa-1 text-xs-center soon-tag warning black--text">
                  {{image.tag.text}}
                </div>
                <v-img 
                  :src="image.url"
                  :class="(image.link_disabled ? 'link_disabled' : '') + ' complement-image'"
                />
              </div>
            </v-layout>
            
          </v-flex>
        </v-layout>
      </v-layout>

      <v-layout 
        obs_container
        v-for="(observatorio, indxObs) in observatorios"
        :key="'obs_section_'+indxObs"
        :style="'background-image:url(\'' + observatorio.section_background + '\');'"
      >
        <v-layout 
          v-if="!observatorio.blocked"
          px-5 row wrap class="white--text"
          section
          align-center
        >
          <v-flex xs12>
            <div class='section-title nav_first_section' @click="$navigationManager.constructor.pushRoute($router, observatorio.to, observatorio.external)" >{{observatorio.title}}</div>
            <div class='section-description' v-html="observatorio.section_description"></div>
          </v-flex>
          <!-- <v-flex  class="section-complement" xs12 md6 px-3>      
            <v-img :src="observatorio.section_image"
              class="complement-image"
              @click="$navigationManager.constructor.pushRoute($router, observatorio.to, observatorio.external)"
            ></v-img>
          </v-flex>   -->
        </v-layout>
      </v-layout>

    </v-flex>
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

        secoes: null,

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

      let tmpSections = this.$observatories.getSections();
      if ((tmpSections instanceof Promise) || tmpSections.then) {
        tmpSections.then((result) => { 
          this.secoes = result 
          }
        );
      } else {
        this.secoes = tmpSections;
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

  .black--background {
    background-color: black;
  }
  .obs_container{
    background-size: cover;
    background-position: top;
  }
  .section {
    min-height: 95vh;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 30px;
    padding-top: 30px;
    padding-left: 8px;
    padding-right: 8px;
    background-size: cover;
    background-position: top;
  }
  .section-title {
    font-family: titulos-observatorio, sans-serif;
    font-size: 3rem;
    margin: 16px;
    line-height: 1.1;
    margin-bottom: 40px;
  }
  .section-description {
    font-size: 1.45rem;
     margin: 16px;
  }
  .section-complement {
    font-size: 1.3rem;
     margin-top: 22px;
  }
  .complement-image {
    border-color: rgba(255, 255, 255, 0.3);
    border-width: 1px;
    border-style: solid;
    cursor: pointer;
  }
  .link_disabled {
    cursor: default;
  }

  .section-complement .minicard-description {
    font-size: 1rem !important;
  }

  .section-complement .minicard-comment {
    font-size: 1rem !important;
  }

  .soon-tag {
    display: block;
    position: absolute;
    width: 136px;
    top: 24px;
    right: -32px;
    z-index: +1;
    transform: rotate(45deg);
  }
  .image-container {
    position: relative;
    overflow: hidden;
  }
</style>
  

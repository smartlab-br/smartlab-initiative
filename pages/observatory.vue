<template>
  <v-container class="pa-0" fluid>
    <v-row class="pa-0">
      <v-col
        cols="12"
        class="first-section pa-0"
        :style="displayHeight"
      >
        <!-- <v-row class="bg-home-shadow ma-0" /> -->
        <v-row
          align="center"
          justify="center"
          class="animated-background-row pa-5"
        >
          <v-img
            v-if="parallaxFile" 
            :src="currentParallax"
            class="animated-background"
            :class="{ 'fade-in': isFading }" 
            alt="Imagem de Fundo"
            cover
          ></v-img>
          <v-col cols="12" class="text-center py-4 my-5 animated-background-content">
            <v-row justify="center">
              <v-col
                id="screenTitle"
                cols="12"
                :class="`d-flex justify-center ${computedClasses}`"
              >
                <v-img
                  :src="`/smartlab/${currentObsId ? currentObsId.concat('.svg') : ''}`"
                  :alt="currentObs ? currentObs.title : ''"
                  width="100%"
                  max-width="680px"
                />
              </v-col>
              <v-col cols="12">
                <v-row
                  align="center"
                  justify="center"
                >
                  <v-col
                    cols="10"
                    md="4"
                    class="pt-5 mt-3"
                  >
                    <FLPOSearchBar />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
          <v-row
            v-if="currentObs"
            class="px-5"
            :class="{'justify-center': xlAndUp }"
          >
            <v-col
              v-for="(dimensao, indxDim) in currentObs?.dimensions"
              :key="'linked_card_obs_' + indxDim"
              class="pa-3"
              :cols="12"
              :sm="6"
              :md="4"
              :xl="2"
            >
              <FLPOLinkedViewCard
                title-color="white"
                :index-tab="30 + indxDim"
                :tag-color="dimensao.tagColor"
                :status="dimensao.status"
                :to="dimensao.to"
                :external="dimensao.external"
                :title="dimensao.short_desc"
                :blocked="dimensao.blocked"
              />
            </v-col>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { useDisplay } from "vuetify"
import { useMainStore } from "~/store"
import { onMounted, ref, watchEffect } from "vue"
import { storeToRefs } from "pinia"
import { NavigationService } from "~/utils/service/singleton/navigation"
import { ColorsService } from "~/utils/service/singleton/colors.js"
import { useRoute, useRouter } from "vue-router"
// import { useNuxtApp } from "#app"

export default {
  setup() {
    const store = useMainStore()
    const router = useRouter()
    const route = useRoute()
    const displayHeight = ref("auto")
    const parallaxFile = ref<string|null>(null)
    const { mdAndUp, xlAndUp } = useDisplay()
    const { xs, sm, md, lg } = useDisplay()
    const idParallaxfile = ref(0)
    const isFading = ref(false)

    const { smartlab, observatories, currentObs, currentObsId, currentDimension } = storeToRefs(store)

    // const { $reformDataset } = useNuxtApp()

    // const ds = [
    //   { cd_indicador: "1", nu_competencia: 2099, vl_indicador: 123.45 },
    //   { cd_indicador: "1", nu_competencia: 2047, vl_indicador: 678.9 }
    // ]
    // const options = {
    //   formatters: [
    //     { id: "vl_indicador", format: "inteiro" }
    //   ]
    // }
    // const result = $reformDataset(ds, options, {})
    // console.log(result)

    const currentParallax = computed(() => {
      return parallaxFile.value
        ? `/parallax/${parallaxFile.value}`
        : ""
    })

    const resizeFirstSection = () => {
      if (mdAndUp.value) {
        displayHeight.value = "min-height:" + (window.innerHeight - 64) + "px"
      } else {
        displayHeight.value = "height:auto"
      }
    }

    const computedClasses = computed(() => {
      if (xs.value) {
        return "px-1 pt-1 mx-1 mt-1"
      } else if (sm.value && !xs.value) {
        return "px-2 pt-2 mx-2 mt-2"
      } else if (md.value && !sm.value) {
        return "px-3 pt-3 mx-3 mt-3"
      } else if (lg.value) {
        return "px-4 pt-4 mx-4 mt-4"
      }
      return ""
    })    

    watch(
      () => currentObs.value, 
      async (newValue) => {
        if (newValue){
          if (currentObs.value && currentObs.value.obsPage){
            parallaxFile.value = currentObs.value.obsPage.background_images[idParallaxfile.value]
          }

        }
      }
    )

    watchEffect(() => {
      resizeFirstSection()
    })

    onMounted(() => {
      setInterval(setParallaxFile, 20000)
      store.setCurrentObs(route)
      store.setCurrentAnalysisUnit("0")
      ColorsService.changeTheme(currentObsId.value)
      // if (smAndDown.value) {
      //   obsMaxSlice.value = 11;
      //   obsSlice.value = 0;
      //   obsSliceSize.value = 1;
      // }
    })

    const setParallaxFile = () => {
      isFading.value = true
      idParallaxfile.value++
      if (idParallaxfile.value == smartlab.value?.background_images.length) {
        idParallaxfile.value = 0
      }
      setTimeout(() => {
        if (smartlab.value) {
          parallaxFile.value = smartlab.value?.background_images[idParallaxfile.value]
        }
        isFading.value = false
      }, 2000)
    }


    return {
      smartlab,
      observatories,
      currentObs,
      currentObsId,
      currentDimension,
      router,
      route,
      NavigationService,
      ColorsService,
      displayHeight,
      parallaxFile,
      currentParallax,
      xlAndUp,
      isFading,
      computedClasses
    }
  }
}

</script>

<style scoped>
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
    color: white;
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

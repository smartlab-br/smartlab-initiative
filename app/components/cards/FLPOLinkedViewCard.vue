<template>
    <v-container
      class="linked-view-card elevation-5"
      @click="handleNavigation"
      @keyup.enter="handleNavigation"
    >
      <v-img
        v-ripple
        :ripple="{ class: rippleColor }"
        class="bg-transparent-buttom align-center"
        :tabindex="indexTab"
        :src="cmpMedia"
        :height="height"
        :aspect-ratio="16/9"
      >
        <v-container
          fill-height
          pa="0"
          ma="0"
        >
          <v-container
            fill-height
            pa="0"
          >
            <v-row align="center">
              <v-col class="pa-0" cols="12">
                <div
                  :class="detail ? 'linked-view-icon-container' : 'text-xs-center'"
                  @click="handleNavigation"
                >
                  <v-btn
                    v-if="icon || appIcon"
                    :color="btnColor || 'transparent'"
                    class="ma-0"
                    icon
                    size="small"
                  >
                    <v-icon
                      v-if="icon"
                      :color="iconColor || ''"
                    >
                      {{ icon }}
                    </v-icon>
                    <svg 
                        v-else-if="appIcon"
                        viewBox="0 0 16 16" 
                        width="16" 
                        height="16" 
                        role="presentation" 
                        :fill="iconColor || ''" 
                        class="icon--inline" 
                        :title="title">
                        <use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="'/icons/sprite/coord-sprites.svg#' + appIcon" />
                      </svg>                
                  </v-btn>
                </div>
                <div
                  class="px-2 linked-view-title-container text-xs-center"
                  :class="titleColor ? titleColor + '--text' : ''"
                >
                  <div
                    :style="(appIcon || icon) ? 'min-height: 70px' : ''"
                    class="headline-obs"
                    v-html="title ? title.toUpperCase() : ''"
                  />
                </div>
                <v-col
                  v-if="detail"
                  class="pt-1 pb-5 linked-view-detail-container"
                  cols="12"
                >
                  <div
                    class="caption px-3 pb-4 pt-2 mt-4 text-xs-center body-1"
                    @click="handleNavigation"
                  >
                    {{ detail.fixed }}
                  </div>
                  <div v-if="tags" class="pa-2">
                    <v-chip
                      v-for="(tag, tagIndx) in tags"
                      :key="'tag_'+tagIndx"
                      small
                      :color="tag.color"
                      text-color="white"
                    >
                      <v-icon start>
                        label
                      </v-icon>
                      <span>{{ tag.label }}</span>
                    </v-chip>
                  </div>
                </v-col>
              </v-col>
            </v-row>
          </v-container>
        </v-container>
        <v-sheet
          v-if="status"
          class="caption font-weight-bold pa-1 text-xs-center"
          :class="'tag bg-' + tagColor"
          :color="tagTextColor"
        >
          {{ status }}
        </v-sheet>
      </v-img>
    </v-container>
  </template>

<script setup lang="ts">
import { NavigationService } from "~/utils/service/singleton/navigation"
import colors from "vuetify/lib/util/colors.mjs"
import { useSnackbarStore } from "~/store/snackbar"

defineOptions({
  name: 'FLPOLinkedViewCard'
})

interface Props {
  tagColor?: string
  status?: string
  icon?: string
  appIcon?: string
  media?: string
  to?: string
  external?: boolean
  title?: string
  titleColor?: string
  rippleColor?: string
  btnColor?: string
  blocked?: boolean
  indexTab?: number
  iconColor?: string
  tags?: any[]
  height?: string | number
  detail?: Record<string, any>
}

const props = defineProps<Props>()
const router = useRouter()
const snackbar = useSnackbarStore()

const tagTextColor = computed(() => {
  return props.tagColor === "warning" ? "#000" : "#FFF"
})

const cmpMedia = computed(() => {
  return props.media
})

const snackBlocked = () => {
  snackbar.showSnackbar({
    color: colors.orange.darken4,
    text: "Disponível em breve!",
  })
}

const handleNavigation = () => {
  if (props.blocked) {
    snackBlocked()
  } else {
    NavigationService.pushRoute(router, props.to as string, props.external)
  }
}
</script>

<style scoped>
.linked-view-card {
  display: block;
  color: white
}

.linked-view-card:hover {
  cursor: pointer;
}

.bg-transparent-buttom {
  background-color: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  border-radius: 5px;
}

.bg-transparent-buttom:hover {
  border: 1px solid white !important;
}

.linked-view-card .v-responsive {
  flex: 1 1 auto;
}

.linked-view-card .linked-view-icon-container {
  justify-content: center;
  display: flex;
  align-items: center;
}

.linked-view-card .linked-view-detail-container {
  background-color: rgba(0, 0, 0, 0.3);
}

.linked-view-card .linked-view-title-container {
  overflow: hidden;
  text-overflow: ellipsis;
}

.linked-view-card .tag {
  display: block;
  position: absolute;
  width: 136px;
  top: 21px;
  right: -32px;
  z-index: +1;
  transform: rotate(45deg);
}
</style>

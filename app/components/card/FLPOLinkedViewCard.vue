<template>
  <v-layout class="linked-view-card elevation-5" 
    v-ripple
    :ripple="{ class: rippleColor }"
    @click="blocked ? snackBlocked() : $navigationManager.constructor.pushRoute($router, to, external)"
    @keyup.enter="blocked ? snackBlocked() : $navigationManager.constructor.pushRoute($router, to, external)"
  >
    <v-img 
      :tabindex = "indexTab"
      :src="cmpMedia"
      :class="bgColor ? headerClass : headerClass + ' bg-transparent-buttom'"
      :height="height"
      :style="bgColor ? 'background-color:' + bgColor : ''"
      :aspect-ratio="16/9"
    >
      <v-container 
        fill-height 
        pa-0 
        ma-0
      >
        <v-container 
          fill-height  
          pa-0
        >
          <v-layout align-center>
            <v-layout column pa-0>
              <v-flex
                :class = "detail ? 'linked-view-icon-container' : 'text-xs-center'"
                @click="blocked ? snackBlocked() : $navigationManager.constructor.pushRoute($router, to, external)"
              >
                <v-btn 
                  v-if="icon || appIcon"
                  :color="btnColor ? btnColor : 'transparent'"
                  class="ma-0"
                  fab
                  flat
                  small
                >
                  <v-icon 
                    v-if="icon"
                    :color="iconColor ? iconColor : ''"
                  >
                    {{icon}}
                  </v-icon>
                  <app-icon 
                    v-else-if="appIcon"
                    :fill="iconColor ? iconColor : ''"
                    :icon="appIcon"
                  >
                  </app-icon>
                </v-btn>
              </v-flex>
              <v-flex 
                px-2 
                :class="titleColor ? 'linked-view-title-container text-xs-center ' + titleColor + '--text' : 'linked-view-title-container text-xs-center'"
              >
                <v-flex 
                  :style="(appIcon || icon) ? 'min-height: 70px' : ''" 
                  class="headline-obs" 
                  v-html="title != null ? title.toUpperCase() : ''"
                >
                </v-flex>
              </v-flex>
              <v-layout 
                v-if="detail"
                column 
                pt-1 
                pb-5 
                class="linked-view-detail-container"
              >
                <v-flex 
                  caption 
                  px-3 pb-4 pt-2 mt-4 
                  text-xs-center 
                  class="body-1"
                  @click="blocked ? snackBlocked() : $navigationManager.constructor.pushRoute($router, to, external)"
                >
                  {{ detail.fixed }}
                </v-flex>
                <v-flex 
                  v-if="tags" 
                  pa-2
                >
                  <v-chip 
                    v-for="(tag, tagIndx) in tags"
                    small 
                    :key="'tag_'+tagIndx"
                    :color="tag.color" 
                    text-color="white"
                  >
                    <v-icon left>label</v-icon>
                    <span>{{ tag.label }}</span>
                  </v-chip>
                </v-flex>
              </v-layout>
            </v-layout>
          </v-layout>
        </v-container>
      </v-container>
      <v-layout
        v-if="status"
        caption 
        font-weight-bold 
        pa-1 
        text-xs-center
        :class = "'tag ' + tagColor + ' ' + tagTextColor"
      >
        {{ status }}
      </v-layout>
    </v-img>
  </v-layout>
  <!-- <span :class="tagColor">
    {{ options.status }}
  </span> -->
</template>

<script>
  export default {
    data () {
      return {
      }
    },
    created() {
    },
    props: ['tagColor', 'status', 'icon', 'appIcon', 'media', 'to',
            'external', 'title', 'titleColor', 'rippleColor', 'headerClass',
            'bgColor', 'btnColor', 'blocked', 'indexTab',
            'iconColor', 'tags', 'height', 'detail'],
    computed: {
      tagTextColor: function() {
        if (this.tagColor == 'warning') return 'black--text';
        return 'white--text';
      },
      cmpMedia: function() {
        return this.media;
      }
    },
    methods: {
      snackBlocked: function(){
        this.$emit('showSnackbar', { color : 'orange darken-4', text: "Disponível em breve!" });
      }
    }
  }
</script>

<style>
  .linked-view-card {
    display: block;
  }

  .linked-view-card:hover {
    cursor: pointer;
  }

  /* 
  .linked-view-card .v-responsive__content {
    background-color: rgba(127,127,127,0.7);
  }
  */

  .bg-transparent-buttom {
    background-color: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255,255,255,0.4) !important;
    border-radius:5px; 
  }

  .bg-transparent-buttom:hover {
    border: 1px solid white !important;
  }

  .rounded-border{
    border-radius:5px; 
  }

  .linked-view-card .v-responsive {
    flex: 1 1 auto;
  }

  /* TEMAS DOS OBSERVATÓRIOS */
  .linked-view-card .v-responsive.brown .v-responsive__content {
    background-color: rgba(78,52,46,0.9) !important;
  }

  .linked-view-card .v-responsive.teal .v-responsive__content {
    background-color: rgba(0,105,92,0.9) !important;
  }

  .linked-view-card .v-responsive.indigo .v-responsive__content {
    background-color: rgba(40,53,147,0.9) !important;
  }

  .linked-view-card .v-responsive.deep-purple .v-responsive__content {
    background-color: rgba(81,45,168,0.9) !important;
  }

  .linked-view-card .v-card__media__background {
    -webkit-transition: 1s ease-in-out;
    -moz-transition: 1s ease-in-out;
    -o-transition: 1s ease-in-out;
    transition: 1s ease-in-out;
  }

  .linked-view-card .v-card__media__background:hover {
    -ms-transform: scale(1.2, 1.2); /* IE 9 */
    -webkit-transform: scale(1.2, 1.2); /* Safari */
    transform: scale(1.2, 1.2);
  }

  .linked-view-card .linked-view-icon-container {
    justify-content: center;
    display: flex;
    align-items: center;
  }

  .linked-view-card .linked-view-detail-container {
    background-color: rgba(0,0,0,0.3);
  }

  .linked-view-card .linked-view-icon-container button,
  .linked-view-card .linked-view-icon-container button:hover {
    position: absolute !important;
    top: 80px;
    z-index: +1;
  }

  .linked-view-card .linked-view-title-container {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .linked-view-card .tag {
    display: block;
    position: absolute;
    width: 136px;
    top: 24px;
    right: -32px;
    z-index: +1;
    transform: rotate(45deg);
  }
</style>
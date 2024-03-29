<template>
  <v-layout secondary style="display: block;">
    <v-tabs
      v-if="content"
      v-model="active"
      color="secondary"
      show-arrows
      class="elevation-1"
      dark
    >
      <v-tabs-slider />
      <!-- Headers -->
      <v-tab
        v-for="(eachTab, eachKey) in content"
        :key="eachKey"
        :href="'#tab-'+eachKey"
        ripple
        class="accent--text headline-obs"
      >
        {{ eachTab != null ? eachTab.tab : '' }}
      </v-tab>
      <!-- Conteúdos -->
      <v-tabs-items>
        <v-tab-item
          v-for="(eachTabItem, eachKeyItem) in content"
          :key="eachKeyItem"
          :value="'tab-'+eachKeyItem"
        >
          <v-container pa-5 class="white--text">
            <div v-if="eachTabItem.title" class="display-2-obs py-2">
              {{ eachTabItem.title }}
            </div>
            <v-container v-for="(section, index) in eachTabItem.sections" :key="index" pa-0>
              <div class="headline-obs py-2">
                {{ section.title }}
              </div>
              <v-list v-if="section.type == 'list'" dark :class="'py-0 ' + section.list_height">
                <template v-for="(item, idxItem) in section.list">
                  <v-divider :key="idxItem" />
                  <v-list-tile :key="item.name">
                    <v-list-tile-content>
                      <v-list-tile-title v-html="item.name" />
                      <v-list-tile-sub-title v-for="(value, index) in item.values" :key="index">
                        {{ value }}
                      </v-list-tile-sub-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </template>
              </v-list>
              <v-list v-if="section.type == 'list-avatar'" dark class="py-0" three-line>
                <template v-for="(item, idxItem) in section.list">
                  <v-divider :key="idxItem" />
                  <v-list-tile :key="item.name">
                    <!-- <v-list-tile-avatar size="64" v-if="item.avatar" class="mr-3 my-0">
                      <img :src="item.avatar" :alt="item.name">
                    </v-list-tile-avatar> -->
                    <v-list-tile-content>
                      <v-list-tile-title class="light-link" v-html="item.name" />
                      <v-list-tile-sub-title v-for="(value, index) in item.values" :key="index">
                        <span class="light-link" v-html="value" />
                      </v-list-tile-sub-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </template>
              </v-list>
              <v-layout
                v-else-if="section.type == 'text'"
                row
                class="pa-0"
              >
                <v-flex
                  xs12
                  v-html="section.content"
                />
              </v-layout>
              <v-layout v-else-if="section.type == 'stack'">
                <a
                  frameborder="0"
                  data-theme="light"
                  data-layers="1,2,3,4"
                  data-stack-embed="true"
                  :href="'https://embed.stackshare.io/stacks/embed/' + section.id"
                />
              </v-layout>
              <v-layout v-else-if="section.type == 'timeline'">
                <v-timeline dark :dense="$vuetify.breakpoint.smAndDown">
                  <v-timeline-item
                    v-for="(event, indxEventLg) in section.list"
                    :key="'history2_event_left_' + indxEventLg"
                    color="accent"
                    small
                  >
                    <v-card class="elevation-2 primary">
                      <v-card-title class="headline pb-1">
                        {{ event.title }}
                      </v-card-title>
                      <v-card-text class="subheading pt-1" v-html="event.content" />
                    </v-card>
                  </v-timeline-item>
                </v-timeline>
              </v-layout>
            </v-container>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
  </v-layout>
</template>
<script>
export default {
  props: ['activeTab', 'content'],
  data () {
    return {
      active: null
    }
  },
  created () {
  },
  mounted: function () {
    this.active = this.activeTab ? 'tab-' + this.activeTab : null
    this.embedStacks()
  },
  destroyed () {
    const embeds = document.querySelectorAll("[data-stack-embed='true']")
    for (const eachStack of embeds) {
      eachStack.parentNode.removeChild(eachStack.parentNode.childNodes[0])
    }
    if (window.addEventListener) {
      window.removeEventListener('message', this.receiveHeight, false)
    } else {
      window.detachEvent('onmessage', this.receiveHeight)
    }
  },
  methods: {
    embedStacks () {
      const embeds = document.querySelectorAll("[data-stack-embed='true']")

      for (const embed of embeds) {
        const element = document.createElement('iframe')
        const div = document.createElement('div')
        const theme = embed.getAttribute('data-theme')
        const layers = embed.getAttribute('data-layers')
        const hrefSplit = embed.href.split('/')
        const embedCode = hrefSplit[5]

        div.setAttribute('class', 'embed-container')
        div.style = ' overflow: hidden; position: relative;'
        element.async = 1
        element.src = embed.href + '?theme=' + theme + '&layers=' + layers
        element.width = '100%'
        element.height = 0
        element.style.border = 0
        element.setAttribute('data-embed-code', embedCode)
        element.style = 'border-width: 0; position: inherit;'
        div.appendChild(element)
        embed.parentNode.insertBefore(div, embed)

        embed.style.display = 'none'
      }

      if (window.addEventListener) {
        window.addEventListener('message', this.receiveHeight, false)
      } else {
        window.attachEvent('onmessage', this.receiveHeight)
      }
    },

    receiveHeight (event) {
      if (event.data.origin == 'stackshare') {
        const embedCode = event.data.embedCode

        const embeds = document.querySelectorAll("[data-stack-embed='true']")
        for (const embed of embeds) {
          const url = embed.href
          const strings = url.split('/')
          if (strings[5] == embedCode) {
            const iframe = document.querySelectorAll("iframe[data-embed-code='" + embedCode + "']")[0]
            iframe.height = event.data.embedHeight
          }
        }
      }
    }
  }
}
</script>

<style>
  .embed-container {
    width: 100%
  }
  .light-link a {
    color: #fff
  }
</style>

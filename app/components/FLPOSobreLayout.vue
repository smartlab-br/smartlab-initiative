<template>
  <div style="display: block; min-height: calc(100vh - 112px); background-color: #424242;">
    <v-tabs
      v-if="content"
      v-model="active"
      color="accent"
      bg-color="#424242"
      show-arrows
      theme="dark"
      class="elevation-0"
    >
      <!-- Headers -->
      <v-tab
        v-for="(eachTab, eachKey) in content"
        :key="eachKey"
        :value="'tab-'+eachKey"
        class="headline-obs"
      >
        {{ eachTab != null ? eachTab.tab : '' }}
      </v-tab>
    </v-tabs>
    <!-- Conteúdos -->
    <v-window v-if="content" v-model="active">
      <v-window-item
        v-for="(eachTabItem, eachKeyItem) in content"
        :key="eachKeyItem"
        :value="'tab-'+eachKeyItem"
      >
        <v-container class="pa-5 text-white" style="min-height: calc(100vh - 112px); background-color: #424242;">
          <div v-if="eachTabItem.title" class="display-2-obs py-2">
            {{ eachTabItem.title }}
          </div>
          <v-container v-for="(section, index) in eachTabItem.sections" :key="sectionKey(eachKeyItem, section, index)" class="pa-0">
            <div class="headline-obs py-2">
              {{ section.title }}
            </div>
            <v-list v-if="section.type == 'list'" theme="dark" :class="'py-0 ' + section.list_height" style="background: transparent;">
              <template v-for="(item, idxItem) in section.list" :key="item.name ?? idxItem">
                <v-divider />
                <v-list-item>
                  <v-list-item-title v-html="item.name" />
                  <v-list-item-subtitle v-for="(value, idx) in item.values" :key="(value ?? idx)">
                    {{ value }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-list>
            <v-list v-if="section.type == 'list-avatar'" theme="dark" class="py-0" lines="three" style="background: transparent;">
              <template v-for="(item, idxItem) in section.list" :key="item.name ?? idxItem">
                <v-divider />
                <v-list-item>
                  <!-- <v-list-item-media v-if="item.avatar" class="mr-3 my-0">
                    <v-avatar size="64"><img :src="item.avatar" :alt="item.name"></v-avatar>
                  </v-list-item-media> -->
                  <v-list-item-title class="light-link" v-html="item.name" />
                  <v-list-item-subtitle v-for="(value, idx) in item.values" :key="(value ?? idx)">
                    <span class="light-link" v-html="value" />
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-list>
            <v-row
              v-else-if="section.type == 'text'"
              class="pa-0"
            >
              <v-col
                cols="12"
                class="sobre-text-content"
                v-html="section.content"
              />
            </v-row>
            <v-row v-else-if="section.type == 'stack'">
              <a
                frameborder="0"
                data-theme="light"
                data-layers="1,2,3,4"
                data-stack-embed="true"
                :href="'https://embed.stackshare.io/stacks/embed/' + section.id"
              />
            </v-row>
            <v-row v-else-if="section.type == 'timeline'">
              <v-timeline :density="smAndDown ? 'compact' : 'default'">
                <v-timeline-item
                  v-for="(event, indxEventLg) in section.list"
                  :key="'history2_event_left_' + indxEventLg"
                  dot-color="accent"
                  size="small"
                >
                  <v-card class="elevation-2 bg-primary">
                    <v-card-title class="text-h6 pb-1">
                      {{ event.title }}
                    </v-card-title>
                    <v-card-text class="text-subtitle-1 pt-1" v-html="event.content" />
                  </v-card>
                </v-timeline-item>
              </v-timeline>
            </v-row>
          </v-container>
        </v-container>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps<{
  activeTab?: string | number | null
  content?: About | null
}>()

const { smAndDown } = useDisplay()

const active = ref<string | null>(null)

const sectionKey = (tabKey: string | number, section: any, index: number) => {
  return [tabKey, section.type ?? 'section', section.id ?? section.title ?? index].join(':')
}

onMounted(() => {
  active.value = props.activeTab ? 'tab-' + props.activeTab : null
  embedStacks()
})

onUnmounted(() => {
  const embeds = document.querySelectorAll("[data-stack-embed='true']")
  for (const eachStack of embeds) {
    const firstChild = eachStack.parentNode?.childNodes[0]
    if (firstChild) eachStack.parentNode?.removeChild(firstChild)
  }
  window.removeEventListener('message', receiveHeight, false)
})

function embedStacks() {
  const embeds = document.querySelectorAll("[data-stack-embed='true']")

  for (const embed of embeds) {
    const anchorEmbed = embed as HTMLAnchorElement
    const element = document.createElement('iframe')
    const div = document.createElement('div')
    const theme = embed.getAttribute('data-theme')
    const layers = embed.getAttribute('data-layers')
    const hrefSplit = anchorEmbed.href.split('/')
    const embedCode = hrefSplit[5]

    div.setAttribute('class', 'embed-container')
    div.setAttribute('style', 'overflow: hidden; position: relative;')
    element.src = anchorEmbed.href + '?theme=' + theme + '&layers=' + layers
    element.width = '100%'
    element.height = '0'
    element.setAttribute('data-embed-code', embedCode ?? '')
    element.style.cssText = 'border-width: 0; position: inherit;'
    div.appendChild(element)
    embed.parentNode?.insertBefore(div, embed)
    anchorEmbed.style.display = 'none'
  }

  window.addEventListener('message', receiveHeight, false)
}

function receiveHeight(event: MessageEvent) {
  if (event.data.origin === 'stackshare') {
    const embedCode = event.data.embedCode
    const embeds = document.querySelectorAll("[data-stack-embed='true']")
    for (const embed of embeds) {
      const url = (embed as HTMLAnchorElement).href
      const strings = url.split('/')
      if (strings[5] === embedCode) {
        const iframe = document.querySelector<HTMLIFrameElement>(`iframe[data-embed-code='${embedCode}']`)
        if (iframe) iframe.height = event.data.embedHeight
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
  .v-list-item-subtitle,
  .v-list-item-title,
  .sobre-text-content {
    font-family: Palanquin, Calibri, sans-serif !important;
  }
</style>

<template>
  <v-app>
    <v-navigation-drawer
        v-if="observatories"
        v-model="drawer"
        :rail="rail"
      >
        <v-list>
        <!-- Usando v-for para iterar sobre uma lista de itens -->
          <v-list-item
            v-for="(item, index) in menuItems"
            :key="index"
            link
            :ripple="{ class: item.rippleColor }"
            :tabindex="drawer ? 10 + index : ''"
          >
            <v-list-item-icon class="pr-4" >
              <v-icon
                  v-if="item.icon"
                  :title="item.short_title"
                  :color="ColorsService.getThemeFromId(item.id).primary"
                >
                  {{ item.icon }}
              </v-icon>
              <svg 
                v-else-if="item.app_icon"
                viewBox="0 0 24 24" 
                width="24" 
                height="24" 
                role="presentation" 
                :fill="ColorsService.getThemeFromId(item.id).primary" 
                class="icon--inline" 
                :title="item.shor_title">
                <use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="'/icons/sprite/coord-sprites.svg#' + item.app_icon" />
              </svg>                
              </v-list-item-icon>
            <v-list-item-content>{{ item.short_title }}</v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider />
        <v-list>
          <v-list-item
            link
            @click.stop="rail = !rail"
          >
            <v-list-item-icon>
              <v-icon>{{ rail ? 'mdi-chevron-right' : 'mdi-chevron-left' }} </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              Apenas ícones
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </v-app>

    <v-container>
      <v-responsive class="d-flex align-center text-center fill-height">
        <v-row class="d-flex align-center justify-center">
          <v-col cols="auto"> <v-btn color="primary"> Primary </v-btn> </v-col>
          <v-col cols="auto">
            <v-btn color="secondary"> Secondary </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="accent"> Accent </v-btn>
          </v-col>
          <v-col cols="auto">
            <div>
            </div>
          </v-col>
        </v-row>
        <v-row class="d-flex align-center justify-center">
          <v-col cols="auto"> 
            <slot />
          </v-col>
        </v-row>
      </v-responsive>
    </v-container>
</template>

<script lang="ts">
import { onMounted, watch, ref } from "vue"
import { useMainStore } from "~/store"
import { ColorsService } from "~/utils/service/singleton/colors"
import { storeToRefs } from "pinia"

export default {
  setup() {
    const store = useMainStore()
    const { observatories } = storeToRefs(store)
    const menuItems = ref<any[]>([])

    watch(
      () => observatories.value, // Função getter que retorna observatories.value
      async (newValue) => {
        console.log("Novo valor:", newValue)
        menuItems.value = newValue.slice() // Atualiza o valor de menuItems
        if (menuItems.value) {
          menuItems.value.unshift({ icon: "mdi-apps", short_title: "Início", to: "/"})
        }
      }
    )
    
    onMounted(() => {
      ColorsService.changeTheme(store.currentObsId)
      ColorsService.getThemeFromId("des")
    })

    return {
      observatories,
      menuItems,
      drawer: true,
      rail: false

    }
  }
}

</script>

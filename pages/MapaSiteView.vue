<template>
  <v-layout primary row wrap>
    <v-flex xs-12>
      <v-card
        class="mx-auto"
      >
        <v-sheet class="pa-3 primary lighten-2">
          <v-text-field
            v-model="search"
            label="Pesquisar no site"
            dark
            flat
            solo-inverted
            hide-details
            clearable
            clear-icon="mdi-close-circle-outline"
            append-icon="search"
            @input="handleSearch"
          />
        </v-sheet>
        <v-card-text>
          <v-treeview
            ref="tree"
            :items="items"
            :search="search"
            :open.sync="open"
            :filter="customFilter"
          >
            <template slot="label" slot-scope="{ item }">
              <v-layout row>
                <v-flex shrink pr-2>
                  <AppIcon
                    v-if="item.type == 'observatorio'"
                    :icon="item.app_icon"
                    size="16"
                    :fill="$observatories.getTheme(item.id).primary"
                  />
                  <v-icon
                    v-else-if="item.type == 'dimensao'"
                  >
                    view_list
                  </v-icon>
                  <v-icon
                    v-else
                  >
                    article
                  </v-icon>
                </v-flex>
                <v-flex v-if="item.type == 'observatorio'" grow>
                  <a @click="goToItem(item.url)">{{ $vuetify.breakpoint.smAndDown ? item.short_title : item.name }}</a>
                </v-flex>
                <v-flex v-else grow>
                  <a @click="goToItem(item.url)">{{ item.name }}</a>
                </v-flex>
              </v-layout>
            </template>
          </v-treeview>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
export default {
  data: () => ({
    items: [],
    open: [1, 2],
    search: ''
  }),
  created () {
    this.$yamlFetcherService.loadYaml('br/mapa_site')
      .then((result) => {
        this.items = result
      })
  },
  mounted () {
    this.$vuetify.theme = this.$observatories.getTheme('default')
  },
  methods: {
    customFilter (item, search, textKey) {
      const queryText = this.$textTransformService.replaceSpecialCharacters(search).toLowerCase()
      const itemText = this.$textTransformService.replaceSpecialCharacters(item.search_text).toLowerCase()
      return itemText.includes(queryText)
    },

    handleSearch (input) {
      if (input) {
        this.$refs.tree.updateAll(true)
      } else {
        this.$refs.tree.updateAll(false)
      }
    },
    goToItem (url) {
      if (url.indexOf('{0}')) {
        url = this.$textTransformService.replaceArgs(url, [this.$analysisUnitModel.getCurrentAnalysisUnit()])
      }

      this.$navigationManager.pushRoute(this.$router, url, false)
    }
  }
}
</script>

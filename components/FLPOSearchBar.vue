<template>
    <v-layout>
        <v-flex>
            <v-menu 
            allow-overflow
            offset-y
            dark
            >
            <template slot="activator" slot-scope="{ on }">
                <v-text-field
                ref="searchText"
                v-model="search_site"
                label="Pesquisa por Tema"
                dark
                outline
                single-line
                class="search-text"
                prepend-inner-icon="search"
                v-on="on"
                @input="handleSearch"
                @keyup.enter="on.click"
                ></v-text-field>
            </template>
            <v-card 
                class="treeview-card"
            >
                <v-card-text>
                <v-treeview
                    ref="tree"
                    :items="items_site"
                    :search="search_site"
                    :open.sync="open"
                    :filter="searchFilter"
                >
                    <template slot="label" slot-scope="{ item }">
                    <v-layout row>
                        <v-flex shrink pr-2>
                        <AppIcon 
                            v-if="item.type == 'observatorio'" 
                            :icon="item.app_icon"
                            :fill="'white'"
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
                        <a @click="goToItem(item.url)" class="white--text">{{ $vuetify.breakpoint.smAndDown ? item.short_title : item.name }}</a>
                        </v-flex>
                        <v-flex v-else grow>
                        <a @click="goToItem(item.url)" class="white--text">{{ item.name }}</a>
                        </v-flex>
                    </v-layout>
                    </template>            
                </v-treeview>
                </v-card-text>
            </v-card>
            </v-menu>
        </v-flex>
    </v-layout>
</template>

<script>
  export default {
    data () {
      return {
        search_site: "",
        items_site: [],
        open: [1, 2]
      }
    },
    created () {
      this.$yamlFetcherService.loadYaml("br/mapa_site")
        .then((result) => { 
          this.items_site = result;
        });
    },      
    methods: {
      searchFilter(item, search, textKey){
        let queryText = this.$textTransformService.replaceSpecialCharacters(search).toLowerCase();
        let itemText = this.$textTransformService.replaceSpecialCharacters(item.search_text).toLowerCase();
        return itemText.indexOf(queryText) > -1;
      },

      handleSearch(input) {
        if (input) {
          this.$refs.tree.updateAll(true)
        } else {
          this.$refs.tree.updateAll(false)
        }
      },
      goToItem(url){
        if (url.indexOf('{0}')){
          url =  this.$textTransformService.replaceArgs(url, [this.$analysisUnitModel.getCurrentAnalysisUnit()]);
        }

        this.$navigationManager.pushRoute(this.$router, url, false)  
      }
    }
  }
</script>
  
<style>
  .search-text.v-input .v-input__slot {
    border-radius: 100px !important;
    background-color: #212121 !important;
    opacity: 0.7;
    text-align: center;
    caret-color: auto;
    border: 1px solid rgba(255,255,255,0.4) !important;
  }

  .search-text.v-input .v-input__slot .v-icon{
    color:  rgba(255,255,255,0.4) !important;
  }

  .search-text.v-input .v-input__slot .v-label{
    width: 100% !important;
  }

  .search-text.v-input .v-input__slot input{
    max-width: 90% !important;
    text-align: center;
    color: white
  }

  .search-text.v-input--is-focused .v-input__slot {
    border: 2px solid #ffffff !important;
  }

  .search-text.v-input--is-focused .v-input__slot .v-icon{
    color: #ffffff !important;
  }

  .treeview-card{
    border-radius:20px;
    background-color: #212121 !important;
    opacity: 0.9;
    max-height: 400px;
    overflow-y: auto;
  }
</style>
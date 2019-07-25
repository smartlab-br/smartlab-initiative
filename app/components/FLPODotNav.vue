<template>
  <v-container class="left_nav pa-0" fluid grid-list-lg>
    <v-list class="text-xs-center py-0">
      <template v-for="section in sectionsStructure">
        <!-- <v-divider v-if="section.divider" :key="section.name"></v-divider> -->
        <v-list-tile v-if="!section.divider" ripple :key="section.name" class="pa-0">
          <v-list-tile-content class="pa-0">
            <a v-on:click="scrollTo('anchor_' + section.name)" >
              <v-tooltip right>
                <v-icon 
                  slot="activator"
                  :color="section.vizColor"
                  class="ml-1 my-5">
                  lens
                </v-icon>
                {{ tooltip[section.name] }}
              </v-tooltip>
            </a>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-list>
  </v-container>
</template>

<script>
  export default {
    data () {
      return {
        sectionsStructure: [],
        tooltip: {}
      }
    },
    props: ['sections'],
    watch: {
      sections: function(newVal, oldVal) {
        window.removeEventListener('scroll', this.assessVisibleCards);
        this.buildStruct(newVal);
        window.addEventListener('scroll', this.assessVisibleCards);
        this.assessVisibleCards();
      }
    },
    mounted () {
      this.buildStruct();
      window.addEventListener('scroll', this.assessVisibleCards);
      this.assessVisibleCards();
    },
    beforeDestroy () {
      window.removeEventListener('scroll', this.assessVisibleCards);
    },
    methods: {
      sendError(message) {
        this.$emit('showSnackbar', { color : 'error', text: message });
      },
      scrollTo(anchor) {
        var el = document.getElementById(anchor);
        el.scrollIntoView();
        window.scrollBy(0,-120);
      },
      buildStruct() {
        this.sectionsStructure = [];
        for (var groupIndex in this.sections) {
          // Coloca um divider iniciando cada seção, exceto a primeira
          if (this.sectionsStructure.length > 0) {
            this.sectionsStructure.push(
              { name: null,
                divider: true,
                vizColor: 'primary lighten-1'
              }
            );
          }
          for (var itemIndex in this.sections[groupIndex].cards) {
            // Se for uma seção "fake", inclui um separador
            if (this.sections[groupIndex].cards[itemIndex].type &&
                this.sections[groupIndex].cards[itemIndex].type == 'headline') {
              this.sectionsStructure.push(
                { name: null,
                  divider: true,
                  vizColor: 'primary lighten-1'
                }
              );
              continue;
            }
            // Insere DOT para o card
            this.sectionsStructure.push(
              { name: this.sections[groupIndex].cards[itemIndex].id,
                divider: false,
                vizColor: 'primary lighten-1'
              }
            );

            // Define o tooltip
            this.fillDataStructure(
              this.sections[groupIndex].cards[itemIndex].title,
              this.customParams, this.customFunctions,
              this.setTooltipTitle,
              { id: this.sections[groupIndex].cards[itemIndex].id }
            );
          }
        }
      },
      assessVisibleCards() {
        const vHeight = (window.innerHeight || document.documentElement.clientHeight);
        for (var ancoraIndex in this.sectionsStructure) {
          if (!this.sectionsStructure[ancoraIndex].divider) {
            if (document.getElementById(this.sectionsStructure[ancoraIndex].name) != null) {
              var { top, bottom } = document.getElementById(this.sectionsStructure[ancoraIndex].name).getBoundingClientRect();
              if ((top > 0 || bottom > 0) && (top < vHeight)) {
                this.sectionsStructure[ancoraIndex].vizColor = 'accent';
              } else {
                this.sectionsStructure[ancoraIndex].vizColor = 'primary lighten-1';
              }
            } else {
              this.sectionsStructure[ancoraIndex].vizColor = 'primary lighten-1';
            }
          }
        }
      },
      setTooltipTitle(base_object_list, rules, structure, addedParams, metadata) {
        if (typeof base_object_list == 'string') {
          this.tooltip[addedParams.id] = base_object_list;
        } else {
          this.tooltip[addedParams.id] = this.replaceArgs(
            structure.template,
            this.indicatorsToValueArray(
              structure.args, 
              this.customFunctions, 
              base_object_list,
              this.sendInvalidInterpol
            ),
            this.sendInvalidInterpol
          );
        }
      },
    }
  }
</script>
  
<style>
  .left_nav {
    position: fixed;
    top: 50%;
    z-index: 101;
    transform: translate(0, -50%);
    width: 1.5em !important;
  }
  .left_nav .v-list {
    background-color: rgba(0,0,0,0) !important;
    border-radius: 0 0.35em 0.35em 0;
  }
  .left_nav .v-list__tile {
    background-color: rgba(0,0,0,0) !important;
    height: 1.5em;
    padding: 0;
  }
  .left_nav i {
    font-size: 12px;
  }
  .left_nav a {
    text-decoration: none;
  }
</style>
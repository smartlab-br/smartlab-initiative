<template>
  <v-flex :class="structure.cls ? structure.cls : 'ma-0 pa-2'">
    <div v-if="errorMessage" class="red--text" v-html="errorMessage" />
    <v-layout v-if="structure.columns" pa-2>
      <v-layout
        v-if="readMoreLimit && !maxedOut"
        column
        pl-0
        py-0
        pb-0
        body-obs
      >
        <div
          v-if="collapsed"
          :class="'d-inline-block '+ structure.cls ? structure.cls : ''"
          :style="$vuetify.breakpoint.mdAndUp ? 'column-gap: 4rem; column-count: '+ structure.columns : ''"
          v-html="finalShortText"
        />
        <div
          v-else
          :class="'d-inline-block '+ structure.cls ? structure.cls : ''"
          :style="$vuetify.breakpoint.mdAndUp ? 'column-gap: 4rem; column-count: '+ structure.columns : ''"
          v-html="finalText"
        />
        <v-container
          v-ripple
          row
          darken-1
          text-xs-right
          pa-0
          class="read-more-less accent--text"
          @click="toggleCollapseExpand"
        >
          <span v-html="cmpTextMoreLess" />
          <v-icon color="primary" :class="assessMoreLess">
            keyboard_arrow_down
          </v-icon>
        </v-container>
      </v-layout>

      <v-layout
        v-else
        :class="'d-inline-block '+ (structure.cls ? structure.cls : 'pl-2 py-0 pb-3')"
        body-obs
      >
        <div
          :style="$vuetify.breakpoint.mdAndUp ? 'column-gap: 4rem; column-count: '+ structure.columns : ''"
          v-html="finalText"
        />
      </v-layout>
    </v-layout>
    <v-layout v-else pa-2>
      <v-layout
        v-if="readMoreLimit && !maxedOut"
        column
        pl-0
        py-0
        pb-0
        body-obs
      >
        <span
          v-if="collapsed"
          :class="'d-inline-block '+ structure.cls ? structure.cls : ''"
          v-html="finalShortText"
        />
        <span
          v-else
          :class="'d-inline-block '+ structure.cls ? structure.cls : ''"
          v-html="finalText"
        />
        <v-container
          v-ripple
          row
          darken-1
          text-xs-right
          pa-0
          class="read-more-less accent--text"
          @click="toggleCollapseExpand"
        >
          <span v-html="cmpTextMoreLess" />
          <v-icon color="primary" :class="assessMoreLess">
            keyboard_arrow_down
          </v-icon>
        </v-container>
      </v-layout>

      <v-layout
        v-else
        :class="'d-inline-block '+ (structure.cls ? structure.cls : 'pl-2 py-0 pb-3')"
        body-obs
      >
        <span v-html="finalText" />
      </v-layout>
    </v-layout>
  </v-flex>
</template>

<script>
export default {
  props: ['structure', 'customParams', 'customFunctions', 'readMoreLimit',
    'reactiveFilter'],
  data () {
    return {
      finalText: '',
      finalShortText: '',
      collapsed: true,
      maxedOut: false
    }
  },
  computed: {
    cmpTextMoreLess: function () {
      return this.collapsed ? 'Leia mais' : 'Leia menos'
    },
    assessMoreLess: function () {
      return this.collapsed ? 'more' : 'less'
    }
  },
  watch: {
    reactiveFilter: function (newVal, oldVal) {
      if (newVal != oldVal && this.structure.reactive) {
        this.fillDataStructure(
          this.structure, this.customParams,
          this.customFunctions, this.setTextContent,
          {
            react: newVal,
            msgError: 'Falha ao carregar dados do componente texto'
          }
        )
      }
    }
  },
  created () {
  },
  mounted: function () {
    this.fillDataStructure(
      this.structure, this.customParams,
      this.customFunctions, this.setTextContent,
      { msgError: 'Falha ao carregar dados do componente texto' }

    )
  },
  methods: {
    sendInvalidInterpol () {
      this.$emit('invalidateInterpol', {})
    },

    // Cálculo do texto reduzido (leia mais)
    buildShortText (fullText) {
      if (this.readMoreLimit) {
        if (fullText.length <= parseInt(this.readMoreLimit)) {
          this.maxedOut = true
        } else {
          const endCharRegex = /[.,!?;& [:space:]](?!.*[.,!?;& [:space:]])/g
          endCharRegex.exec(fullText.substring(0, this.readMoreLimit))
          this.finalShortText = this.finalText.substring(0, endCharRegex.lastIndex)
        }
      }
    },

    toggleCollapseExpand () {
      this.collapsed = !this.collapsed
    },

    setTextContent (base_object_list, rules, structure, metadata) {
      if (typeof base_object_list === 'string') {
        this.finalText = base_object_list
        this.buildShortText(base_object_list)
      } else {
        const finalText = this.$textTransformService.replaceArgs(
          structure.template,
          this.$indicatorsModel.indicatorsToValueArray(
            rules,
            this.customFunctions,
            base_object_list,
            this.sendInvalidInterpol
          ),
          this.sendInvalidInterpol
        )
        this.finalText = finalText
        this.buildShortText(finalText)
      }
    }
  }
}
</script>

<style>
  .read-more-less {
    cursor: pointer;
  }

  .read-more-less .v-icon {
    /* Firefox */
    -moz-transition: all 1s ease;
    /* WebKit */
    -webkit-transition: all 1s ease;
    /* Opera */
    -o-transition: all 1s ease;
    /* Standard */
    transition: all 1s ease;
  }

  .read-more-less .v-icon.more {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  .read-more-less .v-icon.less {
    -webkit-transform: rotate(180deg);
    transform: rotate(180deg);
  }
</style>

<script>
export default {
  props: ['id', 'structure', 'customParams', 'customFunctions', 'immediate', 'reactiveFilter', 'reactiveParent'],
  data () {
    return {
      items: [],
      target: null,
      errorMessage: null
    }
  },
  watch: {
    reactiveFilter: function (newVal, oldVal) {
      if (this.reactiveParent.includes(this.structure.parent) && newVal != oldVal) {
        if (newVal == null || newVal == undefined || Object.values(newVal)[0] == 'empty') {
          this.fillDataStructure(
            this.structure, this.customParams,
            this.customFunctions, this.toItems
          )
        } else {
          this.fillDataStructure(
            this.structure, this.customParams,
            this.customFunctions, this.toItems,
            { react: newVal }
          )
        }
      }
    }
  },
  created () {
    this.fillDataStructure(
      this.structure, this.customParams,
      this.customFunctions, this.toItems
    )
    if (this.structure && this.structure.target) {
      this.target = this.structure.target
    }
  },
  methods: {
    toItems (dataset, rules, structure, addedParams, metadata) {
      for (const rowIndx in dataset) {
        this.toItem(dataset[rowIndx], rules)
      }
    },

    toItem (eachRow, rules) {
      const eachItem = eachRow
      for (const ruleIndx in rules) {
        if (rules[ruleIndx].fixed !== null && rules[ruleIndx].fixed !== undefined) {
          eachItem[rules[ruleIndx].prop] = rules[ruleIndx].fixed
        } else if (rules[ruleIndx].named_prop !== null && rules[ruleIndx].named_prop !== undefined) {
          let value = eachRow[rules[ruleIndx].named_prop]
          if (rules[ruleIndx].null_value && (value == 'null' || value == null || value == '')) {
            value = rules[ruleIndx].null_value
          }
          eachItem[rules[ruleIndx].prop] = value
        } else if (rules[ruleIndx].function) {
          eachItem[rules[ruleIndx].prop] = this.$objectTrandformService.runNamedFunction(rules[ruleIndx], eachRow, this.customFunctions)
        } else if (rules[ruleIndx].template) {
          eachItem[rules[ruleIndx].prop] = this.$textTransformService.applyInterpol(
            rules[ruleIndx],
            this.customParams,
            this.customFunctions,
            eachRow,
            this.sendInvalidInterpol
          )
        }
      }
      this.items.push(eachItem)
    },

    sendSelection () {
      if (this.immediate == null || this.immediate == undefined || this.immediate) {
        this.$emit(
          this.structure.selection.event,
          {
            id: this.id,
            item: this.chosen,
            type: this.structure.type,
            rules: this.structure.selection.rules,
            target: this.target
          }
        )
      }
    },

    sendDefaultSelection () {
      if (this.immediate == null || this.immediate == undefined || this.immediate) {
        this.$emit(
          'default-selection',
          {
            id: this.id,
            item: this.chosen,
            type: this.structure.type,
            rules: this.structure.selection.rules,
            target: this.target
          }
        )
      }
    }

  }
}
</script>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from "vue"
import { TextTransformService } from "~/utils/service/singleton/textTransform"
import { basicFunctions } from "~/utils/basicFunctions"

const textTransformService = new TextTransformService()

export default defineComponent({
  props: {
    id: String,
    structure: Object,
    customParams: Object,
    immediate: {
      type: Boolean,
      default: true
    },
    reactiveFilter: [Object, Array],
    reactiveParent: Array
  },
  setup(props, { emit }) {
    const items = ref<any[]>([])
    const target = ref<any>(null)
    const errorMessage = ref<string | null>(null)
    const { $fillDataStructure } = useNuxtApp()

    const toItems = (dataset: any, rules: any, _preloaded: any, _addedParams: any = null, _metadata: any = null)  => {
      for (const row of dataset) {
        toItem(row, rules)
      }
    }

    const toItem = (eachRow: any, rules: Arg[]) => {
      const eachItem = eachRow
      rules.forEach(rule => {
        let currItem = eachItem[rule.prop as keyof typeof eachItem]
        if (rule.fixed !== null && rule.fixed !== undefined) {
          currItem = rule.fixed
        } else if (rule.named_prop !== null && rule.named_prop !== undefined) {
          let value = eachRow[rule.named_prop]
          if (rule.null_value && (value === "null" || value === null || value === "")) {
            value = rule.null_value
          }
          currItem = value
        } else if (rule.function) {
          currItem= basicFunctions[rule.function as keyof typeof basicFunctions](eachRow)
        } else if (rule.template) {
          currItem = textTransformService.applyInterpol(
            rule,
            props.customParams,
            eachRow,
            () => { emit("sendInvalidInterpol")}
          )
        }
      })
      items.value.push(eachItem)
    }

    const sendSelection = () => {
      if (props.immediate) {
        emit(props.structure?.selection.event, {
          id: props.id,
          item: items.value,
          type: props.structure?.type,
          rules: props.structure?.selection.rules,
          target: target.value
        })
      }
    }

    const sendDefaultSelection = () => {
      if (props.immediate) {
        emit("default-selection", {
          id: props.id,
          item: items.value,
          type: props.structure?.type,
          rules: props.structure?.selection.rules,
          target: target.value
        })
      }
    }

    // Watch para reactiveFilter
    watch(
      () => props.reactiveFilter,
      (newVal, oldVal) => {
        if (props.reactiveParent?.includes(props.structure?.parent) && newVal !== oldVal) {
          if (!newVal || Object.values(newVal)[0] === "empty") {
            $fillDataStructure(props.structure, props.customParams, toItems)
          } else {
            $fillDataStructure(props.structure, props.customParams, toItems, { react: newVal })
          }
        }
      }
    )

    // onMounted para inicializar a estrutura de dados
    onMounted(() => {
      $fillDataStructure(props.structure, props.customParams, toItems)
      if (props.structure?.target) {
        target.value = props.structure.target
      }
    })

    return {
      items,
      target,
      sendSelection,
      sendDefaultSelection,
      errorMessage
    }
  }
})
</script>

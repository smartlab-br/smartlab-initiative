
<script lang="ts">
import { TextTransformService } from "~/utils/service/singleton/textTransform"
const textTransformService = new TextTransformService()

export default defineComponent({
  props: {
    structure: Object,
    customParams: Object,
    topology: Object,
    sectionIndex: Number,
  },
  setup(props, { emit }) {
    // Arrow function para o método setComplexAttribute
    const setComplexAttribute = (dataset: Record<string, any> | string, _rules: Record<string, any>, structure:Record<string, any>, addedParams?: Record<string, any> | string, _metadata?: Record<string, any>) => {
      if (typeof dataset === "string") {
        addedParams = dataset
      } else {
        let base_object = {}
        if (Array.isArray(dataset) && dataset.length === 1) {
          base_object = dataset[0]
        } else if (dataset !== null && dataset !== undefined) {
          base_object = dataset
        }

        // Aplicação de interpolação usando um serviço que está disponível no contexto
        addedParams = textTransformService.applyInterpol(
          structure,
          props.customParams,
          base_object,
          sendInvalidInterpol // Emitindo o evento ou chamando uma função de callback
        )
      }
    }

    // Supondo que `sendInvalidInterpol` é uma função ou evento emitido
    const sendInvalidInterpol = () => {
      emit("sendInvalidInterpol")
    }

    return {
      setComplexAttribute,
      sendInvalidInterpol,
    }
  },
})
</script>

<style scoped>
.leaflet-container {
  font-family: Palanquin, Calibri, sans-serif !important;
}
.leaflet-interactive {
  cursor: pointer;
}
</style>

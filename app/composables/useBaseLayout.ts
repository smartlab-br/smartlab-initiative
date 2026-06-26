import { unref } from 'vue'
import { TextTransformService } from "~/utils/service/singleton/textTransform"

export function useBaseLayout(customParams: any, emit: any) {
  const textTransformService = new TextTransformService()

  /**
   * Callback genérico para $fillDataStructure que resolve um valor interpolado
   * e o escreve em um ref.
   *
   * addedParams esperados:
   *   - attribute    : nome da chave em attribRefs
   *   - attribRefs   : objeto com os refs { [attribute]: Ref }
   *   - key?         : quando presente, escreve em ref.value[key] (dict refs)
   *   - fallback?    : valor usado quando o interpol retorna resultado vazio
   */
  const setComplexAttribute = (
    dataset: Record<string, any> | string,
    _rules: Record<string, any>,
    structure: Record<string, any>,
    addedParams?: Record<string, any> | string,
    _metadata?: Record<string, any>
  ) => {
    if (typeof addedParams === "object" && addedParams.attribute) {
      const attribRef = addedParams.attribRefs[addedParams.attribute]

      let resolved: string | null = null

      if (typeof dataset === "string") {
        resolved = dataset
      } else {
        let base_object = {}
        if (Array.isArray(dataset) && dataset.length === 1) {
          base_object = dataset[0]
        } else if (dataset !== null && dataset !== undefined) {
          base_object = dataset
        }
        resolved = textTransformService.applyInterpol(
          structure,
          unref(customParams),
          base_object,
          () => emit("sendInvalidInterpol")
        )
      }

      if (!resolved && addedParams.fallback !== undefined) {
        resolved = addedParams.fallback
      }

      if (addedParams.key !== undefined) {
        attribRef.value[addedParams.key] = resolved
      } else {
        attribRef.value = resolved
      }
    }
  }

  return {
    setComplexAttribute
  }
}

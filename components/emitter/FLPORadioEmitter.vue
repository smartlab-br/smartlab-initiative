<template>
  <v-container>
    <v-radio-group
      v-model="chosen"
      class="pa-0"
      hide-details
    >
      <v-radio
        v-for="item in structure.items"
        :key="item.id"
        :color="item.color ? item.color : 'accent'"
        :value="item.value"
        @change="toggleRadio(item)"
      >
        <template #label>
          <v-row align="center">
            <v-col ><span v-html="item.label ? item.label : ''"></span></v-col>
            <v-col>
              <FLPOMinicard
                v-for="(miniCard, index) in item.minicards"
                :key="index"
                :structure="miniCard"
                :custom-functions="customFunctions"
                :custom-params="customParams"
                row-class="pa-1"
              />
            </v-col>
          </v-row>
        </template>
      </v-radio>
    </v-radio-group>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue"
import { useEmitter } from "~/composables/useEmitter"
import FLPOMinicard from "~/components/cards/content/FLPOMinicard.vue"

export default defineComponent({
  components: { FLPOMinicard },
  props: {
    structure: {
      type: Object,
      required: true
    },
    customFunctions: {
      type: Object,
      default: () => ({})
    },
    customParams: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { emit }) {
    const chosen = ref(props.structure.items[0].value)
    const selection = ref<Record<string, boolean>>({})

    const { toItem } = useEmitter(props, emit)

    onMounted(() => {
      chosen.value = props.structure.items[0].value
    })

    const toggleRadio = (chosenItem: any) => {
      props.structure.items.forEach((item: any) => {
        selection.value[item.value] = item.value === chosenItem.value
      })

      emit(
        props.structure.event ? props.structure.event : props.structure.selection?.event,
        {
          id: props.structure.id,
          type: "radio",
          enabled: selection.value,
          item: chosenItem,
          rules: props.structure.selection ? props.structure.selection.rules : null
        }
      )
    }

    return {
      chosen,
      selection,
      toggleRadio,
      toItem
    }
  }
})
</script>

<style scoped>
</style>

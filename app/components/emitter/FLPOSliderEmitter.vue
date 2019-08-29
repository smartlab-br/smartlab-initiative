<template>
  <v-flex px-3 pt-4>

    <v-range-slider v-if="structure.range"
      v-model="value"
      thumb-color="primary"
      color="accent"
      always-dirty
      thumb-label="always"
      :step="step"
      :min="min" 
      :max="max"
      @change="sendSelection">
    </v-range-slider>
      
    <v-slider v-else
      v-model="value"
      thumb-color="primary"
      color="accent"
      thumb-label="always"
      always-dirty
      :tick-labels="items"
      :step="step"
      :min="min" 
      :max="max"
      @change="sendSelection"
      class="slider-no-tick-mark">
    </v-slider>
  </v-flex>
</template>

<script>
  import FLPOBaseEmitter from '../FLPOBaseEmitter.vue';

  export default {
    extends: FLPOBaseEmitter,
    data () {
      return {
        value: 0,
        step: 1,
        min: 0,
        max: 0
      }
    },
    created () {
      if (this.structure.range){
        this.value = [this.min, this.max];
      } else {
        this.value = this.max;
      }
    },
    methods: {
      toItems(dataset, rules, structure, addedParams, metadata) {
        for (let rule of rules) {
          if (rule.fixed !== null && rule.fixed !== undefined) {
            this[rule.prop] = rule.fixed;
          } else if (rule.named_prop !== null && rule.named_prop !== undefined) {
            this[rule.prop] = dataset[0][rule.named_prop];
          } else if (rule.function) {
            this[rule.prop] = this.$objectTransformService.runNamedFunction(rule, dataset[0], this.customFunctions);
          }
        }

        if (this.structure.range){
          this.value = [this.min, this.max];
        } else { //mostra ticks labels min e max      
          this.items.push(this.min);
          let emptyThicks = parseInt((parseInt(this.max) - parseInt(this.min))/parseInt(this.step)) - 1
          this.items.push.apply(this.items,Array(emptyThicks).fill(""));
          this.items.push(this.max);
          // se tiver valor default - executa filtro
          if (structure.default != null &&  structure.default != undefined) {
            this.value = structure.default;
            this.sendDefaultSelection();
          } else {
            this.value = this.max;
          }
        }

      },

      sendSelection() {
          this.$emit(
            this.structure.selection.event,
            { id: this.id, value: this.value, type: this.structure.type,
              rules: this.structure.selection.rules
            }
          );
      },

      sendDefaultSelection() {
          this.$emit(
            "default-selection",
            { id: this.id, value: this.value, type: this.structure.type,
              rules: this.structure.selection.rules
            }
          );
      },

      

    }
  }
</script>

<style>
.v-input--range-slider span {
  color: #fff !important;
}

.v-slider__thumb-label span {
  color: #fff !important;
}

.slider-no-tick-mark .v-slider__ticks {
  border-color: transparent !important;
}
</style>

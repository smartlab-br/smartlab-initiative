import Vue from 'vue'
import Vuex from 'vuex'

import Dimension from 'plugins/model/dimensions'

export const state = () => ({
  dimensions: null as unknown as Dimension[],
  currentDimension: null as unknown as Dimension
})

export const mutations = {
    setDimensions(state: any, idObs: string) {
        Dimension.findByObservatory(idObs)
            .then((data) => {
                state.dimensions = data
            })
    },
    setCurrentDimension(state: any, id: string) {
        for (const dim of state.dimensions) {
            if (dim.id == id) {
                state.currentDimension = dim;
                return
            }
        }
        if (state.dimensios.length > 0) state.currentDimension = state.dimensions[0];
    },
}
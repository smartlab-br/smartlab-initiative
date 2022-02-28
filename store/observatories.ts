import Vue from 'vue'
import Vuex from 'vuex'

import { Observatories, Observatory, ObservatoriesSection } from "plugins/model/observatories"

export const state = () => ({
  observatories: null as unknown as Observatory[],
  currentObservatory: null as unknown as Observatory,
  observatoriesSections: null as unknown as ObservatoriesSection[]
})

export const mutations = {
    populateObservatories(state: any) {
        Observatories.findAll()
            .then((data) => {
                state.observatories = data.observatories
                state.observatoriesSections = data.sections
            })
    },
    setCurrentObservatory(state: any, id: string) {
        for (const obs of state.observatories) {
            if (obs.id == id) {
                state.currentDimension = obs;
                return
            }
        }
        if (state.observatories.length > 0) state.currentObservatory = state.observatories[0];
    },
}
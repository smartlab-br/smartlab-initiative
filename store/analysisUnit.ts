import Vue from 'vue'
import Vuex from 'vuex'

import { AnalysisUnit } from "plugins/model/analysisUnit"

export const state = () => ({
    analysisUnits: null as unknown as AnalysisUnit[],
    currentAnalysisUnit: null as unknown as AnalysisUnit
})

export const mutations = {
    populateAnalysisUnits(state: any) {
        state.analysisUnits = AnalysisUnit.buildAllSearchOptions()
    },
    populateAnalysisUnit(state: any) {
        state.currentAnalysisUnit = Vue.prototype.$cookies.get("currentAnalysisUnit")
    },
    setCurrentAnalysisUnit(state: any, id: string) {
        Vue.prototype.$cookies.set("currentAnalysisUnit", id, -1); // Never expires
        state.currentAnalysisUnit = id;
    },    
    isAnalysisUnitCurrent(state: any, id: string) {
        if (state.currentAnalysisUnit) return id == state.currentAnalysisUnit
        return id == Vue.prototype.$cookies.get("currentAnalysisUnit");
    }
}

export const getters = {
    getTotalMunicipios(state: any) {
        return state.analysisUnits.filter(
            (au: AnalysisUnit) => { return au.type == "place" && au.scope == "mun" }
        ).length
    },
    
    getTotalMunicipiosPorUF(state: any, uf: string) {
        return state.analysisUnits.filter(
            (au: AnalysisUnit) => { return au.type == "place" && au.scope == "uf" && au.id == uf }
        ).length
    },
    
    findAllUF(state: any) {
        return state.analysisUnits.filter(
            (au: AnalysisUnit) => { return au.type == "place" && au.scope == "uf" }
        )
    },

    findMPTUnidadeByID(state: any, id: string) {
        return state.analysisUnits.filter(
            (au: AnalysisUnit) => { return au.type == "mpt" && au.scope == "unidade" }
        )
    },

    findPlaceByID(state: any, id: string | number) {
        if (!id) return;
    
        if (id == 0){ //Brasil
            return state.analysisUnits.filter(
                (au: AnalysisUnit) => { return au.type == "place" && au.scope == "br" && au.id == 0 }
            )
        }
        
        let scope: string
        switch (id.toString().length) {
            case 1: { // Região
                scope = "reg"
            }
            case 2: { // Estado
                scope = "uf"
            }
            case 4: { // Mesorregião
                scope = "meso"
            }
            case 4: { // Microrregião
                scope = "micro"
            }
            default: { // Município
                scope = "mun"
            }
        }

        return state.analysisUnits.filter(
            (au: AnalysisUnit) => { return au.type == "place" && au.scope == scope && au.id == 0 }
        )
      }

}
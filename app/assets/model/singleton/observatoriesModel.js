import colors from 'vuetify/es5/util/colors'
import YamlFetcherService from '../../service/singleton/yamlFetcher'
import Vue from 'vue';

class ObservatoriesModel {
    observatoriesSearchOptions = [
        { id: 'td', app_icon: 'td', title: 'Trabalho<br/>Decente',
            to: '/trabalhodecente', external: false,
            rippleColor: 'grey--text darken-3',
            color: "grey--text darken-4", textColor: "grey--text darken-4" },
        { id: 'te', app_icon: 'coord-02', title: 'Trabalho<br/>Escravo',
            to: '/trabalhoescravo', external: false,
            rippleColor: 'brown--text darken-3',
            color: colors.grey.darken3, textColor: "grey--text darken-3" },
        { id: 'sst', app_icon: 'coord-01', title: 'Saúde e<br/>Segurança',
            to: '/sst', external: false,
            rippleColor: 'teal--text darken-3',
            color: colors.teal.darken4, textColor: "teal--text darken-4" },
        { id: 'ti', app_icon: 'coord-07', title: 'Trabalho<br/>Infantil',
            to: '/trabalhoinfantil', external: false,
            rippleColor: 'indigo--text darken-3',
            color: colors.indigo.darken3, textColor: "indigo--text darken-3" },
        { id: 'des', app_icon: 'coord-06', title: 'Diversidade<br/>no Trabalho',
            to: '/diversidade', external: false,
            rippleColor: 'deep-purple--text darken-2',
            color: colors.deepPurple.darken4, textColor: "deep-purple--text darken-4" }
    ];

    constructor() {
        this.isLoading = true;
        YamlFetcherService.loadYaml("br/observatorios", this.setObservatories, this);
    }

    setObservatories(content, context) {
        context.observatories = content.observatorios;
        context.isLoading = false;

        //Vue.set(Vue.prototype.$observatories, 'observatories', content.observatorios);
        //Vue.set(Vue.prototype.$observatories, 'isLoading', false);
        
        // Vue.prototype.$observatories.observatories = content.observatorios;
        // Vue.prototype.$observatories.isLoading = false;
    }

    getObservatories() {
        if (!this.observatories && !this.isLoading) { // Start loading only once
            this.isLoading = true;
            YamlFetcherService.loadYaml("br/observatorios", this.setObservatories);
        }
    }
    
    getObservatoryById(id) {
        if (this.observatories && !this.isLoading) {
            for (let item of this.observatories) {
                if (item.id == id) return item;
            }
        }
        return null;
    }

    getObservatoriesSearchOptions() {
        return this.observatoriesSearchOptions;
    }
}

export default ObservatoriesModel;
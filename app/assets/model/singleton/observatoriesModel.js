import colors from 'vuetify/es5/util/colors'
import YamlFetcherService from '../../service/singleton/yamlFetcherService'
import ColorsService from '../../service/singleton/colorsService';

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
        //this.colorsService = new ColorsService();
    }

    setStore(store) {
        this.store = store;
        this.yamlFetcher = new YamlFetcherService(store);
    }

    setObservatories(content) {
        this.observatories = content.observatorios;
        return this.observatories;
    }

    getObservatories() {
        if (this.observatories == null && this.observatories == undefined) { // Start loading only once
            return this.yamlFetcher.loadYaml("br/observatorios")
                .then((result) => { 
                    return this.setObservatories(result);
                });
        } else {
            return this.observatories;
        }
    }
    
    getObservatoryById(id) {
        if (this.observatories) {
            for (let item of this.observatories) {
                if (item.id == id) return item;
            }
        }
        return null;
    }

    static identifyObservatory(route) {
        if (route.includes('trabalhodecente')) return 'td';
        if (route.includes('diversidade')) return 'des';
        if (route.includes('trabalhoescravo')) return 'te';
        if (route.includes('trabalhoinfantil')) return 'ti';
        if (route.includes('sst')) return 'sst';
        return;
    }

    // Mapeamento dos IDs para os observatorios
    static identifyObservatoryById(idObservatorio) {
        switch (idObservatorio){
            case 'td':
            return 'trabalhodecente';
            case 'des':
            return 'diversidade';
            case 'te':
            return 'trabalhoescravo';
            case 'ti':
            return 'trabalhoinfantil';
            case 'sst':
            return 'sst';
        }
    } 

    getObservatoriesSearchOptions() {
        return this.observatoriesSearchOptions;
    }

    getTheme(observatorio) {
        return ColorsService.getThemeFromId(observatorio);
    }
}

export default ObservatoriesModel;
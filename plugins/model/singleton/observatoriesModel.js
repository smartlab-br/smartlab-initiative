
// import YamlFetcherService from '../../service/singleton/yamlFetcherService'
// import ColorsService from '../../service/singleton/colorsService';

export class ObservatoriesModel {

    constructor(context) {
        this.context = context;
    }

    setObservatories(content) {
        this.observatories = content.observatorios;
        return this.observatories;
    }

    setBackgroundImages(content) {
        this.background_images = content.background_images;
        return this.background_images;
    }

    setSections(content) {
        this.sections = content.secoes;
        return this.sections;
    }

    getBackgroundImages() {
        if (this.background_images == null && this.background_images == undefined) { // Start loading only once
            return this.context.$yamlFetcherService.loadYaml("br/observatorios")
                .then((result) => { 
                    return this.setBackgroundImages(result);
                });
        } else {
            return this.background_images;
        }
    }

    getObservatories() {
        if (this.observatories == null && this.observatories == undefined) { // Start loading only once
            return this.context.$yamlFetcherService.loadYaml("br/observatorios")
                .then((result) => { 
                    return this.setObservatories(result);
                });
        } else {
            return this.observatories;
        }
    }

    getSections() {
        if (this.section == null && this.section == undefined) { // Start loading only once
            return this.context.$yamlFetcherService.loadYaml("br/observatorios")
                .then((result) => { 
                    return this.setSections(result);
                });
        } else {
            return this.sections;
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

    identifyObservatory(route) {
        if (route.includes('trabalhodecente')) return 'td';
        if (route.includes('diversidade')) return 'des';
        if (route.includes('trabalhoescravo')) return 'te';
        if (route.includes('trabalhoinfantil')) return 'ti';
        if (route.includes('sst')) return 'sst';
        if (route.includes('covid')) return 'cov';
        return null;
    }

    // Mapeamento dos IDs para os observatorios
    identifyObservatoryById(idObservatorio) {
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
            case 'cov':
            return 'covid';
        }
    } 

    getTheme(observatorio) {
        return this.context.$colorsService.getThemeFromId(observatorio);
    }
}

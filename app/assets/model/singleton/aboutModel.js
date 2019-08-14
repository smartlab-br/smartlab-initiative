import YamlFetcherService from '../../service/singleton/yamlFetcher'

class AboutModel {
    constructor(content) { }

    setAbout(content) {
        this.about = content;
        return this.about;
    }

    getAbout() {
        if (this.about == null && this.about == undefined) { // Start loading only once
            return YamlFetcherService.loadYaml("br/about")
                .then((result) => { return this.setAbout(result); });
        } else {
            return this.about;
        }
    }

    getPlatform() {
        return this.about.plataforma.sections;
    }
    getHistory() {
        return this.about.history.sections[0].list;
    }
    getPartners() {
        return this.about.parceiros.sections[0].list;
    }
}

export default AboutModel;
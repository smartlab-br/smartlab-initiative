import YamlFetcherService from '../../service/singleton/yamlFetcher'

class AboutModel {
    constructor(content) { }

    setAbout(content) {
        this.about = content;
        this.isLoading = false;
        return this.about;
    }

    getAbout() {
        if ((this.about == null && this.about == undefined) && !this.isLoading) { // Start loading only once
            this.isLoading = true;
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
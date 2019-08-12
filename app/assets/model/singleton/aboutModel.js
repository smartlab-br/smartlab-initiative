import YamlFetcherService from '../../service/singleton/yamlFetcher'

class AboutModel {
    constructor(content) {
        if (content) {
            this.observatories = content;
        } else {
            this.isLoading = true;
            YamlFetcherService.loadYaml("br/about", this.setAbout, this);
        }
    }

    setAbout(content, context) {
        context.about = content;
        context.isLoading = false;
    }

    getAbout() {
        if (!this.about && !this.isLoading) { // Start loading only once
            this.isLoading = true;
            YamlFetcherService.loadYaml("br/about", this.setAbout, this);
        }
    }

    getFullAbout() {
        return this.about;
    }
    getAbout() {
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
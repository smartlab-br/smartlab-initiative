import { YamlFetcherService } from 'plugins/service/viewconf'

class AboutGroup {
    tab: string
    title: string
    sections: AboutSection[]

    constructor(data: any) {
        this.tab = data.tab
        this.title = data.title
        this.sections = data.sections
    }
}    
class AboutSection {
    title: string
    type: string
    content?: string
    list_height?: string
    list?: AboutList[]

    constructor(data: any) {
        this.title = data.title
        this.type = data.type
        this.content = data.content
        this.list_height = data.list_height
        this.list = data.list
    }
}
class AboutList{
    name: string
    values?: string[]
    avatar?: string

    constructor(data: any) {
        this.name = data.name
        this.values = data.values
        this.avatar = data.avatar
    }
}

interface IDictAboutGroup {
    [key: string]: AboutGroup;
}
class About {
    content: IDictAboutGroup
    constructor(content: any) {
        this.content = content
    }

    static findContent() {
        YamlFetcherService.loadYaml("br/about")
            .then((result) => { return new About(result) });
    }

    getPlatform() {
        return this.content.plataforma.sections;
    }
    getHistory() {
        return this.content.history.sections[0].list;
    }
    getPartners() {
        return this.content.parceiros.sections[0].list;
    }
}

export default About;
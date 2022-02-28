
import { YamlFetcherService } from 'plugins/service/viewconf'
import { ColorsService } from 'plugins/service/colors'

class Observatory {
    id: string
    blocked: boolean
    title: string
    short_title: string
    short_desc: string
    tooltip: string
    hash_tag: string
    to: string
    external: boolean
    app_icon: string
    rippleColor: string
    section_title?: string
    section_description: string
    section_image: string
    headerClass?: string
    tagColor?: string
    status?: string
    media?: string
    themeColor?: string
    btnColor?: string

    constructor(data: any) {
        this.id = data.id
        this.blocked = data.blocked
        this.title = data.title
        this.short_title = data.short_title
        this.short_desc = data.short_desc
        this.tooltip = data.tooltip
        this.hash_tag = data.hash_tag
        this.to = data.to
        this.external = data.external
        this.app_icon = data.app_icon
        this.rippleColor = data.rippleColor
        this.section_title = data.section_title
        this.section_description = data.section_description
        this.section_image = data.section_image
        this.headerClass = data.headerClass
        this.tagColor = data.tagColor
        this.status = data.status
        this.media = data.media
        this.themeColor = data.themeColor
        this.btnColor = data.btnColor
    }
}
class ObservatoriesSection {
    id: string
    title: string
    description: string
    cls?: string
    complement: ObservatoriesSectionComplement

    constructor(data: any) {
        this.id = data.id
        this.title = data.title
        this.description = data.description
        this.cls = data.cls
        this.complement = data.complement
    }
}
class ObservatoriesSectionComplement {
    cls: string
    images?: ObservatoriesSectionComplementImages
    minicards?: ObservatoriesSectionComplementMinicards[]

    constructor(data: any) {
        this.cls = data.cls
        this.images = data.images
        this.minicards = data.minicards
    }
}
class ObservatoriesSectionComplementMinicards {
    relevance: string
    cls: string
    rowClass?: string
    preloaded?: ObservatoriesSectionComplementMinicardsPreloaded
    args?: ObservatoriesSectionComplementMinicardsArgs[] 

    constructor(data: any) {
        this.relevance = data.relevance
        this.cls = data.cls
        this.rowClass = data.rowClass
        this.preloaded = data.preloaded
        this.args = data.args
    }
}
class ObservatoriesSectionComplementMinicardsPreloaded {
    prop: string
    function: string
    id: "06_05_10_00"
    year: "max"

    constructor(data: any) {
        this.prop = data.prop
        this.function = data.function
        this.id = data.id
        this.year = data.year
    }
}
class ObservatoriesSectionComplementMinicardsArgs {
    prop?: string
    named_prop?: string
    fixed?: string
    format?: string
    collapse?: ObservatoriesSectionComplementMinicardsArgs
    args?: ObservatoriesSectionComplementMinicardsArgs[]

    constructor(data: any) {
        this.prop = data.prop
        this.named_prop = data.named_prop
        this.fixed = data.fixed
        this.format = data.format
        this.collapse = data.collapse
        this.args = data.args
    }
}
class ObservatoriesSectionComplementImages {
    id: string
    url: string
    link_disabled?: boolean
    tag?: IDictObservatoriesSectionComplementImagesTags
    width?: string

    constructor(data: any) {
        this.id = data.id
        this.url = data.url
        this.link_disabled = data.link_disabled
        this.tag = data.tag
        this.width = data.width
    }
}
interface IDictObservatoriesSectionComplementImagesTags {
    [key: string]: string
}

class Observatories {
    observatories: Observatory[]
    background_images: string[]
    sections: ObservatoriesSection[]
    constructor(data: any) {
        this.observatories = data.observatorios
        this.background_images = data.background_images
        this.sections = data.secoes;
    }

    static async findAll() {
        let ymlData = await YamlFetcherService.loadYaml("br/observatorios")
        return new Observatories(ymlData)
    }
    
    getObservatoryById(id: string) {
        if (this.observatories) {
            for (let item of this.observatories) {
                if (item.id == id) return item;
            }
        }
        return null;
    }

    static identifyObservatory(route: string) {
        if (route.includes('trabalhodecente')) return 'td';
        if (route.includes('diversidade')) return 'des';
        if (route.includes('trabalhoescravo')) return 'te';
        if (route.includes('trabalhoinfantil')) return 'ti';
        if (route.includes('sst')) return 'sst';
        if (route.includes('covid')) return 'cov';
        return null;
    }

    // Mapeamento dos IDs para os observatorios
    static identifyObservatoryById(idObservatorio: string) {
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

    static getTheme(observatorio: string) {
        return ColorsService.getThemeFromId(observatorio);
    }
}

export {
    Observatories,
    Observatory,
    ObservatoriesSection
}
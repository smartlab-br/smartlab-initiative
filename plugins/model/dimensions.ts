import { YamlFetcherService } from "plugins/service/viewconf"

class Dimension {
    label: string
    title: string
    detail: string
    to: string
    id: string
    icon: string
    short_desc: string
    description: string
    type: string
    media: string
    default?: boolean
    blocked?: boolean
    tagColor?: string
    status?: string
    
    constructor(obj: any) {
        this.label = obj.label
        this.title = obj.title
        this.detail = obj.detail
        this.to = obj.to
        this.id = obj.id
        this.icon = obj.icon
        this.short_desc = obj.short_desc
        this.description = obj.description
        this.type = obj.type
        this.media = obj.media
        this.default = obj.default
        this.blocked = obj.blocked
        this.tagColor = obj.tagColor
        this.status = obj.status
    }

    static async findByObservatory(idObservatorio: string | null = null) {
        let source: string = "br/dimensao/base"
        if (idObservatorio) {
            source = `br/dimensao/${idObservatorio}`
        } 
        let dimensoes = await YamlFetcherService.loadYaml(source)
        return dimensoes as Dimension[];
    }
    
    static async findDimensionByObservatoryAndId(obs: string, id: string | null = null) {
        let dimensoes = await YamlFetcherService.loadYaml(`br/dimensao/${obs}`)
        for (let dim of dimensoes) {
            if ((!id && dim.default) || (dim.id == id)) return dim as Dimension
        }
        return null
    }
}

export default Dimension
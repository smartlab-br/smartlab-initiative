// This is the current yaml structure, to be referenced by the platform while rewriting using typescript
class DimensionView {
    principais: ViewDefinition[]
    secoes: DimensionViewSecao[]
}

class ViewDefinition {
    id: string
    type: string
    title: ViewDefinitionArg
    title_comment: ViewDefinition
    info: DimensionViewSecaoCardDescription[]
    description: DimensionViewSecaoCardDescription[]
    chart_type: string 
    charts: DimensionViewSecaoCardCharts[]
    preloaded!: ViewDefinitionPreloaded
    args!: ViewDefinitionArg[]
    relevance!: string
    cls!: string
    rowClass!: string
    api!: ViewDefinitionArg
    api_reactive!: ViewDefinitionArg
    apiBase!: ViewDefinitionArg
    chart_options!: DimensionViewSecaoCardChartsOptions
    template!: string
}

class ViewDefinitionPreloaded {
    prop: string
    function: string
    id: string | string[]
    year: string
    options!: ViewDefinitionPreloadedOptions
}

class ViewDefinitionPreloadedOptions {
    calcs: ViewDefinitionPreloadedOptionsCalc[]
    formatters: ViewDefinitionArg[]
}

class ViewDefinitionPreloadedOptionsCalc {
    id: string
    function: string
    fn_args!: ViewDefinitionArg[]
}

class ViewDefinitionArg {
    id!: string
    fixed!: string
    prop!: string
    named_prop!: string
    format!: string
    template!: string
    default!: string
    precision!: number
    multiplier!: number
    args!: ViewDefinitionArg[]
}

class DimensionViewSecao {
    id: string
    name: string
    cards: ViewDefinition[]
}

class DimensionViewSecaoCardDescription {
    id!: string
    type: string
    cards!: ViewDefinition[]
    title!: string
    content!: ViewDefinitionArg
    label!: string
    clearable!: boolean
    default!: string | number | boolean
    range!: boolean
    api!: ViewDefinitionArg
    args!: ViewDefinitionArg[]
    selection!: DimenstionViewSecaoCardDescriptionSelection
    target!: DimensionViewSecaoCardDescriptionTarget
}

class DimensionViewSecaoCardDescriptionTarget {
    range: string
    scope: string
}

class DimenstionViewSecaoCardDescriptionSelection {
    event: string
    rules: DimenstionViewSecaoCardDescriptionSelectionRules
}

class DimenstionViewSecaoCardDescriptionSelectionRules {
    filter: string
    api: ViewDefinitionArg
}

class DimensionViewSecaoCardCharts {
    id: string
    cls: string
    title: string
    type: string
    preloaded: ViewDefinitionPreloaded
    headers: DimensionViewSecaoCardChartsHeader[]
    options: DimensionViewSecaoCardChartsOptions[]
    source: DimensionViewSecaoCardChartsSource
}

class DimensionViewSecaoCardChartsHeader{
    text: string
    align!: string
    value: string
}

class DimensionViewSecaoCardChartsOptions {
    id: string
    text: string
    size: string
    colorScale: DimensionViewSecaoCardChartsOptionsColorScale
    id_field!: string
    value_field!: string
}

class DimensionViewSecaoCardChartsOptionsColorScale {
    name: string
    levels: number
}

class DimensionViewSecaoCardChartsSource {
    desc_field!: string
    fixed!: string
}
        
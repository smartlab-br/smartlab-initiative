declare module '#app' {
  interface NuxtApp {
    // viewConfReader functions
    $hello(msg: string): string
    async $loadYamlArray(currentStruct: any, yamlArray: any[], finalCbFunction: (context: any) => void): void
    $fillDataStructure(structure: any, customParams: any, cbFunction: (dataset: Record<string, any> | string, rules: Record<string, any>, structure: Record<string, any>, addedParams?: Record<string, any>, metadata?: Record<string, any>) => void, addedParams?: any): void
    $sendDataStructureError(error: string = "Falha ao carregar dados do componente.")
    $reformDataset(dataset: any, reformOptions: any, customParams: any = {}): void
    $autoFillLayout(base_object_list: any, rules: any, _preloaded: any, addedParams: any = null, _metadata: any = null): void
    $getIdLocalidadeFromRoute(idLocalidade: string): string
    $setDataset(dataset: any, rules: any, structure: any, addedParams: any, metadata: any): void
    //snackbarManager
    $openBugDialog(cardTitle: any): void
    $openAuthenticatioDialog(): void
    $chartGen(store: MainStore, id: string, chartType: string, structure: any, chartOptions: any, dataset: any, metadata: any, sectionIndex: number = 0): Promise<unknown> | undefined
    $chartRegen(store: MainStore, chartHandler: any, id: string, chartType: string, structure: any, chartOptions: any, dataset: any, metadata: any, sectionIndex: number = 0): Promise<unknown> | undefined
    $buildChartAdditionalOptions(store: MainStore, chartType: string, structure: any, chartOptions: any, dataset: any, metadata: any, sectionIndex: number = 0): any
    $changeCursor(containerId: string, image: string): void
    async $obsTETooltip(target: any, route: RouteLocationNormalizedLoaded, store: MainStore, _tooltip_list: string[] = [], _removed_text_list: string[] = [], options: any = null): Promise<void>
    async $obsTITooltip(target: any, route: RouteLocationNormalizedLoaded, store: MainStore, _tooltip_list: string[] = [], _removed_text_list: string[] = [], options: any = null): Promise<void>
    async $obsSSTTooltip(target: any, route: RouteLocationNormalizedLoaded, store: MainStore, _tooltip_list: string[] = [], _removed_text_list: string[] = [], options: any = null): Promise<void>
    async $obsTDTooltip(target: any, route: RouteLocationNormalizedLoaded, store: MainStore, _tooltip_list: string[] = [], _removed_text_list: string[] = [], options: any = null): Promise<void>
    $tooltipLinkGoogleStreetView(target: any, route: RouteLocationNormalizedLoaded, store: MainStore, tooltip_list: string[] = [], removed_text_list: string[] = [], options: any = null): void
    async $obsCovidMunicipioTooltip(target: any, route: RouteLocationNormalizedLoaded, store: MainStore, _tooltip_list: string[] = [], _removed_text_list: string[] = [], options: any = null): Promise<void>
    $obsCustomTooltip(target: any, route: RouteLocationNormalizedLoaded, tooltip_list: string[] = [], removed_text_list: string[] = [], options: any = null): void
    $showDefaultTooltip(sourceDS: any, _rules: any, _sourceStructure: any, addedParams: any = null, _metadata: any = null): void
    $obsCovidRegicTooltip(target: any, _route: RouteLocationNormalizedLoaded, _tooltip_list: string[] = [], _removed_text_list: string[] = [], _options: any = null): void
    $obsCovidRegicUTITooltip(target: any, _route: RouteLocationNormalizedLoaded, _tooltip_list: string[] = [], _removed_text_list: string[] = [], _options: any = null): void
    async $obsCovidRegicTextTooltip(target: any, showDadosSaude: boolean = false): Promise<void>
    $getEscopo(idLocalidade: string): "brasil" | "mptreg" | "prtptm" | "regiao" | "estado" | "mesorregiao" | "microrregiao" | "municipio"
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    // viewConfReader functions
    $hello(msg: string): string
    async $loadYamlArray(currentStruct: any, yamlArray: any[], finalCbFunction: (context: any) => void): void
    $fillDataStructure(structure: any, customParams: any, cbFunction: (dataset: Record<string, any> | string, rules: Record<string, any>, structure: Record<string, any>, addedParams?: Record<string, any>, metadata?: Record<string, any>) => void, addedParams?: any): void
    $sendDataStructureError(error: string = "Falha ao carregar dados do componente.")
    $reformDataset(dataset: any, reformOptions: any, customParams: any = {}): void
    $autoFillLayout(base_object_list: any, rules: any, _preloaded: any, addedParams: any = null, _metadata: any = null): void
    $getIdLocalidadeFromRoute(idLocalidade: string): string
    $setDataset(dataset: any, rules: any, structure: any, addedParams: any, metadata: any): void
    //snackbarManager
    $openBugDialog(cardTitle: any): void
    $openAuthenticatioDialog(): void
    $chartGen(store: MainStore, id: string, chartType: string, structure: any, chartOptions: any, dataset: any, metadata: any, sectionIndex: number = 0): Promise<unknown> | undefined
    $chartRegen(store: MainStore, chartHandler: any, id: string, chartType: string, structure: any, chartOptions: any, dataset: any, metadata: any, sectionIndex: number = 0): Promise<unknown> | undefined
    $buildChartAdditionalOptions(store: MainStore, chartType: string, structure: any, chartOptions: any, dataset: any, metadata: any, sectionIndex: number = 0): any
    $changeCursor(containerId: string, image: string): void
    async $obsTETooltip(target: any, route: RouteLocationNormalizedLoaded, store: MainStore, _tooltip_list: string[] = [], _removed_text_list: string[] = [], options: any = null): Promise<void>
    async $obsTITooltip(target: any, route: RouteLocationNormalizedLoaded, store: MainStore, _tooltip_list: string[] = [], _removed_text_list: string[] = [], options: any = null): Promise<void>
    async $obsSSTTooltip(target: any, route: RouteLocationNormalizedLoaded, store: MainStore, _tooltip_list: string[] = [], _removed_text_list: string[] = [], options: any = null): Promise<void>
    async $obsTDTooltip(target: any, route: RouteLocationNormalizedLoaded, store: MainStore, _tooltip_list: string[] = [], _removed_text_list: string[] = [], options: any = null): Promise<void>
    $tooltipLinkGoogleStreetView(target: any, route: RouteLocationNormalizedLoaded, store: MainStore, tooltip_list: string[] = [], removed_text_list: string[] = [], options: any = null): void
    async $obsCovidMunicipioTooltip(target: any, route: RouteLocationNormalizedLoaded, store: MainStore, _tooltip_list: string[] = [], _removed_text_list: string[] = [], options: any = null): Promise<void>
    $obsCustomTooltip(target: any, route: RouteLocationNormalizedLoaded, tooltip_list: string[] = [], removed_text_list: string[] = [], options: any = null): void
    $showDefaultTooltip(sourceDS: any, _rules: any, _sourceStructure: any, addedParams: any = null, _metadata: any = null): void
    $obsCovidRegicTooltip(target: any, _route: RouteLocationNormalizedLoaded, _tooltip_list: string[] = [], _removed_text_list: string[] = [], _options: any = null): void
    $obsCovidRegicUTITooltip(target: any, _route: RouteLocationNormalizedLoaded, _tooltip_list: string[] = [], _removed_text_list: string[] = [], _options: any = null): void
    async $obsCovidRegicTextTooltip(target: any, showDadosSaude: boolean = false): Promise<void>
    $getEscopo(idLocalidade: string): "brasil" | "mptreg" | "prtptm" | "regiao" | "estado" | "mesorregiao" | "microrregiao" | "municipio"
  }
}

export { }
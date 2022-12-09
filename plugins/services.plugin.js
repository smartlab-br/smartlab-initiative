import { AxiosCallSetupService } from './service/singleton/axiosCallSetupService'
import { ColorsService } from './service/singleton/colorsService'
import { DateFormatService } from './service/singleton/dateFormatService'
import { GeoIpClient } from './service/singleton/geoIpClient'
import { NavigationManager } from './service/singleton/navigationManager'
import { NumberTransformService } from './service/singleton/numberTransformService'
import { ObjectTransformService } from './service/singleton/objectTransformService'
import { TextTransformService } from './service/singleton/textTransformService'
import { TooltipBuildingService } from './service/singleton/tooltipBuildingService'
import { YamlFetcherService } from './service/singleton/yamlFetcherService'

export default ({ app }, inject) => {

    const axiosCallSetupService = new AxiosCallSetupService()
    inject('axiosCallSetupService', axiosCallSetupService)

    const colorsService = new ColorsService()
    inject('colorsService', colorsService)

    const dateFormatService = new DateFormatService()
    inject('dateFormatService', dateFormatService)

    const geoIpClient = new GeoIpClient()
    inject('geoIpClient', geoIpClient)

    const navigationManager = new NavigationManager(app)
    inject('navigationManager', navigationManager)

    const numberTransformService = new NumberTransformService()
    inject('numberTransformService', numberTransformService)

    const objectTransformService = new ObjectTransformService(app)
    inject('objectTransformService', objectTransformService)

    const textTransformService = new TextTransformService(app)
    inject('textTransformService', textTransformService)

    const tooltipBuildingService = new TooltipBuildingService(app)
    inject('tooltipBuildingService', tooltipBuildingService)

    const yamlFetcherService = new YamlFetcherService()
    inject('yamlFetcherService', yamlFetcherService)

}
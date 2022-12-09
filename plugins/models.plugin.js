import { AboutModel } from './model/singleton/aboutModel'
import { AnalysisUnitModel } from './model/singleton/analysisUnitModel'
import { DimensionsModel } from './model/singleton/dimensionsModel'
import { IndicatorsModel } from './model/singleton/indicatorsModel'
import { ObservatoriesModel } from './model/singleton/observatoriesModel'
import { TranslationModel } from './model/singleton/translationModel'

export default ({ app }, inject) => {

    const about = new AboutModel(app)
    inject('about', about)

    const analysisUnitModel = new AnalysisUnitModel(app)
    inject('analysisUnitModel', analysisUnitModel)

    const dimensions = new DimensionsModel(app)
    inject('dimensions', dimensions)

    const indicatorsModel = new IndicatorsModel(app)
    inject('indicatorsModel', indicatorsModel)

    const observatories = new ObservatoriesModel(app)
    inject('observatories', observatories)

    const translationModel = new TranslationModel()
    inject('translationModel', translationModel)

}
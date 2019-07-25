import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AppIcon from './AppIcon'

// Charts
// Based on d3plus
import FLPOBarChart from './chart/FLPOBarChart'
import FLPOBoxplotChart from './chart/FLPOBoxplotChart'
import FLPOLinearGauge from './chart/FLPOLinearGauge'
import FLPOLineChart from './chart/FLPOLineChart'
import FLPORankingBullet from './chart/FLPORankingBullet'
import FLPORankingSlider from './chart/FLPORankingSlider'
import FLPOSankey from './chart/FLPOSankey'
import FLPOScatterChart from './chart/FLPOScatterChart'
import FLPOStackedLineChart from './chart/FLPOStackedLineChart'
import FLPOTreemapChart from './chart/FLPOTreemapChart'
// Based on core d3
import FLPOCalendarChart from './chart/FLPOCalendarChart'

// Emitters
import FLPOCheckEmitter from './emitter/FLPOCheckEmitter'
import FLPORadioEmitter from './emitter/FLPORadioEmitter'
import FLPOSelectEmitter from './emitter/FLPOSelectEmitter'
import FLPOSliderEmitter from './emitter/FLPOSliderEmitter'
import FLPOSwitchGroupEmitter from './emitter/FLPOSwitchGroupEmitter'

// Maps
import FLPOLeafletMap from './map/FLPOLeafletMap'
import FLPOTopoJsonMap from './map/FLPOTopoJsonMap'

// Texts
import FLPOCompositeText from './text/FLPOCompositeText'
import FLPORankingText from './text/FLPORankingText'
import FLPOTextBuilder from './text/FLPOTextBuilder'
import FLPORankingList from './text/FLPORankingList'

// Cards
import FLPOLinkedViewCard from './card/FLPOLinkedViewCard'
// Content cards
import FLPOMinicard from './card/content/FLPOMinicard'
import FLPORankingCard from './card/content/FLPORankingCard'
// Story Cards
import FLPOStoryCard from './card/story/FLPOStoryCard'
import FLPOStoryCardAutofill from './card/story/FLPOStoryCardAutofill'
import FLPOStoryCardMultipleCharts from './card/story/FLPOStoryCardMultipleCharts'

// Other
import FLPOArticlesHighlights from './FLPOArticlesHighlights'
import FLPOSobreLayout from './FLPOSobreLayout'
import FLPODotNav from './FLPODotNav'
import FLPOOdometer from './FLPOOdometer'

export default {
  'font-awesome-icon': FontAwesomeIcon,
  
  'flpo-bar-chart': FLPOBarChart,
  'flpo-calendar-chart': FLPOCalendarChart,
  'flpo-boxplot-chart': FLPOBoxplotChart,
  'flpo-sankey': FLPOSankey,
  'flpo-scatter-chart': FLPOScatterChart,
  'flpo-treemap-chart': FLPOTreemapChart,
  'flpo-composite-text': FLPOCompositeText,
  'flpo-leaflet-map': FLPOLeafletMap,
  'flpo-topojson-map': FLPOTopoJsonMap,
  'flpo-line-chart': FLPOLineChart,
  'flpo-stacked-line-chart': FLPOStackedLineChart,
  'flpo-linked-view-card': FLPOLinkedViewCard,
  'flpo-sobre-layout': FLPOSobreLayout,
  'flpo-dot-nav': FLPODotNav,
  'flpo-ranking-slider': FLPORankingSlider,
  'flpo-ranking-bullet': FLPORankingBullet,
  'flpo-select-emitter': FLPOSelectEmitter,
  'flpo-radio-emitter': FLPORadioEmitter,
  'flpo-check-emitter': FLPOCheckEmitter,
  'flpo-switch-group-emitter': FLPOSwitchGroupEmitter,
  'flpo-slider-emitter': FLPOSliderEmitter,
  'flpo-text-builder': FLPOTextBuilder,
  'flpo-minicard': FLPOMinicard,
  'flpo-odometer': FLPOOdometer,
  'flpo-gauge-linear': FLPOLinearGauge,
  'app-icon': AppIcon,

  'flpo-story-card': FLPOStoryCard,
  'flpo-story-card-autofill': FLPOStoryCardAutofill,
  'flpo-story-card-multiple-charts': FLPOStoryCardMultipleCharts,
  'flpo-ranking-text': FLPORankingText,
  'flpo-ranking-list': FLPORankingList,
  'flpo-ranking-card': FLPORankingCard,

  'flpo-articles-highlights': FLPOArticlesHighlights
}

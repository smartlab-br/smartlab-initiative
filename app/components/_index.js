import AppIcon from './AppIcon'

// Charts
// Based on d3plus
import FLPORankingBullet from './chart/FLPORankingBullet'
import FLPORankingSlider from './chart/FLPORankingSlider'
// Based on core d3

// Emitters
import FLPOCheckEmitter from './emitter/FLPOCheckEmitter'
import FLPORadioEmitter from './emitter/FLPORadioEmitter'
import FLPOSelectEmitter from './emitter/FLPOSelectEmitter'
import FLPOSliderEmitter from './emitter/FLPOSliderEmitter'
import FLPOSwitchGroupEmitter from './emitter/FLPOSwitchGroupEmitter'

// Texts
import FLPOCompositeText from './text/FLPOCompositeText'
import FLPORankingText from './text/FLPORankingText'
import FLPOTextBuilder from './text/FLPOTextBuilder'
import FLPORankingList from './text/FLPORankingList'
import FLPOLegendList from './text/FLPOLegendList'

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
import FLPOSearchBar from './FLPOSearchBar'

// Data Visualizations
import FLPOSparklines from './viz/FLPOSparklines'
import FLPODatatable from './viz/FLPODatatable'

export default {
  
  'flpo-composite-text': FLPOCompositeText,
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
  'flpo-search-bar': FLPOSearchBar,
  
  'app-icon': AppIcon,

  'flpo-story-card': FLPOStoryCard,
  'flpo-story-card-autofill': FLPOStoryCardAutofill,
  'flpo-story-card-multiple-charts': FLPOStoryCardMultipleCharts,
  'flpo-ranking-text': FLPORankingText,
  'flpo-legend-list': FLPOLegendList,
  'flpo-ranking-list': FLPORankingList,
  'flpo-ranking-card': FLPORankingCard,

  'flpo-sparklines': FLPOSparklines,
  'flpo-datatable': FLPODatatable,
  
  'flpo-articles-highlights': FLPOArticlesHighlights
}

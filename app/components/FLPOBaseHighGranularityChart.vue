<script>
  import * as d3 from 'd3'

  import FLPOBaseChart from './FLPOBaseChart.vue';
  
  export default {
    extends: FLPOBaseChart,

    created() {
      if (this.options.id === null || this.options.id === undefined) {
        for (var row in this.dataset) {
          if (this.options.id === null || this.options.id === undefined) {
            this.dataset[row].series_id = "1";
          }
          if (this.options.color === null || this.options.color === undefined) {
            this.dataset[row].color = this.$vuetify.theme.primary;
          }
        }
        this.options.color = 'color';
        this.options.id = 'series_id';
      }
    }
  }
</script>

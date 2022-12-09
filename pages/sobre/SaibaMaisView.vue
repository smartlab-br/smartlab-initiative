<template>
  <v-layout primary row wrap>
    <v-layout xs12 sm8 offset-xs0 offset-sm2 class="py-5" style="width:100%"> 
      <v-container v-if="sobre" grid-list-lg style="display:block;"> 
        <FLPOSobreLayout :content="sobre" :active-tab="activeTab"
          v-if="sobre && activeTab">
        </FLPOSobreLayout>
      </v-container>
    </v-layout>
  </v-layout>
</template>
<script>
  export default {
    data () {
      return {
        sobre: null
      }
    },
    created () {
      // fetch the data when the view is created and the data is
      // already being observed
      // fetchData();
      let tmpAbout = this.$about.getAbout();
      if ((tmpAbout instanceof Promise) || tmpAbout.then) {
        tmpAbout.then((result) => { this.sobre = result });
      } else {
        this.sobre = tmpAbout;
      }
    },
    computed: {
      activeTab: function() {
        return this.$route.params.tab;
      },
      // content: function() {
      //   return this.$about.getFullAbout();
      // }
    },
    mounted: function() {
      this.$vuetify.theme = this.$observatories.getTheme('default');
    }
  }
</script>
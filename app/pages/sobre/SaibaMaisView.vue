<template>
  <v-layout primary row wrap>
    <v-layout xs12 sm8 offset-xs0 offset-sm2 class="py-5" style="width:100%"> 
      <v-container :v-if="$about && $about.about" grid-list-lg style="display:block;"> 
        <flpo-sobre-layout :content="$about.about" :active-tab="activeTab"
          :v-if="$about.about != null && $about.about != undefined && activeTab">
        </flpo-sobre-layout>
      </v-container>
    </v-layout>
  </v-layout>
</template>
<script>
  export default {
    data () {
      return {
      }
    },
    created () {
      // this.content = this.getFullAbout();
      // fetch the data when the view is created and the data is
      // already being observed
      // fetchData();
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
      this.changeTheme('default');
    },
    methods: {
      sendError(message) {
        this.$emit('showSnackbar', { color : 'error', text: message });
      }
    }
  }
</script>
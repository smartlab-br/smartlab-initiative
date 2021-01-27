<template>
<v-layout primary row wrap>
<v-layout xs12 sm8 offset-xs0 offset-sm2 class="py-5" style="width:100%"> 
      <v-container grid-list-lg style="display:block;"> 

<v-layout primary row wrap>
    <v-layout secondary style="display: block;">
    <v-tabs
      color="secondary"
      show-arrows
      class="elevation-1"
      dark>
      <v-tabs-slider></v-tabs-slider>
      <!-- Headers -->
      <v-tab class="accent--text headline-obs">
        Perfil do usuário
      </v-tab>
    </v-tabs>
    <v-tabs-items>
      <v-tab-item>
        <v-container px-5 class="white--text">

          <v-container grid-list-md>
              <v-layout row wrap>
                <v-layout align-center justify-start column xs3>
                  <v-avatar
                    size="100px"
                    slot="activator">
                    <!-- <img
                      v-if="this.$store.state.user && this.$store.state.user.picture"
                      :src="this.$store.state.user.picture"
                    > -->
                    <img v-if="this.$store.state.user" :src="this.$store.state.user.picture"/>
                    
                    <!-- <v-icon v-else color="white" slot="activator">perm_identity</v-icon> -->
                    
                  </v-avatar>
                  <img v-if="this.$store.state.user && this.$store.state.user.picture && (this.$store.state.user.picture.search('google') != -1)" src="/static/icons/acesso_google.png" class="social-access-badge"/>
                  <img v-if="this.$store.state.user && this.$store.state.user.picture && (this.$store.state.user.picture.search('fbsbx') != -1)" src="/static/icons/acesso_facebook.png" class="social-access-badge"/>
                </v-layout>
                <v-flex xs9>
                  <div class="display-2-obs white--text">{{this.$store.state.user ? this.$store.state.user.name : ''}}</div>
                  <div class="display-1-obs white--text mb-5">{{this.$store.state.user ? this.$store.state.user.email : ''}}</div>
                  
                  <v-btn @click="logOut()">Sair</v-btn>
                </v-flex>
              </v-layout>
          </v-container>

        </v-container>
      </v-tab-item>
    </v-tabs-items>
      
    </v-layout>
  </v-layout>

      </v-container>
</v-layout>
</v-layout>
</template>

<script>
  export default {
    data () {
      return {
        // user: null
      }
    },
    created () {
      if (!this.$store.state.user) {
        this.$navigationManager.constructor.pushRoute(this.$router, '/', false)
      }
    },
    methods: {
      logOut: function() {
        window.location = `${process.env.GRAVITEE_AM_BASE_URL}/logout?invalidate_tokens=true&target_url=${process.env.GRAVITEE_AM_REDIRECT_URL}`;
      }
    }
  }
</script>
<style>
 .social-access-badge {
   margin-top: 15px;
 }
</style>
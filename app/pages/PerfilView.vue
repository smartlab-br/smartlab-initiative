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
                <v-flex xs9>
                  <div class="display-1-obs white--text">{{ this.$store.state.user ? this.$store.state.user.firstName + ' ' + this.$store.state.user.lastName : '' }}</div>
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
        this.$store.commit('setUser', null);
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
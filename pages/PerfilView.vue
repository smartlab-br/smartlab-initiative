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
              <v-layout row wrap align-center>
                <v-flex py-0 xs12>
                  <v-text-field 
                    v-model="userData.email"
                    class="pt-1 pb-0"
                    label="E-mail"
                    readonly
                    dark
                  />
                </v-flex>

                <v-flex pt-2 pb-0 xs6>
                  <v-text-field 
                    v-model="userData.firstName"
                    class="py-0"
                    label="Nome"
                    readonly
                    dark
                  />
                </v-flex>

                <v-flex pt-2 pb-0 xs6>
                  <v-text-field 
                    v-model="userData.lastName"
                    class="py-0"
                    label="Sobrenome"
                    readonly
                    dark
                  />
                </v-flex>

                <v-flex pt-2 pb-0 xs6>
                  <v-text-field 
                    v-model="userData.phone_number"
                    class="py-0"
                    label="Telefone de contato"
                    readonly
                    dark
                  />
                </v-flex>

                <v-flex pt-2 pb-0 xs6>
                  <v-text-field 
                    v-model="userData.occupation"
                    class="py-0"
                    label="Profissão"
                    readonly
                    dark
                  />
                </v-flex>

                <v-flex pt-2 pb-0 xs6>
                  <v-text-field 
                    v-model="userData.institution"
                    class="py-0"
                    label="Instituição"
                    readonly
                    dark
                  />
                </v-flex>

                <v-flex pt-2 pb-0 xs6>
                  <v-text-field 
                    v-model="userData.institution_website"
                    class="py-0"
                    label="Site da instituição"
                    readonly
                    dark
                  />
                </v-flex>

                <v-flex pt-2 pb-0 xs12>
                  <v-text-field 
                    v-model="userData.research_field"
                    class="py-0"
                    label="Área de pesquisa"
                    readonly
                    dark
                  />
                </v-flex>

                <v-flex pt-2 pb-0 xs12>
                  <v-text-field 
                    v-model="userData.project_title"
                    class="py-0"
                    label="Tema ou Título do Projeto, Pesquisa ou Trabalho"
                    readonly
                    dark
                  />
                </v-flex>

                <v-flex pt-2 pb-0 xs12>
                  <v-textarea 
                    v-model="userData.research"
                    class="py-0"
                    label="Pesquisa"
                    rows=3
                    readonly
                    dark
                  />
                </v-flex>

                <v-flex xs12 text-xs-center>
                  <v-btn  
                    small 
                    class="black--text py-0"
                    color="accent"                  
                    @click="logOut()"
                    light
                  >
                    Sair
                  </v-btn>
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
        userData: {}
      }
    },
    created () {
      if (!this.$store.state.user) {
        this.$navigationManager.pushRoute(this.$router, '/', false)
      } else {
        this.userData = this.$store.state.user;
      }
    },
    mounted(){
      this.$vuetify.theme = this.$observatories.getTheme('default');
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
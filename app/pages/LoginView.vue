<template>
  <v-layout secondary row wrap>
    <v-flex xs12 text-xs-center white--text v-if="!isAuthenticated"> 
      <div class="display-3-obs text-xs-center white--text pa-5">Identifique-se</div>
      <!--
      <div class="authentication-status text-xs-center" v-if="isAuthenticated">
        Autenticação realizada com sucesso!
        <div class="authentication-status__token">{{$auth.getToken()}}</div>
      </div>
      -->
      Acesse com :
      <v-btn icon @click="auth('google')">
        <v-tooltip bottom>
          <v-icon color="white" small slot="activator">fab fa-google</v-icon>
          Google
        </v-tooltip>
      </v-btn>
      <v-btn icon @click="auth('facebook')"> 
        <v-tooltip bottom>
          <v-icon color="white" small slot="activator">fab fa-facebook</v-icon>
          Facebook
        </v-tooltip>
      </v-btn>
      <!--
      <v-btn icon class="white--text" @click="auth('twitter')">
        <v-tooltip bottom>
          <v-icon small slot="activator">fab fa-twitter</v-icon>
          Twitter
        </v-tooltip>
      </v-btn>
      
      <hr />
      <v-btn @click="authLogin()">Login</v-btn>
      <v-btn @click="authRegister()">Register</v-btn>
      <v-btn @click="authLogout()">Logout</v-btn>
      -->
    </v-flex>
    <v-flex xs12 text-xs-center white--text pa-5 v-if="isAuthenticated"> 
      <v-avatar>
        <img
          :src="user.picture"
        >
      </v-avatar><br/>
      {{ user.name }}<br/>
      {{ user.email }}<br/>
      <v-btn small flat class="white--text" @click="authLogout">
          Sair
          <v-icon x-small right>exit_to_app</v-icon>
      </v-btn>
      
    </v-flex>
    <!--
    <v-flex xs12 text-xs-center white--text pa-5 v-if="isAuthenticated"> 
      <pre class="response" v-if="response !== null">{{JSON.stringify(response, null, 2)}}</pre>
    </v-flex>
    -->
  </v-layout>
</template>
<script>

  export default {
    data () {
      return {
        isAuthenticated: null,
        access_token: null,
        response: null,
        user: {name:"", email:"", picture:""}
      }
    },
    created () {
    },
    computed: {
    },
    mounted: function() {
      this.$vuetify.theme = this.$observatories.getTheme('default');
      this.isAuthenticated = this.$auth.isAuthenticated();
      this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {name:"", email:"", picture:""};
    },
    methods: {

      authLogin: function () {
        var this_ = this;
        let user = {
          email: 'john.doe@domain.com', 
          password: 'pass123456'
        };

        if (this.$auth.isAuthenticated()) {
          this.authLogout()
        }

        this.$auth.login(user).then(function (response) {
          this_.isAuthenticated = this_.$auth.isAuthenticated();
          this_.response = response
        })
      },

      authRegister: function () {
        var this_ = this;
        let user = {
          name: 'John Doe',
          email: 'john.doe@domain.com', 
          password: 'pass123456'
        };

        if (this.$auth.isAuthenticated()) {
          this.authLogout()
        }
        
        this.$auth.register(user).then(function (response) {
          this_.isAuthenticated = this_.$auth.isAuthenticated();
          this_.response = response
        })
      },

      authLogout: function () {
        let this_ = this;
        let options = {
          url: localStorage.getItem('logoutUrl'),
        }
        this.$auth.logout(options).then(function () {
          if (!this_.$auth.isAuthenticated()) {
            this_.clearStorageUser();
            this_.user = {name:"", email:"", picture:""};
            this_.$emit('userChanged',this_.user);
            this_.response = null
          }

          this_.isAuthenticated = this_.$auth.isAuthenticated();
        })
      },

      auth: function(provider) {
        if (this.$auth.isAuthenticated()) {
          this.authLogout();
        }
        this.response = null

        var this_ = this;
        this.$auth.authenticate(provider).then(function (authResponse) {
          this_.isAuthenticated = this_.$auth.isAuthenticated();

          if (provider === 'github') {
            this_.$http.get('https://api.github.com/user').then(function (response) {
              this_.response = response
            })
          } else if (provider === 'facebook') {
            this_.$http.get('https://graph.facebook.com/v2.5/me', {
              params: { access_token: this_.$auth.getToken(),
                        fields: "id,name,email,picture"}
            }).then(function (response) {
              let logoutUrl = "https://graph.facebook.com/v2.7/me/permissions?method=delete&access_token=" + this_.$auth.getToken();
              this_.user.name = response.data.name;
              this_.user.email = response.data.email;
              this_.user.picture = response.data.picture.data.url;
              this_.user.facebook = response.data.id;
              this_.response = response
              localStorage.setItem('logoutUrl', logoutUrl);
              localStorage.setItem('user', JSON.stringify(this_.user));
              this_.$emit('userChanged',this_.user);
            })
          } else if (provider === 'google') {
            this_.$http.get('https://www.googleapis.com/oauth2/v3/userinfo').then(function (response) {
              this_.user.name = response.data.name;
              this_.user.email = response.data.email;
              this_.user.picture = response.data.picture;
              this_.user.google = response.data.sub;
              this_.response = response
              let logoutUrl = "https://accounts.google.com/o/oauth2/revoke?token=" + this_.$auth.getToken();
              localStorage.setItem('logoutUrl', logoutUrl);
              localStorage.setItem('user', JSON.stringify(this_.user));
              this_.$emit('userChanged',this_.user);
            })
          } else if (provider === 'twitter') {
            this_.response = authResponse.body.profile
          } else if (provider === 'instagram') {
            this_.response = authResponse
          } else if (provider === 'bitbucket') {
            this_.$http.get('https://api.bitbucket.org/2.0/user').then(function (response) {
              this_.response = response
            })
          } else if (provider === 'linkedin') {
            this_.response = authResponse
          } else if (provider === 'live') {
            this_.response = authResponse
          }
        }).catch(function (err) {
          this_.isAuthenticated = this_.$auth.isAuthenticated()
          this_.response = err
        })
      },
      clearStorageUser(){
        localStorage.removeItem('user');
        localStorage.removeItem('logoutUrl');
      }

      
    }
  }
</script>
<style>
    button {
      background-color: transparent;
      border: 1px solid #ddd;
      border-radius: 3px;
      font-size: inherit;
      font-weight: 700;
      line-height: 2rem;
      padding: 0 2rem;
    }
    button:hover {
      cursor: pointer;
    }

    .authentication-status {
      background-color: #42b983;
      color: #fff;
      left: 0;
      padding: 16px 32px;
      right: 0;
      text-align: center;
      top: 0;
    }
    hr {
      border: 0;
      border-bottom: 1px solid #ddd;
      margin: 2rem 0;
    }

</style>
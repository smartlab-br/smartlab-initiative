<template>
  <v-app>
    <v-navigation-drawer
      :mini-variant="miniVariant"
      clipped
      v-model="drawer"
      fixed
      disable-resize-watcher
      app>
      <!-- <v-layout hidden-md-and-up 
        v-if="miniLeftDrawerTitle"
        column primary pa-3>
        <v-toolbar-title 
          class="white--text font-weight-bold"
          v-text="computedMiddleTitle">
        </v-toolbar-title>
        <v-flex caption white--text>
          {{ computedMiddleSubtitle }}
        </v-flex>
      </v-layout> 
      <v-layout hidden-md-and-up 
        v-if="miniLeftDrawerTitle"
        column primary pa-3>
        <v-toolbar-title 
          class="white--text font-weight-bold"
          v-text="computedTitle">
        </v-toolbar-title>
        <v-flex caption white--text>
          {{ computedSubtitle }}
        </v-flex>
      </v-layout>
      <v-divider></v-divider>
      -->
      <v-list>
        <!-- Item acrescentado para solucionar problema nos displays xs, sm e md, onde o primeiro item desaparecia -->
        <v-list-tile class="hidden-lg-and-up">
          <v-list-tile-content>
            <v-list-tile-title></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile 
          v-on:click="itemClick(item)"
          :ripple="{ class: item.rippleColor }"
          :key="i"
          v-for="(item, i) in items"
          v-ripple
          exact
          :tabindex = "drawer ? 10 + i : ''"
          @keyup.enter = "itemClick(item)"
          >
          <v-list-tile-action>
            <v-icon v-if="item.icon" v-html="item.icon" :title="item.title"></v-icon>
            <app-icon v-else-if="item.app_icon"
              :title="item.title" :icon="item.app_icon">
            </app-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-divider></v-divider>
      <v-list>
        <v-list-tile @click.native.stop="miniVariant = !miniVariant">
          <v-list-tile-action>
            <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'">
            </v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Apenas ícones</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <!--
    <v-toolbar fixed>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
    </v-toolbar>
    -->
    <v-toolbar dark fixed app clipped-left :style="'background-color:'+toolbarColor">
      <v-toolbar-side-icon @click.stop="drawer = !drawer" 
      aria-label="Menu Principal"
      tabindex = "1">
      </v-toolbar-side-icon>
      <!-- <v-btn
        icon
        @click.native.stop="fixed = !fixed"
      >
        <v-icon>remove</v-icon>
      </v-btn> -->
      <v-toolbar-title class="ml-2">
        <v-layout pa-0 row align-center>
          <v-flex pr-2 pt-2 hidden-xs-only>
            <img 
              tabindex = "20"
              @keyup.enter = "$navigationManager.constructor.pushRoute($router, '/', false)"
              v-on:click="$navigationManager.constructor.pushRoute($router, '/', false)" src="/static/icons/smartlab_labeled-30.png" class="cursor-pointer"
              alt="Smartlab"/> 
          </v-flex>
          <v-flex pr-2 pt-2 hidden-sm-and-up>
            <img 
              tabindex = "20"
              v-on:click="$navigationManager.constructor.pushRoute($router, '/', false)" src="/static/icons/smartlab-icon-30x30.png" class="cursor-pointer"
              alt="Smartlab"/> 
          </v-flex>
          <v-divider v-show="computedTitle" vertical class="mx-2" style="background-color:rgba(255,255,255,0.7)"></v-divider>
          <v-flex text-xs-right class="line-height-1">
            <v-flex v-on:click="$navigationManager.constructor.pushRoute($router, ($route && ($route.path.indexOf('localidade') != -1)) ? '../' : ($route && ($route.path.indexOf('estudo') != -1 || $route.path.indexOf('smartmap') != -1)) ? './' : '', false);" class="cursor-pointer" pa-0>{{ computedTitle }}</v-flex>
            <v-flex pa-0 caption>{{ computedSubtitle }}</v-flex>
          </v-flex>
          <v-divider v-show="computedPlaceTitle" vertical class="mx-2" style="background-color:rgba(255,255,255,0.7)"></v-divider>
          <v-flex v-if="currentAnalysisUnit" pl-2 v-on:mousedown="seen = true" v-on:click="focusChangePlace()" class="cursor-pointer line-height-1">
            <v-flex>{{ computedPlaceTitle }}</v-flex>
            <v-flex pa-0 caption>{{ currentPlaceType }}</v-flex>
          </v-flex>
        </v-layout>
      </v-toolbar-title>
      
      <v-spacer></v-spacer>
      <!-- <v-spacer>
        <v-container hidden-sm-and-down column pa-0>
          <v-toolbar-title 
            class="text-xs-center accent--text font-weight-bold"
            v-text="computedMiddleTitle">
          </v-toolbar-title>
          <v-flex text-xs-center accent--text caption>
            {{ computedMiddleSubtitle }}
          </v-flex>
        </v-container>
      </v-spacer> -->
      
      <div width="20rem">
        <!--:hint="hintAutocomplete"
            append-icon="search"
        -->
        <v-autocomplete
          :menu-props="{minWidth:'380px'}"
          tabindex = "21"
          ref = "autocompleteChangePlace"
          v-if="auOptions.length > 0"
          :items="auOptions"
          v-show="seen"
          persistent-hint
          v-model="gsItemBusca"
          item-text="label"
          placeholder="Mudar localidade"
          item-value="id"
          :filter="customFilter"
          @blur="gsItemBusca = null"
          :loading="gsLoadingStatusSearchOptions == 'LOADING' ? true : false"
          :color="gsLoadingStatusSearchOptions == 'ERROR' ? 'error' :
                  (gsLoadingStatusSearchOptions == 'LOADING' ? 'warning' : 'accent')"
          class="input-group--focused global-search"
          return-object>
          <template slot="item" slot-scope="data">
            <template v-if="auOptions.length < 2">
              <v-list-tile-content>
                <v-progress-circular :size="20" indeterminate color="primary">
                </v-progress-circular>
              </v-list-tile-content>
            </template>
            <template v-else >
              <!--
              <v-list-tile-avatar>
                <v-icon>{{ data.item.icon }}</v-icon>
              </v-list-tile-avatar>
              -->
              <v-list-tile-content>
                <v-list-tile-title v-on:click="changeAnalysisUnit($router, data.item)" v-html="data.item.label + (data.item.scope == 'uf'? ' (UF)': '')"></v-list-tile-title>
                <!--<v-list-tile-sub-title v-html="data.item.detail"></v-list-tile-sub-title>-->
              </v-list-tile-content>
              <v-list-tile-action style="min-width: 120px" >
                <v-layout row>
                  <v-layout v-for="(search_item, indxSearch) in $observatories.getObservatoriesSearchOptions()"
                  :key="'search_item_obs_' + indxSearch"
                  v-on:click="changeAnalysisUnit($router, data.item, search_item.id)">
                    <v-layout column wrap align-center
                      v-if="data.item.exclude_from == null || data.item.exclude_from == undefined || !data.item.exclude_from.includes(search_item.id)"
                      >
                     <v-tooltip bottom>
                     
                        <v-icon v-if="search_item.icon"
                          small :class="search_item.color"
                          v-html="search_item.icon"
                          slot="activator">
                        </v-icon>
                        <app-icon v-else-if="search_item.app_icon"
                          size="16" :fill="search_item.color"
                          :icon="search_item.app_icon"
                          slot="activator">
                        </app-icon>
                        <v-layout v-html="search_item.title"> 
                        </v-layout>
                      </v-tooltip>
                    </v-layout>
                  </v-layout>
                </v-layout>
              </v-list-tile-action>
            </template>
          </template>  
        </v-autocomplete>
      </div>
      
      <v-btn
        tabindex = "22"
        icon class="ml-0"
        aria-label="Alterar Localidade"
        @click="seen = !seen">
        <v-tooltip bottom>
          <v-icon color="white" slot="activator">place</v-icon>
          Alterar Localidade
        </v-tooltip>
      </v-btn>
      <!--
      <v-btn
        tabindex = "23"
        icon class="ml-0"
        aria-label="Identifique-se"
        @click="$navigationManager.constructor.pushRoute($router, '/login', false)">
        <v-tooltip bottom>
          <v-icon color="white" slot="activator">perm_identity</v-icon>
          Identifique-se
        </v-tooltip>
      </v-btn>
      <v-btn
        icon class="ml-0"
        @click.native.stop="rightDrawer = !rightDrawer">
        <v-tooltip bottom>
          <v-icon  color="white" slot="activator">settings</v-icon>
          Configurações
        </v-tooltip>
      </v-btn>
      -->
    </v-toolbar>
    <v-content>
      <v-container fluid class="pa-0 fill-height">
        <router-view :key="reRenderPath" @showSnackbar="snackAlert"
          @showLocationDialog="showLocationDialog" @showBugDialog="showBugDialog" @alterToolbar="changeToolbar" @alterMiddleToolbar="changeMiddleToolbar" ref="currentRoute"></router-view>
        <v-slide-y-transition mode="out-in">
        </v-slide-y-transition>
      </v-container>
    </v-content>
    <!--
    <v-navigation-drawer
      :right="right"
      clipped
      v-model="rightDrawer"
      temporary
      disable-resize-watcher
      app>
      <v-list>
      -->
        <!-- <v-list-tile @click.native="right = !right">
          <v-list-tile-action>
            <v-icon light>compare_arrows</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Switch drawer (click me)</v-list-tile-title>
        </v-list-tile> -->
      <!--
        <v-list-tile>
          <v-list-tile-action>
            <v-icon light>language</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-autocomplete
              v-if="langs && langs.length > 0"
              :items="langs"
              v-model="lang"
              label="Select"
              item-text="lbl"
              item-value="value" 
              class="input-group--focused" 
              return-object
              v-on:change="changeLocale()">
              <template slot="selection" slot-scope="data">
                <span v-if="data" class="text-xs-right">
                  <v-avatar size="24px" slot="activator" class="mr-2">
                    <img :src="data.item.flag" :alt="'Idioma ' + data.item.lbl">
                  </v-avatar>
                  <span>{{ data.item.lbl }}</span>
                </span>
              </template>
              <template slot="item" slot-scope="data">
                <template v-if="typeof data.item !== 'object'">
                  <v-list-tile-content v-text="data.item"></v-list-tile-content>
                </template>
                <template v-else>
                  <v-list-tile-avatar size="24px">
                    <img :src="data.item.flag" :alt="'Idioma ' + data.item.lbl">
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    {{ data.item.lbl }}
                  </v-list-tile-content>
                </template>
              </template>
            </v-autocomplete>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    -->
    <!--<v-container fluid grid-list-lg align-start xs12 primary class="white--text footer" app>-->
      <v-layout row wrap primary align-center class="white--text"
       :class="{'px-2 py-4': $vuetify.breakpoint.xsAndup, 
                'px-3 py-4': $vuetify.breakpoint.mdAndDown, 
                'px-5 py-5': $vuetify.breakpoint.lgAndUp}" app>
        <v-flex xs2 sm1 md1 lg2 xl2 :class="{'pt-5 pb-3': $vuetify.breakpoint.smAndDown }" >
             <v-layout row wrap class="text-xs-left">
               <v-flex xs12>
                <a class="white--text" v-on:click="$navigationManager.constructor.pushRoute($router, '/saibamais/smartlab', false)">
                  <img  src="/static/smartlab/smartlab-small.svg" alt="Smartlab" height="25px" style="margin-bottom: -5px;"/><span class="ml-3">Sobre</span>
                </a>
               </v-flex>
             </v-layout>
        </v-flex>
        <v-flex xs10 sm11 md7 lg5 xl4 class="text-xs-right text-md-center" :class="{'pt-5 pb-3': $vuetify.breakpoint.smAndDown }">
          <!-- TODO Devolver os ajustes de tamanho depois do lançamento
            max-height="80%"
            min-height="50%" -->
          <img 
            v-on:click="$navigationManager.constructor.pushRoute($router, 'https://mpt.mp.br', true)" 
            src="/static/smartlab/mpt.svg"
            class="cursor-pointer mr-2" alt="Ministério Público do Trabalho"
            height="50px"
          />
          <img 
            v-on:click="$navigationManager.constructor.pushRoute($router, 'https://ilo.org', true)" 
            src="/static/smartlab/oit_100anos.png"
            class="cursor-pointer mr-2 ml-2" alt="Organização Internacional do Trabalho"
            height="50px"
          />
          
          <!-- <hr class="mx-2 v-divider v-divider--vertical theme--dark" style="background-color: rgba(255, 255, 255, 0.7);"> -->
          <img
            v-on:click="$navigationManager.constructor.pushRoute($router, 'http://cnmp.mp.br', true)" 
            src="/static/smartlab/cnmp.svg"
            class="cursor-pointer mb-1 ml-2" alt="Conselho Nacional do Ministério Público"
            max-height="80%"
            min-height="50%"
            style="border-left: 1px solid white; padding-left: 10px;"
          />
          <img v-if="$observatories.constructor.identifyObservatory($route.path.split('/')[1]) == 'ti'"
            v-on:click="$navigationManager.constructor.pushRoute('https://fnpeti.org.br', true)" 
            src="/static/smartlab/fnpeti.svg"
            class="cursor-pointer mb-1 ml-0" alt="Fórum Nacional de Prevenção e Erradicação do Trabalho Infantil"
            max-height="80%"
            min-height="50%"
          />
          <img v-if="$observatories.constructor.identifyObservatory($route.path.split('/')[1]) == 'ti' || this.$observatories.constructor.identifyObservatory(this.$route.path.split('/')[1]) == 'td'"
            v-on:click="$navigationManager.constructor.pushRoute('http:///ibge.gov.br', true)" 
            src="/static/smartlab/ibge.png"
            class="cursor-pointer mb-1 ml-0" alt="Instituto Brasileiro de Geografia e Estatística"
            height="50px"
          />
          <img v-if="$observatories.constructor.identifyObservatory($route.path.split('/')[1]) == 'des'"
            v-on:click="$navigationManager.constructor.pushRoute('https://www.pactoglobal.org.br', true)" 
            src="/static/smartlab/pacto.svg"
            class="cursor-pointer mb-1 ml-0" alt="Pacto Global - Rede Brasil"
            max-height="80%"
            min-height="50%"
          />
          <img v-if="$observatories.constructor.identifyObservatory($route.path.split('/')[1]) == 'des'"
            v-on:click="$navigationManager.constructor.pushRoute('http://www.onumulheres.org.br/', true)" 
            src="/static/smartlab/onumulheres.svg"
            class="cursor-pointer ml-2" alt="ONU Mulheres"
            height="20px" style="margin-bottom: 12px;"
          />
          
        </v-flex>
        <v-flex xs6 sm6 md2 lg3 xl3 class="text-xs-left text-sm-left text-md-center subheading"
            :class="{'pt-5 pb-3': $vuetify.breakpoint.smAndDown }" >
              <a class="white--text mr-3" v-on:click="$navigationManager.constructor.pushRoute($router, 'https://github.com/smartlab-br', true)"><span v-html="renderIcon('fab','faGithub','GitHub')"/></a>
              <a class="white--text mr-3" v-on:click="$navigationManager.constructor.pushRoute($router, 'https://hub.docker.com/u/smartlab/', true)"><span v-html="renderIcon('fab','faDocker','Docker')"/></a>
              <a class="white--text mr-3" v-on:click="$navigationManager.constructor.pushRoute($router, '', true)"><span v-html="renderIcon('fab','faFacebook','Facebook')"/></a>
              <a class="white--text" v-on:click="$navigationManager.constructor.pushRoute($router, '', true)"><span v-html="renderIcon('fab','faTwitter','Twitter')"/></a>
        </v-flex>
        <v-flex xs6 sm6 md2 lg2 xl3 class="text-xs-right subheading" 
            :class="{'pt-5 pb-3': $vuetify.breakpoint.smAndDown }" >
              <div class="caption mr-1 mb-1">Licenças</div>
              <a class="white--text mx-2" v-on:click="$navigationManager.constructor.pushRoute($router, 'https://creativecommons.org/licences/by-nc-sa/4.0/', true)"><span v-html="renderIcon('fab','faCreativeCommons','CC BY 4.0')"/></a>
              <a class="white--text" v-on:click="$navigationManager.constructor.pushRoute($router, 'https://opensource.org/licenses/MIT', true)"><span v-html="renderIcon('fab','faOsi','MIT - Open Source Initiative')"/></a>
        </v-flex>
      </v-layout>
    <!--</v-container>-->
    <v-snackbar :timeout="snack_timeout" :top="snack_y === 'top'" :bottom="snack_y === 'bottom'"
      :right="snack_x === 'right'" :left="snack_x === 'left'" :multi-line="snack_mode === 'multi-line'"
      :vertical="snack_mode === 'vertical'" :color = "snack_color" v-model="snackbar">
      {{ snackText }}
      <v-btn flat color="white" @click.native="snackbar = false">Fechar</v-btn>
    </v-snackbar>
    <v-snackbar bottom multi-line :timeout="0" color = "blue-grey darken2" v-model="snackbarCookies">
      Este site utiliza cookies para registrar as preferências de navegação do usuário. Ao navegar no site, você aceita a utilização dos cookies.
      <v-btn flat color="white" @click.native="setCookieAccept">Fechar</v-btn>
    </v-snackbar>
    <v-dialog width="500px" v-model="bugDialog">
        <v-card>
          <v-card-title class="headline-obs">Relate um problema</v-card-title>
          <v-card-text>
            <v-form ref="bugForm" v-model="valid">
              <v-container>
                <v-layout column>
                  <v-flex py-0>
                    <v-text-field class="py-0"
                      v-model="computedTitle"
                      label="Observatório"
                      readonly
                    ></v-text-field>
                  </v-flex>

                  <v-flex py-0>
                    <v-text-field class="py-0"
                      v-model="computedSubtitle"
                      label="Dimensão"
                      readonly
                    ></v-text-field>
                  </v-flex>

                  <v-flex py-0>
                    <v-text-field class="py-0"
                      v-model="computedPlaceTitle"
                      label="Localidade"
                      readonly
                    ></v-text-field>
                  </v-flex>

                  <v-flex py-0>
                    <v-text-field class="py-0"
                      v-model="bugCard"
                      label="Card"
                      readonly
                    ></v-text-field>
                  </v-flex>

                  <v-flex>
                    <v-textarea v-if="bugDialog"
                      v-model="bugText"
                      ref="bugText"
                      label="Relate um problema"
                      :rules= "bugTextRules"                      
                      autofocus
                      required>
                    </v-textarea>
                  </v-flex>

                  <v-flex>
                    <v-text-field class="py-0"
                      :rules= "bugEmailRules" 
                      ref="bugEmail"                     
                      v-model="bugEmail"
                      label="E-mail contato"
                      required
                    ></v-text-field>
                  </v-flex>

                  <v-layout py-0 row>
                    <v-layout pa-0 v-show="sendingMail">
                      <v-progress-circular indeterminate
                        color="accent">
                      </v-progress-circular>
                      <span class="pl-2 align-self-center">Enviando...</span>
                    </v-layout>
                    <v-spacer></v-spacer>
                    <v-layout justify-end pa-0>
                      <v-btn small flat  class="mb-0 mr-2"
                        @click="sendBugReport">
                        <span class="hidden-sm-and-down body">Enviar</span>
                        <v-icon right>send</v-icon> 
                      </v-btn>
                      <v-btn small flat  class="mb-0 mx-0"
                        @click="closeBugDialog">
                        <span class="hidden-sm-and-down body">Fechar</span>
                        <v-icon right>close</v-icon> 
                      </v-btn>
                    </v-layout>
                  </v-layout>
              </v-layout>
              </v-container>
            </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog width="500px" v-model="locationDialog" persistent>
        <v-card>
          <v-card-title class="headline-obs">Informe o município a ser visualizado ou sua localidade:</v-card-title>
          <v-card-text>
          <v-autocomplete
            v-if="auOptions.length > 0"
            :items="computedSearchItemsMunicipio"
            persistent-hint
            v-model="gsFavLocation"
            item-text="label"
            placeholder="Município"
            item-value="id"
            :filter="customFilter"
            @blur="gsFavLocation = null"
            :loading="gsLoadingStatusSearchOptions == 'LOADING' ? true : false"
            :color="gsLoadingStatusSearchOptions == 'ERROR' ? 'error' :
                    (gsLoadingStatusSearchOptions == 'LOADING' ? 'warning' : 'accent')"
            class="input-group--focused global-search"
            return-object>
            <template slot="item" slot-scope="data">
              <template v-if="auOptions.length < 2">
                <v-list-tile-content>
                  <v-progress-circular :size="20" indeterminate color="primary">
                  </v-progress-circular>
                </v-list-tile-content>
              </template>
              <template v-else>
                <!--<v-list-tile-avatar>
                  <v-icon>{{ data.item.icon }}</v-icon>
                </v-list-tile-avatar>-->
                <v-list-tile-content>
                  <v-list-tile-title v-html="data.item.label"></v-list-tile-title>
                  <!--<v-list-tile-sub-title v-html="data.item.detail"></v-list-tile-sub-title>-->
                </v-list-tile-content>
              </template>
            </template>  
          </v-autocomplete>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
  import Meta from 'mixins/meta'
  import axios from 'axios'

  import fontawesome from '@fortawesome/fontawesome'
  import fa_brands from '@fortawesome/fontawesome-free-brands'
  import fa_solid from '@fortawesome/fontawesome-free-solid'
  // import fa_regular from '@fortawesome/fontawesome-free-regular'

  export default {
    mixins: [Meta],
    data () {
      return {
        // clipped: true,
        on: {},
        toolbar: null,
        middleToolbar: null,
        middleToolbarSubtitle: null,
        seen: false,
        drawer: false,
        fixed: false,
        items: [
          { icon: 'apps', title: 'Início', to: '/', external: false },
          // { icon: 'stars', title: 'Destaques', to: '/', external: false },
          // { icon: 'map', title: 'Mapa Exploratório', to: '/mapa/0', external: false },
          // { icon: 'map', title: 'Mapa Exploratório', to: '/mapa/06_02_03_04?type=bubbles', external: false },
          { app_icon: 'td', title: 'Trabalho Decente',
            to: '/trabalhodecente', external: false,
            rippleColor: 'grey--text darken-3' },
          { app_icon: 'coord-02', title: 'Trabalho Escravo',
            to: '/trabalhoescravo', external: false,
            blocked: false,
            rippleColor: 'brown--text darken-3' },
          { app_icon: 'coord-01', title: 'Segurança e Saúde',
            to: '/sst', external: false,
            blocked: false,
            rippleColor: 'teal--text darken-3' },
          { app_icon: 'coord-07', title: 'Trabalho Infantil',
            to: '/trabalhoinfantil', external: false,
            blocked: false,
            rippleColor: 'indigo--text darken-3' },
          { app_icon: 'coord-06', title: 'Diversidade no Trabalho',
            to: '/diversidade', external: false,
            blocked: false,
            rippleColor: 'deep-purple--text darken-2' },
          // { icon: 'flight_takeoff', title: 'Migrações e Trabalho',
          //   to: '/', external: false }
        ],
        miniVariant: false,
        right: true,
        rightDrawer: false,
        snackbar: false,
        snackbarCookies: false,
        snack_y: 'bottom',
        snack_x: null,
        snack_mode: '',
        snack_timeout: 6000,
        snack_color: 'info',
        snackText: 'Hello, I\'m a snackbar',
        gsItemBusca: null,
        gsFavLocation: null, 
        gsLoadingStatusSearchOptions: 'LOADING',
        auOptions: [],
        locationDialog: false,
        //Formulário Relate um problema
        valid: true,
        bugDialog: false,
        sendingMail: false,
        bugCard: "",
        bugText: "",
        bugTextRules: [
          v => !!v || 'Descreva o problema',
        ],
        bugEmail: "",
        bugEmailRules: [
          v => /.+@.+/.test(v) || 'Informe um e-mail válido'
        ],        
        //
        langs: [],
        lang: null,
        visibleTitle: true,
        miniLeftDrawerTitle: false,
        hintAutocomplete: '',
        currentAnalysisUnit: null,
        currentPlaceType: null,
        observatorios: null,
        dim: { label: null }
      }
    },
    created () {    
      let tmpObs = this.$observatories.getObservatories();
      if (tmpObs instanceof Promise) {
        tmpObs.then((result) => { this.observatorios = result });
      } else {
        this.observatorios = tmpObs;
      }

      this.dim = { label: null };
      let observ = this.$observatories.constructor.identifyObservatory(this.$route.path.split('/')[1]);
      if (observ != null && (this.$route.query.dimensao || this.$route.params.idLocalidade)) {
        this.$dimensions.getDimensionByObservatoryAndId(observ, this.$route.query.dimensao)
          .then((result) => { this.dim = result; });
      }

      Promise.all(this.$analysisUnitModel.buildAllSearchOptions())
        .then((results) => {
          let hasLoading = false;
          for (let eachResult in results) {
              if (eachResult == 'ERROR') {
                this.gsLoadingStatusSearchOptions = eachResult;
                return;
              }
              if (eachResult == 'LOADING') hasLoading = true;
          }
          this.gsLoadingStatusSearchOptions = hasLoading ? 'LOADING' : 'SUCCESS';
          this.auOptions = this.$analysisUnitModel.getOptions();
        })
        .catch((error) => {
          this.gsLoadingStatusSearchOptions = 'ERROR';
          this.auOptions = this.$analysisUnitModel.getOptions();
          this.sendError("Falha ao buscar lista das localidades");
        });

      this.themeEval();
    },
    computed: {
      toolbarColor: function() {
        return this.$vuetify.theme.toolbar;
      },
      reRenderPath: function() {
        var fullPath = this.$route.fullPath;
        if (fullPath && fullPath.includes('#')) {
          return fullPath.substring(0, fullPath.indexOf('#'));
        }
        return fullPath;
      },
      computedTitle: function() {
        // Assess the current observatory
        let observ = {
          short_title: "",
          title: ''
        };

        if (this.observatorios) {
          let tmpObs = this.$observatories.getObservatoryById(this.$observatories.constructor.identifyObservatory(this.$route.path.split('/')[1]));
          if (tmpObs) {
            observ = tmpObs;
          } else if (this.$route.path.indexOf("saibamais") != -1){ //Sobre
            observ = {
              short_title: "Sobre",
              title: "Sobre"
            };
          }
        }

        if (!this.visibleTitle || (this.$route && (this.$route.path.indexOf("localidade") != -1 || 
                                   this.$route.path.indexOf("estudo") != -1 || 
                                   this.$route.path.indexOf("saibamais") != -1 || 
                                   this.$route.path.indexOf("smartmap") != -1
                                   ))){
          if (this.$vuetify.breakpoint.smAndDown) {
            return observ.short_title;
          }
          return observ.title;
        } 
        return '';
      },
      computedSubtitle: function() {
        let observ = this.$observatories.constructor.identifyObservatory(this.$route.path.split('/')[1]);

        if (!this.visibleTitle && this.dim && this.dim.short_desc){
          return this.dim.short_desc;
        }

        if (observ != null && this.$route.params.idEstudo ){
          return "Estudos temáticos";
        }

        if(this.$route.path.indexOf("smartmap") != -1){ //página de Smartlab
          return "SmartMap - Mapa Avançado";
        }
        
          
        // if (this.$route.params.tab ){
        //   return "Sobre";
        // }
          
        return '';
      },
      computedPlaceTitle: function() {
        if (this.currentAnalysisUnit) {
          let tipoLocalidade = "Seleção Atual"
          if (this.currentAnalysisUnit.tipo == 'Município'){
            tipoLocalidade = "Município Selecionado";
          } else if (this.currentAnalysisUnit.tipo == 'UF'){
            tipoLocalidade = "UF Selecionada";
          } 
          this.currentPlaceType = tipoLocalidade;
          return this.currentAnalysisUnit.nm_localidade;
        }
        return null;
      },
      // computedMiddleTitle: function() {
      //   if (this.$route.path.includes('localidade')) {
      //     if (this.miniTitle) {
      //       return this.middleToolbar;
      //     }
      //   }
      //   return '';
      // },
      // computedMiddleSubtitle: function() {
      //   if (this.$route.path.includes('localidade')) {
      //     if (this.miniTitle) {
      //       return this.middleToolbarSubtitle;
      //     }
      //   }
      //   return '';
      // },
      computedSearchItemsMunicipio: function() {
        let items = this.auOptions;
        return items.filter(function(el) {
          return el.scope == "mun";
        })
      }
    },
    mounted: function() {
      // this.checkCurrentAnalysisUnit();

      if (!this.$cookies.isKey("cookieAccept")){
        this.snackbarCookies = true;
      }

      let findLoc = this.$analysisUnitModel.findCurrentPlace();
      if (findLoc && (findLoc instanceof Promise || findLoc.then)) {
        findLoc.then(response => {
          // console.log(response);
          this.changeMiddleToolbar(response);
          if (response.id_localidade && response.id_localidade.length > 5) this.localidade = response;
        })
        .catch(error => { this.sendError(error); });
      } else if (findLoc){
        this.changeMiddleToolbar(findLoc);
        if (findLoc.id_localidade && findLoc.id_localidade.length > 5) this.localidade = findLoc;
      }
    
      this.langs = this.$translationModel.findAllLocales();
      this.lang = this.$translationModel.findBrowserLocale(this);

      window.addEventListener('scroll', this.assessVisibleTitle);
      window.addEventListener('scroll', this.assessVisibleLeftDrawerTitle);
    },
    watch: {
      '$route.fullPath': function(newVal, oldVal) {
        this.dim = { label: null }
        let observ = this.$observatories.constructor.identifyObservatory(this.$route.path.split('/')[1]);
        if (observ != null && (this.$route.query.dimensao || this.$route.params.idLocalidade)) {
          this.$dimensions.getDimensionByObservatoryAndId(observ, this.$route.query.dimensao)
            .then((result) => { this.dim = result; });
        }
      },
      gsFavLocation(newVal, oldVal) {
        if (newVal) {
          this.$analysisUnitModel.setCurrentAnalysisUnit(newVal.id);
          this.locationDialog = false;
          
          let findLoc = this.$analysisUnitModel.findPlaceByID(newVal.id);
          if (findLoc instanceof Promise || findLoc.then) {
            findLoc.then(response => {
              this.changeMiddleToolbar(response);
              if (newVal.id && newVal.id.length > 5) this.localidade = response;
            })
            .catch(error => { this.sendError(error); });
          } else {
            this.changeMiddleToolbar(findLoc);
            if (newVal.id && newVal.id.length > 5) this.localidade = findLoc;
          }

          if(this.$route.path.indexOf("localidade") != -1){ //página de localidade
            this.changeAnalysisUnit(this.$router, newVal);
          } else if (this.$refs.currentRoute.setIdLocalidade) { //página de observatorio
            this.$refs.currentRoute.setIdLocalidade(newVal.id);
          }
        }
      }
    },
    methods: {
      itemClick(item) {
        if (!item.blocked){
          this.$navigationManager.constructor.pushRoute(this.$router, item.to, item.external);
        }
      },
      customFilter (item, queryText, itemText) {
        queryText = this.$textTransformService.replaceSpecialCharacters(queryText).toLowerCase();
        itemText = this.$textTransformService.replaceSpecialCharacters(itemText).toLowerCase();
        return itemText.indexOf(queryText) > -1 
      },      
      snackAlert(params) {
        this.snack_color = params.color;
        this.snackText = params.text;
        this.snackbar = true;
      },
      changeToolbar: function(params) {
        this.themeEval();
        if (params) {
          this.toolbar = params;
        } else {
          this.toolbar = null;
        }
      },
      themeEval: function() {
        let theme = this.$observatories.getTheme(this.$observatories.constructor.identifyObservatory(this.$route.path.split('/')[1]));
        if (theme) this.$vuetify.theme = theme; // Changes only if 
      },
      changeMiddleToolbar: function(params) {
        if (params && params.localidade) {
          this.currentAnalysisUnit = params.localidade;
        } else if (params) {
          this.currentAnalysisUnit = params;
        } else {
          this.currentAnalysisUnit = null;
        }
      },

      showLocationDialog: function(){
          this.locationDialog = true;
      },

      focusChangePlace(){
        this.$refs.autocompleteChangePlace.focus();
        this.$refs.autocompleteChangePlace.activateMenu();
      },

      setCookieAccept(){
        this.$cookies.set("cookieAccept", true, -1); // Never expires
        this.snackbarCookies = false;
      },

      // changeLocale() {
      //   this.setLocale(this, this.lang);
      // },

      // getGlobalDatasetIdLocalidade(idLocalidade) {
      //   this.$indicatorsModel.getGlobalDataset(
      //     'centralindicadores',
      //     'municipio',
      //     'Falha ao buscar indicadores da localidade',
      //     idLocalidade
      //   );
      // },
      
      assessVisibleTitle() {
        // const vHeight = (window.innerHeight || document.documentElement.clientHeight);
        if (document.getElementById("screenTitle")) {
          var { top, bottom } = document.getElementById("screenTitle").getBoundingClientRect();
          if (top < 0 && bottom < 0) {
            this.visibleTitle = false;
          } else {
            this.visibleTitle = true;
          }
        } else {
          this.visibleTitle = false;
        }
      },

      assessVisibleLeftDrawerTitle() {
        // const vHeight = (window.innerHeight || document.documentElement.clientHeight);
        if (document.getElementById("screenTitle")) {
          var { top, bottom } = document.getElementById("screenTitle").getBoundingClientRect();
          if (top < 0 && bottom < 0) {
            this.miniLeftDrawerTitle = true;
          } else {
            this.miniLeftDrawerTitle = false;
          }
        }
      },

      showBugDialog(cardTitle){
        this.bugCard = cardTitle;
        // this.$refs.inputProblem.focus();
        this.bugDialog = true;
      },

      closeBugDialog(){
        this.bugDialog = false;
        this.bugEmail = '';
        this.bugText = '';
        this.$refs.bugForm.resetValidation()
      },

      sendBugReport(){
        if (this.$refs.bugForm.validate()) {
          this.sendingMail = true;
          
          let content = "Smartlab - Relate um problema" +
                        "\nObservatório: " + this.computedTitle +
                        "\nDimensão: " + this.computedSubtitle +
                        "\nLocalidade: " + this.computedPlaceTitle +
                        "\nCard: " + this.bugCard +
                        "\nDescrição do problema: " + this.$refs.bugText.value +
                        "\nE-mail contato: " + this.$refs.bugEmail.value;
          
          
          let snackAlert = this.snackAlert;
          let finishMailSend = () => { this.sendingMail = false; };
          let closeBugDialog = () => { this.bugDialog = false; };

          var requestOptions = this.$axiosCallSetupService.getAxiosOptions('/mail', 'MAIL');
          
          requestOptions.data = {
            mail: {
              sistema: "smartlab",
              recipients: ['atena@mpt.mp.br'],
              subject: "Smartlab - Relate um problema",
              "content": content
            }
          }
          
          axios(requestOptions).then(function (response) {
            finishMailSend();
            snackAlert({ color : 'success', text: "Formulário enviado com sucesso." });
            closeBugDialog();
          }).catch(function(error) {
            finishMailSend();
            snackAlert({ color : 'error', text: "Falha no envio do formulário. Tente novamente mais tarde." });
          });
        }
      },
      changeAnalysisUnit(router, searchItem, idObservatorio = null) {
        try {
          this.$navigationManager.constructor.searchAnalysisUnit(router, searchItem, idObservatorio, this.observatorios);
        }
        catch(err){
          this.snackAlert({ color : 'error', text: err });
        }
      },
      renderIcon(prefix,icon,icon_title="",icon_size="fa-lg") {
        if (prefix == "fab"){
          if (fa_brands[icon]){
            return fontawesome.icon(fa_brands[icon],{classes: [icon_size], title: icon_title}).html[0];
          }
        } else if (prefix == "fas"){
          if (fa_solid[icon]){
            return fontawesome.icon(fa_solid[icon],{classes: [icon_size], title: icon_title}).html[0];
          }
        // } else if (prefix == "far"){
        //   if (fa_regular[icon]){
        //     return fontawesome.icon(fa_regular[icon],{classes: [icon_size], title: icon_title}).html[0];
        //   }
        } 
        console.log("Icon not found: " + icon);
        return null;
        
      }
      
    }
  }
</script>

<style>
  @import "../node_modules/@fortawesome/fontawesome/styles.css";
  
  .v-toolbar {
    z-index: 101 !important;
  }

  .first-section {
    position: relative;
  }

  .bg-shadow {
    background-color:rgba(0,0,0,0.5) !important;
    position: absolute !important;
    top: 0;
    margin: 0 !important;
    width: 100%;
    min-height: 100% !important;
  }

  .bg-home-shadow {
    background-color:rgba(0,0,0,0.3) !important;
    position: absolute !important;
    top: 0;
    margin: 0 !important;
    width: 100%;
    min-height: 100% !important;
  }

  .parallax-content-home {
    min-height: 700px;
  }

  .parallax-content >.flex {
    z-index: 1;
  }

  .parallax-content-home >.flex {
    z-index: 1;
  }

  .parallax-content span {
    align-self: center;
    color: white;
  }

  .bg-translucent {
    background-color: rgba(0,0,0,0.5);
    z-index: 1;
  }

  @keyframes bg-zoom {
    1% {
      -ms-transform: translateY(0%) scale(1);
      -moz-transform: translateY(0%) scale(1);
      -webkit-transform: translateY(0%) scale(1);
      -o-transform: translateY(0%) scale(1);
      transform: translateY(0%) scale(1);
    }
    50% {
      -ms-transform: translateY(5%) scale(1.1);
      -moz-transform: translateY(5%) scale(1.1);
      -webkit-transform: translateY(5%) scale(1.1);
      -o-transform: translateY(5%) scale(1.1);
      transform: translateY(5%) scale(1.1);
    }
    95%, 100% {
      -ms-transform: translateY(0%) scale(1);
      -moz-transform: translateY(0%) scale(1);
      -webkit-transform: translateY(0%) scale(1);
      -o-transform: translateY(0%) scale(1);
      transform: translateY(0%) scale(1);
    }
  }

  .bg-zoom {
    position: absolute !important;
    top: 0;
    margin: 0 !important;
    width: 100%;
    min-height: 100% !important;
    background-position: center center; 
    background-size: cover;    

    -webkit-animation: bg-zoom 40s ease-out 0s infinite;
    -moz-animation: bg-zoom 40s ease-out 0s infinite;
    -o-animation: bg-zoom 40s ease-out 0s infinite;
    animation: bg-zoom 40s ease-out 0s infinite;
  }
  
  .fade-enter-active, .fade-leave-active {
    transition: opacity 2s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active em versões anteriores a 2.1.8 */ {
    opacity: 0;
  }


  a{
    text-decoration: none;
  }
  .bg_blue {
    background-color:rgb(0,171,240,0.5);
  }
  .bg_red{
    background-color:rgb(255,124,101,0.5);
  }
  .bg_green{
    background-color:rgb(53,246,0,0.5);
  }
  .parallax__content .bottom-nav {
    background-color: rgba(0,0,0,0.6) !important;
  }
  .drawer_input label {
    top: 8px !important;
  }
  .v-navigation-drawer, .toolbar {
    z-index: 101 !important;
  }
  .footer {
    z-index: 98 !important;
    box-shadow: 0px -2px 4px -1px rgba(0,0,0,0.2), 0px -4px 5px 0px rgba(0,0,0,0.14), 0px -1px 10px 0px rgba(0,0,0,0.12);
  }
  .leaflet-pane {
    z-index: 1 !important;
  }
  .leaflet-top, .leaflet-bottom {
    z-index: 2 !important;
  }
  .leaflet-control {
    z-index: 3 !important;
  }
  .leaflet-control-zoom-in, .leaflet-control-zoom-out {
    z-index: 4 !important;
  }
  .map_geo {
    height: 400px; 
    width: 100%; 
    position: relative;
    /* border: 1px solid #BDBDBD; */
  }
  .map_geo_full {
    position: absolute;
    z-index: 1;
    background-color: white;
    width: 100%;
    height: 100%;
    padding-top: 64px;
    top:0;
  }

  .migration-animate-path {
    animation-name: migration-path;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-duration: 80s;
    animation-direction: normal;
  }

  @keyframes migration-path {
    from{
      stroke-dashoffset: 100%
    }
    to{
      stroke-dashoffset: 0%    
    }
  }

  /* @import url('https://fonts.googleapis.com/css?family=Palanquin');   */
  /* @import url('https://fonts.googleapis.com/css?family=Lato:300');   */
  /* @import url('https://fonts.googleapis.com/css?family=Roboto+Condensed'); */
  /* @import url('https://fonts.googleapis.com/css?family=Ubuntu|Ubuntu+Condensed');   */
  
  @font-face {
    font-family: titulos-observatorio;
    src: local('titulos-observatorio'),
         url('/static/fonts/PathwayGothicOne-Regular.woff') format('woff'),
         url('/static/fonts/PathwayGothicOne-Regular.eot') format('eot');
  }
  @font-face {
    font-family: Palanquin;
    src: local('Palanquin'),
         url('/static/fonts/Palanquin-Regular.woff') format('woff'),
         url('/static/fonts/Palanquin-Regular.eot') format('eot');
  }
  @font-face {
    font-family: Lato;
    src: local('Lato'),
         url('/static/fonts/Lato-Light.woff') format('woff'),
         url('/static/fonts/Lato-Light.eot') format('eot');
    font-weight: 300;
  }
  @font-face {
    font-family: 'Roboto Condensed';
    src: local('Roboto Condensed'),
         url('/static/fonts/Roboto-Condensed.woff') format('woff'),
         url('/static/fonts/Roboto-Condensed.eot') format('eot');
  }
  @font-face {
    font-family: Ubuntu;
    src: local('Ubuntu'),
         url('/static/fonts/Ubuntu-Regular.woff') format('woff'),
         url('/static/fonts/Ubuntu-Regular.eot') format('eot');
  }
  @font-face {
    font-family: 'Ubuntu Condensed';
    src: local('Ubuntu Condensed'),
         url('/static/fonts/Ubuntu-Condensed.woff') format('woff'),
         url('/static/fonts/Ubuntu-Condensed.eot') format('eot');
  }
  

  .display-4-obs, .display-3-obs, .display-2-obs, .display-1-obs, .headline-obs, .title-obs, .caption-obs {
    font-family: titulos-observatorio, Calibri, sans-serif !important;
  }

  .ubuntu {
    font-family: Ubuntu, Calibri, sans-serif !important;
  }
  .ubuntu-condensed {
    font-family: 'Ubuntu Condensed', Calibri, sans-serif !important;
  }
  .application, .subheading, .body-2, .body-1, .body, .caption, .title-obs-desc, .link-obs, .micro-caption, .display-2, .title, .display-1, .headline {
    font-family: Palanquin, Calibri, sans-serif !important;
  }

  .screen-title {
    line-height: 0.75em !important;
  }

  .link-obs {
    font-size: 1.429rem;
  }
  
  .micro-caption {
    font-size: 0.625rem;
    line-height: 0.6875rem;
  }

  .data-source {
    font-size: 0.857rem !important;
    /* position: absolute; */
    bottom: 30px;
  }

  .position-relative {
    position: relative;
  }
  /*
  .application {
    line-height: 1.1 !important;
  }
  .display-4-obs, .display-3-obs, .display-2-obs, .display-1-obs, .headline-obs, .title-obs {
    font-family: 'Roboto Condensed', sans-serif !important;
  } */

  .line-height-1 {
    line-height: 1;
  }

  /*
  .body-obs {
    font-size: 1.143rem;
    text-align: justify;
    line-height: 1.429rem;
  }
  */
  .display-title {
    font-size: 4rem;
  }

  .body-obs {
    font-size: 1rem;
    text-align: justify;
  }

  .display-4-obs {
    font-size: 6.7rem;
  }

  .display-3-obs {
    font-size: 4rem;
  }

  .display-2-obs {
    font-size: 3.214rem;
  }

  .display-1-obs {
    font-size: 2.214rem;
  }

  .headline-obs {
    font-size: 1.714rem !important;
  }

  .title-obs {
    font-size: 1.429rem;
  }

  .caption-obs {
    font-size: 0.9375rem;
  }

  .title-obs-desc {
    font-size: 1.429rem;
  }

  .ident-list {
    list-style-position: outside;
  }

  .blue-title {
    color: rgb(53,94,168,1);
  }

  .bg-translucent .flex {
    align-self: stretch;
    color: white;
  }
  .bg-translucent .column {
    align-self: center;
  }

  .translucent {
    position: absolute;
    top:0;
    left:0;
    width: 100%;
    height: 100%;
    z-index: -1;
    opacity: 0.85;
  }

  .btn-busca {
    border-radius: 4px;
    z-index: 1;
    color: white;
    font-family: titulos-observatorio, sans-serif !important;
    font-size: large;
    font-weight: bold;
  }

  .global-search .v-icon {
    transform: none !important;
    -webkit-transform: none !important;
  }

  .error-in-card {
    color: white !important;
  }

  .v-tooltip i {
    cursor: pointer;
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .v-progress-circular__info {
    text-align: center;
  }

  .footer-nav {
    position: fixed;
    bottom: 0;
    z-index: 99;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .footer-nav>.layout {
    flex: none;
    border-radius: 0.3rem 0.3rem 0 0;
    background-color: rgba(0,0,0,0.6);
  }

  .soon {
    color:rgb(255, 230, 0) !important;
    font-weight: bold;
  }

  .v-tabs__icon--next{
    background-color:  var(--v-accent-base) !important;
    border-color:  var(--v-accent-base) !important;    
  }

  .v-tabs__icon--prev{
    background-color:  var(--v-accent-base) !important;
    border-color:  var(--v-accent-base) !important;    
  }
  /*
  .v-btn--floating.v-btn--small {
      height: 25px;
      width: 25px;
  }  
  -->
  */
</style>

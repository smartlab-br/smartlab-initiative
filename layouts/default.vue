<template>
  <div id="app">
    <v-app>
      <v-navigation-drawer
        v-if="observatorios"
        v-model="drawer"
        :mini-variant="miniVariant"
        clipped
        fixed
        disable-resize-watcher
        app
      >
        <v-list>
          <!-- Item acrescentado para solucionar problema nos displays xs, sm e md, onde o primeiro item desaparecia -->
          <v-list-tile class="hidden-lg-and-up">
            <v-list-tile-content>
              <v-list-tile-title />
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile 
            v-for="(item, i) in computedMenuItems"
            :key="i"
            v-ripple="{ class: item.rippleColor }"
            exact
            :tabindex="drawer ? 10 + i : ''"
            @click="itemClick(item)"
            @keyup.enter="itemClick(item)"
          >
            <v-list-tile-action>
              <v-tooltip bottom>
                <v-icon 
                  v-if="item.icon" 
                  slot="activator"
                  :title="item.short_title" 
                  :color="$observatories.getTheme(item.id).primary"
                  v-html="item.icon" 
                />
                <AppIcon 
                  v-else-if="item.app_icon"
                  slot="activator"
                  :title="item.short_title" 
                  :icon="item.app_icon"
                  :fill="$observatories.getTheme(item.id).primary"
                />
                {{ item.short_title }}
              </v-tooltip>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-text="item.short_title" />
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <v-divider />
        <v-list>
          <v-list-tile @click.native.stop="miniVariant = !miniVariant">
            <v-list-tile-action>
              <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'" />
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Apenas ícones</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>

      <v-toolbar 
        dark 
        fixed 
        app 
        clipped-left 
        :style="'background-color:'+toolbarColor"
      >
        <v-toolbar-side-icon 
          aria-label="Menu Principal"
          tabindex="1"
          @click.stop="drawer = !drawer" 
        />

        <v-toolbar-title class="ml-2">
          <v-layout 
            pa-0 
            row 
            align-center
          >
            <v-flex 
              pr-2 
              pt-2 
              hidden-xs-only
            >
              <img
                tabindex="20"
                src="/icons/smartlab_labeled-30.png" 
                class="cursor-pointer"
                alt="Smartlab"
                @click="$navigationManager.pushRoute($router, '/', false)"
                @keyup.enter="$navigationManager.pushRoute($router, '/', false)"
              /> 
            </v-flex>
            <v-flex 
              pr-2 
              pt-2 
              hidden-sm-and-up
            >
              <img
                tabindex="20"
                src="/icons/smartlab-icon-30x30.png" 
                class="cursor-pointer"
                alt="Smartlab"
                @click="$navigationManager.pushRoute($router, '/', false)" 
              /> 
            </v-flex>
            <v-divider 
              v-show="computedTitle" 
              vertical 
              class="mx-2" 
              style="background-color:rgba(255,255,255,0.7)"
            />
            <v-flex 
              class="line-height-1"
            >
              <v-flex 
                text-xs-right 
                class="cursor-pointer" 
                pa-0
                @click="$navigationManager.pushRoute($router, ($route && ($route.path.indexOf('localidade') != -1)) ? '../' : ($route && ($route.path.indexOf('estudo') != -1 || $route.path.indexOf('smartmap') != -1)) ? './' : '', false);" 
              >
                {{ computedTitle }}
              </v-flex>
              <v-flex 
                text-xs-right 
                pa-0 
                caption
              >
                <a 
                  class="white--text"                 
                  @click="$navigationManager.pushRoute($router, 'https://www.instagram.com/smartlab_br/', true)"
                >
                  {{ computedHashTag }}
                </a>
              </v-flex>
            </v-flex>
            <v-divider 
              v-show="computedPlaceTitle" 
              vertical 
              class="mx-2" 
              style="background-color:rgba(255,255,255,0.7)"
            />
            <v-flex 
              v-if="currentAnalysisUnit" 
              pl-2 
              class="cursor-pointer line-height-1"
              @mousedown="seen = true" 
              @click="focusChangePlace()" 
            >
              <v-flex>{{ computedPlaceTitle }}</v-flex>
              <v-flex 
                pa-0 
                caption
              >
                {{ computedPlaceType }}
              </v-flex>
            </v-flex>
          </v-layout>
        </v-toolbar-title>
        
        <v-spacer />
        
        <div width="20rem">
          <v-autocomplete
            v-if="auOptions.length > 0"
            v-show="seen"
            ref="autocompleteChangePlace"
            v-model="gsItemBusca"
            tabindex="21"
            class="input-group--focused global-search"
            persistent-hint
            item-text="label"
            placeholder="Mudar localidade"
            item-value="id"
            return-object
            :items="auOptions"
            :menu-props="{minWidth:'380px'}"
            :filter="customFilter"
            :loading="gsLoadingStatusSearchOptions == 'LOADING' ? true : false"
            :color="gsLoadingStatusSearchOptions == 'ERROR' ? 'error' : (gsLoadingStatusSearchOptions == 'LOADING' ? 'warning' : 'accent')"
            @blur="gsItemBusca = null"
          >
            <template 
              slot="item" 
              slot-scope="data"
            >
              <template v-if="auOptions.length < 2">
                <v-list-tile-content>
                  <v-progress-circular 
                    :size="20" 
                    indeterminate 
                    color="primary"
                  />
                </v-list-tile-content>
              </template>
              <template v-else>
                <v-list-tile-content>
                  <v-list-tile-title 
                    @click="changeAnalysisUnit($router, data.item)" 
                    v-html="data.item.label + (data.item.scope == 'uf'? ' (UF)': '')"
                  />
                </v-list-tile-content>
                <v-list-tile-action style="min-width: 120px">
                  <v-layout row>
                    <v-layout 
                      v-for="(search_item, indxSearch) in $observatories.getObservatories()"
                      :key="'search_item_obs_' + indxSearch"
                      @click="changeAnalysisUnit($router, data.item, search_item.id)"
                    >
                      <v-layout 
                        v-if="!search_item.blocked && (data.item.exclude_from == null || data.item.exclude_from == undefined || !data.item.exclude_from.includes(search_item.id))"
                        column 
                        wrap 
                        align-center
                      >
                        <v-tooltip bottom>
                          <v-icon 
                            v-if="search_item.icon"
                            slot="activator"
                            small 
                            :color="$observatories.getTheme(search_item.id).primary"
                            v-html="search_item.icon"
                          />
                          <AppIcon 
                            v-else-if="search_item.app_icon"
                            slot="activator"
                            size="16" 
                            :fill="$observatories.getTheme(search_item.id).primary"
                            :icon="search_item.app_icon"
                          />
                          <v-layout v-html="search_item.tooltip" /> 
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
          tabindex="22"
          icon 
          class="ml-0"
          aria-label="Alterar Localidade"
          @click="seen = !seen"
        >
          <v-tooltip bottom>
            <v-icon 
              slot="activator"
              color="white" 
            >
              place
            </v-icon>
            Alterar Localidade
          </v-tooltip>
        </v-btn>

        <!-- <v-menu 
          open-on-hover 
          right 
          offset-y
        >
          <template 
            slot="activator" 
            slot-scope="{ on }"
          >
            <v-btn
              tabindex="23"
              icon 
              class="ml-0"
              aria-label="Identifique-se"
              v-on="on"
            >
              <v-avatar
                size="36px"
              >
                <v-icon 
                  :color="$store.state.user ? 'accent' : 'white'" 
                >
                  perm_identity
                </v-icon>
              </v-avatar>
            </v-btn>
          </template>
          <v-list>
            <v-list-tile 
              v-if="!$store.state.user"
              @click="registerUser()"
            >
              <v-list-tile-title>Cadastre-se</v-list-tile-title>
            </v-list-tile>
            <v-list-tile 
              v-if="!$store.state.user"
              @click="handleAvatarClick()"
            >
              <v-list-tile-title>Entrar</v-list-tile-title>
            </v-list-tile>
            <v-list-tile 
              v-if="$store.state.user"
              @click="handleAvatarClick()"
            >
              <v-list-tile-title>Perfil</v-list-tile-title>
            </v-list-tile>
            <v-list-tile 
              v-if="$store.state.user"
              @click="userLogout()"
            >
              <v-list-tile-title>Sair</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu> -->

        <v-tooltip bottom>
          <a 
            slot="activator"
            class="white--text mx-2" 
            @click="$navigationManager.pushRoute($router, 'https://www.instagram.com/smartlab_br/', true)"
          >
            <font-awesome-icon icon="fa-brands fa-instagram" class="fa-lg" title="Instagram"/>
          </a>
          Instagram
        </v-tooltip>
      </v-toolbar>
      <v-content>
        <v-container 
          fluid 
          class="pa-0 fill-height"
        >
          <!-- nuxt capture events in created() method-->
          <nuxt
            :key="reRenderPath" 
            ref="currentRoute"
          />
          <v-slide-y-transition mode="out-in" />
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
          <v-list-tile @click.native="right = !right">
            <v-list-tile-action>
              <v-icon light>compare_arrows</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>Switch drawer (click me)</v-list-tile-title>
          </v-list-tile> 
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
      <v-layout 
        row 
        wrap 
        primary 
        align-center 
        class="white--text"
        :class="{'px-2 py-4': $vuetify.breakpoint.xsAndup, 
                'px-3 py-4': $vuetify.breakpoint.mdAndDown, 
                'px-5 py-5': $vuetify.breakpoint.lgAndUp}" 
        app
      >
        <v-flex 
          class="xs2 sm1 md1 lg2 xl2"
          :class="{'pt-5 pb-3': $vuetify.breakpoint.mdAndDown }" 
        >
          <v-layout 
            row 
            wrap 
            class="text-xs-left"
          >
            <v-flex xs12>
              <a 
                class="white--text" 
                @click="$navigationManager.pushRoute($router, '/saibamais/smartlab', false)"
              >
                <img  
                  src="/smartlab/smartlab-small.svg" 
                  alt="Smartlab" 
                  height="25px" 
                  style="margin-bottom: -5px;"
                />
                <span class="ml-3">Sobre</span>
              </a>
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex  
          class="xs10 sm11 md11 lg8 xl4 text-xs-right text-md-center" 
          :class="{'pt-5 pb-3': $vuetify.breakpoint.mdAndDown }"
        >
          <v-layout 
            align-center 
            justify-center
            wrap
          >
            <img
              src="/smartlab/mpt-extended.svg"
              class="cursor-pointer mr-2" 
              alt="Ministério Público do Trabalho"
              height="40px"
              @click="$navigationManager.pushRoute($router, 'https://mpt.mp.br', true)" 
            />
            <img
              src="/smartlab/oit.png"
              class="cursor-pointer mr-2 ml-2" 
              alt="Organização Internacional do Trabalho"
              height="40px"
              @click="$navigationManager.pushRoute($router, 'https://ilo.org', true)" 
            />
            <!-- <img 
              src="/smartlab/sit.png"
              class="cursor-pointer mb-1 ml-2" 
              alt="Subsecretaria de Inspeção do Trabalho"
              height="40px"
              @click="$navigationManager.pushRoute($router, 'https://www.gov.br/trabalho/pt-br/inspecao', true)" 
            /> -->
            <img
              src="/smartlab/cnmp.svg"
              class="cursor-pointer mb-1 ml-2" 
              alt="Conselho Nacional do Ministério Público"
              max-height="80%"
              min-height="50%"
              @click="$navigationManager.pushRoute($router, 'http://cnmp.mp.br', true)" 
            />
            <!-- <img
              src="/smartlab/mdh.png"
              class="cursor-pointer mr-2 ml-2" 
              alt="Ouvidoria Nacional dos Direitos Humanos"
              height="50px"
              @click="$navigationManager.pushRoute($router, 'https://ouvidoria.mdh.gov.br/portal', true)" 
            /> -->
            <img
              src="/smartlab/fnpeti.svg"
              class="cursor-pointer mb-1 ml-0" 
              alt="Fórum Nacional de Prevenção e Erradicação do Trabalho Infantil"
              max-height="80%"
              min-height="50%"
              @click="$navigationManager.pushRoute($router, 'https://fnpeti.org.br', true)" 
            />
            <img
              src="/smartlab/ibge.png"
              class="cursor-pointer mb-1 ml-0" 
              alt="Instituto Brasileiro de Geografia e Estatística"
              height="50px"
              @click="$navigationManager.pushRoute($router, 'http:///ibge.gov.br', true)" 
            />
            <!-- <img
              src="/smartlab/mcidadania.png"
              class="cursor-pointer mb-1 ml-0" 
              alt="Ministério da Cidadania"
              height="50px"
              @click="$navigationManager.pushRoute($router, 'https://www.gov.br/cidadania/pt-br', true)" 
            /> -->
            <img
              src="/smartlab/pacto.svg"
              class="cursor-pointer mb-1 ml-0" 
              alt="Pacto Global - Rede Brasil"
              max-height="80%"
              min-height="50%"
              @click="$navigationManager.pushRoute($router, 'https://www.pactoglobal.org.br', true)" 
            />
            <img
              src="/smartlab/onumulheres.svg"
              class="cursor-pointer ml-2" 
              alt="ONU Mulheres"
              height="20px" 
              @click="$navigationManager.pushRoute($router, 'http://www.onumulheres.org.br/', true)" 
            />
          </v-layout>
          <v-layout 
            align-center 
            justify-center
            wrap
            class="footer-colab-text"
          >
          Colaboração e apoio:<br/>
          Subsecretaria de Inspeção do Trabalho (SIT) da Secretaria de Trabalho (STRAB) - Ministério do Trabalho e Previdência (MTP), <br/>Ministério da Cidadania (MC), Ministério da Mulher, da Família e dos Direitos Humanos (MMFDH), Ouvidoria Nacional dos Direitos Humanos (ONDH)
          </v-layout>
        </v-flex>
        <v-flex  
          class="xs6 sm6 md6 lg1 xl3 text-md-left text-lg-center subheading"
          :class="{'pt-5 pb-3 ': $vuetify.breakpoint.mdAndDown }" 
        >
          <a 
            class="white--text mr-2" 
            @click="$navigationManager.pushRoute($router, 'https://www.instagram.com/smartlab_br/', true)"
          >
            <font-awesome-icon icon="fa-brands fa-instagram" class="fa-lg" title="Instagram"/>
          </a>
          <a 
            class="white--text mr-2" 
            @click="$navigationManager.pushRoute($router, 'https://github.com/smartlab-br', true)"
          >
            <font-awesome-icon icon="fa-brands fa-github" class="fa-lg" title="GitHub"/>
          </a>
          <a 
            class="white--text mr-2" 
            @click="$navigationManager.pushRoute($router, 'https://hub.docker.com/u/smartlab/', true)"
          >
            <font-awesome-icon icon="fa-brands fa-docker" class="fa-lg" title="Docker"/>
          </a>
        </v-flex>
        <v-flex  
          class="xs6 sm6 md6 lg1 xl3 text-xs-right subheading" 
          :class="{'pt-5 pb-3': $vuetify.breakpoint.mdAndDown }" 
        >
          <div class="caption mr-1 mb-1">
            Licenças
          </div>
          <a 
            class="white--text mx-2" 
            @click="$navigationManager.pushRoute($router, 'https://creativecommons.org/licences/by-nc-sa/4.0/', true)"
          >
            <font-awesome-icon icon="fa-brands fa-creative-commons" class="fa-lg" title="CC BY 4.0"/>
          </a>
          <a 
            class="white--text" 
            @click="$navigationManager.pushRoute($router, 'https://opensource.org/licenses/MIT', true)"
          >
            <font-awesome-icon icon="fa-brands fa-osi" class="fa-lg" title="MIT - Open Source Initiative"/>
          </a>
        </v-flex>
      </v-layout>

      <v-snackbar 
        v-model="snackbar"
        :timeout="snack_timeout" 
        :top="snack_y === 'top'" 
        :bottom="snack_y === 'bottom'"
        :right="snack_x === 'right'" 
        :left="snack_x === 'left'" 
        :multi-line="snack_mode === 'multi-line'"
        :vertical="snack_mode === 'vertical'" 
        :color="snack_color" 
      >
        {{ snackText }}
        <v-btn 
          flat 
          color="white" 
          @click.native="snackbar = false"
        >
          Fechar
        </v-btn>
      </v-snackbar>

      <v-snackbar  
        v-model="snackbarCookies"
        bottom
        multi-line 
        :timeout="0" 
        color="blue-grey darken2" 
      >
        Este site utiliza cookies para registrar as preferências de navegação do usuário. Ao navegar no site, você aceita a utilização dos cookies.
        <v-btn 
          flat 
          color="white" 
          @click.native="setCookieAccept"
        >
          Fechar
        </v-btn>
      </v-snackbar>
      
      <v-dialog 
        v-model="bugDialog"
        width="500px" 
      >
        <v-card>
          <v-card-title 
            class="headline-obs py-1"
          >
            Relate um problema
          </v-card-title>
          <v-card-text py-1>
            <v-form 
              ref="bugForm" 
              v-model="valid"
            >
              <v-container>
                <v-layout column>
                  <v-flex py-0>
                    <v-text-field 
                      v-model="computedTitle"
                      class="py-0"
                      label="Observatório"
                      readonly
                    />
                  </v-flex>

                  <v-flex py-0>
                    <v-text-field 
                      v-model="computedSubtitle"
                      class="py-0"
                      label="Dimensão"
                      readonly
                    />
                  </v-flex>

                  <v-flex py-0>
                    <v-text-field 
                      v-model="computedPlaceTitle"
                      class="py-0"
                      label="Localidade"
                      readonly
                    />
                  </v-flex>

                  <v-flex py-0>
                    <v-text-field 
                      v-model="bugCard"
                      class="py-0"
                      label="Card"
                      readonly
                    />
                  </v-flex>

                  <v-flex py-0>
                    <v-textarea 
                      v-if="bugDialog"
                      ref="bugText"
                      v-model="bugText"
                      class="py-0"
                      label="Relate um problema"
                      :rules="bugTextRules"                      
                      autofocus
                      required
                    />
                  </v-flex>

                  <v-flex>
                    <v-text-field 
                      ref="bugEmail"                     
                      v-model="bugEmail"
                      class="py-0"
                      :rules="bugEmailRules" 
                      label="E-mail contato"
                      required
                    />
                  </v-flex>

                  <v-layout 
                    py-0 
                    row
                  >
                    <v-layout 
                      v-show="sendingMail"
                      pa-0 
                    >
                      <v-progress-circular 
                        indeterminate
                        color="accent"
                      />
                      <span class="pl-2 align-self-center">Enviando...</span>
                    </v-layout>
                    <v-spacer />
                    <v-layout 
                      justify-end 
                      pa-0
                    >
                      <v-btn 
                        small 
                        flat  
                        class="mb-0 mr-2"
                        @click="sendBugReport"
                      >
                        <span class="hidden-sm-and-down body">Enviar</span>
                        <v-icon right>
                          send
                        </v-icon> 
                      </v-btn>
                      <v-btn
                        small 
                        flat 
                        class="mb-0 mx-0"
                        @click="closeBugDialog"
                      >
                        <span class="hidden-sm-and-down body">Fechar</span>
                        <v-icon right>
                          close
                        </v-icon> 
                      </v-btn>
                    </v-layout>
                  </v-layout>
                </v-layout>
              </v-container>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog 
        v-model="locationDialog" 
        width="500px" 
        persistent
      >
        <v-card>
          <v-card-title 
            class="headline-obs"
          >
            Informe o município a ser visualizado ou sua localidade:
          </v-card-title>
          <v-card-text>
            <v-autocomplete
              v-if="auOptions.length > 0"
              v-model="gsFavLocation"
              persistent-hint
              item-text="label"
              placeholder="Município"
              item-value="id"
              class="input-group--focused global-search"
              return-object
              :items="computedSearchItemsMunicipio"
              :filter="customFilter"
              :loading="gsLoadingStatusSearchOptions == 'LOADING' ? true : false"
              :color="gsLoadingStatusSearchOptions == 'ERROR' ? 'error' :
                (gsLoadingStatusSearchOptions == 'LOADING' ? 'warning' : 'accent')"
              @blur="gsFavLocation = null"
            >
              <template 
                slot="item" 
                slot-scope="data"
              >
                <template v-if="auOptions.length < 2">
                  <v-list-tile-content>
                    <v-progress-circular 
                      :size="20" 
                      indeterminate 
                      color="primary"
                    />
                  </v-list-tile-content>
                </template>
                <template v-else>
                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.label" />
                  </v-list-tile-content>
                </template>
              </template>  
            </v-autocomplete>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog 
        v-model="authMessageDialog"
        width="500px" 
      >
        <v-card>
          <v-card-title class="headline-obs">
            Identificação necessária
          </v-card-title>
          <v-card-text>
            <p>Para baixar os microdados, você precisa se identificar mediante nome de usuário e senha. Em breve, a funcionalidade estará disponível.</p>
          </v-card-text>
          <v-layout 
            align-center 
            justify-center 
            row 
            fill-height
          >
            <!-- <v-btn 
              class="theme--light mb-3 mt-0" 
              color="accent" 
              @click="handleRegisterClick()"
            >
              <v-icon 
                left 
                color="white"
              >
                perm_identity
              </v-icon>
              Cadastrar
            </v-btn>
            <v-btn 
              class="theme--light mb-3 mt-0" 
              color="accent" 
              @click="handleAuthClick()"
            >
              <v-icon 
                left 
                color="white"
              >
                login
              </v-icon>
              Entrar
            </v-btn> -->
            <v-btn 
              class="theme--light mb-3 mt-0" 
              color="accent" 
              @click="authMessageDialog = false"
            >
              Fechar
            </v-btn>
          </v-layout>
        </v-card>
      </v-dialog>

      <v-layout 
        text-xs-center 
        pa-0 
        class="footer-nav white--text"
      >
        <v-layout 
          row 
          wrap 
          caption 
          class="cursor-pointer"
        >
          <v-layout 
            v-if="!isPageBottom" 
            column 
            scroll-menu 
            pa-2
            @click="scrollDown()"
          >
            Leia mais
            <v-icon dark>
              keyboard_arrow_down
            </v-icon>
          </v-layout>
          <v-layout 
            v-if="isPageBottom" 
            column 
            scroll-menu 
            pa-2
            @click="scrollTop()"
          >
            <v-icon dark>
              keyboard_arrow_up
            </v-icon>
            Para o topo
          </v-layout>
        </v-layout>
      </v-layout>
    </v-app>
  </div>
</template>

<script>
  import axios from 'axios'

export default {
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
        isPageBottom: true,
        menuItems: [
          { icon: 'apps', short_title: 'Início', to: '/', external: false },
          // { icon: 'stars', title: 'Destaques', to: '/', external: false },
          // { icon: 'map', title: 'Mapa Exploratório', to: '/mapa/0', external: false },
          // { icon: 'map', title: 'Mapa Exploratório', to: '/mapa/06_02_03_04?type=bubbles', external: false },
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
        authMessageDialog: false,
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
        observatorios: null,
        currentObs: null,
        dim: { label: null },
        userData: {additionalInformation:{}},
        graviteeUser: {}
      }
    },
    computed: {
      computedLoginLabel: function(){
        if (this.$store.state.user){
          return "Visualizar perfil";
        } else {
          return "Identifique-se"
        }
      },
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
          let tmpObs = this.$observatories.getObservatoryById(this.currentObs);
          if (tmpObs) {
            observ = tmpObs;
          } else if (this.$route.path.indexOf("perfil") != -1){ //Perfil
            observ = {
              short_title: "Perfil",
              title: "Perfil"
            };
          } else if (this.$route.path.indexOf("mapasite") != -1){ //Mapa do Site
            observ = {
              short_title: "Mapa do Site",
              title: "Mapa do Site"
            };
          } else if (this.$route.path.indexOf("saibamais") != -1){ //Sobre
            observ = {
              short_title: "Sobre",
              title: "Sobre"
            };
          }
        }
        
        if (this.$vuetify.breakpoint.mdAndDown) {
          return observ.short_title;
        }
        return observ.title;
      },
      computedHashTag: function() {
        let hashTag = '';
        if (this.computedTitle != ''){
          if (this.computedTitle == "Sobre"){
            hashTag = "#TrabalhoDecente";
          } else if (this.observatorios) {
            let observ = this.$observatories.getObservatoryById(this.currentObs);
            if (observ) {
                hashTag = "#"+ observ.hash_tag;
            } 
          }
        }
        return hashTag;
      },
      computedSubtitle: function() {

        if (!this.visibleTitle && this.dim && this.dim.short_desc){
          return this.dim.short_desc;
        }

        if (this.currentObs != null && this.$route.params.idEstudo ){
          return "Estudos temáticos";
        }

        if(this.$route.path.indexOf("smartmap") != -1){ //página de Smartlab
          return "SmartMap - Mapa Avançado";
        }
        
          
        return '';
      },
      computedPlaceTitle: function() {
        if (this.currentAnalysisUnit) {
          return this.currentAnalysisUnit.nm_localidade;
        }
        return null;
      },
      computedPlaceType: function() {
        if (this.currentAnalysisUnit) {
          let tipoLocalidade = "Seleção Atual"
          if (this.currentAnalysisUnit.tipo == 'Município'){
            tipoLocalidade = "Município Selecionado";
          } else if (this.currentAnalysisUnit.tipo == 'UF'){
            tipoLocalidade = "UF Selecionada";
          } 
          return tipoLocalidade;
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
      },
      computedMenuItems: function() {
        if (this.observatorios) {
          return [].concat(this.menuItems, this.observatorios);
        } else {
          return this.menuItems;
        }
      }
    },
    watch: {
      '$route.fullPath': function(newVal, oldVal) {
        this.currentObs = this.$observatories.identifyObservatory(this.$route.path.split('/')[1]);
        this.dim = { label: null }
        if (this.currentObs != null && (this.$route.query.dimensao || this.$route.params.idLocalidade)) {
          this.$dimensions.getDimensionByObservatoryAndId(this.currentObs, this.$route.query.dimensao)
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
              if (newVal.id && newVal.id.toString().length > 5) this.localidade = response;
            })
            .catch(error => { this.sendError(error); });
          } else {
            this.changeMiddleToolbar(findLoc);
            if (newVal.id && newVal.id.toString().length > 5) this.localidade = findLoc;
          }

          if(this.$route.path.indexOf("localidade") != -1){ //página de localidade
            this.changeAnalysisUnit(this.$router, newVal);
          } else if (this.$refs.currentRoute.setIdLocalidade) { //página de observatorio
            this.$refs.currentRoute.setIdLocalidade(newVal.id);
          }
        }
      }
    },
    created () {    
      // nuxt component - capture events
      // @userChanged="updateUser" 
      // @showSnackbar="snackAlert"
      // @showLocationDialog="showLocationDialog" 
      // @showAuthenticatioDialog="showAuthenticatioDialog" 
      // @showBugDialog="showBugDialog" 
      // @alterToolbar="changeToolbar" 
      // @alterMiddleToolbar="changeMiddleToolbar" 
      this.$nuxt.$on('userChanged', (params) => {
        this.updateUser(params)
      })
      this.$nuxt.$on('showSnackbar', (params) => {
        this.snackAlert(params)
      })
      this.$nuxt.$on('showLocationDialog', () => {
        this.showLocationDialog()
      })
      this.$nuxt.$on('showAuthenticatioDialog', () => {
        this.showAuthenticatioDialog()
      })
      this.$nuxt.$on('showBugDialog', () => {
        this.showBugDialog()
      })
      this.$nuxt.$on('alterToolbar', (params) => {
        this.changeToolbar(params)
      })
      this.$nuxt.$on('alterMiddleToolbar', (params) => {
        this.changeMiddleToolbar(params)
      })


      let tmpObs = this.$observatories.getObservatories();
      if (tmpObs instanceof Promise) {
        tmpObs.then((result) => { 
          this.observatorios = result;
        });
      } else {
        this.observatorios = tmpObs;
      }

      this.dim = { label: null };
      this.currentObs = this.$observatories.identifyObservatory(this.$route.path.split('/')[1]);
      if (this.currentObs != null && (this.$route.query.dimensao || this.$route.params.idLocalidade)) {
        this.$dimensions.getDimensionByObservatoryAndId(this.currentObs, this.$route.query.dimensao)
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
    mounted: function() {

      if (!this.$cookies.isKey("cookieAccept")){
        this.snackbarCookies = true;
      }

      let findLoc = this.$analysisUnitModel.findCurrentPlace();
      if (findLoc && (findLoc instanceof Promise || findLoc.then)) {
        findLoc.then(response => {
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

      window.addEventListener('scroll', this.assessPageBottom);
      this.assessPageBottom();

      window.addEventListener('scroll', this.assessVisibleTitle);
      window.addEventListener('scroll', this.assessVisibleLeftDrawerTitle);
    },
    methods: {
      assessPageBottom() {
        this.isPageBottom = false;
        if (window && document) {
          if (window.scrollY == 0){ //início
            this.isPageBottom = false;
          }
          else{
            this.isPageBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight-1;
          }
        } 
      },

      scrollDown(){
        window.scrollBy(0, window.innerHeight / 2);        
      },

      scrollTop(){
        window.scrollTo(0,0);
      },

      itemClick(item) {
        if (!item.blocked){
          this.$navigationManager.pushRoute(this.$router, item.to, item.external);
        } else {
          this.snackAlert({ color : 'orange darken-4', text: "Esse observatório estará disponível em breve." })
        }
      },
      customFilter (item, queryText, itemText) {
        queryText = this.$textTransformService.replaceSpecialCharacters(queryText).toLowerCase();
        itemText = this.$textTransformService.replaceSpecialCharacters(itemText).toLowerCase();
        return itemText.indexOf(queryText) > -1 
      },      
      snackAlert(params) {
        this.snack_mode = params.snack_mode || '';
        this.snack_timeout = params.timeout || 6000;
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
        let theme = this.$observatories.getTheme(this.currentObs);
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

      showAuthenticatioDialog: function() {
        this.authMessageDialog = true;
      },

      handleAuthClick: function() {
        this.showLoginDialog();
        this.authMessageDialog = false;
      },

      handleRegisterClick: function() {
        this.$navigationManager.pushRoute(this.$router, '/cadastro', false)
      },

      registerUser: function() {
        this.$navigationManager.pushRoute(this.$router, '/cadastro', false)
      },

      handleAvatarClick: function() {
        if (this.$store.state.user) {
          this.$navigationManager.pushRoute(this.$router, '/perfil', false)
        } else {
          this.showLoginDialog()
        }
      },

      showLoginDialog: function(){
        var loginUrl = `${process.env.GRAVITEE_AM_BASE_URL}/oauth/authorize?client_id=${process.env.GRAVITEE_AM_CLIENT_ID}&response_type=token&redirect_uri=${process.env.GRAVITEE_AM_REDIRECT_URL}`;
        var popup = window.open(loginUrl, '_blank', 'width=550,height=450,resizable=no,scrollbars=yes')

        var this_ = this;
        var poolingInterval = setInterval(function () {
          if (!popup || popup.closed || popup.closed === undefined) {
            clearInterval(poolingInterval);
            poolingInterval = null;
            throw new Error('Pop-up de login fechado.');
          }
          try {
            var popupWindowPath = popup.location;             
            if (popupWindowPath.hash) {
              var params = popupWindowPath.hash.split("access_token=")[1]
              var access_token = params.split("&")[0]
              var bearer = 'Bearer ' + access_token
              axios({
                method: "GET",
                url: `${process.env.GRAVITEE_AM_BASE_URL}/oidc/userinfo`,
                data: {},
                headers: {'Authorization': bearer}
              }).then(function (response) {
                this_.graviteeUser = response.data;
                this_.updateUser(this_.graviteeUser)
                this_.snackAlert({ color : 'success', text: "Login realizado com sucesso." });
              }).catch(function(error) {
                this_.userLogout();
                // handle error
                console.log(error)
                throw new Error('Erro ao buscar informações do usuário.');
              });

              clearInterval(poolingInterval);
              poolingInterval = null;
              popup.close();
            }
          } catch(e) {
            console.log(e.message)
            // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
          }
        }, 250);

      },

      userLogout(){
        this.$store.commit('setUser', null);
        window.location = `${process.env.GRAVITEE_AM_BASE_URL}/logout?invalidate_tokens=true&target_url=${process.env.GRAVITEE_AM_REDIRECT_URL}`;
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

          axios(this.$axiosCallSetupService.getAxiosOptions(
            '/mail', true,
            {
              mail: {
                sistema: "smartlab",
                recipients: ['atena@mpt.mp.br'],
                subject: "Smartlab - Relate um problema",
                "content": content
              }
            })
          ).then(function (response) {
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
          this.$navigationManager.searchAnalysisUnit(router, searchItem, idObservatorio, this.observatorios);
        }
        catch(err){
          this.snackAlert({ color : 'error', text: err });
        }
      },
      // renderIcon(prefix,icon,icon_title="",icon_size="fa-lg") {
      //   if (prefix == "fab"){
      //     if (fa_brands[icon]){
      //       return fontawesome.icon(fa_brands[icon],{classes: [icon_size], title: icon_title}).html[0];
      //     }
      //   } else if (prefix == "fas"){
      //     if (fa_solid[icon]){
      //       return fontawesome.icon(fa_solid[icon],{classes: [icon_size], title: icon_title}).html[0];
      //     }
      //   // } else if (prefix == "far"){
      //   //   if (fa_regular[icon]){
      //   //     return fontawesome.icon(fa_regular[icon],{classes: [icon_size], title: icon_title}).html[0];
      //   //   }
      //   } 
      //   console.log("Icon not found: " + icon);
      //   return null;
        
      // },

      updateUser(user){
        this.$store.commit('setUser', user)
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
    background-color: black;
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
    position: absolute !important;
    top: 0;
    margin: 0 !important;
    width: 100%;
    min-height: 100% !important;
  }

  .parallax-content-home {
    min-height: 700px;
    background-color: black;
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
         url('/fonts/PathwayGothicOne-Regular.woff') format('woff'),
         url('/fonts/PathwayGothicOne-Regular.eot') format('eot');
  }
  @font-face {
    font-family: Palanquin;
    src: local('Palanquin'),
         url('/fonts/Palanquin-Regular.woff') format('woff'),
         url('/fonts/Palanquin-Regular.eot') format('eot');
  }
  @font-face {
    font-family: Lato;
    src: local('Lato'),
         url('/fonts/Lato-Light.woff') format('woff'),
         url('/fonts/Lato-Light.eot') format('eot');
    font-weight: 300;
  }
  @font-face {
    font-family: 'Roboto Condensed';
    src: local('Roboto Condensed'),
         url('/fonts/Roboto-Condensed.woff') format('woff'),
         url('/fonts/Roboto-Condensed.eot') format('eot');
  }
  @font-face {
    font-family: Ubuntu;
    src: local('Ubuntu'),
         url('/fonts/Ubuntu-Regular.woff') format('woff'),
         url('/fonts/Ubuntu-Regular.eot') format('eot');
  }
  @font-face {
    font-family: 'Ubuntu Condensed';
    src: local('Ubuntu Condensed'),
         url('/fonts/Ubuntu-Condensed.woff') format('woff'),
         url('/fonts/Ubuntu-Condensed.eot') format('eot');
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
    margin-left: 47vw;
    z-index: 99;
    width: 64px;
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
  .footer-colab-text {
    font-size: x-small;
  }
  /*
  .v-btn--floating.v-btn--small {
      height: 25px;
      width: 25px;
  }  
  -->
  */

</style>

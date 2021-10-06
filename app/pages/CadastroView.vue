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
        Cadastro de novo usuário
      </v-tab>
    </v-tabs>
    <v-tabs-items>
      <v-tab-item>
        <v-container px-5 class="white--text">

          <v-container grid-list-md>
              <v-layout row wrap align-center>
                <v-flex py-0 xs12>
                  <!-- <v-card>
                    <v-card-title 
                    class="headline-obs py-1"
                    >
                    Registro do usuário
                    </v-card-title>
                    <v-card-text py-1> -->
                    <v-form 
                        ref="userDataForm" 
                        v-model="valid"
                    >
                        <v-container>
                        <v-layout 
                            row 
                            wrap
                        >
                            <v-flex 
                            pt-2 
                            pb-0 
                            xs6
                            >
                            <v-text-field 
                                v-model="userData.email"
                                class="py-0"
                                label="E-mail"
                                required
                                dark
                                :rules="[userDataTextRules.required, userDataTextRules.email]"                      
                            />
                            </v-flex>

                            <v-flex
                            pt-2 
                            pb-0 
                            xs6
                            >
                            <v-text-field 
                                v-model="userData.password"
                                type="password"
                                class="py-0"
                                label="Senha (min. 6 caracteres)"
                                required
                                dark
                                :rules="[userDataTextRules.required, userDataTextRules.password]"                      
                            />
                            </v-flex>

                            <v-flex
                            pt-2 
                            pb-0 
                            xs6
                            >
                            <v-text-field 
                                v-model="userData.firstName"
                                class="py-0"
                                label="Nome"
                                required
                                dark
                                :rules="[userDataTextRules.required]"                      
                            />
                            </v-flex>

                            <v-flex
                            pt-2 
                            pb-0 
                            xs6
                            >               
                            <v-text-field 
                                v-model="userData.lastName"
                                class="py-0"
                                label="Sobrenome"
                                required
                                dark
                                :rules="[userDataTextRules.required]"                      
                            />
                            </v-flex>

                            <v-flex
                            pt-2 
                            pb-0 
                            xs6
                            >                
                            <v-text-field            
                                v-model="userData.additionalInformation.phone_number"
                                class="py-0"
                                label="Telefone de contato"
                                required
                                dark
                                :rules="[userDataTextRules.required]"                      
                            />
                            </v-flex>

                            <v-flex
                            pt-2 
                            pb-0 
                            xs6
                            >
                            <v-text-field 
                                v-model="userData.additionalInformation.occupation"
                                class="py-0"
                                label="Profissão"
                                required
                                dark
                                :rules="[userDataTextRules.required]"                      
                            />
                            </v-flex>

                            <v-flex
                            pt-2 
                            pb-0 
                            xs6
                            >                
                            <v-text-field 
                                v-model="userData.additionalInformation.institution"
                                class="py-0"
                                label="Instituição"
                                required
                                dark
                                :rules="[userDataTextRules.required]"                      
                            />
                            </v-flex>

                            <v-flex
                            pt-2 
                            pb-0 
                            xs6
                            >
                            <v-text-field   
                                v-model="userData.additionalInformation.institution_website"
                                class="py-0"
                                label="Site da instituição"
                                required
                                dark
                                :rules="[userDataTextRules.required]"                      
                            />
                            </v-flex>

                            <v-flex
                            pt-2 
                            pb-0 
                            xs12
                            >                
                            <v-select
                                v-model="userData.additionalInformation.research_field"
                                :items="['Científico','Jornalístico','Acadêmico','Iniciativa Governamental','Outros']"
                                label="Campo de pesquisa ou investigação"
                                required
                                dark
                                :rules="[userDataTextRules.required]"                      
                            />
                            </v-flex>

                            

                            <v-flex
                            pt-2 
                            pb-0 
                            xs12
                            >                
                            <v-textarea 
                                ref="userResearchText"
                                v-model="userData.additionalInformation.research"
                                class="py-0"
                                label="Descrição da sua iniciativa"
                                counter="2500"
                                placeholder="Descreva, com no mínimo 50 (cinquenta) palavras, seu projeto ou plano de uso dos dados."
                                required
                                dark
                                rows="3"
                                maxlength="2500"
                                :rules="[userDataTextRules.required, userDataTextRules.userResearchText]"
                            />
                            </v-flex>

                            <v-flex
                            pt-4 
                            pb-0 
                            xs12
                            >                
                            <p class="important-notes"><b>IMPORTANTE</b><br/>
                            Ao submeter o formulário, você concorda em respeitar todas as condições de uso, entre elas a de não redistribuir o conteúdo obtido. <br/>
                            Cada potencial usuário deverá submeter sua própria solicitação. <br/>
                            As informações aqui publicadas podem ser utilizadas em veículos como artigos científicos, jornais, relatórios e análogos sem fins comerciais. <br/>
                            Você está ciente de que todos os dados provém de plataformas públicas (a exemplo do IBGE, do IPEA, do INEP, entre outros), em que não há identificação de indivíduos.<br/>
                            </p>
                            </v-flex>


                            

                            <v-layout 
                            py-0 
                            row
                            >
                            <v-layout 
                                justify-end 
                                pa-0
                            >
                                <v-btn 
                                small 
                                flat  
                                dark
                                class="mb-0 mr-2"
                                @click="sendUserData"
                                >
                                <span class="hidden-sm-and-down body">Cadastrar usuário</span>
                                <v-icon right>
                                    send
                                </v-icon> 
                                </v-btn>
                            </v-layout>
                            </v-layout>
                        </v-layout>
                        </v-container>
                    </v-form>
                    <!-- </v-card-text>
                </v-card> -->
                </v-flex>

                <v-dialog 
                v-model="notificationDialog"
                width="80%"
                persistent
                >
                <v-layout 
                py-0 
                row
                secondary
                >

                <v-container  class="white--text">
                    <v-layout 
                        row 
                        wrap
                    >
                    <v-flex 
                        pt-2 
                        pb-0 
                        xs12
                        dark
                        >
                        <p class="headline-obs">REGISTRO PARA USO DE DADOS DA PLATAFORMA SMARTLAB</p>
                        <p>As informações e o conhecimento produzido pela Plataforma SmartLab são públicos e gratuitos, tendo como origem diferentes fontes de dados abertos e igualmente públicos. Para acessar os dados de cada dimensão, você deve submeter o formulário eletrônico que o identifique pelo nome, endereço eletrônico e afiliação institucional. </p>
                        <p>A plataforma precisa identificar os usuários das informações e seus perfis de acesso para aprimorar os serviços oferecidos. Assim, o usuário deve declarar o propósito do uso e concordar com as regras abaixo especificadas. Se mais de um usuário estiver envolvido em determinado projeto ou uso, cada um deles deve submeter o seu formulário separadamente. Assim, não é permitido o cadastro de pessoas jurídicas sem identificação do usuário.</p>
                        <p>Ao completar o formulário, você concorda: <br/>a) em receber mensagens de e-mail ocasionais, que não serão frequentes; <br/>b) em compartilhar os dados pessoais abaixo especificados, que serão tratados para os fins exclusivos deste serviço.</p>
                        <p>Suas informações pessoais serão mantidas em segurança.</p>

                        <p class="headline-obs">CITAÇÕES</p>
                        <p>As citações da plataforma, em regra, devem respeitar o formato ABNT para cada Observatório, incluindo-se, na consulta, a dimensão específica consultada.</p>
                        <p>Exemplos:</p>
                        <ul class="mention-examples">
                        <li>Observatório do Trabalho Decente – Contexto Econômico e Social. SmartLab, 2021. Fonte original: (...). Disponível em: https://smartlabbr.org/trabalhodecente. Acesso em: 10 de ago. de 2021.</li>
                        <li>Observatório de Segurança e Saúde no Trabalho – Covid 19. Fonte original: (...). SmartLab, 2021. Disponível em: https://smartlabbr.org/sst. Acesso em: 10 de ago. de 2021.</li>
                        <li>Observatório da Erradicação do Trabalho Escravo e do Tráfico de Pessoas – Sinan/ Tráfico de Pessoas. Fonte original: (...). SmartLab, 2021. Disponível em: https://smartlabbr.org/trabalhoescravo. Acesso em: 10 de ago. de 2021.</li>
                        <li>Observatório da Prevenção e da Erradicação do Trabalho Infantil – Áreas Prioritárias e Análise Comparativa. Fonte original: (...). SmartLab, 2021. Disponível em: https://smartlabbr.org/trabalhoinfantil. Acesso em: 10 de ago. de 2021.</li>
                        <li>Observatório da Diversidade e Igualdade de Oportunidades no Trabalho – População em Situação de Rua. Fonte original: (...). SmartLab, 2021. Disponível em: https://smartlabbr.org/diversidade. Acesso em: 10 de ago. de 2021.</li>
                        </ul>
                        <p>Além disso, você deverá citar adequadamente a fonte original dos dados, indicada em cada dimensão e visão. A apresentação de informações falsas, enganosas ou fraudulentas constitui uma violação deste acordo.</p>

                        </v-flex>

                        <v-layout 
                            justify-space-between
                            pa-0
                        >
                        <v-btn
                        small 
                        dark
                        class="my-0 mx-0"
                        @click="handleBackToHome"
                        >
                        <v-icon left>
                            close
                        </v-icon> 
                        <span class="hidden-sm-and-down body">Voltar</span>
                        </v-btn>
                        <v-btn
                        small 
                        dark
                        class="my-0 mx-0"
                        @click="closeNotificationDialog"
                        >
                        <v-icon left>
                            check
                        </v-icon> 
                        <span class="hidden-sm-and-down body">Eu concordo</span>
                        </v-btn>
                    </v-layout>
                    </v-layout>
                </v-container>

                </v-layout>
                </v-dialog>
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
import axios from 'axios'
  export default {
    data () {
      return {
        valid: true,
        userDataTextRules: {
          required: v => !!v || 'Preencha o campo',
          password: v => (v && v.length >= 6) || 'Senha de no mínimo 6 caracteres',
          email: value => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'E-mail inválido.'        
          },
          userResearchText: value => {
            if (value) {
              var words = value.trim().split(' ')
              return words.length >= 50 || 'A descrição deve ter no mínimo 50 palavras'
            }
            return 'A descrição deve ter no mínimo 50 palavras'
            
          }
        },
        userData: {additionalInformation:{}},
        graviteeUser: {},
        notificationDialog: false,
      }
    },
    // created () {
    //   if (!this.$store.state.user) {
    //     this.$navigationManager.constructor.pushRoute(this.$router, '/', false)
    //   } else {
    //     this.userData = this.$store.state.user;
    //   }
    // },
    mounted(){
      this.$vuetify.theme = this.$observatories.getTheme('default');
      this.notificationDialog = true;
    },
    methods: {
      handleBackToHome(){
        this.$navigationManager.constructor.pushRoute(this.$router, '/', false)
      },
      // logOut: function() {
      //   this.$store.commit('setUser', null);
      //   window.location = `${process.env.GRAVITEE_AM_BASE_URL}/logout?invalidate_tokens=true&target_url=${process.env.GRAVITEE_AM_REDIRECT_URL}`;
      // },
      closeNotificationDialog(){
        this.notificationDialog = false;
        this.$refs.userDataForm.resetValidation()
      },

      sendUserData(){
        let this_ = this;
        if (this.$refs.userDataForm.validate()){ 
          axios.post(
              '/register',
              this.userData
          ).then((response) => {
            console.log(response);
            this_.notificationDialog = false;
            this_.snackAlert({ color : 'blue darken-1', text: "Dados enviados. Verifique seu e-mail para confirmar o registro." });
            this.$refs.userDataForm.reset()
            // this.showLoginDialog();
          }).catch((error) => {
            console.log(error.response ? error.response.data.message : error.message);
            this_.snackAlert({ color : 'error', text: "Falha no registro do usuário. Por favor, tente novamente. Erro: '" +  (error.response ? error.response.data.message : error.message) + "'"});
          });          
        }
      },
      updateUser(user){
        this.$store.commit('setUser', user)
      }
    }
  }
</script>
<style>
 .social-access-badge {
   margin-top: 15px;
 }
 .notification-dialog {
    background-color: #212121;
 }
 .mention-examples {
     list-style-type: square;
     padding-bottom: 20px;
 }
 .mention-examples li::marker {
  font-size: 75%;
}
.error--text  .v-input__slot {
  margin-bottom: 0px;
}
.primary--text {
    color: white !important;
    caret-color: white !important;
}
.important-notes{
  font-size: 0.85rem;;
}
</style>
<template>
  <v-layout row wrap>
    <v-layout xs12 sm8 offset-xs0 offset-sm2 class="py-5" style="width:100%"> 
      <v-container grid-list-lg style="display:block;"> 
        <FLPOSobreLayout v-if="activeTab" :content="content" :active-tab="activeTab"></FLPOSobreLayout>
      </v-container>
    </v-layout>
  </v-layout>
</template>
<script>
  export default {
    data () {
      return {
        content: {
          origem: {
            tab: "Origem dos Dados",
            title: "",
            sections: []
          },
          openapi: {
            tab: "DATAHUB-API",
            title: "",
            sections: []
          },
          tecnologias: {
            tab: "Tecnologias Open Source Usadas",
            sections: [
              { title: "Tecnologias Open Source Utilizadas",
                type: "text",
                texts: 
                  [
                    "Por princípio, as tecnologias utilizadas pelo MPT são preferencialmente " + 
                      "livres e aderentes ao padrão de softwares livres e código aberto (OPEN " +
                      "SOURCE). Para os observatórios, foram utilizadas ferramentas e " +
                      "bibliotecas de computação estatística amplamente adotadas por " +
                      "universidade e instituições de pesquisa em todo o mundo.",
                    "No caso das pesquisas empíricas são utilizados softwares de análise, " +
                      "com destaque para o R, uma linguagem e ambiente de desenvolvimento " +
                      "integrado para computação estatística e gráfica que se caracteriza " +
                      "por sua adaptação e flexibilidade, sendo expansível por meio de " +
                      "pacotes e bibliotecas específicas."
                  ]
              }
            ]
          },
          opensource: {
            tab: "Código Aberto",
            sections: [
              { title: "Código Aberto",
                type: "text",
                texts: []
              }
            ]
          }
        }
      }
    },
    created () {
    },
    computed: {
      activeTab: function() {
        return this.$route.params.tab;
      }
    }
  }
</script>
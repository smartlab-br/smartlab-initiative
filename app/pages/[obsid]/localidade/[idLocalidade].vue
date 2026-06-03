<template>
  <v-container fluid class="pa-0">
    <!-- ── Seção hero: parallax + tabs de dimensão ───────────────────────────── -->
    <v-row class="pa-0">
      <v-col
        cols="12"
        class="first-section pa-0 overflow-hidden"
        :style="displayHeight"
      >
        <!-- Parallax de fundo -->
        <v-row
          v-if="customParams.cd_uf"
          class="bg-zoom ma-0"
          :style="currentParallax"
        />
        <v-row class="bg-shadow ma-0" />

        <v-row
          v-if="dimensao_ativa"
          class="parallax-content ma-0"
        >
          <!-- Menu de dimensões (tabs) -->
          <v-col cols="12" class="justify-bottom pa-0 dim-menu">
            <v-tabs
              v-if="dimensao_ativa"
              v-model="dimensao_ativa_id"
              color="accent"
              show-arrows
              grow
              dark
            >
              <v-tab
                v-for="dimensao in dimensoes"
                :key="dimensao.id"
                :value="dimensao.id"
                class="caption-obs px-3"
                @click="changeDim(dimensao.id)"
              >
                {{ dimensao.short_desc }}
              </v-tab>
            </v-tabs>
          </v-col>

          <!-- Conteúdo do hero -->
          <v-col cols="12" class="pt-1 px-5">
            <!-- Indicador de carregamento -->
            <v-col
              v-if="ind_principais && ind_principais.length === 0 && localidade !== null"
              class="text-center pa-0"
            >
              <v-progress-circular indeterminate color="primary" />
            </v-col>

            <v-col class="pt-5" />

            <!-- Título: nome da localidade + indicador master -->
            <v-col
              id="screenTitle"
              class="text-white text-center pa-5 line-height-1"
            >
              <div class="display-3-obs">
                {{ localidade ? localidade.nm_localidade : '' }}
                <v-tooltip
                  v-if="presentation"
                  location="bottom"
                  class="icon-vertical-align-middle"
                >
                  <template #activator="{ props }">
                    <v-icon v-bind="props" color="accent" class="pb-1">
                      mdi-information
                    </v-icon>
                  </template>
                  <FLPOTextBuilder
                    :custom-params="customParams"
                    :structure="presentation"
                  />
                </v-tooltip>
              </div>

              <v-row
                v-if="masterIndicator"
                class="pa-1 justify-center master-indicator"
                v-html="masterIndicator"
              />

              <v-row
                v-if="idLocalidade !== '0'"
                justify="center"
              >
                <v-btn
                  size="small"
                  class="text-accent"
                  variant="text"
                  @click="openCompareDialog()"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Comparar
                </v-btn>
              </v-row>

              <div
                class="display-2-obs pt-3"
                v-html="dimensao_ativa.title ?? dimensao_ativa.label"
              />
            </v-col>

            <!-- Grade de minicards principais + índice de seções -->
            <v-row justify="center" class="pt-4">
              <!-- Descrição da dimensão -->
              <v-col
                cols="12"
                md="4"
                lg="3"
                :class="mdAndDown ? 'px-3' : 'px-4'"
              >
                <span
                  class="text-white"
                  v-html="dimensao_ativa.description"
                />
              </v-col>

              <!-- Minicards principais -->
              <v-col
                cols="12"
                md="3"
                :class="mdAndDown ? 'px-3' : 'px-4'"
              >
                <v-row
                  v-if="dimParamsLoaded && ind_principais && ind_principais.length > 0 && unlockLoading"
                  justify="center"
                >
                  <FLPOMinicard
                    v-for="(miniCardPrincipal, indexMinicardsPrincipal) in ind_principais"
                    :key="'minicard_principal_' + indexMinicardsPrincipal"
                    :structure="miniCardPrincipal"
                    :custom-params="customParams"
                    :row-class="miniCardPrincipal.rowClass"
                  />
                </v-row>
              </v-col>

              <!-- Índice de seções (card-links) -->
              <v-col
                cols="12"
                md="4"
                lg="3"
                :class="mdAndDown ? 'px-3' : 'px-4'"
              >
                <v-col
                  v-if="sections && sections.length > 0"
                  class="pt-0"
                >
                  <v-col
                    v-for="(cardLink, cardLinkIndx) in cardLinks"
                    :key="cardLink.id ?? ('sec' + cardLinkIndx)"
                    class="py-0"
                  >
                    <a
                      v-if="cardLink.id"
                      class="text-accent"
                      style="cursor:pointer"
                      @click="scrollTo('anchor_' + cardLink.id)"
                    >
                      <span class="card-title-bullet text-accent">&#9679;</span>
                      {{ cardLink.title }}
                    </a>
                    <div
                      v-else
                      :class="cardLinkIndx !== 0 ? 'pt-2 title-obs text-white' : 'title-obs text-white'"
                    >
                      {{ cardLink.title }}
                    </div>
                  </v-col>
                </v-col>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- ── Seções com cards ──────────────────────────────────────────────────── -->
    <v-container fluid class="pa-0 ma-0">
      <v-col
        v-if="dimParamsLoaded && sections && sections.length > 0"
        class="bg-page pa-0 ma-0"
      >
        <v-row
          v-for="(secao, indexSecao) in sections"
          :key="secao.id ?? indexSecao"
          class="ma-0"
        >
          <v-col
            :id="secao.id"
            cols="12"
            class="pa-0"
            :style="{ backgroundColor: ColorsService.assessZebraBG(indexSecao, vuetifyTheme.current.value.colors) }"
          >
            <!-- Título da seção -->
            <v-col cols="12">
              <div
                :class="'display-2-obs pt-5 pb-3 ml-5 pl-3 font-weight-bold ' + ColorsService.assessZebraTitle(indexSecao, vuetifyTheme.current.value)"
              >
                {{ secao.name }}
              </div>
            </v-col>

            <!-- Cards da seção -->
            <v-container fluid class="py-2 px-1">
              <v-col
                v-if="unlockLoading && secao.cards && secao.cards.length > 0 && customParams.localidade"
              >
                <v-col
                  v-for="(card, cardIndex) in secao.cards"
                  :key="card.id ?? cardIndex"
                  cols="12"
                >
                  <div
                    :id="'anchor_' + card.id"
                    :style="card.type !== 'headline' && card.type !== 'text' && card.type !== 'presentation' ? 'min-height:500px;' : ''"
                    class="ma-0 pa-0"
                  >
                    <!-- Tipo: texto ou apresentação -->
                    <v-col
                      v-if="card.type && (card.type === 'text' || card.type === 'presentation')"
                      :id="card.id"
                      class="px-4 pb-4"
                    >
                      <FLPOCompositeText
                        :structure="card.description"
                        :custom-params="customParams"
                        :section-index="indexSecao"
                      />
                    </v-col>

                    <!-- Tipo: headline -->
                    <div
                      v-else-if="card.type && card.type === 'headline'"
                      :class="'display-2-obs font-weight-bold ' + ColorsService.assessZebraTitle(indexSecao, vuetifyTheme.current.value)"
                      style="padding: 20px 0 12px 28px"
                      v-html="card.title?.fixed"
                    />

                    <!-- Tipo: autoFill -->
                    <FLPOStoryCardAutoFill
                      v-else-if="card.autoFill && topology && ((indexSecao * 100) + Number(cardIndex) <= visibleCardMaxIndex)"
                      :structure="card"
                      :custom-params="customParams"
                      :custom-functions="basicFunctions"
                      :topology="topology"
                      :section-index="indexSecao"
                    />

                    <!-- Tipo: múltiplos gráficos -->
                    <FLPOStoryCardMultipleCharts
                      v-else-if="card.type && card.type === 'multiple-charts' && topology && ((indexSecao * 100) + Number(cardIndex) <= visibleCardMaxIndex)"
                      :structure="card"
                      :custom-params="customParams"
                      :custom-functions="basicFunctions"
                      :topology="topology"
                      :section-index="indexSecao"
                      @show-bug-dialog="$openBugDialog"
                      @show-authentication-dialog="$openAuthenticatioDialog"
                    />

                    <!-- Tipo: story card padrão -->
                    <FLPOStoryCard
                      v-else-if="topology && ((indexSecao * 100) + Number(cardIndex) <= visibleCardMaxIndex)"
                      :structure="card"
                      :custom-params="customParams"
                      :custom-functions="basicFunctions"
                      :topology="topology"
                      :section-index="indexSecao"
                      @show-bug-dialog="$openBugDialog"
                      @show-authentication-dialog="$openAuthenticatioDialog"
                    />
                  </div>
                </v-col>
              </v-col>
            </v-container>
          </v-col>
        </v-row>
      </v-col>
    </v-container>

    <!-- ── Navegação em dots ─────────────────────────────────────────────────── -->
    <FLPODotNav :sections="sections" />

    <!-- ── Painel de carregamento ────────────────────────────────────────────── -->
    <v-row
      v-if="!unlockLoading"
      align="center"
      justify="center"
      class="loadingPanel"
    >
      <v-progress-circular
        :size="120"
        :width="8"
        color="grey-lighten-1"
        indeterminate
      >
        Carregando dados
      </v-progress-circular>
    </v-row>

    <!-- ── Diálogo de comparação ─────────────────────────────────────────────── -->
    <v-dialog v-model="compareDialog" width="500px">
      <v-card>
        <v-card-title class="headline-obs">
          Comparar com:
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                v-if="auOptions.length > 0"
                v-model="idLocalidade_compare"
                :items="computedSearchItems"
                :placeholder="localidade ? localidade.scope : ''"
                :custom-filter="customFilter"
                persistent-hint
                item-title="label"
                item-value="id"
                class="input-group--focused global-search"
                return-object
                @blur="idLocalidade_compare = null"
              >
                <template #item="{ props: itemProps, item }">
                  <v-list-item v-bind="itemProps">
                    <template #title>
                      <span v-html="item.raw.label" />
                    </template>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="12" class="text-right">
              <v-btn
                size="small"
                color="accent"
                @click="compareDialog = false"
              >
                <v-icon start>mdi-close</v-icon>
                Fechar
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { useDisplay, useTheme } from 'vuetify'
import { ColorsService } from '~/utils/service/singleton/colors.js'
import { basicFunctions } from '~/utils/basicFunctions'
import { useLocalidadeView } from '~/composables/useLocalidadeView'

const { mdAndDown } = useDisplay()
const vuetifyTheme = useTheme()
const { $openBugDialog, $openAuthenticatioDialog } = useNuxtApp()

const {
  displayHeight,
  dimensoes,
  dimensao_ativa,
  dimensao_ativa_id,
  sections,
  localidade,
  masterIndicator,
  presentation,
  ind_principais,
  customParams,
  topology,
  unlockLoading,
  visibleCardMaxIndex,
  cardLinks,
  dimParamsLoaded,
  idLocalidade,
  compareDialog,
  idLocalidade_compare,
  auOptions,
  currentParallax,
  computedSearchItems,
  changeDim,
  scrollTo,
  openCompareDialog,
  customFilter,
} = useLocalidadeView()
</script>

<style scoped>
.dim-menu {
  background-color: rgb(var(--v-theme-primary)) !important;
  width: 100%;
  position: fixed;
  z-index: 99 !important;
}

.dim-menu :deep(.v-tab) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.dim-menu :deep(.v-tab--selected) {
  color: rgb(var(--v-theme-accent)) !important;
}

.bg-zoom {
  width: 100%;
  min-height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.bg-shadow {
  width: 100%;
  min-height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.45);
}

.parallax-content {
  position: relative;
  z-index: 1;
}

.master-indicator :deep(span) {
  align-self: auto;
}

.loadingPanel {
  width: 100%;
  background-color: rgba(33, 33, 33, 0.9);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 99;
}

.icon-vertical-align-middle :deep(i) {
  vertical-align: middle !important;
}

.card-title-bullet {
  font-size: 0.6rem;
}

.line-height-1 {
  line-height: 1;
}
</style>

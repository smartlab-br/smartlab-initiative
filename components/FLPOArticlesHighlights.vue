<template>
  <v-layout v-if="destaquesObs.length > 0" ma-0 pa-0 column>
    <v-layout v-show="showTitle" row wrap align-center>
      <v-flex xs12 class="display-1 white--text text-xs-center py-4 my-4">
        Estudos temáticos em Destaque
      </v-flex>
    </v-layout>
    <v-layout
      v-if="shownHighlights && shownHighlights.length > 0"
      v-touch="{
        left: () => swipeDes('left'),
        right: () => swipeDes('right')
      }"
      row
      justify-center
      pb-4
    >
      <v-icon
        x-large
        dark
        :disabled="desSlice == 0"
        @click="swipeDes('right')"
      >
        chevron_left
      </v-icon>
      <v-flex
        v-for="(destaque, indxDest) in shownHighlights"
        :key="'linked_card_dest_' + indxDest"
        :class="desSliceClass"
        pa-3
      >
        <FLPOLinkedViewCard
          :tag-color="destaque.tagColor"
          :status="destaque.status"
          :icon="destaque.icon"
          :app-icon="destaque.appIcon"
          :header-class="destaque.class"
          :media="destaque.media"
          :to="destaque.to"
          :external="destaque.external"
          :title="destaque.title"
          :tags="destaque.tags"
          :detail="destaque.sub"
        />
      </v-flex>
      <v-icon
        x-large
        dark
        :disabled="desSlice + desSliceSize == desMaxSlice"
        @click="swipeDes('left')"
      >
        chevron_right
      </v-icon>
    </v-layout>
  </v-layout>
</template>

<script>
export default {
  props: ['showTitle'],
  data () {
    return {
      destaques: [
        {
          title: 'TI - Estudo temático - MAPEAR',
          to: '/estudo/mapear?obs=ti',
          external: false,
          class: 'light-blue lighten-3',
          obs: ['td', 'ti'],
          tagColor: 'success',
          status: 'NOVO',
          // media: "/showcase/destaque01.jpg",
          tags: [
            { label: 'escravo', color: 'brown' }
          ]
        },
        {
          title: 'TE - Estudo temático - Potencial de resgates',
          to: '/estudo/potencialresgate?obs=te',
          external: false,
          class: 'light-blue lighten-3',
          obs: ['td', 'te'],
          tagColor: 'success',
          status: 'NOVO',
          // media: "/showcase/destaque02.jpg",
          tags: [
            { label: 'escravo', color: 'brown' }
          ]
        },
        {
          title: 'TE - Estudo temático - Fluxos migratórios',
          to: '/estudo/fluxosmigratorios?obs=te',
          external: false,
          class: 'light-blue lighten-3',
          obs: ['td', 'te'],
          tagColor: 'success',
          status: 'NOVO',
          // media: "/showcase/destaque02.jpg",
          tags: [
            { label: 'escravo', color: 'brown' }
          ]
        }
        // { title: "Destaque 3", to: "", external: false, tagColor: 'warning', status: 'BREVE',
        //   // media: "/showcase/destaque03.jpg",
        //   class: "light-blue lighten-3",
        //   obs: ["te","td","ti","sst","des"],
        //   tags: [
        //     { label: "escravo", color: "brown"},
        //     { label: "infantil", color: "indigo"}
        //   ] },
        // { title: "Destaque 4", to: "", external: false, tagColor: null, status: null,
        //   class: "light-blue lighten-3",
        //   obs: ["te","td","ti","sst","des"],
        //   // media: "/showcase/destaque04.jpg"
        //   },
        // { title: "Destaque 5", to: "", external: false, tagColor: null, status: null,
        //   class: "light-blue lighten-3",
        //   obs: ["te","td","ti","sst","des"],
        //   // media: "/showcase/destaque05.jpg"
        //   },
        // { title: "Destaque 6", to: "", external: false, tagColor: null, status: null,
        //   class: "light-blue lighten-3",
        //   obs: ["te","td","ti","sst","des"],
        //   // media: "/showcase/destaque06.jpg"
        //   }
      ],
      destaquesObs: [],
      desSlice: 0,
      desSliceSize: 4,
      desSliceClass: 'xs12 sm6 md4 lg3 xl2',
      desMaxSlice: 4,
      shownHighlights: []
    }
  },
  created () {
    const idObservatorio = this.$observatories.identifyObservatory(this.$route.path.split('/')[1])
    for (const destaque of this.destaques) {
      if (destaque.obs.includes(idObservatorio)) {
        this.destaquesObs.push(destaque)
      }
    }
  },
  mounted: function () {
    if (this.$vuetify.breakpoint.xsOnly) {
      this.desMaxSlice = 11
      this.desSlice = 0
      this.desSliceSize = 1
    } else if (this.$vuetify.breakpoint.smAndDown) {
      this.desMaxSlice = 11
      this.desSlice = 0
      this.desSliceSize = 2
    }
    this.updateShownHighlights()
    window.addEventListener('resize', this.updateShownHighlights)
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.updateShownHighlights)
  },
  methods: {
    swipeDes (direction) {
      if (direction == 'right' && this.desSlice > 0) {
        this.desSlice--
      } else if (direction == 'left' && this.desSlice < this.desMaxSlice) {
        this.desSlice++
      }
      this.updateShownHighlights()
    },

    updateShownHighlights () {
      if (window.innerWidth < 600) {
        this.desSliceSize = 1
      } else if (window.innerWidth < 960) {
        this.desSliceSize = 2
      } else if (window.innerWidth < 1264) {
        this.desSliceSize = 3
      } else if (window.innerWidth < 1904) {
        this.desSliceSize = 4
      } else {
        this.desSliceSize = 6
      }
      this.desMaxSlice = this.destaquesObs.length
      if (this.destaquesObs.length < this.desSliceSize) {
        this.desSliceSize = this.destaquesObs.length
      }

      if (this.desSlice > this.desMaxSlice - this.desSliceSize) {
        this.desSlice = this.desMaxSlice - this.desSliceSize
      }
      const start = this.desSlice
      const stop = start + this.desSliceSize
      this.shownHighlights = this.destaquesObs.slice(start, stop)
    }
  }
}
</script>

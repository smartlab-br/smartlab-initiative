import colors from 'vuetify/es5/util/colors'

const ObservatoriesModel = {
  install(Vue, options) {
    Vue.mixin({
      data() {
        return {
          observatories: require("json-loader!yaml-loader!../../trabalhodecente-viewconf/br/observatorios.yaml").observatorios
        }
      },
      methods: {
        getObservatories() {
          return this.observatories;
        },
        getObservatoryById(id) {
          for (let indx in this.observatories) {
            if (this.observatories[indx].id == id) {
              return this.observatories[indx];
            }
          }
        },
        getObservatoriesSearchOptions() {
          return [
            { id: 'td', app_icon: 'td', title: 'Trabalho<br/>Decente',
              to: '/trabalhodecente', external: false,
              rippleColor: 'grey--text darken-3',
              color: "grey--text darken-4", textColor: "grey--text darken-4" },
            { id: 'te', app_icon: 'coord-02', title: 'Trabalho<br/>Escravo',
              to: '/trabalhoescravo', external: false,
              rippleColor: 'brown--text darken-3',
              color: colors.grey.darken3, textColor: "grey--text darken-3" },
            { id: 'sst', app_icon: 'coord-01', title: 'Saúde e<br/>Segurança',
              to: '/sst', external: false,
              rippleColor: 'teal--text darken-3',
              color: colors.teal.darken4, textColor: "teal--text darken-4" },
            { id: 'ti', app_icon: 'coord-07', title: 'Trabalho<br/>Infantil',
              to: '/trabalhoinfantil', external: false,
              rippleColor: 'indigo--text darken-3',
              color: colors.indigo.darken3, textColor: "indigo--text darken-3" },
            { id: 'des', app_icon: 'coord-06', title: 'Diversidade<br/>no Trabalho',
              to: '/diversidade', external: false,
              rippleColor: 'deep-purple--text darken-2',
              color: colors.deepPurple.darken4, textColor: "deep-purple--text darken-4" }
          ];
        }
      }
    })
  }
}

export default ObservatoriesModel;
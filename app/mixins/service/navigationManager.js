
const NavigationManager = {
  install(Vue, options) {
    Vue.mixin({
      data() {
        return {
        }
      },
      methods: {
        searchAnalysisUnit(searchItem, idObservatorio = null) {
          // TODO Remover apos lancamento de demais observatorios
          // if (idObservatorio && idObservatorio == 'des') return;
          if (searchItem === null || searchItem === undefined) {
            // this.snackAlert({ color : 'error', text: "Nenhum item selecionado" });
            return;
          }

          let obsAtual = this.$observatories.constructor.identifyObservatory(this.$route.path.split('/')[1]);
          
          let url = '';
          if (idObservatorio != null) {
            url = "/" + this.$observatories.constructor.identifyObservatoryById(idObservatorio) + searchItem.to;  
            if(obsAtual && idObservatorio == obsAtual){
              if (this.$route.query && this.$route.query.dimensao) {
                url = url + '&dimensao=' + this.$route.query.dimensao;
              }
            }
          } else if(obsAtual){
            if(searchItem.exclude_from && searchItem.exclude_from.includes(obsAtual)){
              if (this.snackAlert){
                this.snackAlert({ color : 'error', text: "A análise da localidade escolhida ("+ searchItem.detail +") não está disponível para esse observatório." });
              } else {
                this.sendError("A análise da localidade escolhida ("+ searchItem.detail +") não está disponível para esse observatório.");
              }
              return;
            }

            url = "/" + this.$observatories.constructor.identifyObservatoryById(obsAtual) + searchItem.to;  

            if (this.$route.query && this.$route.query.dimensao) {
              url = url + '&dimensao=' + this.$route.query.dimensao;
            }
          // } else{
          //   let obsDefault = "td";
          //   if(searchItem.exclude_from && searchItem.exclude_from.includes(obsDefault)){
          //     obsDefault = "te";
          //   }
          //   url = "/" + this.$observatories.constructor.identifyObservatoryById(obsDefault) + searchItem.to;  
          }

          this.$analysisUnitModel.setCurrentAnalysisUnit(searchItem.id);
          
          let findLoc = this.$analysisUnitModel.findPlaceByID(searchItem.id);
          if (findLoc instanceof Promise || findLoc.then) {
            findLoc.then(response => {
              this.changeMiddleToolbar(response);
              if (searchItem.id && searchItem.id.length > 5) this.localidade = response;
            })
            .catch(error => { this.sendError(error); });
          } else {
            this.changeMiddleToolbar(findLoc);
            if (searchItem.id && searchItem.id.length > 5) this.localidade = findLoc;
          }

          this.pushRoute(url);   
        },
        
        pushRoute(link, external=false, isGo=false) {
          this.toolbar = null;
          if (!external && link !== null && link !== undefined) {
            if (!isGo) {
              this.$router.push(link);
            } else {
              this.$router.go(link);
            }
          } else if (external && link !== null && link !== undefined) {
            window.open(link, '_blank');
          }
        },
        openBugDialog(cardTitle){
          this.$emit('showBugDialog', cardTitle);
        },
        openAuthenticatioDialog() {
          this.$emit('showAuthenticatioDialog');
        }
      }
    })
  }
}

export default NavigationManager;
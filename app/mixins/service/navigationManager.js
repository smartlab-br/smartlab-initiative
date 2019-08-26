
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

          let obsAtual = this.identifyObservatory(this.$route.path.split('/')[1]);
          
          let url = '';
          if (idObservatorio != null) {
            url = "/" + this.identifyObservatoryById(idObservatorio) + searchItem.to;  
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

            url = "/" + this.identifyObservatoryById(obsAtual) + searchItem.to;  

            if (this.$route.query && this.$route.query.dimensao) {
              url = url + '&dimensao=' + this.$route.query.dimensao;
            }
          // } else{
          //   let obsDefault = "td";
          //   if(searchItem.exclude_from && searchItem.exclude_from.includes(obsDefault)){
          //     obsDefault = "te";
          //   }
          //   url = "/" + this.identifyObservatoryById(obsDefault) + searchItem.to;  
          }

          this.$analysisUnitModel.setCurrentAnalysisUnit(searchItem.id);
          this.$analysisUnitModel.findPlaceByID(this, searchItem.id,null,this.changeMiddleToolbar);

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
        // Mapeamento dos observatórios para os IDs  
        identifyObservatory(route) {
          if (route.includes('trabalhodecente')) return 'td';
          if (route.includes('diversidade')) return 'des';
          if (route.includes('trabalhoescravo')) return 'te';
          if (route.includes('trabalhoinfantil')) return 'ti';
          if (route.includes('sst')) return 'sst';
          return;
        } ,
        // Mapeamento dos IDs para os observatorios
        identifyObservatoryById(idObservatorio) {
          switch (idObservatorio){
            case 'td':
              return 'trabalhodecente';
            case 'des':
              return 'diversidade';
            case 'te':
              return 'trabalhoescravo';
            case 'ti':
              return 'trabalhoinfantil';
            case 'sst':
              return 'sst';
          }
        } 
      }
    })
  }
}

export default NavigationManager;
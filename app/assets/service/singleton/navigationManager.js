import ObservatoriesModel from '../../model/singleton/observatoriesModel'

class NavigationManager {
  
  constructor (){ }

  static searchAnalysisUnit(router, searchItem, idObservatorio = null) {
    let observatories = new ObservatoriesModel();
    let route = router.currentRoute;

    if (searchItem === null || searchItem === undefined) {
      throw "Nenhum item selecionado";
    }

    let obsAtual = observatories.identifyObservatory(route.path.split('/')[1]);
    
    let url = '';
    if (idObservatorio != null) {
      url = "/" + observatories.identifyObservatoryById(idObservatorio) + searchItem.to;  
      if(obsAtual && idObservatorio == obsAtual){
        if (route.query && route.query.dimensao) {
          url = url + '&dimensao=' + route.query.dimensao;
        }
      }
    } else if(obsAtual){
      if(searchItem.exclude_from && searchItem.exclude_from.includes(obsAtual)){
        throw "A análise da localidade escolhida ("+ searchItem.detail +") não está disponível para esse observatório.";
      }

      url = "/" + observatories.identifyObservatoryById(obsAtual) + searchItem.to;  

      if (route.query && route.query.dimensao) {
        url = url + '&dimensao=' + route.query.dimensao;
      }
    } else {
      for (let obs of observatories.observatoriesSearchOptions){
        if(searchItem.exclude_from && searchItem.exclude_from.includes(obs.id)){
          continue;
        } else {
          url = obs.to + searchItem.to;
          break;
        }
      }
    }
    
    NavigationManager.pushRoute(router, url);
  }
  
  static pushRoute(router, link, external=false, isGo=false) {
    this.toolbar = null;
    if (!external && link !== null && link !== undefined) {
      if (!isGo) {
        router.push(link);
      } else {
        router.go(link);
      }
    } else if (external && link !== null && link !== undefined) {
      window.open(link, '_blank');
    }
  }
}

export default NavigationManager;
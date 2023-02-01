// import ObservatoriesModel from '../../model/singleton/observatoriesModel'

export class NavigationManager {
  constructor (context) {
    this.context = context
  }

  searchAnalysisUnit (router, searchItem, idObservatorio = null, observatorios = null) {
    const route = router.currentRoute

    if (searchItem === null || searchItem === undefined) {
      throw new Error('Nenhum item selecionado')
    }

    const obsAtual = this.context.$observatories.identifyObservatory(route.path.split('/')[1])

    let url = ''
    if (idObservatorio != null) {
      url = '/' + this.context.$observatories.identifyObservatoryById(idObservatorio) + searchItem.to
      if (obsAtual && idObservatorio == obsAtual) {
        if (route.query && route.query.dimensao) {
          url = url + '&dimensao=' + route.query.dimensao
        }
      }
    } else if (obsAtual) {
      if (searchItem.exclude_from && searchItem.exclude_from.includes(obsAtual)) {
        throw new Error('A análise da localidade escolhida (' + searchItem.detail + ') não está disponível para esse observatório.')
      }

      url = '/' + this.context.$observatories.identifyObservatoryById(obsAtual) + searchItem.to

      if (route.query && route.query.dimensao) {
        url = url + '&dimensao=' + route.query.dimensao
      }
    } else {
      for (const obs of observatorios) {
        if (searchItem.exclude_from && searchItem.exclude_from.includes(obs.id)) {
          continue
        } else {
          url = obs.to + searchItem.to
          break
        }
      }
    }

    this.pushRoute(router, url)
  }

  pushRoute (router, link, external = false, isGo = false) {
    this.toolbar = null
    if (!external && link !== null && link !== undefined) {
      if (!isGo) {
        router.push(link)
      } else {
        router.go(link)
      }
    } else if (external && link !== null && link !== undefined) {
      window.open(link, '_blank')
    }
  }
}

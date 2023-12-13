export class NavigationService {

  static pushRoute(router: any, link: string, external: boolean = false, isGo: boolean = false) {
    if (!external && link !== null && link !== undefined) {
      if (!isGo) {
        router.push(link)
      } else {
        router.go(link)
      }
    } else if (external && link !== null && link !== undefined) {
      window.open(link, "_blank")
    }
  }
  
}
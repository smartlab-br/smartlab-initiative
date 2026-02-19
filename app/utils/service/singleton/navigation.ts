import type { Router } from "vue-router"

export class NavigationService {

  static pushRoute(router: Router, link: string, external: boolean = false) {
    if (!external && link !== null && link !== undefined) {
      router.push(link)
    } else if (external && link !== null && link !== undefined) {
      window.open(link, "_blank")
    }
  }
  
}
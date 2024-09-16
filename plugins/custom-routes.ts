// plugins/custom-routes.ts
import { defineNuxtPlugin } from "#app"
import { useRouter } from "vue-router"

export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.addRoute({
    name: "Observatório do Trabalho Decente",
    path: "/trabalhodecente",
    component: () => import("~/pages/observatory.vue")
  })

  router.addRoute({
    name: "Observatório de Segurança e Saúde no Trabalho",
    path: "/sst",
    component: () => import("~/pages/observatory.vue")
  })

  router.addRoute({
    name: "Observatório da Prevenção e da Erradicação do Trabalho Infantil",
    path: "/trabalhoinfantil",
    component: () => import("~/pages/observatory.vue")
  })

  router.addRoute({
    name: "Observatório da Prevenção e da Erradicação do Trabalho Infantil",
    path: "/trabalhoescravo",
    component: () => import("~/pages/observatory.vue")
  })

})

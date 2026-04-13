import { useMainStore } from "~/store"

export default defineNuxtPlugin(async () => {
  const store = useMainStore()

  await callOnce(async () => {
    await store.loadSmartlabData()
  })

  const route = useRoute()
  store.setCurrentObs(route)
})

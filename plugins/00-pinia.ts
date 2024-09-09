import { useMainStore } from "~/store"
import { useSnackbarStore } from "~/store/snackbar"
import { type Pinia } from "pinia"

export default defineNuxtPlugin(({ $pinia }) => {
  const mainStore = useMainStore($pinia as Pinia)
  const snackbarStore = useSnackbarStore($pinia as Pinia)

  return {
    provide: {
      store: mainStore,
      snackbarStore
    }
  }
})
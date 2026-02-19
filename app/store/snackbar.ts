import { defineStore } from "pinia"

interface SnackbarOptions {
  visible: boolean;
  message: string;
  color: string;
  timeout: number;
}

export const useSnackbarStore = defineStore("snackbar", {
  state: (): SnackbarOptions => ({
    visible: false,
    message: "",
    color: "success",
    timeout: 6000,
  }),
  actions: {
    showSnackbar(params: {text: string, color?: string, timeout?: number}) {
      this.message = params.text
      this.color = params.color || "success"
      this.timeout = params.timeout || 6000
      this.visible = true
    },
    hideSnackbar() {
      this.visible = false
    },
  },
})

import { useMainStore } from "~/store"

export default defineNuxtPlugin(async () => {
  useMainStore()

  // O carregamento agora é gerenciado pelo app.vue
  // Este plugin está aqui para garantir que a store esteja disponível
  // mas o carregamento efetivo acontece no app.vue para garantir
  // que nenhum componente seja renderizado antes dos dados estarem prontos
})

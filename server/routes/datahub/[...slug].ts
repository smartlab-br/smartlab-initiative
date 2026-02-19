import type { H3Event } from "h3"

export default defineEventHandler(async (event: H3Event): Promise<any> => {
  const { datahubKey, datahubUrl } = useRuntimeConfig()
  
  if (!datahubKey || !datahubUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "Erro de configuração: datahubKey ou datahubUrl não informado.",
    })
  }

  // Path da rota chamada (/datahub/...)
  const path = event.path.replace(/^\/datahub/, '')
  
  // Construa a URL da API
  const apiUrl = `${datahubUrl}${path}`
  try {
    return await $fetch(apiUrl, {
      headers: { "X-Mpt-Api-Key": datahubKey },
    })
  } catch (error) {
    const typedError = error as { response?: Response; message: string }
    throw createError({
      statusCode: typedError.response?.status || 500,
      statusMessage: typedError.message || "Falha ao buscar dados(datahub API).",
    })
  }
})


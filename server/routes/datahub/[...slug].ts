import { H3Event } from 'h3';

export default defineEventHandler(async (event: H3Event): Promise<any> => {
  const { datahubKey, datahubUrl } = useRuntimeConfig()
  
  if (!datahubKey || !datahubUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro de configuração: datahubKey ou datahubUrl não informado.',
    })
  }

  const url = new URL(event.node.req.url || '', `http://${event.node.req.headers.host}`);
  const path = url.pathname.replace(/^\/datahub/, '');
  const query = url.search;

  // Construa a URL da API
  const apiUrl = `${datahubUrl}${path}${query}`;
  try {
    const response = await $fetch(apiUrl, {
      headers: { "X-Mpt-Api-Key": datahubKey },
    })
    return response
  } catch (error) {
    const typedError = error as { response?: Response; message: string };
    throw createError({
      statusCode: typedError.response?.status || 500,
      statusMessage: typedError.message || 'Falha ao buscar dados(datahub API).',
    });
  }
})


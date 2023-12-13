export default defineEventHandler(async (event) => {
  const { datahubKey, datahubUrl } = useRuntimeConfig()
  const apiUrl = datahubUrl + event.path.replace("/datahub", "")

  const response = await $fetch(apiUrl, {
    headers: { "X-Mpt-Api-Key": datahubKey },
  })
  return response
})
import * as yaml from "js-yaml"
import { normalizeCls } from "~/utils"

const normalizeYamlCls = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(normalizeYamlCls)
  if (obj && typeof obj === "object") {
    if (typeof obj.cls === "string") obj.cls = normalizeCls(obj.cls)
    for (const key of Object.keys(obj)) normalizeYamlCls(obj[key])
  }
  return obj
}
export const YamlFetcherService = {
  async loadYaml<T>(
    basePath: string, 
    location: string
  ): Promise<T> {
    const path = `${basePath}${location}.yaml`
    
    // Se for /viewconf/, sempre usa fetch (mesmo no servidor)
    const shouldUseFetch = basePath === "/viewconf/" || import.meta.client
       
    if (!shouldUseFetch && import.meta.server) {
      const { readFile } = await import("fs/promises")
      const { join } = await import("path")
      
      const filePath = join(process.cwd(), "public", path)
      
      try {
        const content = await readFile(filePath, "utf-8")
        return normalizeYamlCls(yaml.load(content, { json: true })) as T
      } catch (error) {
        console.error("[YAML] ✗ Erro ao ler arquivo:", error)
        throw error
      }
    } else {
      const response = await $fetch<string>(path, { responseType: "text" })
      return normalizeYamlCls(yaml.load(response, { json: true })) as T
    }
  },

  async loadYamlArray(basePath: string, currentStruct: any, yamlArray: any[]) {
    // Se for /viewconf/, sempre usa fetch (mesmo no servidor)
    const shouldUseFetch = basePath === "/viewconf/" || import.meta.client
    
    const promises = yamlArray.map(async (conf) => {
      try {
        const path = `${basePath}${conf.main}.yaml`
        
        if (!shouldUseFetch && import.meta.server) {
          const { readFile } = await import("fs/promises")
          const { join } = await import("path")
          
          const filePath = join(process.cwd(), "public", path)
          const content = await readFile(filePath, "utf-8")
          return normalizeYamlCls(yaml.load(content, { json: true }))
        } else {
          const res = await $fetch<string>(path, { responseType: "text" })
          return normalizeYamlCls(yaml.load(res, { json: true }))
        }
      } catch {
        if (conf.alt) {
          const pathAlt = `${basePath}${conf.alt}.yaml`
          
          if (!shouldUseFetch && import.meta.server) {
            const { readFile } = await import("fs/promises")
            const { join } = await import("path")
            
            const filePath = join(process.cwd(), "public", pathAlt)
            const content = await readFile(filePath, "utf-8")
            return normalizeYamlCls(yaml.load(content, { json: true }))
          } else {
            const resAlt = await $fetch<string>(pathAlt, { responseType: "text" })
            return normalizeYamlCls(yaml.load(resAlt, { json: true }))
          }
        }
        return null
      }
    })

    const structs = (await Promise.all(promises)).filter(Boolean)
    return Object.assign(currentStruct || {}, ...structs)
  }
}
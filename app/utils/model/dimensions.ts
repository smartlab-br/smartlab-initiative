// import { YamlFetcherService } from "../service/singleton/yamlFetcher"

// export class Dimensions {
//   dimensions: any

//   setDimensions (content: any) {
//     this.dimensions = content
//     return this.dimensions
//   }

//   getDimensions (idObservatorio: string | null = null, cbFunction: Function | null = null) {
//     if (idObservatorio === null || idObservatorio === undefined) {
//       if (this.dimensions == null && this.dimensions == undefined) { // Start loading only once
//         return YamlFetcherService.loadYaml("br/dimensao/base")
//           .then((result) => {
//             if (cbFunction) {
//               cbFunction(result)
//             } else {
//               return this.setDimensions(result)
//             }
//           })
//       } else if (cbFunction) {
//         cbFunction(this.dimensions)
//       } else {
//         return this.dimensions
//       }
//     } else {
//       return YamlFetcherService.loadYaml("br/dimensao/" + idObservatorio)
//         .then((result) => {
//           if (cbFunction) {
//             cbFunction(result)
//           } else {
//             return this.setDimensions(result)
//           }
//         })
//     }
//   }

//   findDimensionById (id: string) {
//     if (this.dimensions) { // Only when loaded
//       for (const dim of this.dimensions.dimensoes) {
//         if (dim.id == id) { return dim }
//       }
//       return this.dimensions.dimensoes[0]
//     }
//   }

//   getDimensionByObservatoryAndId (obs: string, id: string | null = null) {
//     return YamlFetcherService.loadYaml("br/dimensao/" + obs)
//       .then((result) => {
//         const dims = (result as any).dimensoes
//         for (const indx in dims) {
//           if ((id === null || id === undefined) && dims[indx].default) { return dims[indx] }
//           if (dims[indx].id == id) { return dims[indx] }
//         }
//       })
//   }
// }

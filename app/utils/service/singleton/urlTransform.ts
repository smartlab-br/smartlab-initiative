export class UrlTransformService {

  // static getApiUrl (endpoint: string, noCache: boolean = false, postData: any = {}) {
  static getApiUrl (endpoint: string) {

    endpoint = this.getValidDatahubUrl("/datahub" + endpoint)
    return endpoint

    // const options: any = {}
    // if (endpoint == "/mail") {
    //   options.method = "POST"
    //   options.data = postData
    // } else {
    //   options.method = "GET"
    //   endpoint = "/datahub" + endpoint
    // }
    // options.url = this.getValidDatahubUrl(endpoint)

    // const headers = {
    //   "Content-Type": "application/json",
    //   "Request-Source": "application"
    // }

    // if (noCache) {
    //   headers["Cache-Control"] = "no-cache"
    // }

    // return Object.assign(
    //   options,
    //   { headers }
    // )
  }

  static getValidDatahubUrl (url: string) {
    // Datahub api uses comma and minus to split options
    // replace comma (,) with "\," inside quotes
    url = url.replace(/"([^"]*)+"/g, s => s.replace(/,/g, "\\,"))
    // replace "-" with "\-" inside quotes
    url = url.replace(/"([^"]*)+"/g, s => s.replace(/-/g, "\\-"))
    return url
  }


}
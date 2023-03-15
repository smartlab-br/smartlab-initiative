export class AxiosCallSetupService {
  getAxiosOptions (endpoint, noCache = false, postData = {}) {
    // const urlMap = {
    //   DATAHUB : '/api-proxy/datahub',
    //   MERCURIO : '/api-proxy/mercurio'
    // }

    const options = {}
    if (endpoint == '/mail') {
      options.method = 'POST'
      options.data = postData
    } else {
      options.method = 'GET'
      endpoint = '/datahub' + endpoint
    }

    options.url = this.getDatahubValidUrl(endpoint)

    const headers = {
      'Content-Type': 'application/json',
      'Request-Source': 'application'
    }

    if (noCache) {
      headers['Cache-Control'] = 'no-cache'
    }

    return Object.assign(
      options,
      { headers }
    )
  }

  getValidDatahubUrl(url){
    // Datahub api uses comma and minus to split options
    // replace comma (,) with '\,' inside quotes
    url = url.replace(/'([^']*)+'/g, s => s.replace(/,/g, '\\,'))
    // replace '-' with '\-' inside quotes
    url = url.replace(/'([^']*)+'/g, s => s.replace(/-/g, '\\-'))
    return url
  }
}

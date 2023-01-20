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

    options.url = endpoint

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
}

class AxiosCallSetupService {
  constructor(store) {
    this.store = store;
  }

  setStore(store) {
    this.store = store;
  }

  envFromKey(key) {
    if (this.store && this.store[key]) return this.store[key];
    return process.env[key];
  }

  getAxiosOptions(endpoint, key = 'DATAHUB', noCache = false) {
    const urlMap = {
      DATAHUB : '/api-proxy/datahub',
      MERCURIO : '/api-proxy/mercurio'
    }

    var options = {
      method: "GET",
      "url": urlMap[key] + endpoint
    }

    var headers = {
      'Content-Type': "application/json",
      'Request-Source': "application"
    }

    if (noCache) {
      headers['Cache-Control'] = 'no-cache'
    }
    if (endpoint == '/mail') {
      options.method = 'POST'
    }

    return Object.assign(
      options,
      {headers: headers}
    )
  }

}

export default AxiosCallSetupService;

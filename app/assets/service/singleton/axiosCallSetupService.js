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

  getAxiosOptions(endpoint, key = 'DATAHUB') {
    const urlMap = {
      DATAHUB : '/api-proxy/datahub',
      ACIDENTOMETROS : '/api-proxy/odometros',
      MAIL : '/api-proxy'
    }

    var options = {
      method: "GET",
      "url": urlMap[key] + endpoint
    }

    var headers = {
      'Content-Type': "application/json"
    }

    if (key == 'ACIDENTOMETROS') {
      headers['Cache-Control'] = 'no-cache'
    }
    if (key == 'MAIL') {
      options.method = 'POST'
    }

    return Object.assign(
      options,
      {headers: headers}
    )
  }

}

export default AxiosCallSetupService;

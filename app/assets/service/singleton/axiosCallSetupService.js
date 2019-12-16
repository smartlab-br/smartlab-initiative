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

  getHeaders(key, customHeaders) {
    // Ativar apenas quando a API exigir a autorização do usuário
    // let token = this.$store.state.DATAHUB_APP_KEY;
    // if (token === null || token === undefined) {
    //   token = 'Basic ' + process.env.DATAHUB_APP_KEY;
    // }

    return Object.assign(
      { 'Content-Type': "application/json"
        // "X-Gravitee-Api-Key": this.envFromKey(key + '_APP_KEY')
        // 'Authorization': token
      },
      customHeaders
    );
  }

  getAxiosOptions(endpoint, key = 'DATAHUB') {
    const urlMap = {
      DATAHUB : '/api-proxy/datahub'
    }
    return {
      method: "GET",
      // "url": this.envFromKey(key + '_API_BASE_URL') + endpoint,
      "url": urlMap[key] + endpoint,

      headers: this.getHeaders(key)
    };
  }

  getAxiosOdometrosOptions(endpoint, key = 'DATAHUB') {
    return {
      method: "GET",
      "url": this.envFromKey(key + '_API_BASE_URL') + endpoint,
      headers: this.getHeaders(key, { 'Cache-Control': 'no-cache' , "X-Gravitee-Api-Key": this.envFromKey(key + '_APP_KEY')})
    };
  }
}

export default AxiosCallSetupService;

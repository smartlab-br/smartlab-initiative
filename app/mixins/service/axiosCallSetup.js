const AxiosCallSetup = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        getAxiosOptions(endpoint) {
          let api_base = this.$store.state.DATAHUB_API_BASE_URL;
          if (api_base === null || api_base === undefined) {
            api_base = process.env.DATAHUB_API_BASE_URL;
          }

          // Ativar apenas quando a API exigir a autorização do usuário
          // let token = this.$store.state.DATAHUB_APP_KEY;
          // if (token === null || token === undefined) {
          //   token = 'Basic ' + process.env.DATAHUB_APP_KEY;
          // }

          return {
            method: "GET",
            "url": api_base + endpoint,
            headers: {
              'Content-Type': "application/json",
              "X-Gravitee-Api-Key": process.env.DATAHUB_APP_KEY
              // 'Authorization': token
            }
          };
        },
        getAxiosOdometrosOptions(endpoint) {
          let api_base = this.$store.state.ACIDENTOMETROS_API_BASE_URL;
          if (api_base === null || api_base === undefined) {
            api_base = process.env.ACIDENTOMETROS_API_BASE_URL;
          }

          // Ativar apenas quando a API exigir a autorização do usuário
          // let token = this.$store.state.DATAHUB_APP_KEY;
          // if (token === null || token === undefined) {
          //   token = 'Basic ' + process.env.DATAHUB_APP_KEY;
          // }
          // console.log(api_base);
          return {
            method: "GET",
            "url": api_base + endpoint,
            headers: {
              'Content-Type': "application/json",
              'Cache-Control': 'no-cache', 
              "X-Gravitee-Api-Key": process.env.ACIDENTOMETROS_APP_KEY
              // 'Authorization': token
            }
          };
        }
      }
    })
  }
}

export default AxiosCallSetup;

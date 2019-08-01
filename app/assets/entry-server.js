import {
  createApp
} from './app'

const isDev = (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging')

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default context => {

  return new Promise((resolve, reject) => {
    const s = isDev && Date.now()
    const {
      app,
      router,
      store
    } = createApp(context)
    
    // set router's location
    router.push(context.url)

    // wait until router has resolved possible async hooks
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      // no matched routes
      if (!matchedComponents.length) {
        reject({
          code: 404
        })
      }
      console.log("NODE ENV => " + process.env.NODE_ENV);

      Promise.all([
        matchedComponents.map(component => {
          return component.asyncData && component.asyncData({
            store,
            route: router.currentRoute
          })
        })
      ]).then(() => {
        isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`)
        // After all preFetch hooks are resolved, our store is now
        // filled with the state needed to render the app.
        // Expose the state on the render context, and let the request handler
        // inline the state in the HTML response. This allows the client-side
        // store to pick-up the server-side state without having to duplicate
        // the initial data fetching on the client.
        store.state.GA_ID_BASE = process.env.GA_ID_BASE;
        store.state.GA_ID_DV = process.env.GA_ID_DV;

        store.state.GIT_VIEWCONF_TAG_URL = process.env.GIT_VIEWCONF_TAG_URL;

        store.state.DATAHUB_API_BASE_URL = process.env.DATAHUB_API_BASE_URL;     
        store.state.DATAHUB_APP_KEY = process.env.DATAHUB_APP_KEY;
      
        store.state.MAILER_API_BASE_URL = process.env.MAILER_API_BASE_URL;     
        store.state.MAILER_APP_KEY = process.env.MAILER_APP_KEY;
      
        store.state.ACIDENTOMETROS_API_BASE_URL = process.env.ACIDENTOMETROS_API_BASE_URL;     
        store.state.ACIDENTOMETROS_APP_KEY = process.env.ACIDENTOMETROS_APP_KEY;

        context.state = store.state                
        resolve(app)
      }).catch(reject)
    }, reject)
  })
}

const axios = require('axios')
const bodyParser = require('body-parser')
const app = require('express')()

app.use(bodyParser.json())
app.get('/datahub/*', (req, res) => {
  if (req.headers['request-source'] == 'application' && req.headers['user-agent'] && !req.headers['user-agent'].toLowerCase().includes('postman')) {
    const datahub = {
      url: process.env.DATAHUB_API_BASE_URL,
      key: process.env.DATAHUB_APP_KEY
    }

    const apiUrl = datahub.url + req.url.replace('/datahub', '')
    const header = {
      'Content-Type': 'application/json'
    }

    header['X-Mpt-Api-Key'] = datahub.key

    if (req.headers['cache-control']) {
      header['cache-control'] = 'no-cache'
    }
    axios({
      method: 'get',
      url: apiUrl,
      responseType: 'json',
      headers: header
    })
      .then(function (response) {
        // handle success
        // console.log(res);
        res.json(response.data)
      })
      .catch(function (error) {
        // handle error
        console.log(error)
        if (error.response) {
          res.status(error.response.status).send(error.response.data)
        } else {
          // Something happened in setting up the request that triggered an Error
          res.status(400).send(error)
        }
      })
  } else {
    res.status(401).send('Unauthorized')
  }
})

app.post('/mail', (req, res) => {
  if (req.headers['request-source'] == 'application' && req.headers['user-agent'] && !req.headers['user-agent'].toLowerCase().includes('postman')) {
    const mercurio = {
      url: process.env.MAILER_API_BASE_URL,
      key: process.env.MAILER_APP_KEY
    }

    const apiUrl = mercurio.url + req.url

    const header = {
      'Content-Type': 'application/json',
      'X-Mpt-Api-Key': mercurio.key
    }
    axios({
      method: 'POST',
      url: apiUrl,
      data: req.body,
      headers: header
    }).then(function (response) {
      res.json(response.data)
    }).catch(function (error) {
      // handle error
      console.log(error)
      if (error.response) {
        res.status(error.response.status).send(error.response.data)
      } else {
        // Something happened in setting up the request that triggered an Error
        res.status(400).send(error)
      }
    })
  } else {
    res.status(401).send('Unauthorized')
  }
})

module.exports = app

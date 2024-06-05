const axios = require('axios')
const bodyParser = require('body-parser')
const app = require('express')()
const nodemailer = require('nodemailer')
const compression = require('compression')

app.use(bodyParser.json())
app.use(compression())
app.get('/datahub/*', (req, res) => {
  if (req.headers['request-source'] === 'application' && req.headers['user-agent'] && !req.headers['user-agent'].toLowerCase().includes('postman')) {
    const datahub = {
      url: process.env.DATAHUB_API_BASE_URL,
      key: process.env.DATAHUB_APP_KEY
    }

    const apiUrl = datahub.url + req.url.replace('/datahub', '')
    const header = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br'
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
        // console.log(error)
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
  if (req.headers['request-source'] === 'application' && req.headers['user-agent'] && !req.headers['user-agent'].toLowerCase().includes('postman')) {
    const smtp = {
      host: process.env.SMTP_HOST,
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_TO
    }

    const contentArgs = req.body.args.split('|')
    const content = 'Smartlab - Relate um problema' +
      '\n E-mail contato: ' + contentArgs[0] +
      '\n Observatório: ' + contentArgs[1] +
      '\n Dimensão: ' + contentArgs[2] +
      '\n Localidade: ' + contentArgs[3] +
      '\n Card: ' + contentArgs[4] +
      '\n Descrição do problema: ' + contentArgs[5]

    // const header = {
    //   'Content-Type': 'application/json',
    // }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: 25
    })

    const options = {
      from: smtp.from,
      to: smtp.to,
      subject: 'Smartlab - Relate um problema',
      text: content
    }

    transporter.sendMail(options).then(function (info) {
      res.status(200).send(info.response)
    }).catch(function (error) {
      res.status(400).send(error)
    })
  } else {
    res.status(401).send('Unauthorized')
  }
})

module.exports = app

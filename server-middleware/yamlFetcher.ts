import * as yaml from 'js-yaml'
import bodyParser from 'body-parser'
import axios from 'axios'

const app = require('express')()
const LOAD_OPTIONS = { schema: yaml.JSON_SCHEMA, json: true }
const BASE_PATH: string = process.env.GIT_VIEWCONF_TAG_URL ? process.env.GIT_VIEWCONF_TAG_URL : "/static/smartlab-initiative-viewconf/"

app.use(bodyParser.json());
app.all('/', (req: any, res: any, next: any) => {
    // verifyToken(req, res, next)},
    (req: any, res: any) => {
        new Promise((resolve, reject) => {
            axios.get(`${BASE_PATH}${req.query.location}.yaml`)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error)
                })
        }).then((data) => {
            res.json(yaml.load(data as string, LOAD_OPTIONS))
        }).catch((error) => {
            res.status(error.response.status)
            res.json(error.response.data)
        })
    }
})
module.exports = app
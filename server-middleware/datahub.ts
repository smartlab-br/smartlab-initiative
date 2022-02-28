import * as yaml from 'js-yaml'
import bodyParser from 'body-parser'
import axios from 'axios'

const app = require('express')()

app.use(bodyParser.json());
app.all('/', (req: any, res: any, next: any) => {
    // verifyToken(req, res, next)},
    (req: any, res: any) => {
        const { endpoint, ...qry } = req.query.endpoint
        
        new Promise((resolve, reject) => {
            axios({
                method: "get",
                url: `${process.env.DATAHUB_API_BASE_URL}/${endpoint}?${qry}`,
                responseType: "json",
                headers: {
                    "Content-Type": "application/json",
                    "X-Mpt-Api-Key": process.env.DATAHUB_APP_KEY,
                    "cache-control": "no-cache"
                }
            }).then((response) => {
                resolve(response.data);
            }).catch((error) => {
                reject(error)
            })
        }).then((data) => {
            res.json(data)
        }).catch((error) => {
            res.status(error.response.status)
            res.json(error.response.data)
        })
    }
})
module.exports = app
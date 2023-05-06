require("dotenv").config()
const buffer = require("buffer")

const INFURA_API_KEY = process.env.INFURA_API_KEY
const INFURA_SECRET_KEY = process.env.INFURA_SECRET_KEY
const auth = 'Basic ' + buffer.Buffer.from(INFURA_API_KEY + ':' + INFURA_SECRET_KEY).toString('base64')
console.log(auth)
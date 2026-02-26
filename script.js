const express = require('express')

const app = express()
const  mustache = require('mustache-express')

app.engine('mustache', mustache())
app.set('view engine', 'mustache')
app.use(express.static("public"));

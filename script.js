const express = require('express')
const sqlite3 = require('sqlite3').verbose()

const app = express()
const  mustache = require('mustache-express')

app.engine('mustache', mustache())
app.set('view engine', 'mustache')
app.use(express.static("public"));
app.set('views', __dirname + '/views');

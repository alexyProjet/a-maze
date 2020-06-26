const express = require('express')
const expressWS = require('express-ws')
const path = require('path')
var app = expressWS(express()).app
const port = 3000

const ignoreFavicon = (req, res, next) => (req.originalUrl === '/favicon.ico') ? res.status(204).end() : next()

app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, '/public')))
app.use(ignoreFavicon)

// const fs = require('fs')

app.ws('/*', (ws, req) => {
/*    ws.send(JSON.stringify(data))
    ws.on('message', msg => {
      Object.assign(data,JSON.parse(msg))
      updateModels(data)
    })
    ws.on('close',() => delete clients[key])
*/
})

app.get('*', (req, resp) => resp.render('game'))
app.listen(port)

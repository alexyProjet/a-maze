const express = require('express')
const expressWS = require('express-ws')
const path = require('path')
var app = expressWS(express()).app
const port = 3000

const ignoreFavicon = (req, res, next) => (req.originalUrl === '/favicon.ico') ? res.status(204).end() : next()

app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, '/public')))
app.use(ignoreFavicon)

const newId = () => Math.floor(Math.random()*1000000000)

// const fs = require('fs')

let model = {
    players: [],
    traps: [],
    rewards:[],
    map:map()
}

const position = (x,y) => {x,y}
const player = (position,role,score=0,inventory=[],id=newId()) => {id,position,role,score,inventory}
const piege = (parentId,position,triggered=null) => {parentId,position,triggered}
const reward = (position,score) => {position,score}
const map = () => [
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
]


clients = []
const updateModels = model => clients.forEach(client => client.send(JSON.stringify(model)))
app.ws('/*', (ws, req) => {
    let key = JSON.stringify(ws)
    client[key] = ws
    ref = player(position(1,1))
    model.players.push(ref)

    ws.send(JSON.stringify(model))

    ws.on('message', msg => {
        if(msg.type == "PLACE"){
            model.traps.push(msg.trap)
            model.rewards.push(msg.reward)            
        }
        else if(msg.type == "MOVE"){
            ref.position = msg.position
        }
        updateModels(model)
    })
    ws.on('close',() => delete clients[key])
})

app.get('*', (req, resp) => resp.render('game'))
app.listen(port)

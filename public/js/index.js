const express = require('express')
const expressWS = require('express-ws')
const path = require('path')
var app = expressWS(express()).app
const port = 3000



const ignoreFavicon = (req, res, next) => (req.originalUrl === '/favicon.ico') ? res.status(204).end() : next()
const filterField = (object,fieldname) => Object.fromEntries(Object.entries(object).filter(kv => kv[0] != fieldname))
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, '/public')))
app.use(ignoreFavicon)

const newId = () => Math.floor(Math.random()*1000000000)
const distance = (a,b) => Math.sqrt( (b.x - a.x)**2 + (b.y - a.y)**2)
// const fs = require('fs')

const position = (x,y) => Object({x,y})
const player = (position,role,score=0,inventory=[],id=newId()) => Object({id,position,role,score,inventory})
const trap = (parentId,position,triggered=null,id=newId()) => Object({parentId,position,triggered})
const reward = (position,score=1) => Object({position,score})
const map = () => [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,0,0,1],
    [1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,1],
    [1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,1,0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,1,1,1,1,1,1,1,0,1,0,1,0,1,0,0,1,0,0,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,1,0,1,0,1,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0,1,1,0,0,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,1,1,1,0,0,1,0,0,1,0,1,0,0,1,1,1,0,1],
    [1,0,1,1,0,1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,0,0,1,0,1,1,1,0,0,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,0,0,1,1,1],
    [1,0,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1,0,0,1,0,0,1,1,0,1],
    [1,0,1,0,0,0,0,1,0,0,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,0,1,0,1],
    [1,0,0,1,1,1,1,1,0,0,0,0,0,0,1,0,0,1,0,1,0,0,0,1,1,0,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,0,1],
    [1,0,0,1,1,1,1,1,1,1,0,1,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]

let model = {
    players: [],
    traps: [],
    rewards:[],
    map:map()
}

const fuzeTime = 500
const thickness = 1.0

const roles = {
    explorer: true,
    trapper: false
}

clients = []
const updateModels = (model,withmap=false) => clients.forEach((client,i) => 
    client.send(JSON.stringify(Object.assign(
            {currentPlayer:model.players[i].id},
            withmap ? model : filterField(model,'map')
    )))
)

const collision = (posEntity, listEntity) => listEntity.filter(Boolean).map(p => [p,distance(posEntity,p.position)]).filter(v => v[1] < thickness).map(v => v[0])
const plan_explosion = (trap1) => setTimeout(() => {
    collision(trap1.position, model.players).forEach(player1 => {
        //WARNING: ne pas intervertir les deux lignes suivent, sinon il est possible de ressuçuider™
        getPlayerFromId(trap1.parentId).role = roles.explorer
        player1.role = roles.trapper
        getPlayerFromId(trap1.parentId).score++ //FIXME: donne des points en cas de suicide, mince :)))
        model.traps = model.traps.filter(Boolean).filter(tr => tr.id != trap1.id)
        updateModels(model)
    })
},fuzeTime)

const corners = (pos,size) =>  [
        position(Math.floor(pos.x - size/2.0), Math.floor(pos.y - size/2.0)),
        position(Math.floor(pos.x + size/2.0), Math.floor(pos.y - size/2.0)),
        position(Math.floor(pos.x + size/2.0), Math.floor(pos.y + size/2.0)),
        position(Math.floor(pos.x - size/2.0), Math.floor(pos.y + size/2.0))
]

const getPlayerFromId = (id) => model.players.filter(Boolean).filter(p => p.id == id)[0]

app.ws('/', (ws, req) => {
    let key = clients.length
    clients.push(ws)
    
    let ref = player(position(1,1),roles.explorer)
    model.players[key] = ref
    updateModels(model,withmap=true)
    ws.on('message', msg => {
        let data = JSON.parse(msg)
        if(data.type == "PLACE"){
            trap_instance = trap(model.players[key].id,data.trap)
            reward_instance = reward(data.reward)

            model.traps.push(trap_instance) // FIXME: mmake sure the reference is not lost
            model.rewards.push(reward_instance)

            if( collision(trap_instance.position, model.players).length > 0 ) {
                trap_instance.triggered = Date.now();
                plan_explosion(trap_instance)
            }
        }

        else if(data.type == "MOVE"){

            ref.position = data.position
            let trapTrigger = collision(ref.position, model.traps);
            trapTrigger.forEach(trap1 => {
                trap1.triggered = Date.now()
                plan_explosion(trap1);
            })

            let cornersInWall = corners(data.position, thickness).filter(v => model.map[v.x][v.y]).length

            if(cornersInWall === 0) {
                ref.position = data.position
            }
        }
        updateModels(model)
    })
    ws.on('close',() => {
        delete clients[key];
        delete model.players[key];
        updateModels(model);
    })
})
app.get('*', (req, resp) => resp.render('game'))
app.listen(port)
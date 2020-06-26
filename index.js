const express = require('express')
const expressWS = require('express-ws')
const path = require('path')
var app = expressWS(express()).app
const port = 3000
const slog = (f,m) => {
    console.log(m)
    return f()
}
const ignoreFavicon = (req, res, next) => (req.originalUrl === '/favicon.ico') ? res.status(204).end() : next()

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
const map = () => [1] || [
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
const updateModels = model => clients.forEach((client,i) => client.send(JSON.stringify(Object.assign({currentPlayer:model.players[i].id},model))))

const collision = (posEntity, listEntity) => listEntity.map(v => distance(posEntity, v.position)).filter(v => v < 2 * thickness)
const plan_explosion = (trap1) => setTimeout(() => {
    console.log("collision1")
    collision(trap1.position, model.players).forEach(player1 => {
        player1.role = roles.trapper
        model.players.filter(player2 => player2.id == trap1.parentId).forEach(killer => killer.score++) //FIXME: donne des points en cas de suicide, mince :)))
        model.traps = model.traps.filter(candidat => candidat.id != trap1.id)
    })
},fuzeTime)


app.ws('/', (ws, req) => {
    let key = clients.length
    clients.push(ws)
    
    let ref = player(position(1,1),roles.explorer)
    model.players[key] = ref
    updateModels(model)
//    ws.send(JSON.stringify(model))

    ws.on('message', msg => {
        let data = JSON.parse(msg)
        if(data.type == "PLACE"){
            trap_instance = trap(model.players[key].id,data.trap)
            reward_instance = reward(data.reward)

            model.traps.push(trap_instance) // FIXME: mmake sure the reference is not lost
            model.rewards.push(reward_instance)

            if( collision(trap_instance.position, model.players) > 0 ) {
                trap_instance.triggered = Date.now();
                plan_explosion(trap_instance)
            }
        }

        else if(data.type == "MOVE"){
            ref.position = data.position
            // let trapTrigger = collision(ref.position, model.traps);
            //     trapTrigger.forEach(trap1 => {
            //     trap1.triggered = Date.now();
            //     plan_explosion(trap1);
            // })
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
JSON.stringify(trap(0,))
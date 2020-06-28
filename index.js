const express = require('express')
const expressWS = require('express-ws') //pour utiliser web socket pas juste http
const path = require('path')
var app = expressWS(express()).app
const port = 3000


const ignoreFavicon = (req, res, next) => (req.originalUrl === '/favicon.ico') ? res.status(204).end() : next() //eviter afficher erreur navigateur 
const filterField = (object,fieldname) => Object.fromEntries(Object.entries(object).filter(kv => kv[0] != fieldname)) // filtrer champs d'un objet, pour ne pas renvoyer map systematiquement
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, '/public')))
app.use(ignoreFavicon)


const newId = () => Math.floor(Math.random()*1000000000)//génère un id aléatoire
const distance = (a,b) => Math.sqrt( (b.x - a.x)**2 + (b.y - a.y)**2)//distance entre deux points

const position = (x,y) => Object({x,y}) //creer un objet position
const player = (position,role,score=0,inventory=[],id=newId()) => Object({id,position,role,score,inventory}) //champs player
const trap = (parentId,position,triggered=null,id=newId()) => Object({parentId,position,triggered}) //champs de trap
const reward = (position,score=1) => Object({position,score}) //champ reward
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
} //structure du model

const fuzeTime = 500 //temps d'eplosion piege entre declenchement eet tue
const thickness = 0.5 // taille joueur et piege, rayon à verifier

const roles = {
    explorer: "explorer",
    trapper: "trapper"
}

clients = []// structure contient tous clients
const updateModels = (model,withmap=false) => clients.forEach((client,i) => 
    client.send(JSON.stringify(Object.assign(
            {currentPlayer:model.players[i].id},
            withmap ? model : filterField(model,'map')
    )))
) // prend un model et le met à jour et inclu ou non map et renvoi à tous clients, objet assign rajoute current player

//quand piege declenché, appelé pour exploser
//tue le ou les joeurus touchés et recompense l'auteur du piege
//supprime les pieges usés
const plan_explosion = (trap1) => setTimeout(() => {
    getPlayerFromId(trap1.parentId).role = roles.explorer
    let player = model.players.filter(pl => Math.floor(pl.position.x) == Math.floor(trap1.position.x_) && Math.floor(pl.position.y) == (trap1.position.y_));
    player[0].role = "trapper"
    player[0].inventory = [0,1,0,1] //l'ordre est important
    let trapAuthor = getPlayerFromId(trap1.parentId)
    trapAuthor.score++
    trapAuthor.inventory = []
    model.traps = model.traps.filter(Boolean).filter(tr => tr.id != trap1.id)
    updateModels(model)
},fuzeTime)
/*
const rewards = () => setTimeout(() => {
    collision(trap1.position, model.players).forEach(player1 => {
        //WARNING: ne pas intervertir les deux lignes suivent, sinon il est possible de ressuçuider™
        getPlayerFromId(trap1.parentId).role = roles.explorer
        player1.role = roles.trapper
        getPlayerFromId(trap1.parentId).score++ //FIXME: donne des points en cas de suicide, mince :)))
        model.traps = model.traps.filter(Boolean).filter(tr => tr.id != trap1.id)
        updateModels(model)
    })
},fuzeTime)*/

//donne un tableau des collisions possible autour du joueur
const collision = (pos,size) =>  [
        position(Math.floor(pos.x), Math.floor(pos.y)),// haut gauche
        position(Math.floor(pos.x + size), Math.floor(pos.y)),// haut droite
        position(Math.floor(pos.x + size), Math.floor(pos.y + size)),// bas droite
        position(Math.floor(pos.x), Math.floor(pos.y + size))// bas gauche
]

//donne joueur via id
const getPlayerFromId = (id) => model.players.filter(Boolean).filter(p => p.id == id)[0]

//websocket, push dans le tableau clients
app.ws('/', (ws, req) => {
    let key = clients.length
    clients.push(ws)
    
    let ref
    if(model.players.filter(pl => pl.role == "trapper").length == 0){
        ref = player(position(1,1),roles.trapper,0,[0,1,0,1]) // construit nouveau joeur a position 11 et role explorer
    } else {
        ref = player(position(1,1),roles.explorer,0,[]) // construit nouveau joeur a position 11 et role explorer
    }

    model.players[key] = ref //ajoute joueur au model, garde indice peu importe
    updateModels(model,withmap=true) //met a jour model car nouveau joeur

    //quand recoit message client
    ws.on('message', msg => {
        let data = JSON.parse(msg)
        //check type de message recu
        if(data.type == "PLACE"){
            trap_instance = trap(model.players[key].id,data.trap) //creer un piege avec les données recu et ce qu'on a deja
            reward_instance = reward(data.reward)

            if(true){//si placement possible TODO
                model.traps.push(trap_instance)
                model.rewards.push(reward_instance)
                getPlayerFromId(model.players[key].id).inventory.pop()
                getPlayerFromId(model.players[key].id).inventory.pop()
            }
        }

        //si message move
        else if(data.type == "MOVE"){
            //permet de savoir quel joueur
            //Collisions avec pieges/recompenses
            let isColliding = false
                    collision(data.position, thickness/2.0).some(function(pos, ind) {    
                        if(isColliding){
                            return false
                        }
                        model.traps.some(function(trap, index) {
                            if(trap.position.x_ == pos.x && trap.position.y_ == pos.y){
                                isColliding = true
                                if(trap.triggered == null){
                                    trap.triggered = Date.now()
                                    plan_explosion(trap);
                                }                                
                                return false
                            } else {
                                return true
                            }
                          })  
                          /*model.rewards.some(function(element, index) {
                            if(element.position.x_ == pos.x && element.position.y_ == pos.y){
                                isColliding = true

                                return false
                            } else {
                                return true
                            }
                          })  */
                          return true                    
                    })

            //collisions avec murs
            isColliding = false
            collision(data.position, thickness/2.0).forEach(
                pos => {
                    if(model.map[pos.y][pos.x] == 1){ //inversé mais fonctionne 
                        isColliding = true
                        
                    }
                })
           if(!isColliding) {
                ref.position = data.position
           }
        }
        updateModels(model)//maj du model
    })
    //quand client ferme connection, on le delete et son player et update model
    ws.on('close',() => {
        delete clients[key];
        delete model.players[key];
        updateModels(model);
    })
})
//pug
app.get('*', (req, resp) => resp.render('game'))
app.listen(port)
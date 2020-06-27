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
    explorer: true,
    trapper: false
}

clients = []// structure contient tous clients
const updateModels = (model,withmap=false) => clients.forEach((client,i) => 
    client.send(JSON.stringify(Object.assign(
            {currentPlayer:model.players[i].id},
            withmap ? model : filterField(model,'map')
    )))
) // prend un model et le met à jour et inclu ou non map et renvoi à tous clients, objet assign rajoute current player

//avec une pos et liste entité, check les entités en collision avec position, renvoie toute celle dont distance inferieur a thickness
const collision = (posEntity, listEntity) => listEntity.filter(Boolean).map(p => [p,distance(posEntity,p.position)]).filter(v => v[1] < thickness).map(v => v[0])

//quand piege declenché, appelé pour exploser
//tue le ou les joeurus touchés et recompense l'auteur du piege
//supprime les pieges usés
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

//donne un tableau des collisions possible autour du joueur
const collisionMurs = (pos,size) =>  [
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
    
    let ref = player(position(1,1),roles.explorer,0,[0,0,1,1]) // construit nouveau joeur a position 11 et role explorer
    model.players[key] = ref //ajoute joueur au model, garde indice peu importe
    updateModels(model,withmap=true) //met a jour model car nouveau joeur

    //quand recoit message client
    ws.on('message', msg => {
        let data = JSON.parse(msg)
        //check type de message recu
        if(data.type == "PLACE"){
            trap_instance = trap(model.players[key].id,data.trap) //creer un piege avec les données recu et ce qu'on a deja
            reward_instance = reward(data.reward)
            
            //ajoute au model
            model.traps.push(trap_instance)
            model.rewards.push(reward_instance)

            //si piege est en collision avec un joueur, si oui, piege explose
            if( collision(trap_instance.position, model.players).length > 0 ) {
                trap_instance.triggered = Date.now();//savoir si ca a ezte trigger ou null si pas trigger du tout
                plan_explosion(trap_instance)
            }
        }

        //si message move
        else if(data.type == "MOVE"){

            //vérifie si joueurs collision avec piege
            let trapTrigger = collision(ref.position, model.traps);
            trapTrigger.forEach(trap1 => {
                trap1.triggered = Date.now()
                plan_explosion(trap1);
            })

            let isColliding = false
            collisionMurs(data.position, thickness/2.0).forEach(
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
        console.log("traps",model.traps)
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
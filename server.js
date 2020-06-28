var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.static(__dirname + '/public'));

const rooms = { name: {} }
var players = {};
const trapperInventory = [0, 1, 0, 1, 0, 1, 0, 1]

app.get('/', (req, res) => {
    console.log("/")
    res.render('lobby', { rooms: rooms })
})

app.post('/room', (req, res) => {
    console.log("/room")
    if (rooms[req.body.room] != null) {
        return res.redirect('/')
    }
    rooms[req.body.room] = { users: {} }
    res.redirect(req.body.room)
    //send message that new room is created
    io.emit("newRoom", req.body.room)
})

app.get('/:room', (req, res) => {
    console.log("/autre")
    res.render('game', { roomName: req.params.room })
})

server.listen(3000, function () {
    console.log(`En écoute sur ${server.address().port}`);

    io.on('connection', function (socket) {
        console.log('Nouvelle utilisateur connecté');

        socket.on('disconnect', function () {
            console.log('Utilisateur deconnecté');
            // remove this player from our players object
            delete players[socket.id];
            // emit a message to all players to remove this player
            io.emit('disconnect', socket.id);
        });

        let ref
        if (model.players.filter(pl => pl.role == "trapper").length == 0) {
            ref = player(position(-10, 1), roles.trapper, 0, trapperInventory) // construit nouveau joeur a position 11 et role explorer
        } else {
            ref = player(randomPosition(), roles.explorer, 0, []) // construit nouveau joeur a position 11 et role explore
        }
        ref.socketID = socket.id

        model.players.push(ref)
        updateModels(model, withmap = true)

        socket.on('PLACE', function (dataJSON) {
            let data = JSON.parse(dataJSON)
            let player = model.players.find(pl => pl.socketID == socket.id)

            trap_instance = trap(player.id, data.trap) //creer un piege avec les données recu et ce qu'on a deja
            reward_instance = reward(data.reward)

            if (isAValidPosition(trap_instance.position.x_, trap_instance.position.y_) && isAValidPosition(reward_instance.position.x_, reward_instance.position.y_)) {//si placement possible TODO
                console.log("trap et reward placés valides")
                model.traps.push(trap_instance)
                model.rewards.push(reward_instance)
                getPlayerFromId(player.id).inventory.pop()
                getPlayerFromId(player.id).inventory.pop()
            } else {
                console.log("trap et reward placés NON valides")
            }
            updateModels(model)
        });

        socket.on('MOVE', function (dataJSON) {
            let data = JSON.parse(dataJSON)
            let player = model.players.find(pl => pl.socketID == socket.id)

            if (data.player.role == "trapper") {

            } else {
                collision(data.position, thickness / 2.0).some(function (pos, ind) {   //regarde si il y a une collision à la nouvelle position avec...
                   let isCollidingReward=false;
                   let isCollidingTrap=false;

                    if (isCollidingTrap==true && isCollidingReward==true) {
                        return false
                    }
                    //... des pièges
                    model.traps.some(function (trap, index) {
                        if (trap.position.x_ == pos.x && trap.position.y_ == pos.y) {
                            isCollidingTrap = true
                            if (trap.triggered == null) {
                                trap.triggered = Date.now()
                                console.log("player : ", data.player.id, " walk on trap : ", trap)
                                plan_explosion(trap, data.player);
                                isCollidingTrap = false
                            }
                            return false
                        } else {
                            return true
                        }
                    })
                    //...des recompenses
                    model.rewards.some(function (rew, index) {
                        if (rew.position.x_ == pos.x && rew.position.y_ == pos.y) {
                            isCollidingReward = true
                            if (rew.triggered == null) {
                                rew.triggered = Date.now()
                                console.log("player : ", data.player.id, " walk on reward : ", rew)
                                rewardPlayer(rew, data.player)
                                isCollidingReward = false
                            }
                            return false
                        } else {
                            return true
                        }
                    })
                    return true
                })

                //check collisions avec mur
                let isCollidingWall=false
                collision(data.position, thickness / 2.0).forEach(
                    pos => {
                        if (model.map[pos.y][pos.x] == 1) { //inversé mais fonctionne 
                            isCollidingWall = true
                        }
                    })
                if (!isCollidingWall) {
                    ref.position = data.position
                }
            }
            updateModels(model)
        })
    });
});

function updateModels(mod, withmap = false) {
    io.emit('modelUpdate', JSON.stringify(mod))
}

const newId = () => Math.floor(Math.random() * 1000000000)//génère un id aléatoire
const distance = (a, b) => Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)//distance entre deux points

const position = (x, y) => Object({ x, y }) //creer un objet position
const player = (position, role, score = 0, inventory = [], id = newId(), oldPosition = position, socketID = null) => Object({ id, position, oldPosition, role, score, inventory, socketID }) //champs player
const trap = (parentId, position, triggered = null, id = newId()) => Object({ parentId, position, triggered }) //champs de trap
const reward = (position, score = 1, triggered = null) => Object({ position, score, triggered }) //champ reward
const map = () => [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

let model = {
    players: [],
    traps: [],
    rewards: [],
    map: map(),
    roomID: 0
} //structure du model

const fuzeTime = 500 //temps de suspense
const thickness = 0.5 // taille joueur et piege, rayon à verifier

const roles = {
    explorer: "explorer",
    trapper: "trapper"
}


function randomPosition() {
    let x
    let y
    do {
        x = Math.floor(Math.random() * (model.map[0].length - 1)) + 1
        y = Math.floor(Math.random() * (model.map.length - 1)) + 1
    } while (!(isAValidPosition(x, y)))

    return position(x, y)
}
/**
 * Vérfie qu'il n'y a que du sol à la position donnée
 * @param {*} x 
 * @param {*} y 
 */
function isAValidPosition(x, y) {
    if (model.map[y][x] == 0) {
        let trap = model.traps.filter(tr => tr.position == position(x, y))
        let rew = model.rewards.filter(rew => rew.position == position(x, y))

        if (trap.length == 0 && rew.length == 0) {
            return true
        }
    }
    return false
}

/**
 * Provoque une explosion pour actualplayer qui devient trapper
 * récompense le joueur auteur du piege
 * change les roles de l'explorer à trapper et vice versa
 * supprime du model
 * @param {*} trap1 
 */
const plan_explosion = (trap1, actualPlayer) => setTimeout(() => {
    //MAJ joueur marché sur piege
    let pl = model.players.find(p => p.id == actualPlayer.id)
    pl.role = roles.trapper
    pl.inventory = trapperInventory //l'ordre est important
    pl.oldPosition = pl.position
    pl.position.x = -10//n'est plus sur terrain de jeu
    console.log("player : ", pl.id, " role changed, now is : ", pl.role)

    //MAJ joueur auteur du piege
    let trapAuthor = getPlayerFromId(trap1.parentId)
    trapAuthor.score++
    if (trapAuthor.role == roles.trapper) {
        trapAuthor.role = roles.explorer
        console.log("player : ", trapAuthor.id, " role changed, now is : ", trapAuthor.role)
        trapAuthor.inventory = []
        trapAuthor.position = trapAuthor.oldPosition
        if (trapAuthor.position.x < 0) {
            trapAuthor.position = randomPosition() //on le repositionne à ses anciennes coordonées
        }
    }
    model.traps = model.traps.filter(Boolean).filter(tr => tr.id != trap1.id)
    updateModels(model)
}, fuzeTime)

/**
 * Recompense le joueur qui a recupéré la reward
 * supprime du model
 * @param {} rewardUsed 
 * @param {*} player 
 */
const rewardPlayer = (rewardUsed, player) => setTimeout(() => {
    let pl = model.players.find(p => p.id == player.id)
    pl.score++
    model.rewards = model.rewards.filter(Boolean).filter(rew => rew.position != rewardUsed.position)
    console.log("player : ", pl.id, " score is : ", pl.score)
    updateModels(model)
}, fuzeTime)

/**
 * Donne un tableau des collisions autour d'un rayon de size
 * @param {} pos 
 * @param {*} size 
 */
const collision = (pos, size) => [
    position(Math.floor(pos.x), Math.floor(pos.y)),// haut gauche
    position(Math.floor(pos.x + size), Math.floor(pos.y)),// haut droite
    position(Math.floor(pos.x + size), Math.floor(pos.y + size)),// bas droite
    position(Math.floor(pos.x), Math.floor(pos.y + size))// bas gauche
]

/**
 * Donne un joueur à partir d'un id
 * @param {*} id 
 */
const getPlayerFromId = (id) => model.players.filter(Boolean).filter(p => p.id == id)[0]
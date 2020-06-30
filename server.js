var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }))

const rooms = {}
const trapperInventory = [0, 1, 0, 1, 0, 1, 0, 1]

app.get('/', (req, res) => {
    console.log("/")
    res.render('lobby', { rooms: rooms, roomType: "lobbyMenu", roomName: "lobbyMenu" })
})

/**
 * lorsque clic bouton "creer room"
 * averti tout autre clients que nouvelle room
 * redirige le createur vers sa nouvelle room
 */
app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/')
    }
    rooms[req.body.room] = { users: {}, model: model(), roomLeader: null, state: "lobby" }
    res.redirect(req.body.room)
    io.emit("newRoom", req.body.room)
    console.log("SERVEUR io.EMIT : new room created", req.body.room)
})

app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/')
    }
    res.render('game', { roomName: req.params.room, roomType: "lobby" })
    console.log("SERVEUR : /:room", req.params.room)
})

function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if (room.users[socket.id] != null) names.push(name)
        return names
    }, [])
}

server.listen(3000, function () {
    console.log(`En écoute sur ${server.address().port}`);

    io.on('connection', function (socket) {

        //recu du controller, enregistre le nouveau joueur
        socket.on('new-user', (room, name) => {
            if (rooms[room].state != "inGame") { //si dans le lobby
                console.log("SERVEUR ON : new-user", name, room)
                socket.join(room)
                rooms[room].users[socket.id] = name
                if (Object.keys(rooms[room].users).length == 1) {
                    rooms[room].roomLeader = socket.id
                }
                // console.log("SERVEUR : rooms content ",rooms)
                io.in(room).emit("user-connected", name, rooms[room])
                console.log("SERVEUR EMIT : user-connected", name)
            } else {
                io.to(socket.id).emit("already-in-game")
                console.log("SERVEUR on : deja en jeu")
            }

        });

        socket.on('setName', function (room, name) {
            console.log("SERVEUR ON setName old : ", rooms[room].users[socket.id])
            rooms[room].users[socket.id] = name
            console.log("SERVEUR ON setName new : ", rooms[room].users[socket.id])
            io.to(room).emit("lobby-changes-occured", rooms[room])
        })

        // si un joueur part
        socket.on('disconnect', function () {
            getUserRooms(socket).forEach(room => {
                if (rooms[room].state != "inGame") { //si deconnexion en lobby

                    let name = rooms[room].users[socket.id]
                    if (Object.keys(rooms[room].users).length == 1) { //si plus personne, on detruit le salon
                        delete rooms[room]
                        console.log("SERVEUR ON : disconnect lobby detruit", rooms[room])
                    } else if (rooms[room].users[socket.id] == rooms[room].users[rooms[room].roomLeader]) { //le leader part,  nouveau leader
                        let newLeader = null
                        console.log("SERVEUR ON : disconnet roomLeader is leaving", rooms[room].roomLeader)
                        delete rooms[room].users[socket.id]
                        if (Object.keys(rooms[room].users).length == 0) {//plus personne en jeu
                            io.in(room).emit("exit")
                            delete rooms[room]
                        } else {//reste assez de joueur
                            rooms[room].roomLeader = Object.keys(rooms[room].users)[0];
                            console.log("SERVEUR ON : disconnect new roomLeader is", rooms[room].roomLeader, rooms[room].users)
                            io.to(room).emit("user-disconnected-lobby", name, rooms[room])
                        }
                    } else {
                        console.log("SERVEUR ON : disconnect ", rooms[room].users[socket.id])
                        delete rooms[room].users[socket.id]
                        io.to(room).emit("user-disconnected-lobby", name, rooms[room])
                    }
                    

                } else { //si deconnexion en jeu

                    if (Object.keys(rooms[room].users).length >= 2) { //si plus personne, on detruit le salon
                        delete rooms[room]
                        io.in(room).emit("exit")
                        console.log("SERVEUR ON : disconnect room detruite", rooms[room])
                    } else if (rooms[room].users[socket.id] == rooms[room].users[rooms[room].roomLeader]) { //le leader part
                        let newLeader = null
                        console.log("SERVEUR ON : disconnet roomLeader is leaving", rooms[room].roomLeader)
                        delete rooms[room].users[socket.id]
                            rooms[room].roomLeader = Object.keys(rooms[room].users)[0];
                            console.log("SERVEUR ON : disconnect new roomLeader is", rooms[room].roomLeader, rooms[room].users)

                            //si le joueur était trapper, random devient trapper à sa place
                            if (getPlayerFromId(socket.id, room).role == "trapper") {
                                getPlayerFromId(rooms[room].roomLeader, room).role = "trapper"
                            }

                            getPlayerFromId(rooms[room].roomLeader, room).isRoomLeader = true

                            removeEntityAssociatedtoPlayer(getPlayerFromId(socket.id, room), room)
                            rooms[room].model.players = rooms[room].model.players.filter(function (pl) {
                                return pl.id !== socket.id;
                            });

                            updateModels(rooms[room].model, room, withmap = true)
                        
                    } else {
                        console.log("SERVEUR ON : disconnect ", rooms[room].users[socket.id])

                        removeEntityAssociatedtoPlayer(getPlayerFromId(socket.id, room), room)
                        rooms[room].model.players = rooms[room].model.players.filter(function (pl) {
                            return pl.id !== socket.id;
                        });
                        delete rooms[room].users[socket.id]
                        updateModels(rooms[room].model, room, withmap = true)
                    }

                }
            })
        });

        //Initialisation du joueur
        socket.on('INIT', function (room,time) {
            let ref
            if (rooms[room].model.players.filter(pl => pl.role == "trapper").length == 0) {
                ref = player(position(-10, 1), roles.trapper, 0, trapperInventory.slice()) // construit nouveau joeur a position 11 et role explorer
            } else {
                ref = player(randomPosition(room), roles.explorer, 0, []) // construit nouveau joeur a position 11 et role explore
            }
            ref.id = socket.id
            ref.name = rooms[room].users[socket.id]
            if (socket.id == rooms[room].roomLeader) {
                ref.isRoomLeader = true
            }
            console.log("SERVEUR ON : player is  ", ref)
            rooms[room].model.players.push(ref)
            console.log("SERVEUR ON : START in room ", room)
            updateModels(rooms[room].model, room, withmap = true)
            io.in(room).emit('displayGame',time)
        })


        //averti tous le monde que partie commence
        socket.on('START', function (room, time) {
            if (socket.id == rooms[room].roomLeader) {
                if (false/*Object.keys(rooms[room].users).length == 1*/) { // a enlever 
                    console.log("SERVEUR EMIT : gameReadey 1 seul joueur annulation")
                    io.in(room).emit('gameReady', "missingPlayers")
                } else {
                    console.log("SERVEUR EMIT : gameReadey ", room)
                    io.in(room).emit('gameReady', "ok",time)
                    io.emit('update-lobbyMenu', room)
                    rooms[room].state = "inGame"

                    let timeStop = new Date();
                    timeStop.setMinutes(timeStop.getMinutes() + parseInt(time));
                    timer(timeStop.getTime(),room)
                }
            } else {
                console.log("SERVEUR : seul le roomLeader peut lancer la partie")
            }

        })

        //place un piege ou recompense si l'emplacement est valide
        socket.on('PLACE', function (room, dataJSON) {
            let data = JSON.parse(dataJSON)
            let player = rooms[room].model.players.find(pl => pl.id == socket.id)

            let trap_instance = trap(player.id, data.trap) //creer un piege avec les données recu et ce qu'on a deja
            let reward_instance = reward(player.id, data.reward)

            if (trap_instance.position.x_ == reward_instance.position.x_ && trap_instance.position.y_ == reward_instance.position.y_) {
                console.log("SERVEUR on place : positions identiques invalides")
            } else if (isAValidPosition(trap_instance.position.x_, trap_instance.position.y_, room) && isAValidPosition(reward_instance.position.x_, reward_instance.position.y_, room)) {//si placement possible TODO
                console.log("trap et reward placés valides")
                rooms[room].model.traps.push(trap_instance)
                rooms[room].model.rewards.push(reward_instance)
                getPlayerFromId(player.id, room).inventory.pop()
                getPlayerFromId(player.id, room).inventory.pop()
            } else {
                console.log("trap et reward placés NON valides")
            }
            updateModels(rooms[room].model, room)
        });

        //vérifi si le deplacement du joueur est valide
        //vérifi si collision avec piege ou recompense
        socket.on('MOVE', function (room, dataJSON) {
            let data = JSON.parse(dataJSON)
            let player = rooms[room].model.players.find(pl => pl.id == socket.id)

            if (data.player.role == "explorer") {
                let isColliding = false;
                collision(data.position, thickness / 2.0).some(function (pos, ind) {   //regarde si il y a une collision à la nouvelle position avec...
                    //... des pièges
                    rooms[room].model.traps.some(function (trap, index) {
                        if (trap.position.x_ == pos.x && trap.position.y_ == pos.y) {
                            if (trap.triggered == null) {
                                trap.triggered = Date.now()
                                console.log("player : ", data.player.id, " walk on trap : ", trap)
                                isColliding = true
                                plan_explosion(trap, data.player, room);
                                return true
                            }
                        }
                    })
                    //...des recompenses
                    console.log("test rewards : ", rooms[room].model.rewards)
                    rooms[room].model.rewards.some(function (rew, index) {
                        if (rew.position.x_ == pos.x && rew.position.y_ == pos.y) {
                            if (rew.triggered == null) {
                                rew.triggered = Date.now()
                                console.log("player : ", data.player.id, " walk on reward : ", rew)
                                isColliding = true
                                rewardPlayer(rew, data.player, room)
                                return true
                            }
                        }
                    })
                    if (isColliding) {
                        return true
                    }
                })
                //check collisions avec mur
                let isCollidingWall = collision(data.position, thickness / 2.0).some(pos => rooms[room].model.map[pos.y][pos.x] == 1)
                if (!isCollidingWall) {
                    console.log("MOUVEMENT", data.position)
                    player.position = data.position
                }
            }
            updateModels(rooms[room].model, room)
        })
    });
});

function timer(stop,room){
    var x = setInterval(function() {
        var now = new Date().getTime();
        
        var distance = stop - now;
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        //Lorsque fini
        if (distance <= 0) {
          clearInterval(x);
          io.to(room).emit("countdown-over")
        }
      }, 1000);
}


/**
 * Met à jour le model
 * @param {*} mod 
 * @param {*} room 
 * @param {*} withmap 
 */
function updateModels(mod, room, withmap = false) {
    //console.log("SERVEUR EMIT : model content ",mod)
    io.in(room).emit('modelUpdate', JSON.stringify(mod))
}



function removeEntityAssociatedtoPlayer(player, room) {
    rooms[room].model.traps = rooms[room].model.traps.filter(function (tr) {
        return tr.parentId !== player.id;
    });
    rooms[room].model.rewards = rooms[room].model.rewards.filter(function (rew) {
        return rew.parentId !== player.id;
    });
}

const distance = (a, b) => Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)//distance entre deux points
const newId = () => Math.floor(Math.random() * 1000000000)//génère un id aléatoire
const position = (x, y) => Object({ x, y }) //creer un objet position
const player = (position, role, score = 0, inventory = [], name = null, id = null, isRoomLeader = false) => Object({ id, position, name, role, isRoomLeader, score, inventory }) //champs player
const trap = (parentId, position, triggered = null, id = newId()) => Object({ parentId, position, triggered }) //champs de trap
const reward = (parentId, position, score = 1, triggered = null) => Object({ parentId, position, score, triggered }) //champ reward
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

let model = () => Object({
    players: [],
    traps: [],
    rewards: [],
    map: map(),
    roomLeader: null
})

const fuzeTime = 150 //temps de suspense
const thickness = 0.5 // taille joueur et piege, rayon à verifier

const roles = {
    explorer: "explorer",
    trapper: "trapper"
}

/**
 * renvoi une position random
 * @param {*} room 
 */
function randomPosition(room) {
    let x
    let y
    do {
        x = Math.floor(Math.random() * (rooms[room].model.map[0].length - 1)) + 1
        y = Math.floor(Math.random() * (rooms[room].model.map.length - 1)) + 1
    } while (!(isAValidPosition(x, y, room)))

    return position(x, y)
}

/**
 * Vérfie qu'il n'y a que du sol à la position donnée
 * @param {*} x 
 * @param {*} y 
 */
function isAValidPosition(x, y, room) {
    if (rooms[room].model.map[y][x] == 0) {
        let trap = rooms[room].model.traps.filter(tr => tr.position == position(x, y))
        let rew = rooms[room].model.rewards.filter(rew => rew.position == position(x, y))
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
const plan_explosion = (trap1, actualPlayer, room) => {
    //MAJ joueur marché sur piege
    let pl = rooms[room].model.players.find(p => p.id == actualPlayer.id)
    pl.role = roles.trapper
    pl.inventory = trapperInventory.slice() //l'ordre est important
    console.log("player : ", pl.id, " role changed, now is : ", pl.role)

    //MAJ joueur auteur du piege
    let trapAuthor = getPlayerFromId(trap1.parentId, room)
    trapAuthor.score++
    if (trapAuthor.role == roles.trapper) {
        trapAuthor.role = roles.explorer
        console.log("player : ", trapAuthor.id, " role changed, now is : ", trapAuthor.role)
        trapAuthor.inventory = []
        if (trapAuthor.position.x < 0) {
            trapAuthor.position = randomPosition(room) //on le repositionne à ses anciennes coordonées
        }
    }
    rooms[room].model.traps = rooms[room].model.traps.filter(Boolean).filter(tr => tr.id != trap1.id)
    console.log(pl.position)
    updateModels(rooms[room].model, room)
    console.log('traps :', rooms[room].model.traps)
}

/**
 * Recompense le joueur qui a recupéré la reward
 * supprime du model
 * @param {} rewardUsed 
 * @param {*} player 
 */
const rewardPlayer = (rewardUsed, player, room) => {
    let pl = rooms[room].model.players.find(p => p.id == player.id)
    pl.score++
    rooms[room].model.rewards = rooms[room].model.rewards.filter(Boolean).filter(rew => rew.position != rewardUsed.position)
    console.log("player : ", pl.id, " score is : ", pl.score)
    updateModels(rooms[room].model, room)
    console.log('rewards :', rooms[room].model.rewards)
}

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
const getPlayerFromId = (id, room) => rooms[room].model.players.filter(Boolean).filter(p => p.id == id)[0]
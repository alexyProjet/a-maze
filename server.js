var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }))

const rooms = {}
const refreshRate = 30
const trapperInventory = [0, 1, 0, 1, 0, 1, 0, 1]
const fuzeTime = 150 //temps de suspense
const playerHalfSize = 0.20 // taille joueur et piege, rayon à verifier

/**
 * Rendu de la page dans le menu des salons
 */
app.get('/', (req, res) => {
    res.render('lobby', { rooms: rooms, roomName: "lobbyMenu" })
})

/**
 * Gestion de création de salon
 */
app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/')
    }
    rooms[req.body.room] = { users: {}, model: model(), roomLeader: null, state: "lobby", refreshing: null }
    res.redirect(req.body.room)
    io.emit("new-roon", req.body.room)
    console.log("SERVEUR : nouveau salon créé", req.body.room)
})

/**
 * Gestion de redirection ou non quand force entrée dans un salon
 * Si le salon est en jeu -> redirection
 * Sinon rejoint le salon
 */
app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/')
    }
    res.render('game', { roomName: req.params.room })
})

var port = process.env.PORT || 3000

server.listen(port, function () {
    console.log(`En écoute sur ${server.address().port}`);

    io.on('connection', function (socket) {

        /**
         * Enregistrement du nouvel utilisateur connecté
         */
        socket.on('new-user', (room, name) => {
            console.log("SERVEUR : nouveau joueur : ", name, " dans le salon : ", room)
            if(rooms[room] == undefined){
                console.log("[NEW-USER] : salon inexistant... abandon.")
                io.to(socket.id).emit("redirectPlayer")
            } else  if (rooms[room].state != "inGame") { //si dans le lobby
                socket.join(room)
                rooms[room].users[socket.id] = name
                if (Object.keys(rooms[room].users).length == 1) {
                    rooms[room].roomLeader = socket.id
                }
                io.in(room).emit("user-connected-in-lobby", name, rooms[room])
            } else {
                io.to(socket.id).emit("redirectPlayer")
            }
        });

        /**
         * MAJ du pseudo demandé par l'utilisateur
         */
        socket.on('set-name', function (room, name) {
            console.log("SERVEUR : changement de nom dans le salon : ", room, "Ancien : ", rooms[room].users[socket.id], " Nouveau : ", name)
            rooms[room].users[socket.id] = name
            io.to(room).emit("lobby-changes-occured", rooms[room])
        })

        /**
         * Gestion de tous les cas possibles de deconnexion
         */
        socket.on('disconnect', function () {
            getRoomFromPlayerId(socket).forEach(room => {
                if (rooms[room].state != "inGame") { //si deconnexion en lobby
                    let name = rooms[room].users[socket.id]
                    if (Object.keys(rooms[room].users).length == 1) { //si plus personne, on detruit le salon
                        console.log("SERVEUR : Destruction du salon : ", rooms[room], " raison : vide.")
                        delete rooms[room]
                        io.emit('remove-room-from-lobby-menu', room)
                    } else if (rooms[room].users[socket.id] == rooms[room].users[rooms[room].roomLeader]) { //le leader part,  nouveau leader
                        let newLeader = null
                        console.log("SERVEUR : Deconnexion du maitre de salon dans : ", room, " tentative de réaffectation...")
                        delete rooms[room].users[socket.id]
                        if (Object.keys(rooms[room].users).length == 0) {//plus personne en jeu
                            io.in(room).emit("redirectPlayer")
                            delete rooms[room]
                        } else {//reste assez de joueur
                            rooms[room].roomLeader = Object.keys(rooms[room].users)[0];
                            io.to(room).emit("user-disconnected-lobby", name, rooms[room])
                        }
                    } else {
                        console.log("SERVEUR : deconnexion de : ", rooms[room].users[socket.id], "dans : ", room)
                        delete rooms[room].users[socket.id]
                        io.to(room).emit("user-disconnected-lobby", name, rooms[room])
                    }
                } else { //si deconnexion en jeu
                    if (Object.keys(rooms[room].users).length <= 2) { //si plus personne, on detruit le salon
                        console.log("SERVEUR : Destruction du salon : ", rooms[room], " raison : vide.")
                        clearInterval(rooms[room].refreshing);
                        delete rooms[room]
                        io.in(room).emit("redirectPlayer")
                    } else if (rooms[room].users[socket.id] == rooms[room].users[rooms[room].roomLeader]) { //le leader part
                        console.log("SERVEUR : Deconnexion du maitre de salon dans : ", room, " tentative de réaffectation...")
                        delete rooms[room].users[socket.id]
                        rooms[room].roomLeader = Object.keys(rooms[room].users)[0];
                        //si le joueur était trapper, random devient trapper à sa place
                        if (getPlayerFromId(socket.id, room).role == "trapper") {
                            getPlayerFromId(rooms[room].roomLeader, room).role = "trapper"
                        }
                        getPlayerFromId(rooms[room].roomLeader, room).isRoomLeader = true
                        removeEntityAssociatedtoPlayer(getPlayerFromId(socket.id, room), room)
                        rooms[room].model.players = rooms[room].model.players.filter(function (pl) {
                            return pl.id !== socket.id;
                        });
                    } else {
                        console.log("SERVEUR : deconnexion de : ", rooms[room].users[socket.id], "dans : ", room)
                        removeEntityAssociatedtoPlayer(getPlayerFromId(socket.id, room), room)
                        rooms[room].model.players = rooms[room].model.players.filter(function (pl) {
                            return pl.id !== socket.id;
                        });
                        delete rooms[room].users[socket.id]
                    }
                }
            })
        });

                /**
         * Client demande le debut de partie, si oui alors on prépare
         */
        socket.on('start-game', function (room, time) {
            if (socket.id == rooms[room].roomLeader) {
                if (false/*Object.keys(rooms[room].users).length == 1*/) { // a enlever 
                    console.log("SERVEUR EMIT : gameReadey 1 seul joueur annulation")
                    io.in(room).emit('game-ready', "missingPlayers")
                } else {
                    
                    rooms[room].state = "inGame"
                    let timeStop = new Date();
                    timeStop.setMinutes(timeStop.getMinutes() + parseInt(time));
                    timer(timeStop.getTime(), room)

                    io.in(room).emit('game-ready', "ok", timeStop.getTime())
                    io.in(room).emit('remove-room-from-lobby-menu', room)

//for les clés dans users ->push player avec id
                    let idArray = Object.keys(rooms[room].users)

                    idArray.forEach(id => {
                        let ref 
                        if (rooms[room].model.players.filter(pl => pl.role == "trapper").length == 0) {
                            ref = player(randomPosition(room), roles.trapper, 0, trapperInventory.slice())
                        } else {
                            ref = player(randomPosition(room), roles.explorer, 0, []) // construit nouveau joeur a position 11 et role explore
                        }
                        ref.id = id
                        ref.name = rooms[room].users[id]
                        if (id == rooms[room].roomLeader) {
                            ref.isRoomLeader = true
                        }
                        rooms[room].model.players.push(ref)
                    })

                    updateModelsEveryRefreshRate()
                    io.in(room).emit('display-game', timeStop,rooms[room].model)
                }
            } else {
                console.log("SERVEUR : seul le roomLeader peut lancer la partie")
            }

        })

        /**
         * Place un piège et une recompense si emplacement valide (pas d'entités, pas les deux sur la même case etc...)
         */
        socket.on('place-trap-and-reward', function (room, dataJSON) {
            let data = JSON.parse(dataJSON)
            let player = rooms[room].model.players.find(pl => pl.id == socket.id)

            let trap_instance = trap(player.id, data.trap) //creer un piege avec les données recu et ce qu'on a deja
            let reward_instance = reward(player.id, data.reward)

            if (trap_instance.position.x_ == reward_instance.position.x_ && trap_instance.position.y_ == reward_instance.position.y_) {
                console.log("SERVEUR on place : positions identiques invalides")
            } else if (isAValidPosition(trap_instance.position.x_, trap_instance.position.y_, room) && isAValidPosition(reward_instance.position.x_, reward_instance.position.y_, room)) {//si placement possible
                console.log("trap et reward placés valides")
                rooms[room].model.traps.push(trap_instance)
                rooms[room].model.rewards.push(reward_instance)
                getPlayerFromId(player.id, room).inventory.pop()
                getPlayerFromId(player.id, room).inventory.pop()
                console.log(rooms[room].model.traps)
            } else {
                console.log("trap et reward placés NON valides")
            }
        });

        /**
         * Vérfie si joueur entre en collision avec mur ou entités
         * Valide ou non le déplacement
         */
        socket.on('move-player', function (room, newPosition, dir) {
            //console.log("[MOVE-PLAYER] : recu du salon : ", room)
            let player = rooms[room].model.players.find(pl => pl.id == socket.id)
            if (newPosition.x > 30 || newPosition.y > 20) {
               // console.log("----> [MOVE-PLAYER] : position en dehors du plateau.")
            }
            else if (player.role == "explorer" && Math.abs(newPosition.x - player.position.x) < 1.0 && Math.abs(newPosition.y - player.position.y) < 1.0) {
                let isColliding = false;
                collision(newPosition, playerHalfSize).some(function (pos, ind) {
                    //regarde si il y a une collision à la nouvelle position avec...
                    //... des pièges
                    rooms[room].model.traps.some(function (trap, index) {
                        if (trap.position.x_ == pos.x && trap.position.y_ == pos.y) {
                            if (trap.triggered == null) {
                                trap.triggered = Date.now()
                                console.log("player : ", player.id, " walk on trap : ", trap)
                                isColliding = true
                                io.to(room).emit("trap-animation", trap.position)
                                io.to(room).emit("shake-game")
                                plan_explosion(trap, player, room);
                                return true
                            }
                        }
                    })
                    //...des recompenses
                    rooms[room].model.rewards.some(function (rew, index) {
                        if (rew.position.x_ == pos.x && rew.position.y_ == pos.y) {
                            if (rew.triggered == null) {
                                rew.triggered = Date.now()
                                console.log("player : ", player.id, " walk on reward : ", rew)
                                isColliding = true
                                io.to(room).emit("reward-animation", rew.position)
                                rewardPlayer(rew, player, room)
                                return true
                            }
                        }
                    })
                    if (isColliding) {
                        return true
                    }
                })
                //check collisions avec murs
                let isCollidingWall = collision(newPosition, playerHalfSize).some(pos => rooms[room].model.map[pos.y][pos.x] == 1)
                if (!isCollidingWall) {
                    player.direction = dir
                    player.position = newPosition
                } else {
                    io.to(socket.id).emit('error-position')
                    console.log("----> [MOVE-PLAYER] : collision avec un mur.", newPosition)
                }

            } else {
                io.to(socket.id).emit('error-position')
                console.log("----> [MOVE-PLAYER] : erreur position, triche probable", Math.abs(newPosition.x - player.position.x), Math.abs(newPosition.y - player.position.y))
            }
        })
    });
});

/**
 * Return a room
 * @param {*} socket 
 */
function getRoomFromPlayerId(socket) {
    return Object.entries(rooms).reduce((roomName, [name, room]) => {
        if (room.users[socket.id] != null) roomName.push(name)
        console.log("SORTIE", roomName)
        return roomName
    }, [])
}

/**
 * Gestion du chronometre de la partie
 * @param {*} stop 
 * @param {*} room 
 */
function timer(stop, room) {
    let x = setInterval(function () {
        let now = new Date().getTime();

        let distance = stop - now;
        //Lorsque fini
        if (distance <= 0) {
            clearInterval(x);
            io.to(room).emit("countdown-over")
            delete rooms[room]
        }
    }, 1000);
}

/**
 * Met à jour le model tous les refreshRate ms
 * @param {*} mod 
 * @param {*} room 
 * @param {*} withmap 
 */

function updateModelsEveryRefreshRate(room) {
    let x = setInterval(function () {

        if (rooms[room] == undefined) {
            clearInterval(x)
        }
        else {
            console.log("[REFRESHING MODEL] room : ", room)
            let mod = rooms[room].model
            mod.players.forEach(pl => {
                let socketId = pl.id
                //mesure anti-triche, les explorer n'ont pas à avoir la lsite des pieges et traps mais seulement la liste d'entités
                if (pl.role == "explorer") {
                    let newModel = Object.assign({}, mod)
                    newModel.entities = newModel.rewards.concat(newModel.traps)
                    newModel.traps = []
                    newModel.rewards = []
                    io.to(socketId).emit('model-update', newModel);
                } else {
                    io.to(socketId).emit('model-update', mod);
                }
            })
        }
    }, refreshRate);
}

function removeEntityAssociatedtoPlayer(player, room) {
    rooms[room].model.traps = rooms[room].model.traps.filter(function (tr) {
        return tr.parentId !== player.id;
    });
    rooms[room].model.rewards = rooms[room].model.rewards.filter(function (rew) {
        return rew.parentId !== player.id;
    });
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

    return position(x + 0.5, y + 0.5)
}

/**
 * Vérfie qu'il n'y a que du sol à la position donnée
 * (cad : pas de pieges, pas recompenses, pas d'autres joueurs)
 * @param {*} x 
 * @param {*} y 
 */
function isAValidPosition(x, y, room) {
    if (rooms[room].model.map[y][x] == 0) {
        let trap = rooms[room].model.traps.filter(tr => tr.position == position(x, y))
        let rew = rooms[room].model.rewards.filter(rew => rew.position == position(x, y))
        let otherPlayers = rooms[room].model.players.filter(pl => pl.position == position(x, y))
        if (trap.length == 0 && rew.length == 0 && otherPlayers.length == 0) {
            return true
        }
    }
    return false
}

let model = () => Object({
    players: [],
    traps: [],
    rewards: [],
    entities: [],
    map: map(),
    roomLeader: null
})

const distance = (a, b) => Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)//distance entre deux points
const newId = () => Math.floor(Math.random() * 1000000000)//génère un id aléatoire
const position = (x, y) => Object({ x, y }) //creer un objet position
const player = (position, role, score = 0, inventory = [], name = null, id = null, isRoomLeader = false, direction = "down") => Object({ id, position, name, role, isRoomLeader, score, inventory, direction }) //champs player
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

const roles = {
    explorer: "explorer",
    trapper: "trapper"
}

/**
 * Provoque une explosion pour actualplayer qui devient trapper
 * récompense le joueur auteur du piege
 * change les roles de l'explorer à trapper et vice versa
 * supprime du model
 * @param {*} trap1 
 */
const plan_explosion = (trap1, actualPlayer, room) => setTimeout(() => {
    //MAJ le joueur qui a marché sur le piege
    let pl = rooms[room].model.players.find(p => p.id == actualPlayer.id)
    pl.role = roles.trapper
    pl.inventory = trapperInventory.slice() //l'ordre est important

    //MAJ le joueur auteur du piege
    let trapAuthor = getPlayerFromId(trap1.parentId, room)
    if (trap1.parentId == pl.id) { //si marche sur son propre piege -2 points
        trapAuthor.score = trapAuthor.score - 2
    } else {
        trapAuthor.score++
    }

    if (trapAuthor.role == roles.trapper) {
        trapAuthor.role = roles.explorer
        trapAuthor.inventory = []
        if (trapAuthor.position.x < 0) {
            trapAuthor.position = randomPosition(room) //on le repositionne à ses anciennes coordonées
        }
    }
    //Fait exploser mur à côté
    explodeTrapWallNeighboor(trap1.position, room)
    rooms[room].model.traps = rooms[room].model.traps.filter(Boolean).filter(tr => tr.position != trap1.position)
    //updateModels(rooms[room].model, room)
    io.to(room).emit("scores-update")

}, fuzeTime)

function explodeTrapWallNeighboor(trapPosition, room) {
    let neighboors = []
    let map = rooms[room].model.map
    let y = trapPosition.x_
    let x = trapPosition.y_
    //2 = mur detruit
    //3= trace d'explosion
    if (map[x + 1][y] == 1) {
        map[x + 1][y] = 2
    }
    if (map[x - 1][y] == 1) {
        map[x - 1][y] = 2
    }
    if (map[x][y + 1] == 1) {
        map[x][y + 1] = 2
    }
    if (map[x][y - 1] == 1) {
        map[x][y - 1] = 2
    }
    //indique qu'il faut une trace d'explosion
    map[x][y] = 3
}
/**
 * Recompense le joueur qui a recupéré la reward
 * supprime du model
 * @param {} rewardUsed 
 * @param {*} player 
 */
const rewardPlayer = (rewardUsed, player, room) => {
    let pl = rooms[room].model.players.find(p => p.id == player.id)

    if (rewardUsed.parentId != pl.id) { //si marche sur son propre piege -2 points
        pl.score++
    }

    rooms[room].model.rewards = rooms[room].model.rewards.filter(Boolean).filter(rew => rew.position != rewardUsed.position)
    console.log("player : ", pl.id, " score is : ", pl.score)
    //updateModels(rooms[room].model, room)
    io.to(room).emit("scores-update")
}

/**
 * Donne un tableau des collisions autour d'un rayon de size
 * @param {} pos 
 * @param {*} size 
 */
const collision = (pos, size) => {

    let a = [
        position(Math.floor(pos.x - size), Math.floor(pos.y - size)),// haut ET gauche
        position(Math.floor(pos.x - size), Math.floor(pos.y + size)),// haut droite
        position(Math.floor(pos.x + size), Math.floor(pos.y + size)),// bas droite
        position(Math.floor(pos.x + size), Math.floor(pos.y - size))// bas gauche
    ]
    console.log(a)
    return a
}

/**
 * Renvoi un joueur à partir d'un id
 * @param {*} id 
 */
const getPlayerFromId = (id, room) => rooms[room].model.players.filter(Boolean).filter(p => p.id == id)[0]
var express = require('express');
var app = express();
const noSniff = require('dont-sniff-mimetype')
app.use(noSniff())
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var generate = require("@indutny/maze")
const fs = require('fs');



app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }))

const mapSize = { width: 30, height: 20 }
const rooms = {}
const refreshRate = 25
const speed = 0.15
const trapperInventory = [0, 1, 0, 1, 0, 1, 0, 1]
const fuzeTime = 150 //temps de suspense
const playerHalfSize = 0.20 // taille joueur et piege, rayon à verifier
var songsContainer = { trap: [], reward: [], mainTrap: null, mainReward: null } //contient les tableau avec les noms des fichiers  mp3

/**
 * Rendu de la page dans le menu des salons
 */
app.get('/', (req, res) => {
    let publicRooms = {}
    for (let roomName in rooms) {
        if (rooms[roomName].isPublic == true) {
            publicRooms[roomName] = rooms[roomName]
        }
    }
    res.render('lobby', { rooms: publicRooms, roomName: "lobbyMenu" })
})

/**
 * Gestion de création de salon
 */
app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/')
    }
    //Salon public ou privé ?
    if (req.body.state == "on") {
        rooms[req.body.room] = { users: {}, model: model(), roomLeader: null, state: "lobby", refreshing: null, isPublic: false, timer: null }
        console.log("SERVEUR : nouveau salon PRIVE créé", req.body.room, req.body.state)
    } else {
        rooms[req.body.room] = { users: {}, model: model(), roomLeader: null, state: "lobby", refreshing: null, isPublic: true, timer: null }
        console.log("SERVEUR : nouveau salon PUBLIC créé", req.body.room, req.body.state)
        io.emit('new-room', req.body.room)
    }
    res.redirect(req.body.room)

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
    loadSongs()
    io.on('connection', function (socket) {

        /**
         * Enregistrement du nouvel utilisateur connecté
         */
        socket.on('new-user', (room, name) => {
            console.log("[NEW-USER] : nouveau joueur : ", name, " dans le salon : ", room)
            if (rooms[room] == undefined) {
                console.log(" ----> [NEW-USER] : salon inexistant... abandon.")
                io.to(socket.id).emit("redirectPlayer")

            } else if (rooms[room].state != "inGame") { //si dans le lobby
                socket.join(room)
                rooms[room].users[socket.id] = name
                if (Object.keys(rooms[room].users).length == 1) {
                    rooms[room].roomLeader = socket.id
                }
                io.to(socket.id).emit("songs-list-update", songsContainer) //renvoi le songsContainer
                updateLobby(room, name)
            } else {
                io.to(socket.id).emit("redirectPlayer")
            }
        });

        /**
         * MAJ du pseudo demandé par l'utilisateur
         */
        socket.on('set-name', function (room, newName) {
            console.log("SERVEUR : changement de nom dans le salon : ", room, "Ancien : ", rooms[room].users[socket.id], " Nouveau : ", newName)
            const noms = Object.values(rooms[room].users)
            let alreadyInUse = false
            if (noms.some(nom => nom == newName)) {
                alreadyInUse = true
            }

            if (alreadyInUse) {
                console.log(" ---> déja pris, abandon...")
            } else {
                rooms[room].users[socket.id] = newName

            }

            io.to(room).emit("lobby-changes-occured", rooms[room])
        })

        /**
         * Gestion de tous les cas possibles de deconnexion
         */
        socket.on('disconnect', function () {
            getRoomFromPlayerId(socket.id).forEach(room => {
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
                        clearInterval(rooms[room].timer);
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
                    console.log("[ START GAME ] : 1 seul joueur, annulation...", room)
                    io.in(room).emit('game-ready', "missingPlayers")
                } else {
                    rooms[room].state = "inGame"
                    let timeStop = new Date();
                    timeStop.setMinutes(timeStop.getMinutes() + parseInt(time));
                    timer(timeStop.getTime(), room)
                    io.in(room).emit('remove-room-from-lobby-menu', room)

                    //Ajoute les joueurs de rooms[room].users
                    let usersKeysArray = Object.keys(rooms[room].users)
                    usersKeysArray.forEach(userKey => {
                        let newPlayer
                        if (rooms[room].model.players.filter(pl => pl.role == "trapper").length == 0) {
                            newPlayer = player(randomPosition(room), roles.trapper, 0, trapperInventory.slice())
                        } else {
                            newPlayer = player(randomPosition(room), roles.explorer, 0, [])
                        }
                        newPlayer.id = userKey
                        newPlayer.name = rooms[room].users[userKey]
                        if (userKey == rooms[room].roomLeader) {
                            newPlayer.isRoomLeader = true
                        }
                        rooms[room].model.players.push(newPlayer)
                    })
                    updateModelsEveryRefreshRate(room)
                    io.in(room).emit('display-game', timeStop.getTime(), rooms[room].model)
                }
            }

        })

        /**
         * Vérfie si joueur entre en collision avec mur ou entités
         * Valide ou non le déplacement
         * les coordonnées sont déjà en version canva (pour rappel canva et array sont inversés)
         */
        socket.on('move-player', function (room, newPosition, dir) {
            movePlayer(room, newPosition, dir, socket.id)
        })

        /**
          * Place un piège et une recompense si emplacement valide (pas d'entités, pas les deux sur la même case etc...)
          */
        socket.on('place-trap-and-reward', function (room, data) {
            placeTrapsAndRewards(room, data.trap, data.reward, socket.id)
        });
    });
});


/**
 * Met à jour le lobby avec users
 * @param {*} room 
 */
function updateLobby(room, name) {
    io.in(room).emit("user-connected-in-lobby", name, rooms[room])
}

/**
 * Déplace le joueur à newposition si possible
 * @param {nom de salon} room 
 * @param {objet {x,y}} newPosition 
 * @param {up,down,left,right format String} dir 
 * @param {string} id 
 */
function movePlayer(room, newPosition, dir, id) {
    let player = rooms[room].model.players.find(pl => pl.id == id)
    if (newPosition.x > mapSize.width || newPosition.y > mapSize.height || newPosition.x < 0 || newPosition.y < 0) {
        console.log("[MOVE-PLAYER] : position en dehors du plateau.", room, player.id)
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
                        isColliding = true
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
        let isCollidingWall = collision(newPosition, playerHalfSize).some(pos => {
            return rooms[room].model.map[pos.y][pos.x] == 1 || rooms[room].model.map[pos.y][pos.x] == -1
        })
        if (!isCollidingWall) {
            player.direction = dir
            player.position = newPosition
        } else {
            io.to(id).emit('error-position')
        }
    } else {
        io.to(id).emit('error-position')
        console.log("----> [MOVE-PLAYER] : erreur position, triche probable", Math.abs(newPosition.x - player.position.x), Math.abs(newPosition.y - player.position.y))
    }
}

/**
 * Place des peiges et recompenses si endroit disponible
 * @param {nom de salon} room 
 * @param {coord du piege {x,y}} trapPosition 
 * @param {coord de la recompense {x,y}} rewardPosition 
 * @param {string} id 
 */
function placeTrapsAndRewards(room, trapPosition, rewardPosition, id) {
    let player = rooms[room].model.players.find(pl => pl.id == id)

    let trap_instance = trap(player.id, trapPosition) //creer un piege avec les données recu et ce qu'on a deja
    let reward_instance = reward(player.id, rewardPosition)
    if (player.inventory.length != 0) {
        if (trap_instance.position.x_ == reward_instance.position.x_ && trap_instance.position.y_ == reward_instance.position.y_) {
        } else if (isAValidPosition(trap_instance.position.x_, trap_instance.position.y_, room) && isAValidPosition(reward_instance.position.x_, reward_instance.position.y_, room)) {//si placement possible
            rooms[room].model.traps.push(trap_instance)
            rooms[room].model.rewards.push(reward_instance)
            player.inventory.pop()
            player.inventory.pop()
            console.log(rooms[room].model.traps)
        } else {
            console.log("trap et reward placés NON valides", room)
        }
    }
}

/**
 * Charge les bruitages dans le serveur afin de les envoyer plus tard
 */
function loadSongs() {
    var dirTrap = './public/sound/trap-fx/';
    fs.readdir(dirTrap, (err, files) => {
        files.forEach(file => {
            songsContainer.trap.push(file)
        });
    });
    var dirReward = './public/sound/reward-fx/';
    fs.readdir(dirReward, (err, files) => {
        files.forEach(file => {
            songsContainer.reward.push(file)
        });
    });
    songsContainer.trapMain = "trap_main.mp3"
    songsContainer.rewardMain = "reward_main.mp3"
}

/**
 * Return a room
 * @param {*} id 
 */
function getRoomFromPlayerId(id) {
    return Object.entries(rooms).reduce((roomName, [name, room]) => {
        if (room.users[id] != null) roomName.push(name)
        console.log("SORTIE", roomName)
        return roomName
    }, [])
}

/**
 * Gestion du chronometre de la partie
 * @param {date} stop 
 * @param {date} room 
 */
function timer(stop, room) {
    rooms[room].timer = setInterval(function () {
        let now = new Date().getTime();

        let distance = stop - now;
        //Lorsque fini
        if (distance <= 0) {
            clearInterval(rooms[room].timer);
            io.to(room).emit("countdown-over")
            delete rooms[room]
        }
    }, 1000);
}

/**
 * Met à jour le model tous les refreshRate ms
 * @param {Object model} mod 
 * @param {string} room 
 * @param {Boolean} withmap 
 */

function updateModelsEveryRefreshRate(room) {
    let x = setInterval(function () {

        if (rooms[room] == undefined) {
            clearInterval(x)
        }
        else {
            // console.log("[REFRESHING MODEL] room : ", room)
            let mod = rooms[room].model
            mod.players.forEach(pl => {
                let socketId = pl.id
                //mesure anti-triche, les explorer n'ont pas à avoir la lsite des pieges et traps mais seulement la liste d'entités
                if (pl.role == "explorer") {
                    let newModel = Object.assign({}, mod)
                    newModel.entities = newModel.rewards.concat(newModel.traps)
                    newModel.traps = []
                    newModel.rewards = []
                    io.to(socketId).emit('model-update', newModel, speed, refreshRate);

                } else {
                    let newModel = Object.assign({}, mod)
                    newModel.entities = newModel.rewards.concat(newModel.traps)
                    io.to(socketId).emit('model-update', newModel, speed, refreshRate);

                }
            })
        }
    }, refreshRate);
}

/**
 * Supprimes toutes les entités (pieges/recompenses) associés au joueur
 * @param {Object} player 
 * @param {string} room 
 */
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
 * @param {string} room 
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
 * Inverse les coordonnées pour vérfier dans la map, les coord passées sont celles du canvas
 * @param {float} x 
 * @param {float} y 
 */
function isAValidPosition(x, y, room) {
    if (y > mapSize.width || x > mapSize.height || y < 0 || x < 0) {
        return false
    } else if (rooms[room].model.map[y][x] != 1 && rooms[room].model.map[y][x] != -1) { //si sur du sol
        rooms[room].model.players.some(pl => {
            if (Math.floor(pl.position.x) == x && Math.floor(pl.position.y) == y) {
                return false
            }
        })
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

const newId = () => Math.floor(Math.random() * 1000000000)//génère un id aléatoire
const position = (x, y) => Object({ x, y }) //creer un objet position
const player = (position, role, score = 0, inventory = [], name = null, id = null, isRoomLeader = false, direction = "down") => Object({ id, position, name, role, isRoomLeader, score, inventory, direction }) //champs player
const trap = (parentId, position, triggered = null, id = newId()) => Object({ parentId, position, triggered }) //champs de trap
const reward = (parentId, position, score = 1, triggered = null) => Object({ parentId, position, score, triggered }) //champ reward
const map = () => {
    console.log("[ GENERATING MAP ]")
    //cette librairie est pratique mais bug, il faut donc checker les bords qui parfois ne sont pas rendus
    let maze = generate({ width: 29, height: 19, empty: '0', wall: '1' });
    while (!bordersPresents(maze)) {
        maze = generate({ width: 29, height: 19, empty: '0', wall: '1' });
        console.log(" ---> [ GENERATING MAP ] failed... retrying !")
    }
    console.log(" ---> [ GENERATING MAP ] succes !")
    return maze
}

/**
 * Vérfie qu'il y a bien des mur tout autour de la map pour éviter la sortie de joueur
 * @param {Array2D} maze 
 */
function bordersPresents(maze) {

    let xLength = maze[0].length
    let yLength = maze.length
    console.log(" ----------------> debut bordersPresents")

    for (let i = 0; i < xLength - 1; i++) {
        if (maze[0][i] == 0 || maze[yLength - 1][i] == 0) {
            console.log(" ----------------> failed")
            return false
        } else {
            maze[0][i] = -1
            maze[yLength - 1][i] = -1
        }
    }
    for (let i = 1; i < yLength - 1; i++) {
        if (maze[i][0] == 0 || maze[i][xLength - 1] == 0) {
            console.log(" ----------------> failed")
            return false
        } else {
            maze[i][0] = -1
            maze[i][xLength - 1] = -1
        }
    }
    console.log(" ----------------> success")
    return true
}

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
        console.log(" ----> -2 au joueur ", actualPlayer.name, " car active son propre piège")
        io.to(actualPlayer.id).emit("play-(-2)-animation", trap1.position)
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

    io.to(room).emit("play-sound", "trapMain", songsContainer.trapMain)
    setTimeout(function () {
        let index = Math.floor(Math.random() * (songsContainer.trap.length))
        console.log("index : ", index, " sur ", songsContainer.trap.length)
        io.to(actualPlayer.id).emit("play-sound", "trap", index)
    }, fuzeTime * 3);


}, fuzeTime)

/**
 * Détruit les murs présents  sur les côtés gauche, droit, haut, bas d'un piege
 * @param {{x,y}} trapPosition 
 * @param {string} room 
 */
function explodeTrapWallNeighboor(trapPosition, room,) {
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
 * @param {{parentId,x_,y_}} rewardUsed 
 * @param {*} player 
 */
const rewardPlayer = (rewardUsed, player, room) => {
    let pl = rooms[room].model.players.find(p => p.id == player.id)

    rooms[room].model.rewards = rooms[room].model.rewards.filter(Boolean).filter(rew => rew.position != rewardUsed.position)
    console.log("player : ", pl.id, " score is : ", pl.score)
    io.to(room).emit("scores-update")

    if (rewardUsed.parentId == pl.id) { //si marche sur sa propre récompense -1
        pl.score = pl.score - 1
        io.to(player.id).emit("play-sound", "trapMain", songsContainer.trapReward)

        io.to(room).emit("scores-update")
        io.to(player.id).emit("play-(-1)-animation", rewardUsed.position)


        setTimeout(function () {
            let index = Math.floor(Math.random() * (songsContainer.trap.length))
            io.to(pl.id).emit("play-sound", "trap", index)
        }, fuzeTime * 3);

    } else { //pas sa recompense
        pl.score++
        io.to(player.id).emit("play-sound", "rewardMain", songsContainer.trapReward)
        io.to(player.id).emit("reward-animation", rewardUsed.position)
        io.to(room).emit("scores-update")

        setTimeout(function () {
            let index = Math.floor(Math.random() * (songsContainer.trap.length))
            io.to(pl.id).emit("play-sound", "reward", index)
        }, fuzeTime * 3);

    }
}

/**
 * Donne un tableau des collisions autour d'un rayon de size
 * @param {{x,y}} pos 
 * @param {float} size 
 */
const collision = (pos, size) => {

    let a = [
        position(Math.floor(pos.x - size), Math.floor(pos.y - size)),// haut ET gauche
        position(Math.floor(pos.x - size), Math.floor(pos.y + size)),// haut droite
        position(Math.floor(pos.x + size), Math.floor(pos.y + size)),// bas droite
        position(Math.floor(pos.x + size), Math.floor(pos.y - size))// bas gauche
    ]
    return a
}

/**
 * Renvoi un joueur à partir d'un id
 * @param {string} id 
 */
const getPlayerFromId = (id, room) => rooms[room].model.players.filter(Boolean).filter(p => p.id == id)[0]
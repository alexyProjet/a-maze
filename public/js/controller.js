let controller = null;
var gameStarted = false;
var refreshRate = 25
$(() => {

    var name = "invité"
    var self = this;
    self.socket = io();

    controller = (() => {
        let room = {}
        let myId = null
        let gameTimeout = null
        let gameInterval = null
        let model = { //init model
            players: [],
            traps: [],
            entities: [],
            rewards: [],
            map: [[]],
            currentPlayer: '',
            roomLeader: null
        }

        let vue = null;//creer l'ui
        let idtemp = Math.floor(Math.random() * 1000);
        name = name + idtemp
        vue = new Vue();
        self.socket.on('connect', function () {
            socket.emit('new-user', roomName, name);
        });

        /**
        * ---------------------- Gestion du salon ----------------------------------
        */
        //Nouvel utilisateur dans le salon
        self.socket.on('user-connected-in-lobby', function (name, roomReceived) {
            myId = socket.id
            if (Object.keys(room).length == 0) {  //premiere connexion de l'utilisateur, room est vide
                room = roomReceived
                vue.renderLeftLobbyPannel()
                vue.renderRightLobbyPannel()
            } else {
                room = roomReceived
            }

            room = roomReceived
            vue.renderMiddleLobbyPannel()
            console.log("Nouvelle utilisateur : ", name, "dans : ", roomReceived)
        })

        self.socket.on('scores-update', function () {
            vue.renderScoreList()
        })

        //Utilisateur se deconnecte
        self.socket.on('user-disconnected-lobby', function (name, roomReceived) {
            console.log(name, "disconnected")
            room = roomReceived
            vue.renderMiddleLobbyPannel()
        })

        //Changement dans le lobby
        self.socket.on('lobby-changes-occured', function (roomReceived) {
            console.log("changes occured")
            room = roomReceived
            vue.renderMiddleAndRightLobbyPannel()
        })

        /**
        * ---------------------- Gestion d'une partie ----------------------------------
        */
        self.socket.on('model-update', function (data) {
            Object.assign(model, JSON.parse(data))
            model.currentPlayer = model.players.find(pl => pl.id == self.socket.id)
            console.log("CONTROLLER ON : UpdateModel recu", model.players)
        })

        /**
         * plus qu'un seul joueur en jeu/salon -> destruction du salon + redirection
         */
        this.socket.on('exit-one-player-left', room => {
            alert("Plus de joueur dans le jeu, vous avez été déconnecté.");
            window.location.replace("/");
        })

        /**
         * Animation de piège
         */
        self.socket.on('trap-animation', function (position) {
            vue.trapAnimation(position)
        })

        /**
         * Signale que le jeu est prêt
         */
        self.socket.on('game-ready', function (info, time) {
            if (info == "missingPlayers") {
                console.log("CONTROLLER : partie tout seul impossible ")
            } else {
                console.log("CONTROLLER : game-ready tout est bon ")
                self.socket.emit("init-player", roomName, time)
            }
        })

        /**
         * Signale que le jeu est prêt
         */
        self.socket.on('error-position', function () {
            myPlayerPosition = Object.assign({}, controller.getCurrentPlayer().position)
        })
        /**
         * Signale qu'il faut affiche le jeu
         */
        self.socket.on('display-game', function (timeStop) {
            console.log("CONTROLLER: display-game ")
            gameStarted = true
            vue.initGame()
            vue.launchCountdown(timeStop)
            vue.renderScoreList()

            //attend un peu puis lance le set interval pour être sur que tout pret
            initListener()

            //renderPlayerTimeOut = setTimeout(renderPlayerTimeInterval = setInterval(() => vue.player(false, myPlayerPosition), refreshRate), 200) //render userPlayer avec la var global de position
            //document.getElementById('startGameButton').parentNode.removeChild(document.getElementById('startGameButton'));
            // document.getElementById('nameContainer').parentNode.removeChild(document.getElementById('nameContainer'));    
            console.log("fin displaygame.... launching vue.renderGame()...")
            gameTimeout = setTimeout(gameInterval = setInterval(() => vue.renderGame(myPlayerPosition), refreshRate), 200)
        })

        //Fin du chronometre
        self.socket.on('countdown-over', function () {
            clearTimeout(gameTimeout)
            clearInterval(gameInterval)
            vue.renderEndGame()
        })

        self.socket.on('shake-game', function () {
            vue.shake()
        })


        //Signale au serveur que le bouton start est cliqué
        const startButtonClicked = () => {
            let time = document.getElementById("inputBoxTime").value
            if (time != 0 && time <= 60) { //a enlever
                self.socket.emit("start-game", roomName, time)
            } else {
                alert("Le nombre de minutes ne peut être > 60 et = 0")
            }
        }

        const moveTo = (position, actualPlayer) => self.socket.emit("move-player", roomName, { position: position, player: actualPlayer }) //send la position
        const place = (trapPosition, rewardPosition, actualplayer) => self.socket.emit("place-trap-and-reward", roomName, JSON.stringify({ trap: trapPosition, reward: rewardPosition, player: actualplayer }))
        const getModel = () => model //renvoi le model
        const setName = (name) => self.socket.emit("set-name", roomName, name)
        const getRoomUsers = () => Object.assign({}, room.users) //renvoi le les users de la room
        const getRoomLeader = () => room.roomLeader //renvoi le les users de la room
        const getId = () => myId
        const getName = () => room.users[getId()]
        const getCurrentPlayer = () => Object.assign({}, model.currentPlayer) //renvoi le current player
        return { moveTo, place, getModel, getCurrentPlayer, startButtonClicked, setName, getRoomUsers, getRoomLeader, getId, getName } //
    })()

    var zKey = false;
    var sKey = false
    var qKey = false
    var dKey = false
    var speed = 0.11
    var myPlayerPosition = null
    var oldX = -1
    var oldY = -1
    var interval = null
    var renderPlayerTimeOut = null

    function initListener() {
        console.log("initializing listener....")
        myPlayerPosition = Object.assign({}, controller.getCurrentPlayer().position)
        oldY = myPlayerPosition.y
        oldX = myPlayerPosition.x
        checkNeighboors()
        setInterval(routine, refreshRate)
        console.log("listener initialised", oldX, oldY, myPlayerPosition)
    }

    var isWallPresent = { up: false, down: false, right: false, left: false }

    function checkNeighboors() {
        console.log("check collision")
        let x = Math.floor(myPlayerPosition.y)
        let y = Math.floor(myPlayerPosition.x)
        isWallPresent.up = false
        isWallPresent.down = false
        isWallPresent.right = false
        isWallPresent.left = false
        if (controller.getModel().map[x - 1][y] == 1) { //haut
            isWallPresent.up = true

        }
        if (controller.getModel().map[x + 1][y] == 1) { //bas
            isWallPresent.down = true

        }
        if (controller.getModel().map[x][y + 1] == 1) { //droite
            isWallPresent.right = true

        }
        if (controller.getModel().map[x][y - 1] == 1) { //gauche
            isWallPresent.left = true

        }
        console.log("COLLISION DOWN", isWallPresent.down)
        console.log("COLLISION LEFT", isWallPresent.left)
        console.log("COLLISION RIGHT", isWallPresent.right)
        console.log("COLLISION UP", isWallPresent.up)
    }

    function routine() {
        if (gameStarted) {
            if (zKey) {
                let newY = myPlayerPosition.y - speed
                if(qKey || dKey)  myPlayerPosition.y - speed/2.0
                let newX = myPlayerPosition.x
                if (Math.floor(oldY) == Math.floor(newY) && Math.floor(oldX) == Math.floor(newX)) { //si sur meme case
                    oldY = myPlayerPosition.y
                    oldX = myPlayerPosition.x
                    myPlayerPosition.y = newY //c'est Okay on avance
                } else if (!isWallPresent.up) { //Si pas mur
                    oldY = newY
                    oldX = newX
                    myPlayerPosition.y = newY
                    controller.moveTo(myPlayerPosition, controller.getCurrentPlayer()) //signale au controller le deplacement*/
                    checkNeighboors()
                } 
            } else if (sKey) {
                let newY = myPlayerPosition.y + speed
                if(qKey || dKey)  myPlayerPosition.y + speed/2.0
                let newX = myPlayerPosition.x
                if (Math.floor(oldY) == Math.floor(newY) && Math.floor(oldX) == Math.floor(newX)) { //si sur meme case
                    oldY = myPlayerPosition.y
                    oldX = myPlayerPosition.x
                    myPlayerPosition.y = newY //c'est Okay on avance
                } else if (!isWallPresent.down) { //Si veut avancer sur una case pas murée
                    oldY = newY
                    oldX = newX
                    myPlayerPosition.y = newY
                    controller.moveTo(myPlayerPosition, controller.getCurrentPlayer()) //signale au controller le deplacement*/
                    checkNeighboors()
                }
            }
            if (qKey) {
                let newY = myPlayerPosition.y
                let newX = myPlayerPosition.x - speed
                if(zKey || sKey)  newX = myPlayerPosition.x - speed/2.0
                if (Math.floor(oldY) == Math.floor(newY) && Math.floor(oldX) == Math.floor(newX)) { //si sur meme case
                    oldY = myPlayerPosition.y
                    oldX = myPlayerPosition.x
                    myPlayerPosition.x = newX //c'est Okay on avance
                } else if (!isWallPresent.left) { //Si veut avancer sur una case pas murée
                    oldY = newY
                    oldX = newX
                    myPlayerPosition.x = newX
                    controller.moveTo(myPlayerPosition, controller.getCurrentPlayer()) //signale au controller le deplacement*/
                    checkNeighboors()
                }
            } else if (dKey) {
                let newY = myPlayerPosition.y
                let newX = myPlayerPosition.x + speed
                if(zKey || sKey)  newX = myPlayerPosition.x + speed/2.0
                if (Math.floor(oldY) == Math.floor(newY) && Math.floor(oldX) == Math.floor(newX)) { //si sur meme case
                    oldY = myPlayerPosition.y
                    oldX = myPlayerPosition.x
                    myPlayerPosition.x = newX //c'est Okay on avance
                } else if (!isWallPresent.right) { //Si veut avancer sur una case pas murée
                    oldY = newY
                    oldX = newX
                    myPlayerPosition.x = newX
                    controller.moveTo(myPlayerPosition, controller.getCurrentPlayer()) //signale au controller le deplacement*/
                    checkNeighboors()
                }
            }
        }
    }

    document.body.onkeypress = function (event) {
        switch (event.key.toLowerCase()) {
            case 'z':
                zKey = true;
                break;
            case 's':
                sKey = true;
                break;
            case 'q':
                qKey = true;

                break;
            case 'd':
                dKey = true;
                break;
            default:
                break;
        }

    };

    document.body.onkeyup = function (event) {
        switch (event.key.toLowerCase()) {
            case 'z':
                zKey = false;
                break;
            case 's':
                sKey = false;
                break;
            case 'q':
                qKey = false;
                break;
            case 'd':
                dKey = false;
                break;
            default:
                break;
        }
    };

})
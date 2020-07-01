let controller = null;
var gameStarted = false;

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
            } else {
                room = roomReceived
            }

            room = roomReceived
            vue.renderMiddleAndRightLobbyPannel()
            console.log("Nouvelle utilisateur : ", name, "dans : ", roomReceived)
        })

        //Utilisateur se deconnecte
        self.socket.on('user-disconnected-lobby', function (name, roomReceived) {
            console.log(name, "disconnected")
            room = roomReceived
            vue.renderMiddleAndRightLobbyPannel()
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

        self.socket.on('trap-animation', function (position) {
            console.log("activation de animation trap")
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
         * Signale qu'il faut affiche le jeu
         */
        self.socket.on('display-game', function (timeStop) {
            console.log("CONTROLLER: display-game ")
            gameStarted = true
            vue.initGame()
            vue.launchCountdown(timeStop)
            //attend un peu puis lance le set interval pour être sur que tout pret
            gameTimeout = setTimeout(gameInterval = setInterval(() => vue.renderGame(myId), 66), 200)
            document.getElementById('startGameButton').parentNode.removeChild(document.getElementById('startGameButton'));
            document.getElementById('nameContainer').parentNode.removeChild(document.getElementById('nameContainer'));
        })

        //Fin du chronometre
        self.socket.on('countdown-over', function () {
            clearTimeout(gameTimeout)
            clearInterval(gameInterval)
            vue.renderEndGame()
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

        const moveTo = (position, actualPlayer) => self.socket.emit("move-player", roomName, JSON.stringify({ position: position, player: actualPlayer })) //send la position
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
})
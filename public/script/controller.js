let controller = null;
var gameStarted = false;

$(() => {

    var name = "invité"
    var self = this;
    self.socket = io();
    const roomContainer = document.getElementById('room-container')
    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    this.socket.on('newRoom', room => {
        console.log("createroom recu", room)
        const roomElement = document.createElement('li')
        roomElement.innerText = room
        const roomLink = document.createElement('a')

        roomLink.href = `/${room}`
        roomLink.innerText = 'join'

        var div = document.createElement("div");
        div.setAttribute("id", room);

        div.append(roomLink)
        div.append(roomElement)
        roomContainer.append(div)
    })

    this.socket.on('exit', room => {
        alert("Plus de joueur dans le jeu, vous avez été déconnecté");
        window.location.replace("/");
    })

    this.socket.on('already-in-game', () => {
        window.location.replace("/");
    })

    this.socket.on('update-lobbyMenu', (room) => {
        console.log("delete room from menu", room)
        document.getElementById(room).parentNode.removeChild(document.getElementById(room));
    })


    controller = (() => {
        let room = {}
        let myId = null
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

        //un nouvel utilisateur est connecté
        self.socket.on('user-connected', function (name, roomReceived) {
            myId = socket.id
            room = roomReceived
            vue.renderLobby()
            console.log("CONTROLLER ON : utilisateur connecte : ", name)
        })

        //un nouvel utilisateur est connecté
        self.socket.on('user-disconnected-lobby', function (name, roomReceived) {
            console.log(name,"disconnected")
            room = roomReceived
            vue.renderLobby()
        })

        self.socket.on('lobby-changes-occured', function (roomReceived) {
            console.log("changes occured")
            room = roomReceived
            vue.renderLobby()
        })


        /**
         * MAJ du model
         */
        self.socket.on('modelUpdate', function (data) {
            Object.assign(model, JSON.parse(data))
            model.currentPlayer = model.players.find(pl => pl.id == self.socket.id)
            console.log("CONTROLLER ON : UpdateModel recu", model.players)
        })

        //si on est dans le lobby
        if (roomType == "lobby") {
            vue = new Vue();
            console.log("dans le controller")
            self.socket.on('connect', function () {
                console.log("controller envoi")
                socket.emit('new-user', roomName, name);
                console.log("CONTROLLER EMIT : new-user", roomName, name)
            });
        }

        //signale au serveur que le bouton start est cliqué
        const startButtonClicked = () => {
            let time = document.getElementById("inputBoxTime").value
            if(time != 0 && time <= 60){
                self.socket.emit("START", roomName,time)
            }

        }



        /**
         * signale que le jeu est prêt
         */
        self.socket.on('gameReady', function (info) {
            if (info == "missingPlayers") {
                console.log("CONTROLLER ON : partie tout seul impossible ")
            } else {
                console.log("CONTROLLER ON : gameReady tout est bon ")
                self.socket.emit("INIT", roomName)
            }

        })

        /**
         * signale qu'il faut affiche le jeu
         */
        self.socket.on('displayGame', function () {
            console.log("CONTROLLER ON : displayGame ")
            gameStarted = true
            console.log("CONTROLLER ON : loading game itnerface....", model)
            vue.initGame()
            setTimeout(setInterval(() => vue.renderGame(), 66), 200)
            document.getElementById('startGameButton').parentNode.removeChild(document.getElementById('startGameButton'));
            document.getElementById('nameContainer').parentNode.removeChild(document.getElementById('nameContainer'));
        })

        const moveTo = (position, actualPlayer) => self.socket.emit("MOVE", roomName, JSON.stringify({ position: position, player: actualPlayer })) //send la position
        const place = (trapPosition, rewardPosition, actualplayer) => self.socket.emit("PLACE", roomName, JSON.stringify({ trap: trapPosition, reward: rewardPosition, player: actualplayer }))
        const getModel = () => model //renvoi le model
        const setName = (name) => {
            console.log("controller : changement de nom")
            self.socket.emit("setName", roomName, name)
        }
        const getRoomUsers = () => Object.assign({}, room.users) //renvoi le les users de la room
        const getRoomLeader = () => room.roomLeader //renvoi le les users de la room
        const getId = () => myId
        const getName = () => room.users[getId()]
        const getCurrentPlayer = () => Object.assign({}, model.currentPlayer) //renvoi le current player
        //attend un peu puis lance le set interval pour être sur que tout pret
        return { moveTo, place, getModel, getCurrentPlayer, startButtonClicked, setName, getRoomUsers, getRoomLeader, getId,getName } //
    })()
})
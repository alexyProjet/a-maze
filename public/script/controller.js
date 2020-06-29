let controller = null;
var self = this;
self.socket = io();
var gameStarted = false;
var name = "invité"

$(() => {
    const roomContainer = document.getElementById('room-container')

    this.socket.on('newRoom', room => {
        console.log("createroom recu",room)
        const roomElement = document.createElement('li')
        roomElement.innerText = room
        const roomLink = document.createElement('a')
        roomLink.href = `/${room}`
        roomLink.innerText = 'join'
        roomContainer.append(roomElement)
        roomContainer.append(roomLink)
    })
    
    
    controller = (() => {

        let model = { //init model
            players: [],
            traps: [],
            rewards: [],
            map: [[]],
            currentPlayer: ''
        }

        let ui = new UI()//creer l'ui
        let idtemp = Math.floor(Math.random()*1000);
        name = name + idtemp

        self.socket.on('user-connected', function (name) {
            console.log("CONTROLLER ON : utilisateur connecte : ",name)
        })

        self.socket.on('modelUpdate', function (data) {
            Object.assign(model, JSON.parse(data))
            model.actualPlayer = model.players.find(pl => pl.socketID == self.socket.id)
            console.log("CONTROLLER ON : UpdateModel recu")
        })

        self.socket.on('gameStarting', function (data) {
            ui.loadGameInterface()
            setTimeout(setInterval(() => ui.vue.renderGame(), 66), 200) 
            console.log("CONTROLLER ON : game starting")
        })
        
        //si on est dans le lobby
        if(roomType == "lobby"){
            ui.loadLobbyInterface()
            socket.on('connect', function() {
                socket.emit('new-user', roomName, name);
                console.log("CONTROLLER EMIT : room", roomName)
             });
        }
        
        const startButtonClicked =() => {
            console.log("controller : button start clicked")
            gameStarted = true
            self.socket.emit("START",roomName)
        }

        const moveTo = (position, actualPlayer) => self.socket.emit("MOVE",roomName,JSON.stringify({ position: position, player: actualPlayer,roomName: room })) //send la position

        const place = (trapPosition, rewardPosition, actualplayer) => self.socket.emit("PLACE",roomName,JSON.stringify({ trap: trapPosition, reward: rewardPosition, player: actualplayer}))

        const getModel = () => model //renvoi le model
        const getCurrentPlayer = () => model.actualPlayer //renvoi le current player
        //attend un peu puis lance le set interval pour être sur que tout pret
        return { moveTo, place, getModel, getCurrentPlayer,startButtonClicked} //
    })()
})
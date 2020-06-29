let controller = null;

$(() => {
    var gameStarted = false;
    var name = "invité"
    var self = this;
    self.socket = io();
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

    this.socket.on('already-in-game', () => {
        window.location.replace("/");
    })
    
    
    controller = (() => {

        let model = { //init model
            players: [],
            traps: [],
            rewards: [],
            map: [[]],
            currentPlayer: '',
            roomLeader: null
        }

        let ui = null;//creer l'ui
        
        let idtemp = Math.floor(Math.random()*1000);
        name = name + idtemp

        //un nouvel utilisateur est connecté
        self.socket.on('user-connected', function (name) {
            console.log("CONTROLLER ON : utilisateur connecte : ",name)
        })

        /**
         * MAJ du model
         */
        self.socket.on('modelUpdate', function (data) {
            Object.assign(model, JSON.parse(data))
            model.currentPlayer = model.players.find(pl => pl.socketID == self.socket.id)
            console.log("CONTROLLER ON : UpdateModel recu",model,self.socket.id)
        })

        //si on est dans le lobby
        if(roomType == "lobby"){
            ui = new UI();
            ui.loadLobbyInterface()
            console.log("dans le controller")
            self.socket.on('connect', function() {
                console.log("controller envoi")
                socket.emit('new-user', roomName, name);
                console.log("CONTROLLER EMIT : new-user", roomName, name)
             });
        }

        //signale au serveur que le bouton start est cliqué
        const startButtonClicked =() => {
            console.log("controller : button start clicked")
            self.socket.emit("START",roomName)
        }

        /**
         * signale que le jeu est prêt
         */
        self.socket.on('gameReady', function () {
            console.log("CONTROLLER ON : gameReady ")
            self.socket.emit("INIT",roomName)
        })

        /**
         * signale qu'il faut affiche le jeu
         */
        self.socket.on('displayGame', function () {
            console.log("CONTROLLER ON : displayGame ")
            gameStarted = true
            console.log("CONTROLLER ON : loading game itnerface....")
            ui.loadGameInterface()
            setTimeout(setInterval(() => ui.vue.renderGame(), 66), 200)
            document.getElementById('startGameButton').style.display = 'none';
        })
        
        const moveTo = (position, actualPlayer) => self.socket.emit("MOVE",roomName,JSON.stringify({ position: position, player: actualPlayer})) //send la position
        const place = (trapPosition, rewardPosition, actualplayer) => self.socket.emit("PLACE",roomName,JSON.stringify({ trap: trapPosition, reward: rewardPosition, player: actualplayer}))
        const getModel = () => model //renvoi le model
        const getCurrentPlayer = () => Object.assign({},model.currentPlayer) //renvoi le current player
        //attend un peu puis lance le set interval pour être sur que tout pret
        return { moveTo, place, getModel, getCurrentPlayer,startButtonClicked} //
    })()
})
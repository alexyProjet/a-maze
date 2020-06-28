let controller = null;
var self = this;
const roomContainer = document.getElementById('room-container')
//pour être sur dom chargé
$(() => {
    controller = (() => {

        let model = { //init model
            players: [],
            traps: [],
            rewards: [],
            map: [[]],
            currentPlayer: ''
        }
        let ui = new UI()//creer l'ui
        //ui.createGame()

        self.socket = io();

        //quand socket deconnecté, enleve de la liste
        self.socket.on('disconnect', function (playerId) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        })

        self.socket.on('modelUpdate', function (data) {
            Object.assign(model, JSON.parse(data))
            model.actualPlayer = model.players.find(pl => pl.socketID == self.socket.id)
            console.log("UpdateModel recu",model)
        })

        self.socket.on('newRoom', room => {
            const roomElement = document.createElement('div')
            roomElement.innerText = room
            const roomLink = document.createElement('a')
            roomLink.href = `/${room}`
            roomLink.innerText = 'join'
            roomContainer.append(roomLink)
            console.log("nouvelle room creee",room)
        })


        const moveTo = (position, actualPlayer) => self.socket.emit("MOVE",JSON.stringify({ position: position, player: actualPlayer })) //send la position

        const place = (trapPosition, rewardPosition, actualplayer) => self.socket.emit("PLACE",JSON.stringify({ trap: trapPosition, reward: rewardPosition, player: actualplayer }))

        const getModel = () => model //renvoi le model
        const getCurrentPlayer = () => model.actualPlayer //renvoi le current player
        setTimeout(setInterval(() => ui.vue.render(), 66), 200) //attend un peu puis lance le set interval pour être sur que tout pret
        return { moveTo, place, getModel, getCurrentPlayer } //
    })()
})
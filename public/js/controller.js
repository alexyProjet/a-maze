let controller = null;
var gameStarted = false;
var soundActived = true;

$(() => {

    var name = "invité"
    var self = this;
    self.socket = io();
    var trapsRewardsToAnimate = { trap: null, reward: null }
    var songsLists = { trap: [], reward: [], mainTrap: null, mainReward: null } //contient les tableau avec les noms des fichiers  mp3

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
        //Met à jour la liste des sons
        self.socket.on('songs-list-update', function (songsContainer) {
            songsContainer.trap.forEach(song => {
                let sound = new Howl({
                    src: ['../sound/trap-fx/' + song],
                    autoplay: false,
                    loop: false,
                    volume: 0.5,
                });
                songsLists.trap.push(sound)
            })

            songsContainer.reward.forEach(song => {
                let sound = new Howl({
                    src: ['../sound/reward-fx/' + song],
                    autoplay: false,
                    loop: false,
                    volume: 0.5,
                });
                songsLists.reward.push(sound)
            })

            let sound = new Howl({
                src: ['../sound/mains/' + songsContainer.rewardMain],
                autoplay: false,
                loop: false,
                volume: 0.5,
            });
            songsLists.rewardMain = sound

            sound = new Howl({
                src: ['../sound/mains/' + songsContainer.trapMain],
                autoplay: false,
                loop: false,
                volume: 0.5,
            });
            songsLists.trapMain = sound
        })

        //Nouvel utilisateur dans le salon
        self.socket.on('user-connected-in-lobby', function (name, roomReceived) {
            if (Object.keys(room).length == 0) {  //premiere connexion de l'utilisateur, room est vide
                myId = socket.id
                room = roomReceived
                vue.renderLeftLobbyPannel()
                vue.renderRightLobbyPannel()
                vue.lobbyMusic()
            } else {
                room = roomReceived
            }

            room = roomReceived
            vue.renderMiddleLobbyPannel()
            vue.renderRightLobbyPannel()
            console.log("[IO] Nouvelle utilisateur : ", name, "dans : ", roomReceived)
        })


        //Utilisateur se deconnecte
        self.socket.on('user-disconnected-lobby', function (name, roomReceived) {
            console.log("[IO] ", name, "s'est deconnecté")
            room = roomReceived
            vue.renderMiddleLobbyPannel()
        })

        //Changement dans le lobby
        self.socket.on('lobby-changes-occured', function (roomReceived) {
            room = roomReceived
            vue.renderMiddleLobbyPannel()
            vue.renderRightLobbyPannel()
        })



        /**
        * ---------------------- Gestion d'une partie ----------------------------------
        */

        /**
         * 
         */
        self.socket.on('play-sound', function (type, data) {
            console.log("RECU JOUE SON", data)
            if (soundActived) {
                if (type == "trapMain") {
                    songsLists.trapMain.play()
                } else if (type == "trap") {
                    songsLists.trap[data].play()
                } else if (type == "rewardMain") {
                    songsLists.rewardMain.play()
                } else if (type == "reward") {
                    songsLists.reward[data].play()
                }
            }
        })

        self.socket.on('play-(-1)-animation', function (position) {
            console.log("animation malus -1 en", position)
            vue.animateMalus(position, 1)
        })

        self.socket.on('play-(-2)-animation', function (position) {
            console.log("animation malus -2 en", position)
            vue.animateMalus(position, 2)
        })

        self.socket.on('model-update', function (mod,spd,rfrhRate) {
            Object.assign(model, mod)
            speed = spd // anti-triche
            refreshRate = rfrhRate // anti-triche
            model.currentPlayer = model.players.find(pl => pl.id == self.socket.id)
        })

        /**
         * plus qu'un seul joueur en jeu/salon -> destruction du salon + redirection
         */
        this.socket.on('redirectPlayer', room => {
            alert("Plus de joueur dans le jeu ou ancien salon, vous avez été déconnecté.");
            window.location.replace("/");
        })

        /**
         * Animation de piège
         */
        self.socket.on('trap-animation', function (position) {
            trapsRewardsToAnimate.trap = position

        })

        /**
         * Animation de recompense
         */
        self.socket.on('reward-animation', function (position) {
            trapsRewardsToAnimate.reward = position
        })

        /**
         * erreur de position d'un joueur
         */
        self.socket.on('error-position', function () {
            myPlayerPosition = Object.assign({}, controller.getCurrentPlayer().position)
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

        /**
         * Signale qu'il faut affiche le jeu
         */
        self.socket.on('display-game', function (timeStop, mod) {
            vue.lobbyMusicFile.pause()
            console.log("CONTROLLER: display-game ")
            Object.assign(model, mod)
            model.currentPlayer = model.players.find(pl => pl.id == self.socket.id)
            console.log("CONTROLLER ON : UpdateModel recu", model.players)

            gameStarted = true
            vue.initGame()
            vue.launchCountdown(timeStop)
            vue.renderScoreList()

            //attend un peu puis lance le set interval pour être sur que tout pret
            initListener()


            console.log("fin displaygame.... launching vue.renderGame()...")
            gameTimeout = setTimeout(gameInterval = setInterval(() => vue.renderGame(myPlayerPosition), refreshRate), 200)
        })

        const moveTo = (position, dir) => self.socket.emit("move-player", roomName, position, dir) //send la position
        const place = (trapPosition, rewardPosition) => self.socket.emit("place-trap-and-reward", roomName, { trap: trapPosition, reward: rewardPosition })
        const getModel = () => model //renvoi le model
        const setName = (name) => self.socket.emit("set-name", roomName, name)
        const getRoomUsers = () => Object.assign({}, room.users) //renvoi le les users de la room
        const getRoomLeader = () => room.roomLeader //renvoi le les users de la room
        const getId = () => myId
        const getName = () => room.users[getId()]
        const getCurrentPlayer = () => Object.assign({}, model.currentPlayer) //renvoi le current player
        const getTrapsRewardsToAnimate = () => trapsRewardsToAnimate //renvoi le current player
        return { moveTo, place, getModel, getCurrentPlayer, startButtonClicked, setName, getRoomUsers, getRoomLeader, getId, getName, getTrapsRewardsToAnimate } //
    })()


})
//variables Globales
var tempTrapsRewardsArray = { trap: null, reward: null }
var lastRole
var lastInventoryCount

class Vue {

    constructor() {
        this.canva = document.getElementById("canva")
        this.canva.setAttribute('width', window.innerWidth);
        this.canva.setAttribute('height', window.innerHeight); //set à la longueur et largeur de la fenetre    
        this.context = document.getElementById("canva").getContext("2d")
        this.context.imageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;
        this.spriteWidth = Math.floor($("#canva")[0].clientWidth / 51)
        this.spriteHeight = Math.floor($("#canva")[0].clientWidth / 51)
        this.halfWidth = this.spriteWidth / 2.0
        this.halfHeight = this.spriteHeight / 2.0
        this.canva.setAttribute('width', this.spriteWidth * 30);
        this.canva.setAttribute('height', this.spriteHeight * 20);
        this.isAssetLoadingOver = false
        this.biais = 3.0
    }

    /**
     * Fait correspondre les images à des noms pour le canva
     */
    async loadAssets() {
        this.floorAsset = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_06.png", this.spriteWidth, this.spriteHeight)
        this.wallAsset = await this._syncedLoadImg("/img/PNG/Default size/Blocks/block_03.png", this.spriteWidth, this.spriteHeight)
        this.trapAsset = await this._syncedLoadImg("/img/PNG/Default size/Environment/environment_04.png", this.spriteWidth, this.spriteHeight)
        this.bonusAsset = await this._syncedLoadImg("/img/PNG/Default size/Environment/environment_12.png", this.spriteWidth, this.spriteHeight)

        this.playerUpAsset = await this._syncedLoadImg("/img/PNG/Default size/Player/player_up.png", this.halfWidth, this.halfHeight)
        this.playerDownAsset = await this._syncedLoadImg("/img/PNG/Default size/Player/player_down.png", this.halfWidth, this.halfHeight)
        this.playerRightAsset = await this._syncedLoadImg("/img/PNG/Default size/Player/player_right.png", this.halfWidth, this.halfHeight)
        this.playerLeftAsset = await this._syncedLoadImg("/img/PNG/Default size/Player/player_left.png", this.halfWidth, this.halfHeight)

        this.playerEnemyUpAsset = await this._syncedLoadImg("/img/PNG/Default size/Player/player_enemy_up.png", this.halfWidth, this.halfHeight)
        this.playerEnemyDownAsset = await this._syncedLoadImg("/img/PNG/Default size/Player/player_enemy_down.png", this.halfWidth, this.halfHeight)
        this.playerEnemyRightAsset = await this._syncedLoadImg("/img/PNG/Default size/Player/player_enemy_right.png", this.halfWidth, this.halfHeight)
        this.playerEnemyLeftAsset = await this._syncedLoadImg("/img/PNG/Default size/Player/player_enemy_left.png", this.halfWidth, this.halfHeight)

        this.emptySlotAsset = await this._syncedLoadImg("/img/PNG/Default size/Environment/environment_16.png", this.spriteWidth, this.spriteHeight)
        this.anonymousEntityAsset = await this._syncedLoadImg("/img/PNG/Default size/Environment/environment_07.png", this.spriteWidth, this.spriteHeight) //ground 07 apperement mais il existe pas enculé >:(
        this.isAssetLoadingOver = true
    }

    /**
     * Sous-fonction de loadAssets qui charge une image
     * @param {*} src_ 
     * @param {*} width_ 
     * @param {*} height_ 
     */
    async _syncedLoadImg(src_, width_, height_) {
        let ctx = this.context
        return await new Promise((resolve, reject) => {
            let result = new Image(width_, height_)
            result.src = src_
            result.onload = () => {
                resolve(result)
            }
            result.onerror = reject
        }).catch(error => console.log(error))
    }

    gameBaliseShown(value) {
        if (value) {
            document.getElementById('trapsRewardsMenu').style.display = 'block';
            document.getElementById('scoreListContainer').style.display = 'block';
            document.getElementById('canvaContainer').style.display = 'block';
            document.getElementById('indication').style.display = 'block';
        } else {
            document.getElementById('trapsRewardsMenu').style.display = 'none';
            document.getElementById('scoreListContainer').style.display = 'none';
            document.getElementById('canvaContainer').style.display = 'none';
            document.getElementById('indication').style.display = 'none';
        }

    }

    initGame() {
        console.log("Initiallising game....")
        if (document.getElementById("colonne-milieu-div") != null) {
            document.getElementById('colonne-milieu-div').parentNode.removeChild(document.getElementById('colonne-milieu-div'));
            document.getElementById('colonne-gauche-div').parentNode.removeChild(document.getElementById('colonne-gauche-div'));
            document.getElementById('colonne-droite-div').parentNode.removeChild(document.getElementById('colonne-droite-div'));
        }
        this.loadAssets()
        this.menus(controller.getCurrentPlayer().inventory)
        this.gameBaliseShown(true)
        console.log("END OF initiallising game....")
    }

    /**
     * Affiche le chronomètre
     * @param {*} stop 
     */
    launchCountdown(stop) {
        var x = setInterval(function () {
            var now = new Date().getTime();
            var distance = stop - now;
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (minutes < 10) {
                minutes = "0" + minutes
            }
            if (seconds < 10) {
                seconds = "0" + seconds
            }
            document.getElementById('countdown').innerHTML = minutes + ":" + seconds

            //Lorsque fini
            if (distance <= 0) {
                clearInterval(x);
            }
        }, 1000);
    }

    renderEndGame() {
        //tout efface sauf score et mettre score au milieu
        document.getElementById('trapsRewardsMenu').parentNode.removeChild(document.getElementById('trapsRewardsMenu'));
        document.getElementById('indication').parentNode.removeChild(document.getElementById('indication'));
        document.getElementById('canvaContainer').parentNode.removeChild(document.getElementById('canvaContainer'));
        document.getElementById('scoreLabel').parentNode.removeChild(document.getElementById('scoreLabel'));
        $("#scoreListContainer").css(
            {
                "padding-left": "0",
                "padding-right": "0",
                "margin-left": "18%",
                "margin-right": "18%",
                "display": "block",
                "width": "64%"
            });
        $("#container").css(
            {
                "margin-left": "auto",
                "margin-right": "auto",
                "width": "80%",
                "height": "100%"
            });

        var resultatBalise = document.createElement("p");
        resultatBalise.setAttribute("id", "endResults");

        var resultatText = document.createTextNode("Classement");
        resultatBalise.appendChild(resultatText);

        $("#scoreListContainer").prepend(resultatBalise)

        gameStarted = false;
        console.game("Game session ended properly.")
    }

    leftLobbyPannel() {
        /**
         * COLONNE DE GAUCHE
         * SET PSEUDO, OPTIONS...
         */
        let divColonneGauche = document.createElement("div")
        divColonneGauche.setAttribute("id", "colonne-gauche-div")

        let divOptions = document.createElement("div")
        divOptions.setAttribute("id", "divOptions")

        let divOptionsPartie = document.createElement("div")
        divOptionsPartie.setAttribute("id", "divOptionsPartie")

        divOptions.innerHTML = "<h2>OPTIONS</h2>"

        let inputBox = document.createElement("input");
        inputBox.type = "text";
        let btnName = document.createElement("button");
        btnName.setAttribute("id", "btnRename")
        btnName.innerHTML = "ok";

        let divNameContainer = document.createElement("div")
        divNameContainer.setAttribute("id", "nameContainer")
        divNameContainer.innerHTML = "<h4>Pseudo</h4>";
        divNameContainer.append(inputBox)
        divNameContainer.append(btnName)

        divOptions.append(divNameContainer)

        divColonneGauche.append(divOptions)


        if (JSON.stringify(controller.getId()) == JSON.stringify(controller.getRoomLeader())) {
            divOptionsPartie.innerHTML = "<h2>OPTIONS DE JEU</h2>"

            let dureeDiv = document.createElement("div")
            dureeDiv.setAttribute("id", "dureeDiv")

            let inputBoxTime = document.createElement("input");
            inputBoxTime.setAttribute("id", "inputBoxTime")
            inputBoxTime.type = "text";


            let dureeLabel = document.createElement("p");
            let dureeText = document.createTextNode("Durée de la partie (minutes) : ");
            dureeLabel.append(dureeText)

            dureeDiv.append(dureeLabel)
            dureeDiv.append(inputBoxTime)

            divOptionsPartie.append(dureeDiv)

            this.setInputFilter(inputBoxTime, function (value) { //empeche de retnrer autre chose que des entiers
                return /^-?\d*$/.test(value);
            });
            divColonneGauche.append(divOptionsPartie)
        }
        $("#container").append(divColonneGauche)

        btnName.addEventListener("click", function () {
            if (inputBox.value != "" && inputBox.value.length < 21) {
                controller.setName(inputBox.value)
            } else {
                alert("Format de pseudo incorrect (>20 ou vide)")
            }

        });
        this.middleAndRightLobbyPannel()
    }

    middleAndRightLobbyPannel() {
        //cacher container
        console.log("rendering lobby..")
        this.gameBaliseShown(false)
        if (document.getElementById("colonne-milieu-div") != null) {
            document.getElementById('colonne-milieu-div').parentNode.removeChild(document.getElementById('colonne-milieu-div'));
            //document.getElementById('colonne-gauche-div').parentNode.removeChild(document.getElementById('colonne-gauche-div'));
            document.getElementById('colonne-droite-div').parentNode.removeChild(document.getElementById('colonne-droite-div'));
        }
        /**
         * COLONNE DU MILIEU
         * liste de joueurs dans le lobby
         */
        let btnStart = document.createElement("button");
        btnStart.setAttribute("id", "btnStart")
        btnStart.innerHTML = "Lancer la partie";

        let divColonneMilieu = document.createElement("div")
        divColonneMilieu.setAttribute("id", "colonne-milieu-div")

        let ulListUsers = document.createElement("ul");
        ulListUsers.setAttribute("id", "listPlayers-container")
        console.log(controller.getRoomUsers())
        let usersArray = Object.entries(controller.getRoomUsers())
        usersArray.forEach(entrie => {
            let userName = entrie[1]
            console.log("user est : ", userName)
            let li = document.createElement("li");
            li.setAttribute("class", "userInList")
            let pBalise = document.createElement("p");
            let name = document.createTextNode(userName);
            pBalise.appendChild(name);
            console.log("en0", entrie[0])
            console.log(JSON.stringify(controller.getRoomLeader()))
            if (entrie[0] == controller.getRoomLeader()) {
                var imgLeader = document.createElement("img")
                imgLeader.src = '/img/PNG/Default size/misc/crown.png';
                imgLeader.setAttribute('width', '24px');
                imgLeader.setAttribute('height', '24px');
                imgLeader.setAttribute('id', 'leaderImg');
                pBalise.append(imgLeader)
            }

            li.appendChild(pBalise);
            ulListUsers.append(li)
        })

        divColonneMilieu.innerHTML = "<h2>LISTE DE JOUEURS</h2>"
        divColonneMilieu.append(ulListUsers)

        console.log("getid", controller.getId())
        console.log("roomleader", controller.getRoomLeader())
        if (controller.getId() != controller.getRoomLeader()) {
            btnStart.innerHTML = "En attente du lancement...";
        }
        divColonneMilieu.append(btnStart)


        /**
         * COLONNE DE DROITE
         * SET PSEUDO, OPTIONS...
         */
        let divColonneDroite = document.createElement("div")
        divColonneDroite.setAttribute("id", "colonne-droite-div")


        let divpseudoContainer = document.createElement("div")
        divpseudoContainer.setAttribute("id", "pseudo-container")
        divpseudoContainer.innerHTML = "<h1 id='pseudoH1'>Ton pseudo</h1>"

        let h2Pseudo = document.createElement("h2")
        h2Pseudo.setAttribute("id", "pseudoH2")
        let pseudo = document.createTextNode(controller.getName());
        h2Pseudo.appendChild(pseudo);

        divpseudoContainer.append(h2Pseudo);
        divColonneDroite.append(divpseudoContainer);


        $("#container").append(divColonneMilieu)
        $("#container").append(divColonneDroite)

        btnStart.addEventListener("click", function () {
            controller.startButtonClicked()
        });
        console.log("..END OF rendering lobby")
    }

    /**
     * Empeche la saisie de caractere autres que des entiers dans la box de durée
     * @param {*} textbox 
     * @param {*} inputFilter 
     */
    setInputFilter(textbox, inputFilter) {
        ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
            textbox.addEventListener(event, function () {
                if (inputFilter(this.value)) {
                    this.oldValue = this.value;
                    this.oldSelectionStart = this.selectionStart;
                    this.oldSelectionEnd = this.selectionEnd;
                } else if (this.hasOwnProperty("oldValue")) {
                    this.value = this.oldValue;
                    this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                } else {
                    this.value = "";
                }
            });
        });
    }


    scoreList() {
        document.getElementById("scoreList").innerHTML = "";
        //for controller.model.players
        let scorePrecedent = 0
        for (const player of controller.getModel().players) {
            var div = document.createElement("div");
            div.setAttribute("class", "scoreDiv");

            var divName = document.createElement("div");
            divName.setAttribute("class", "score-container");
            var playerNameBalise = document.createElement("p");
            playerNameBalise.setAttribute("class", "scoreName");
            var text = document.createTextNode(player.name);
            playerNameBalise.appendChild(text);
            divName.append(playerNameBalise)

            if (player.isRoomLeader) {
                var imgLeader = document.createElement("img")
                imgLeader.src = '/img/PNG/Default size/misc/crown.png';
                imgLeader.setAttribute('width', '24px');
                imgLeader.setAttribute('height', '24px');
                imgLeader.setAttribute('id', 'leaderImg');
                divName.append(imgLeader)
            }

            var playerScoreBalise = document.createElement("p")
            playerScoreBalise.setAttribute("class", "scoreText");
            text = document.createTextNode(player.score);
            playerScoreBalise.appendChild(text);

            div.append(divName)
            div.append(playerScoreBalise)


            if (scorePrecedent < player.score) {
                $("#scoreList").prepend(div)
            } else {
                $("#scoreList").append(div)
            }

        }
    }

    /**
     * Rend visuellement le plateau, les joueurs, bref tout
     */
    renderGame(thisplayerId) {
        if ((lastRole != controller.getCurrentPlayer().role && lastRole != null) || lastInventoryCount != controller.getCurrentPlayer().inventory.length) {
            this.menus(controller.getCurrentPlayer().inventory)
        }
        this.clearAll()
        this.map(controller.getModel().map) //todo rajouter les paramètres
        this.traps(controller.getModel().traps) //todo
        this.bonus(controller.getModel().rewards) //todo
        this.players(controller.getModel().players, thisplayerId) //todo
        if (controller.getCurrentPlayer().role == "explorer") this.darken()
        this.tempTrapsAndRewards(controller.getCurrentPlayer().role)
        lastRole = controller.getCurrentPlayer().role
        lastInventoryCount = controller.getCurrentPlayer().inventory.length
        this.scoreList()
    }

    clearAll() {
        this.context.clearRect(0, 0, this.canva.width, this.canva.height);
    }

    //a appeler par controller ?
    /**
     * Affiche les menus et les complete en fonction de 
     */
    menus(inventory) {
        document.getElementById("rewardsList").innerHTML = "";
        document.getElementById("trapsList").innerHTML = "";

        this.trapsMenu = document.getElementById("trapsMenu")
        this.rewardsMenu = document.getElementById("rewardsMenu")

        let trapSlotUsed = 0;
        let rewardSlotUsed = 0;
        inventory.forEach(element => {//reparti 0 et 1 en piege et recompenses
            if (element == 0) { //c'est une recompenses
                rewardSlotUsed++
                $("#rewardsList").append('<li><img class="rewards" src="/img/PNG/Default size/Environment/environment_12.png" width="' + this.spriteWidth + '" height="' + this.spriteHeight + '"></li>');
            } else { //c'est un piege
                trapSlotUsed++
                $("#trapsList").append('<li><img class="traps" src="/img/PNG/Default size/Environment/environment_04.png" width="' + this.spriteWidth + '" height="' + this.spriteHeight + '"></li>');
            }

        });

        for (var i = rewardSlotUsed; i < 4; i++) {
            $("#rewardsList").append('<li><img class="rewardsEmpty" src="/img/PNG/Default size/Environment/environment_16.png" width="' + this.spriteWidth + '" height="' + this.spriteHeight + '"></li>');
        }

        for (var i = trapSlotUsed; i < 4; i++) {
            $("#trapsList").append('<li><img class="trapsEmpty" src="/img/PNG/Default size/Environment/environment_16.png" width="' + this.spriteWidth + '" height="' + this.spriteHeight + '"></li>');
        }

        //séléctionne les pieges et rewards
        var traps = $(".traps");
        var rewards = $(".rewards");

        //deviennent draggable
        traps.draggable({
            helper: 'clone',
        });
        traps.data("type", "trap");
        rewards.draggable({
            helper: 'clone',
        });
        rewards.data("type", "rewards");


        var $canvas = $("#canva");
        //le canva est droppable
        $canvas.droppable({
            drop: dragDrop,
        });

        let t = this

        function dragDrop(e, ui) {
            let Offset = $canvas.offset();
            let offsetX = Offset.left;
            let offsetY = Offset.top;
            let x = Math.round((parseInt(ui.offset.left - offsetX) - 1) / t.spriteWidth);
            let y = Math.round((parseInt(ui.offset.top - offsetY)) / t.spriteHeight);
            var data = ui.draggable.data("type");

            if (data == "trap") {
                tempTrapsRewardsArray["trap"] = { x_: x, y_: y }
            } else {
                tempTrapsRewardsArray["reward"] = { x_: x, y_: y }
            }
        }

    }

    /**
     * Si il ya un piege ou une recompense en cours de placement pas encore validé par controller donc pas sur le serveur
     * on l'affiche grâce à cette fonction
     */
    tempTrapsAndRewards(role) {
        let trapIndex = -1
        let rewardsIndex = -1
        let x
        let y
        document.getElementById("indication").innerHTML = "";
        if (role == "trapper") {

            var indicationTextBalise = document.createElement("p");
            var indicationText = document.createTextNode("TRAPPER : Place un piège et une récompense à la fois");

            indicationTextBalise.appendChild(indicationText);

            document.getElementById("indication").append(indicationTextBalise);
        } else {
            var indicationTextBalise = document.createElement("p");
            var indicationText = document.createTextNode("EXPLORER : trouve des récompenses mais attention aux pièges...");

            indicationTextBalise.appendChild(indicationText);

            document.getElementById("indication").append(indicationTextBalise);
        }

        if (tempTrapsRewardsArray["trap"] != null) {
            this.context.globalAlpha = 0.5;
            x = tempTrapsRewardsArray["trap"].x_ * this.spriteWidth
            y = tempTrapsRewardsArray["trap"].y_ * this.spriteWidth
            this.context.drawImage(this.trapAsset, x, y, this.trapAsset.width, this.trapAsset.height)
            this.context.globalAlpha = 1.0;
        }
        if (tempTrapsRewardsArray["reward"] != null) {
            this.context.globalAlpha = 0.5;
            x = tempTrapsRewardsArray["reward"].x_ * this.spriteWidth
            y = tempTrapsRewardsArray["reward"].y_ * this.spriteWidth
            this.context.drawImage(this.bonusAsset, x, y, this.bonusAsset.width, this.bonusAsset.height)
            this.context.globalAlpha = 1.0;
        }
        //si envoi
        if (tempTrapsRewardsArray["trap"] != null && tempTrapsRewardsArray["reward"] != null) {
            controller.place(tempTrapsRewardsArray["trap"], tempTrapsRewardsArray["reward"], controller.getCurrentPlayer())

            tempTrapsRewardsArray["trap"] = null
            tempTrapsRewardsArray["reward"] = null

            document.getElementById("rewardsList").innerHTML = "";
            document.getElementById("trapsList").innerHTML = "";
            this.menus(controller.getCurrentPlayer().inventory)
        }
    }


    /**
     * Dessine la map
     * @param {*} mapArray de 0 et 1
     */
    map(mapArray) {
        for (var i = 0; i < mapArray.length; i++) {
            for (var j = 0; j < mapArray[i].length; j++) {
                this.context.drawImage(this.floorAsset, j * this.floorAsset.width, i * this.floorAsset.height, this.floorAsset.width, this.floorAsset.height) //rend le sol
                if (mapArray[i][j] == 1) {
                    this.context.drawImage(this.wallAsset, j * this.wallAsset.width, i * this.wallAsset.height, this.wallAsset.width, this.wallAsset.height) //canva block_03 c'est un mur
                }
            }
        }
    }

    /**
     * Dessine le cercle de lumière autour du joueur (ou plutot assombri tout autour)
     */
    darken() {
        let myPlayer = controller.getCurrentPlayer()
        let coordX = myPlayer.position.x
        let coordY = myPlayer.position.y
        this.context.beginPath()
        this.context.rect(0, 0, 30 * this.spriteWidth, 20 * this.spriteHeight);
        this.context.arc(coordX * this.spriteWidth - this.biais, coordY * this.spriteHeight - this.biais, 100, 0, Math.PI * 2, true);
        this.context.fill();
    }

    /**
     * Dessine les pièges sur le plateau
     * @param {*} trapArray 
     */
    traps(trapArray) {
        for (var i = 0; i < trapArray.length; i++) {
            if (trapArray[i]) {
                let coordX = trapArray[i].position.x_
                let coordY = trapArray[i].position.y_
                let myPlayer = controller.getCurrentPlayer()
                if (myPlayer.role == "explorer") {
                    this.context.drawImage(this.anonymousEntityAsset, coordX * this.spriteWidth, coordY * this.spriteHeight, this.anonymousEntityAsset.width, this.anonymousEntityAsset.height) // Entité anonyme 
                } else {
                    this.context.drawImage(this.trapAsset, coordX * this.spriteWidth, coordY * this.spriteHeight, this.trapAsset.width, this.trapAsset.height) // Entité piège
                }
            }
        }
    }

    /**
     * Dessine les recompenses
     * @param {*} bonusArray 
     */
    bonus(bonusArray) {
        for (var i = 0; i < bonusArray.length; i++) {
            let coordX = bonusArray[i].position.x_
            let coordY = bonusArray[i].position.y_
            let myPlayer = controller.getCurrentPlayer()
            if (myPlayer.role == "explorer") {
                this.context.drawImage(this.anonymousEntityAsset, coordX * this.anonymousEntityAsset.width, coordY * this.anonymousEntityAsset.height, this.anonymousEntityAsset.width, this.anonymousEntityAsset.height) // Entité anonyme 
            } else {
                this.context.drawImage(this.bonusAsset, coordX * this.bonusAsset.width, coordY * this.bonusAsset.height, this.bonusAsset.width, this.bonusAsset.height) // Entité bonus
            }
        }
    }

    /**
     * Dessine tous les joueurs sur les plateau de jeu
     * @param {*} playersArray 
     */
    players(playersArray, thisPlayerId) {
        for (var i = 0; i < playersArray.length; i++) {
            if (playersArray[i].role == "explorer") { //ne rend que les explorers
                let coordX = playersArray[i].position.x
                let coordY = playersArray[i].position.y
                console.log("thisplayerid", thisPlayerId)
                console.log("playerarrayid", playersArray[i].id)
                if (thisPlayerId == playersArray[i].id) {
                    switch (playersArray[i].direction) {
                        case 'up':
                            this.context.drawImage(this.playerUpAsset, coordX * this.spriteWidth - this.biais, coordY * this.spriteHeight - this.biais, this.playerUpAsset.width, this.playerUpAsset.height)
                            break;
                        case 'down':
                            this.context.drawImage(this.playerDownAsset, coordX * this.spriteWidth - this.biais, coordY * this.spriteHeight - this.biais, this.playerDownAsset.width, this.playerDownAsset.height)
                            break;
                        case 'right':
                            this.context.drawImage(this.playerRightAsset, coordX * this.spriteWidth - this.biais, coordY * this.spriteHeight - this.biais, this.playerRightAsset.width, this.playerRightAsset.height)
                            break;
                        case 'left':
                            this.context.drawImage(this.playerLeftAsset, coordX * this.spriteWidth - this.biais, coordY * this.spriteHeight - this.biais, this.playerLeftAsset.width, this.playerLeftAsset.height)
                            break;
                        default:
                            console.log(`Erreur dans la direction`);
                    }
                } else {
                    switch (playersArray[i].direction) {
                        case 'up':
                            this.context.drawImage(this.playerEnemyUpAsset, coordX * this.spriteWidth - this.biais, coordY * this.spriteHeight - this.biais, this.playerEnemyUpAsset.width, this.playerEnemyUpAsset.height)
                            break;
                        case 'down':
                            this.context.drawImage(this.playerEnemyDownAsset, coordX * this.spriteWidth - this.biais, coordY * this.spriteHeight - this.biais, this.playerEnemyDownAsset.width, this.playerEnemyDownAsset.height)
                            break;
                        case 'right':
                            this.context.drawImage(this.playerEnemyRightAsset, coordX * this.spriteWidth - this.biais, coordY * this.spriteHeight - this.biais, this.playerEnemyRightAsset.width, this.playerEnemyRightAsset.height)
                            break;
                        case 'left':
                            this.context.drawImage(this.playerEnemyLeftAsset, coordX * this.spriteWidth - this.biais, coordY * this.spriteHeight - this.biais, this.playerEnemyLeftAsset.width, this.playerEnemyLeftAsset.height)
                            break;
                        default:
                            console.log(`Erreur dans la direction`);
                    }
                }
            }
        }
    }
}
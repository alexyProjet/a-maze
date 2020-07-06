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
        this.floorAsset = await this._syncedLoadImg("/img/Environment/ground.png", this.spriteWidth, this.spriteHeight)
        this.wallAsset = await this._syncedLoadImg("/img/Environment/block.png", this.spriteWidth, this.spriteHeight)
        this.trapAsset = await this._syncedLoadImg("/img/Environment/trap.png", this.spriteWidth, this.spriteHeight)
        this.rewardAsset = await this._syncedLoadImg("/img/Environment/reward.png", this.spriteWidth, this.spriteHeight)
        this.emptySlotAsset = await this._syncedLoadImg("/img/Environment/empty_slot.png", this.spriteWidth, this.spriteHeight)
        this.anonymousEntityAsset = await this._syncedLoadImg("/img/Environment/anonymous_block.png", this.spriteWidth, this.spriteHeight)

        this.playerUpAsset = await this._syncedLoadImg("/img/Player/Main/player_up.png", this.halfWidth, this.halfHeight)
        this.playerDownAsset = await this._syncedLoadImg("/img/Player/Main/player_down.png", this.halfWidth, this.halfHeight)
        this.playerRightAsset = await this._syncedLoadImg("/img/Player/Main/player_right.png", this.halfWidth, this.halfHeight)
        this.playerLeftAsset = await this._syncedLoadImg("/img/Player/Main/player_left.png", this.halfWidth, this.halfHeight)

        this.playerEnemyUpAsset = await this._syncedLoadImg("/img/Player/Ennemy/player_enemy_up.png", this.halfWidth, this.halfHeight)
        this.playerEnemyDownAsset = await this._syncedLoadImg("/img/Player/Ennemy/player_enemy_down.png", this.halfWidth, this.halfHeight)
        this.playerEnemyRightAsset = await this._syncedLoadImg("/img/Player/Ennemy/player_enemy_right.png", this.halfWidth, this.halfHeight)
        this.playerEnemyLeftAsset = await this._syncedLoadImg("/img/Player/Ennemy/player_enemy_left.png", this.halfWidth, this.halfHeight)

        this.trapExplodedMarkAsset = await this._syncedLoadImg("/img/Environment/trap_exploded_mark.png", this.spriteWidth, this.spriteHeight)
        this.wallDestroyedAsset = await this._syncedLoadImg("/img/Environment/wall_destroyed.png", this.spriteWidth, this.spriteHeight)
        this.isAssetLoadingOver = true

        this.explosionAnimationFrames = new Array(24);
        async function fillExplosionFramesArray(self) {
            let i = 0
            for await (let element of self.explosionAnimationFrames) {
                self.explosionAnimationFrames[i] = new Image(self.spriteWidth * 3, self.spriteHeight * 3)
                self.explosionAnimationFrames[i].src = "/img/Animations/trap/trap_animation-" + i + ".png"
                i++
                console.log(self.explosionAnimationFrames[i])
            }
            console.log(self.explosionAnimationFrames)
        }
        fillExplosionFramesArray(this)

    }

    /**
     * Sous-fonction de loadAssets qui charge une image
     * @param {*} src_ 
     * @param {*} width_ 
     * @param {*} height_ 
     */
    async _syncedLoadImg(src_, width_, height_) {
        return await new Promise((resolve, reject) => {
            let result = new Image(width_, height_)
            result.src = src_
            result.onload = () => {
                resolve(result)
            }
            result.onerror = reject
        }).catch(error => console.log(error))
    }

    /**
     * 
     * -------------------------------------- DIVERS --------------------------------------
     */
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

    clearAll() {
        this.context.clearRect(0, 0, this.canva.width, this.canva.height);
    }

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
    /**
     * 
     * -------------------------------------- RENDU DU SALON --------------------------------------
     */

    /**
     * Rendu du panneau gauche dans le salon
     * gauche : Options de joueur et options de partie (seulement pour le maitre de salon)
     */
    renderLeftLobbyPannel() {
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
            inputBoxTime.value = 10;


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
    }

    /**
     * COLONNE DE DROITE
     * SET PSEUDO, OPTIONS...
     */
    renderRightLobbyPannel() {

        let divColonneDroite = document.createElement("div")
        divColonneDroite.setAttribute("id", "colonne-droite-div")

        let divRulesContainer = document.createElement("div")
        divRulesContainer.setAttribute("id", "rules-container")
        divRulesContainer.innerHTML = "<h1 id='rulesH1'>Règles</h1>"

        let pseudoP = document.createElement("div")
        pseudoP.setAttribute("id", "rulesP")

        //let rules = document.createTextNode( );
        // pseudoP.appendChild(pseudo);

        divRulesContainer.append(pseudoP);
        divColonneDroite.append(divRulesContainer);
        $("#container").append(divColonneDroite)

        $("#rulesP").load("rules.txt");
    }
    /**
     * Rendu des panneaux du central (liste joueur)
     * centre : liste des joueurs dans le salon
     */
    renderMiddleLobbyPannel() {
        //cacher container
        console.log("rendering lobby..")
        this.gameBaliseShown(false)
        if (document.getElementById("colonne-milieu-div") != null) {
            document.getElementById('colonne-milieu-div').parentNode.removeChild(document.getElementById('colonne-milieu-div'));
            //document.getElementById('colonne-gauche-div').parentNode.removeChild(document.getElementById('colonne-gauche-div'));
            document.getElementById('colonne-droite-div').parentNode.removeChild(document.getElementById('colonne-droite-div'));
        }
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
            let li = document.createElement("li");
            li.setAttribute("class", "userInList")
            let pBalise = document.createElement("p");
            let name = ""

            if (entrie[0] == controller.getId()) {
                name = document.createTextNode(userName + "(toi)");
            } else {
                name = document.createTextNode(userName);
            }
            pBalise.appendChild(name);
            if (entrie[0] == controller.getRoomLeader()) {
                var imgLeader = document.createElement("img")
                imgLeader.src = '/img/misc/crown.png';
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

        $("#container").append(divColonneMilieu)


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

    /**
     * 
     * -------------------------------------- RENDU D'UNE PARTIE --------------------------------------
     */

    /**
     * Initialise la page de jeu et supprime les elements de salon
     */
    initGame() {

        console.log("Initialisation de la partie....")
        if (document.getElementById("colonne-milieu-div") != null) {
            document.getElementById('colonne-milieu-div').parentNode.removeChild(document.getElementById('colonne-milieu-div'));
            document.getElementById('colonne-gauche-div').parentNode.removeChild(document.getElementById('colonne-gauche-div'));
            document.getElementById('colonne-droite-div').parentNode.removeChild(document.getElementById('colonne-droite-div'));
        }
        this.loadAssets()
        this.renderInGameMenus(controller.getCurrentPlayer().inventory)
        this.gameBaliseShown(true)
        console.log("Initialisation terminée....")
    }

    /**
     * Ecran de fin de partie
     */
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
        console.log("Game session ended properly.")
    }

    /**
     * Rend la liste des scores
     */
    renderScoreList() {
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
            let nameText = player.name
            if (player.id == controller.getId()) nameText = nameText + " (toi)"
            var text = document.createTextNode(nameText);
            playerNameBalise.appendChild(text);
            divName.append(playerNameBalise)

            if (player.isRoomLeader) {
                var imgLeader = document.createElement("img")
                imgLeader.src = '/img/misc/crown.png';
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
            scorePrecedent = player.score
        }
    }

    /**
     * Rend visuellement le plateau, les joueurs, bref tout
     */
    renderGame(position) {
        if ((lastRole != controller.getCurrentPlayer().role && lastRole != null) || lastInventoryCount != controller.getCurrentPlayer().inventory.length) {
            this.renderInGameMenus(controller.getCurrentPlayer().inventory)
        }
        this.clearAll()
        this.map(controller.getModel().map)
        if (controller.getCurrentPlayer().role == "trapper") {
            this.traps(controller.getModel().traps)
            this.rewards(controller.getModel().rewards)
            this.otherPlayers(controller.getModel().players)
        } else {
            this.entities(controller.getModel().entities)
            this.player(false, position) //render le joueur principal
            this.otherPlayers(controller.getModel().players)
        }
        
        //this.players(controller.getModel().players, thisplayerId)
        this.tempTrapsAndRewards(controller.getCurrentPlayer().role)
        lastRole = controller.getCurrentPlayer().role
        lastInventoryCount = controller.getCurrentPlayer().inventory.length
    }

    /**
     * 
     * -------------------------------------- RENDU DES ELEMENTS DE JEU --------------------------------------
     */

    /**
     * Affiche les menus et les complete en fonction de 
     */
    renderInGameMenus(inventory) {
        document.getElementById("rewardsList").innerHTML = "";
        document.getElementById("trapsList").innerHTML = "";

        this.trapsMenu = document.getElementById("trapsMenu")
        this.rewardsMenu = document.getElementById("rewardsMenu")

        /**
         * Affichage du menu des pieges/recompenses
        */
        let trapSlotUsed = 0;
        let rewardSlotUsed = 0;
        inventory.forEach(element => {//reparti 0 et 1 en piege et recompenses
            if (element == 0) { //c'est une recompenses
                rewardSlotUsed++
                $("#rewardsList").append('<li><img class="rewards" src="/img/Environment/reward.png" width="' + this.spriteWidth + '" height="' + this.spriteHeight + '"></li>');
            } else { //c'est un piege
                trapSlotUsed++
                $("#trapsList").append('<li><img class="traps" src="/img/Environment/trap.png" width="' + this.spriteWidth + '" height="' + this.spriteHeight + '"></li>');
            }

        });
        for (var i = rewardSlotUsed; i < 4; i++) {
            $("#rewardsList").append('<li><img class="rewardsEmpty" src="/img/Environment/empty_slot.png" width="' + this.spriteWidth + '" height="' + this.spriteHeight + '"></li>');
        }

        for (var i = trapSlotUsed; i < 4; i++) {
            $("#trapsList").append('<li><img class="trapsEmpty" src="/img/Environment/empty_slot.png" width="' + this.spriteWidth + '" height="' + this.spriteHeight + '"></li>');
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
     * Gère le stockage et l'envoi des pièges et récompenses placées par l'utilisateur
     * Vérfie qu'il y a bien 1 piège et 1 récompenses placées
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
            this.context.drawImage(this.rewardAsset, x, y, this.rewardAsset.width, this.rewardAsset.height)
            this.context.globalAlpha = 1.0;
        }
        //si envoi
        if (tempTrapsRewardsArray["trap"] != null && tempTrapsRewardsArray["reward"] != null) {
            controller.place(tempTrapsRewardsArray["trap"], tempTrapsRewardsArray["reward"], controller.getCurrentPlayer())

            tempTrapsRewardsArray["trap"] = null
            tempTrapsRewardsArray["reward"] = null

            document.getElementById("rewardsList").innerHTML = "";
            document.getElementById("trapsList").innerHTML = "";
            this.renderInGameMenus(controller.getCurrentPlayer().inventory)
        }
    }

    /**
     * Shake the game
     * @param {*} mapArray 
     */
    shake() {
        $("#canva").effect("shake", { times: 3, distance: 4, direction: 'left' }, 250);
    }
    /**
     * Dessine le plateau de jeu
     */
    map(mapArray) {
        for (var i = 0; i < mapArray.length; i++) {
            for (var j = 0; j < mapArray[i].length; j++) {
                this.context.drawImage(this.floorAsset, j * this.floorAsset.width, i * this.floorAsset.height, this.floorAsset.width, this.floorAsset.height) //rend le sol
                if (mapArray[i][j] == 1) { //mur
                    this.context.drawImage(this.wallAsset, j * this.wallAsset.width, i * this.wallAsset.height, this.wallAsset.width, this.wallAsset.height) //canva block_03 c'est un mur
                }
                if (mapArray[i][j] == 2) { //mur détruit
                    this.context.drawImage(this.wallDestroyedAsset, j * this.wallAsset.width, i * this.wallAsset.height, this.wallAsset.width, this.wallAsset.height) //canva block_03 c'est un mur
                }
                if (mapArray[i][j] == 3) { //trace bombe explosée
                    this.context.drawImage(this.trapExplodedMarkAsset, j * this.wallAsset.width, i * this.wallAsset.height, this.wallAsset.width, this.wallAsset.height) //canva block_03 c'est un mur
                }
            }
        }
    }

    /**
    * Dessine le cercle de lumière autour du joueur (ou plutot assombri tout autour)
    */
    darken(position) {

        let coordX = position.x
        let coordY = position.y
        this.context.beginPath()
        this.context.rect(0, 0, 30 * this.spriteWidth, 20 * this.spriteHeight);
        //x,y,rayon,angles...
        this.context.arc(coordX * this.spriteWidth + this.biais, coordY * this.spriteHeight + this.biais, this.spriteHeight * 2.5, 0, Math.PI * 2, true);
        this.context.fillStyle = "black";
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
                this.context.drawImage(this.trapAsset, coordX * this.spriteWidth, coordY * this.spriteHeight, this.trapAsset.width, this.trapAsset.height) // Entité piège
            }
        }
    }

    /**
     * Dessine les recompenses
     * @param {*} rewardsArray 
     */
    rewards(rewardsArray) {
        for (var i = 0; i < rewardsArray.length; i++) {
            let coordX = rewardsArray[i].position.x_
            let coordY = rewardsArray[i].position.y_
            let myPlayer = controller.getCurrentPlayer()
            this.context.drawImage(this.rewardAsset, coordX * this.rewardAsset.width, coordY * this.rewardAsset.height, this.rewardAsset.width, this.rewardAsset.height) // Entité reward
        }
    }

    /**
     * Dessine les pièges sur le plateau
     * @param {*} entitiesArray 
     */
    entities(entitiesArray) {
        for (var i = 0; i < entitiesArray.length; i++) {
            if (entitiesArray[i]) {
                let coordX = entitiesArray[i].position.x_
                let coordY = entitiesArray[i].position.y_
                let myPlayer = controller.getCurrentPlayer()
                this.context.drawImage(this.anonymousEntityAsset, coordX * this.spriteWidth, coordY * this.spriteHeight, this.anonymousEntityAsset.width, this.anonymousEntityAsset.height) // Entité anonyme 
            }
        }
    }

    /**
     * anime le piege
     */
    trapAnimation(position) {
        let self = this
        let x = position.x_
        let y = position.y_
        let i = 0
        console.log("coord : ", x, y)
        function anim() {
            self.context.drawImage(self.explosionAnimationFrames[i], (x * self.spriteWidth) - self.spriteWidth, (y * self.spriteHeight) - self.spriteHeight - self.biais, self.explosionAnimationFrames[i].width, self.explosionAnimationFrames[i].height)
            i++;
            if (i < self.explosionAnimationFrames.length) {
                requestAnimationFrame(anim);
            }
        }
        anim(0)
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
                if (thisPlayerId == playersArray[i].id) { //si joueur actuel
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
                } else { // si joueurs ennemies
                    let name = playersArray[i].name
                    //canva.fillStyle = "white"; a bidouiller
                    this.context.font = '12px Roboto';
                    let textSize = this.context.measureText(name).width
                    this.context.fillText(name, coordX * this.spriteWidth - (textSize / 2.0) + (this.halfWidth / 2.0), coordY * this.spriteHeight - this.biais);
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

    player(isEnnemy, position) {
        //  console.log("player render launched",position)
        if (isEnnemy) {

        } else {
            this.context.drawImage(this.playerUpAsset, position.x * this.spriteWidth - this.halfWidth/2.0, position.y * this.spriteHeight - this.halfWidth/2.0, this.playerUpAsset.width, this.playerUpAsset.height)
        }
        this.darken(position)
    }

    otherPlayers(players) {

        players.forEach(pl => {
            if(pl.id != controller.getId()){//pas notre joueur
                this.context.drawImage(this.playerEnemyUpAsset, pl.position.x * this.spriteWidth, pl.position.y * this.spriteHeight, this.playerEnemyUpAsset.width, this.playerEnemyUpAsset.height)
            }
            //player(true,pos)
        })
    }
}
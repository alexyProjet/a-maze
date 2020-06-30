//variables Globales
var tempTrapsRewardsArray = []
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
        this.spriteWidth = Math.floor($("#canva")[0].clientHeight / 22)
        this.spriteHeight = Math.floor($("#canva")[0].clientHeight / 22)
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
        this.playerAsset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_01.png", this.halfWidth, this.halfHeight) //FIXME: DELETE DIS
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

    initGame(){
        console.log("Initiallising game....")
        this.loadAssets()
        this.menus(controller.getCurrentPlayer().inventory)
        document.getElementById('trapsRewardsMenu').style.display = 'block';
        document.getElementById('scoreList').style.display = 'block';
        console.log("END OF initiallising game....")
    }

    renderLobby() {
        //cacher container
        console.log("rendering lobby..")
        document.getElementById('trapsRewardsMenu').style.display = 'none';
        document.getElementById('scoreList').style.display = 'none';
        var btn = document.createElement("button");
        btn.innerHTML = "start";
        $("#startGameButton").append(btn)

        var box = document.createElement("input");
        box.type = "text";       
        
        var btnName = document.createElement("button");
        btnName.innerHTML = "ok";
        $("#nameContainer").append(box)
        $("#nameContainer").append(btnName)

        btn.addEventListener ("click", function() {
            controller.startButtonClicked()
          });
        console.log("..END OF rendering lobby")

        btnName.addEventListener ("click", function() {
            console.log(box.value)
            controller.setName(box.value)
          });
    }

    scoreList(){
        document.getElementById("scoreList").innerHTML = "";
        //for controller.model.players
        let scorePrecedent = 0
        for (const player of controller.getModel().players) {
            var div = document.createElement("div");
            div.setAttribute("class", "scoreDiv");

            var playerNameBalise = document.createElement("p");
            var text = document.createTextNode(player.name);
            playerNameBalise.appendChild(text);

            var playerScoreBalise = document.createElement("p")
            text = document.createTextNode(player.score);
            playerScoreBalise.appendChild(text);

            div.append(playerNameBalise)
            div.append(playerScoreBalise)

            if(scorePrecedent < player.score){
                $("#scoreList").prepend(div)
            } else{
                $("#scoreList").append(div)
            }
            
         }
    }

    /**
     * Rend visuellement le plateau, les joueurs, bref tout
     */
    renderGame() {
        if( ( lastRole != controller.getCurrentPlayer().role && lastRole != null ) || lastInventoryCount != controller.getCurrentPlayer().inventory.length){
            this.menus(controller.getCurrentPlayer().inventory)
        } 
        this.clearAll()
        this.map(controller.getModel().map) //todo rajouter les paramètres
        this.traps(controller.getModel().traps) //todo
        this.bonus(controller.getModel().rewards) //todo
        this.players(controller.getModel().players) //todo
        if (controller.getCurrentPlayer().role == "explorer") this.darken()
        this.tempTrapsAndRewards()
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
    menus(inventory){
        document.getElementById("rewardsList").innerHTML = "";
        document.getElementById("trapsList").innerHTML = "";
        this.trapsMenu = document.getElementById("trapsMenu")
        this.rewardsMenu = document.getElementById("rewardsMenu")

        let trapSlotUsed = 0;
        let rewardSlotUsed = 0;
        inventory.forEach(element => {//reparti 0 et 1 en piege et recompenses
            if(element == 0){ //c'est une recompenses
                rewardSlotUsed++
                $("#rewardsList").append('<li><img class="rewards" src="/img/PNG/Default size/Environment/environment_12.png" width="'+this.spriteWidth+'" height="'+this.spriteHeight+'"></li>');
            }else { //c'est un piege
                trapSlotUsed++
                $("#trapsList").append('<li><img class="traps" src="/img/PNG/Default size/Environment/environment_04.png" width="'+this.spriteWidth+'" height="'+this.spriteHeight+'"></li>');
            }
        
        });

        for(var i = rewardSlotUsed; i < 4; i++ ){
            $("#rewardsList").append('<li><img class="rewardsEmpty" src="/img/PNG/Default size/Environment/environment_16.png" width="'+this.spriteWidth+'" height="'+this.spriteHeight+'"></li>');
        }

        for(var i = trapSlotUsed; i < 4; i++ ){
            $("#trapsList").append('<li><img class="trapsEmpty" src="/img/PNG/Default size/Environment/environment_16.png" width="'+this.spriteWidth+'" height="'+this.spriteHeight+'"></li>');
        }

        //séléctionne les pieges et rewards
        var traps=$(".traps");
        var rewards=$(".rewards");

        //deviennent draggable
        traps.draggable({
            helper:'clone',
        });
        traps.data("type","trap");
        rewards.draggable({
            helper:'clone',
        });
        rewards.data("type","rewards");


        var $canvas=$("#canva");
        //le canva est droppable
        $canvas.droppable({
            drop:dragDrop,
        });

        let t = this

        function dragDrop(e,ui){
            let Offset=$canvas.offset();
            let offsetX=Offset.left;
            let offsetY=Offset.top;
            let x=Math.round( (parseInt(ui.offset.left-offsetX)-1) / t.spriteWidth );
            let y=Math.round( (parseInt(ui.offset.top-offsetY))/t.spriteHeight );
            var data=ui.draggable.data("type");

            if(data == "trap"){
                tempTrapsRewardsArray.push(["trap",{x_:x, y_:y}])
            } else {
                tempTrapsRewardsArray.push(["rewards",{x_:x, y_:y}])
            }
        }
        
    }

    /**
     * Si il ya un piege ou une recompense en cours de placement pas encore validé par controller donc pas sur le serveur
     * on l'affiche grâce à cette fonction
     */
    tempTrapsAndRewards(){
        let trapIndex = -1
        let rewardsIndex = -1
        for (var i = 0; i < tempTrapsRewardsArray.length; i++) {
            if (tempTrapsRewardsArray[i][0] == "trap") {
                trapIndex=i//recupere index
                let x = tempTrapsRewardsArray[i][1].x_ * this.spriteWidth
                let y = tempTrapsRewardsArray[i][1].y_ * this.spriteWidth
                this.context.drawImage(this.trapAsset, x, y, this.trapAsset.width, this.trapAsset.height)
            } else {
                rewardsIndex=i 
                let x = tempTrapsRewardsArray[i][1].x_ * this.spriteWidth
                let y = tempTrapsRewardsArray[i][1].y_ * this.spriteWidth
                this.context.drawImage(this.bonusAsset, x, y, this.bonusAsset.width, this.bonusAsset.height)
            }
        }
        //si envoi
        if(trapIndex != -1 && rewardsIndex != -1){
            controller.place(tempTrapsRewardsArray[trapIndex][1] , tempTrapsRewardsArray[rewardsIndex][1], controller.getCurrentPlayer())
            //supprime le trap et reward car plus besoin
            if(trapIndex > rewardsIndex){ //si index plus grand, faut supprimer le plus grand en premier pour pas avori de bug
                tempTrapsRewardsArray.splice(trapIndex, 1)
                tempTrapsRewardsArray.splice(rewardsIndex, 1)
            } else {
                tempTrapsRewardsArray.splice(rewardsIndex, 1)
                tempTrapsRewardsArray.splice(trapIndex, 1)
            }
            document.getElementById("rewardsList").innerHTML = "";
            document.getElementById("trapsList").innerHTML = "";
            console.log("effacé menus")
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
            if(trapArray[i]){
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
    players(playersArray) {
        for (var i = 0; i < playersArray.length; i++) {
            if(playersArray[i]){
                let coordX = playersArray[i].position.x
                let coordY = playersArray[i].position.y
                //console.log(coordX,coordY)
                if(coordX >=0) this.context.drawImage(this.playerAsset, coordX * this.spriteWidth - this.biais, coordY * this.spriteHeight-this.biais, this.playerAsset.width, this.playerAsset.height)
            }
        }
    }
}
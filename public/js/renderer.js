//alexy
class Renderer {

    constructor(isShadowed_ = true) {
        this.canva = document.getElementById("renderer")
        this.canva.setAttribute('width', window.innerWidth);
        this.canva.setAttribute('height', window.innerHeight); //set à la longueur et largeur de la fenetre    

        this.context = document.getElementById("renderer").getContext("2d")

        this.context.imageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;

        this.spriteWidth = Math.floor($("#renderer")[0].clientHeight / 22)
        this.spriteHeight = Math.floor($("#renderer")[0].clientHeight / 22)
        this.halfWidth = Math.floor(this.spriteWidth / 2)
        this.halfHeight = Math.floor(this.spriteHeight / 2)

        this.isAssetLoadingOver = false

        this.isShadowed = isShadowed_
    }

    async loadAssets() {
        this.floorAsset = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_06.png", this.spriteWidth, this.spriteHeight)
        this.wallAsset = await this._syncedLoadImg("/img/PNG/Default size/Blocks/block_03.png", this.spriteWidth, this.spriteHeight)
        this.trapAsset = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_03.png", this.spriteWidth, this.spriteHeight)
        this.bonusAsset = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_04.png", this.spriteWidth, this.spriteHeight)
        this.playerAsset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_01.png", this.halfWidth, this.halfHeight) //FIXME: DELETE DIS
        this.ennemyPlayer_Back1Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_01.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Back2Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_02.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Back3Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_24.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Front1Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_22.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Front2Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_23.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Front3Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_21.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Right1Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_10.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Right2Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_11.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Right2Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_09.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Left1Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_13.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Left2Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_14.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Left3Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_12.png", this.halfWidth, this.halfHeight)

        this.mainPlayer_Front1Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_04.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Front2Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_05.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Front3Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_03.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Back1Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_07.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Back2Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_08.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Back3Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_06.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Right1Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_16.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Right2Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_17.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Right3Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_15.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Left1Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_19.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Left2Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_20.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Left3Asset = await this._syncedLoadImg("/img/PNG/Retina/Player/player_18.png", this.halfWidth, this.halfHeight)

        this.anonymousEntityAsset = await this._syncedLoadImg("/img/PNG/Default%20size/Environment/environment_07.png", this.spriteWidth, this.spriteHeight) //ground 07 apperement mais il existe pas enculé >:(

        this.isAssetLoadingOver = true
    }


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

    clearAll() {
        this.context.clearRect(0, 0, this.canva.width, this.canva.height);
    }

    render() {
        this.map(controller.getModel().map) //todo rajouter les paramètres
        this.traps(controller.getModel().traps) //todo
        this.bonus(controller.getModel().rewards) //todo
        this.players(controller.getModel().players) //todo
        if (this.isShadowed) this.darken()
        //window.requestAnimationFrame(this.render)

    }

    //recoit un tableau de 0 et 1
    //1 est un mur, 0 est du sol
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
    //rend sombre tout autour du joueur
    darken() {
        let myPlayer = controller.getCurrentPlayer()
        let coordX = myPlayer.position.x
        let coordY = myPlayer.position.y
        this.context.beginPath()
        this.context.rect(0, 0, 30 * this.spriteWidth, 20 * this.spriteHeight);
        console.log("renderer.darken()",myPlayer,coordX,coordY)
        this.context.arc(coordX * this.spriteWidth, coordY * this.spriteHeight, 55, 0, Math.PI * 2, true);
        this.context.fill();
    }


    traps(trapArray) {
        for (var i = 0; i < trapArray.length; i++) {
            let coordX = trapArray[i].position.x
            let coordY = trapArray[i].position.y
            console.log("renderer.traps()",coordX,coordY)
            let myPlayer = controller.getCurrentPlayer()
            if (myPlayer.role == true) {
                this.context.drawImage(this.anonymousEntityAsset, coordX * this.anonymousEntityAsset.width, coordY * this.anonymousEntityAsset.height, this.anonymousEntityAsset.width, this.anonymousEntityAsset.height) // Entité anonyme 
            } else {
                this.context.drawImage(this.trapAsset, coordX * this.trapAsset.width, coordY * this.trapAsset.height, this.trapAsset.width, this.trapAsset.height) // Entité piège
            }
        }
    }
    
    bonus(bonusArray) {
        for (var i = 0; i < bonusArray.length; i++) {
            let coordX = bonusArray[i].x
            let coordY = bonusArray[i].y
            let myPlayer = controller.getCurrentPlayer()
            if (myPlayer.role == true) {
                this.context.drawImage(this.anonymousEntityAsset, coordX * this.anonymousEntityAsset.width, coordY * this.anonymousEntityAsset.height, this.anonymousEntityAsset.width, this.anonymousEntityAsset.height) // Entité anonyme 
            } else {
                this.context.drawImage(this.bonusAsset, coordX * this.bonusAsset.width, coordY * this.bonusAsset.height, this.bonusAsset.width, this.bonusAsset.height) // Entité bonus

            }
        }
    }

    players(playersArray) {
        for (var i = 0; i < playersArray.length; i++) {
            if(playersArray[i]){
                let coordX = playersArray[i].position.x
                let coordY = playersArray[i].position.y

                this.context.drawImage(this.playerAsset, coordX * this.playerAsset.halfWidth, coordY * this.playerAsset.halfHeight, this.playerAsset.halfWidth, this.playerAsset.halfHeight) // Entité bonus
            }
        }
    }
}
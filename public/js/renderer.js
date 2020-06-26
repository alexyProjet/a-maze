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
        this.floor = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_06.png", this.spriteWidth, this.spriteHeight)
        this.wall = await this._syncedLoadImg("/img/PNG/Default size/Blocks/block_03.png", this.spriteWidth, this.spriteHeight)
        this.trap = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_03.png", this.spriteWidth, this.spriteHeight)
        this.bonus = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_04.png", this.spriteWidth, this.spriteHeight)

        this.player = await this._syncedLoadImg("/img/PNG/Retina/Player/player_01.png", this.halfWidth, this.halfHeight) //FIXME: DELETE DIS


        this.ennemyPlayer_Back1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_01.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Back2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_02.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Back3 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_24.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Front1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_22.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Front2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_23.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Front3 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_21.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Right1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_10.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Right2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_11.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Right2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_09.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Left1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_13.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Left2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_14.png", this.halfWidth, this.halfHeight)
        this.ennemyPlayer_Left3 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_12.png", this.halfWidth, this.halfHeight)

        this.mainPlayer_Front1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_04.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Front2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_05.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Front3 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_03.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Back1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_07.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Back2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_08.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Back3 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_06.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Right1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_16.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Right2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_17.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Right3 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_15.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Left1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_19.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Left2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_20.png", this.halfWidth, this.halfHeight)
        this.mainPlayer_Left3 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_18.png", this.halfWidth, this.halfHeight)

        this.anonymousEntity = await this._syncedLoadImg("/img/PNG/Default%20size/Environment/environment_07.png", this.spriteWidth, this.spriteHeight) //ground 07 apperement mais il existe pas enculé >:(

        this.isAssetLoadingOver = true
    }


    async _syncedLoadImg(src_, width_, height_) {
        let ctx = this.context
        return await new Promise((resolve, reject) => {
            let result = new Image(width_, height_)
            result.src = src_
            result.onload = () => {
                //console.log(ctx)
                //ctx.imageSmoothingEnabled = false; // empeche que ce soit degueu EN FAIT NON MDR
                resolve(result)
            }
            result.onerror = reject
        }).catch(error => console.log(error))
    }

    clearAll() {
        this.context.clearRect(0, 0, this.canva.width, this.canva.height);
    }

    render() {
        this.map() //todo rajouter les paramètres
        this.traps() //todo
        this.bonus() //todo
        this.players() //todo
        if (this.isShadowed) this.darken()
        window.requestAnimationFrame(this.render)
    }

    //recoit un tableau de 0 et 1
    //1 est un mur, 0 est du sol
    map(mapArray) {
        //temp
        //let mapArray = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1], [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1], [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1], [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1], [1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1], [1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], [1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1], [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1], [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1], [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]

        for (var i = 0; i < mapArray.length; i++) {
            for (var j = 0; j < mapArray[i].length; j++) {
                this.context.drawImage(this.floor, j * this.floor.width, i * this.floor.height, this.floor.width, this.floor.height) //rend le sol
                if (mapArray[i][j] == 1) {
                    this.context.drawImage(this.wall, j * this.wall.width, i * this.wall.height, this.wall.width, this.wall.height) //canva block_03 c'est un mur
                }
            }
        }
    }
    //rend sombre tout autour du joueur
    darken() {
        let myPlayer = controller.getModel().players.filter(p => p.id == controller.getModel().currentPlayer)[0]
        let coordX = myPlayer.position.x
        let coordY = myPlayer.position.y
        this.context.beginPath()
        this.context.rect(0, 0, 30 * this.spriteWidth, 20 * this.spriteHeight);
        console.log("ack",myPlayer,coordX,coordY)
        this.context.arc(coordX * this.spriteWidth, coordY * this.spriteHeight, 55, 0, Math.PI * 2, true);
        this.context.fill();
    }


    traps(trapArray) {
        for (var i = 0; i < trapArray.length; i++) {
            let coordX = trapArray[i].position.x
            let coordY = trapArray[i].position.y
            console.log("ackack",coordX,coordY)
            let myPlayer = controller.getModel().players.filter(p => p.id == controller.getModel().currentPlayer)[0]
            if (myPlayer.role == true) {
                this.context.drawImage(this.anonymousEntity, coordX * this.anonymousEntity.width, coordY * this.anonymousEntity.height, this.anonymousEntity.width, this.anonymousEntity.height) // Entité anonyme 
            } else {
                this.context.drawImage(this.trap, coordX * this.trap.width, coordY * this.trap.height, this.trap.width, this.trap.height) // Entité piège
            }
        }
    }
    bonus(bonusArray) {
        for (var i = 0; i < bonusArray.length; i++) {
            let coordX = bonusArray[i].x
            let coordY = bonusArray[i].y
            let myPlayer = controller.getModel().players.filter(p => p.id == controller.getModel().currentPlayer)[0]
            if (myPlayer.role == true) {
                this.context.drawImage(this.anonymousEntity, coordX * this.anonymousEntity.width, coordY * this.anonymousEntity.height, this.anonymousEntity.width, this.anonymousEntity.height) // Entité anonyme 
            } else {
                this.context.drawImage(this.bonus, coordX * this.bonus.width, coordY * this.bonus.height, this.bonus.width, this.bonus.height) // Entité bonus

            }
        }
    }

    players(playersArray) {
        for (var i = 0; i < playersArray.length; i++) {
            if(playersArray[i]){
                let coordX = playersArray[i].position.x
                let coordY = playersArray[i].position.y
                console.log("ackackackacacacacac",coordX,coordY,this.player)

                this.context.drawImage(this.player, coordX * this.player.halfWidth, coordY * this.player.halfHeight, this.player.halfWidth, this.player.halfHeight) // Entité bonus
            }
        }
    }
}
class Renderer{

    constructor(){
        this.canva = document.getElementById("renderer")
        this.canva.setAttribute('width', window.innerWidth);
        this.canva.setAttribute('height', window.innerHeight); //set à la longueur et largeur de la fenetre    

        this.context = document.getElementById("renderer").getContext("2d")

        this.context.imageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;

        this.spriteWidth = Math.floor($("#renderer")[0].clientHeight / 22)
        this.spriteHeight = Math.floor($("#renderer")[0].clientHeight / 22)

        this.isAssetLoadingOver = false
    }

    async loadAssets(){
        this.floor = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_06.png", this.spriteWidth, this.spriteHeight)
        this.wall = await this._syncedLoadImg("/img/PNG/Default size/Blocks/block_03.png", this.spriteWidth, this.spriteHeight)
        this.trap = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_03.png", this.spriteWidth, this.spriteHeight)
        this.bonus = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_04.png", this.spriteWidth, this.spriteHeight)

        let halfWidth = Math.floor(this.spriteWidth/2)
        let halfHeight = Math.floor(this.spriteHeight/2)
        
        this.ennemyPlayer_Back1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_01.png", halfWidth, halfHeight)
        this.ennemyPlayer_Back2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_02.png", halfWidth, halfHeight)
        this.ennemyPlayer_Back3 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_24.png", halfWidth, halfHeight)
        this.ennemyPlayer_Front1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_22.png", halfWidth, halfHeight)
        this.ennemyPlayer_Front2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_23.png", halfWidth, halfHeight)
        this.ennemyPlayer_Front3 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_21.png", halfWidth, halfHeight)
        this.ennemyPlayer_Right1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_10.png", halfWidth, halfHeight)
        this.ennemyPlayer_Right2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_11.png", halfWidth, halfHeight)
        this.ennemyPlayer_Right2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_09.png", halfWidth, halfHeight)
        this.ennemyPlayer_Left1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_13.png", halfWidth, halfHeight)
        this.ennemyPlayer_Left2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_14.png", halfWidth, halfHeight)
        this.ennemyPlayer_Left3 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_12.png", halfWidth, halfHeight)

        this.mainPlayer_Front1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_04.png", halfWidth, halfHeight)
        this.mainPlayer_Front2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_05.png", halfWidth, halfHeight)
        this.mainPlayer_Front3 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_03.png", halfWidth, halfHeight)
        this.mainPlayer_Back1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_07.png", halfWidth, halfHeight)
        this.mainPlayer_Back2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_08.png", halfWidth, halfHeight)
        this.mainPlayer_Back3 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_06.png", halfWidth, halfHeight)
        this.mainPlayer_Right1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_16.png", halfWidth, halfHeight)
        this.mainPlayer_Right2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_17.png", halfWidth, halfHeight)
        this.mainPlayer_Right3 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_15.png", halfWidth, halfHeight)
        this.mainPlayer_Left1 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_19.png", halfWidth, halfHeight)
        this.mainPlayer_Left2 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_20.png", halfWidth, halfHeight)
        this.mainPlayer_Left3 = await this._syncedLoadImg("/img/PNG/Retina/Player/player_18.png", halfWidth, halfHeight)
        
        this.anonymousEntity = await this._syncedLoadImg("/img/PNG/Default%20size/Environment/environment_07.png", this.spriteWidth, this.spriteHeight) //ground 07 apperement mais il existe pas enculé >:(

        this.isAssetLoadingOver = true
    }

    
    async _syncedLoadImg(src_, width_, height_){
        let ctx = this.context
        return await new Promise( (resolve, reject) =>{
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

    clearAll(){
        this.context.clearRect(0, 0, this.canva.width, this.canva.height);
    }
  
    //recoit un tableau de 0 et 1
    //1 est un mur, 0 est du sol
    map(mapArray){
        for (var i = 0; i < mapArray.length; i++) {
            for (var j = 0; j < mapArray[i].length; j++) {
                this.context.drawImage(this.floor, j * this.floor.width, i * this.floor.height, this.floor.width, this.floor.height) //rend le sol
                if (mapArray[i][j] == 1) {
                  	this.context.drawImage(this.wall, j * this.wall.width, i * this.wall.height, this.wall.width, this.wall.height) //canva block_03 c'est un mur
                }
                
            }
        }
    }

    traps(trapArray){
        for (var i = 0; i < trapArray.length; i++) {
            let coordX = trapArray[i].x
            let coordY = trapArray[i].y
            if (myPlayer.role == "explorer") {
                 this.context.drawImage(this.anonymousEntity, j * this.spriteWidth, i * this.spriteHeight, this.spriteWidth, this.spriteHeight) // Entité anonyme 
            } else {
                this.context.drawImage(this, j * this.spriteWidth, i * this.spriteHeight, this.spriteWidth, this.this.spriteHeight) // Entité piège
            }
        }
    }

    bonus(bonusArray){
        for (var i = 0; i < bonusArray.length; i++) {
            let coordX = bonusArray[i].x
            let coordY = bonusArray[i].y
            if (myPlayer.role == "explorer") {
                this.context.drawImage(this.anonymousEntity, j * this.spriteWidth, i * this.spriteHeight, this.spriteWidth, this.spriteHeight) // Entité anonyme 
            } else {
                this.context.drawImage(this.bonus, j * this.spriteWidth, i * this.spriteHeight, this.spriteWidth, this.this.spriteHeight) // Entité bonus
            }
        }
    }

    players(playersArray){
        for (var i = 0; i < playersArray.length; i++) {
            let coordX = playersArray[i].x
            let coordY = playersArray[i].y
            this.context.drawImage(this.player, j * this.spriteWidth, i * this.spriteHeight, this.spriteWidth, this.spriteHeight) // Entité bonus
        }
    }

}
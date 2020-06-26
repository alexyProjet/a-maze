class Renderer{

    constructor(){
        this.canva = document.getElementById("renderer")
        this.canva.setAttribute('width', window.innerWidth);
        this.canva.setAttribute('height', window.innerHeight); //set à la longueur et largeur de la fenetre    

        this.context = document.getElementById("renderer").getContext("2d")

        this.context.imageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
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
        this.anonymousEntity = await this._syncedLoadImg("/img/PNG/Default size/Ground/environment_07.png", this.spriteWidth, this.spriteHeight)
        this.player = await this._syncedLoadImg("/img/PNG/Default size/Ground/player_01.png", this.spriteWidth, this.spriteHeight)
        this.isAssetLoadingOver = true
    }

    async _syncedLoadImg(src_, width_, height_){
        return await new Promise( (resolve, reject) =>{
            let result = new Image(width_, height_)
            result.src = src_
            result.onload = () => resolve(result)
            result.onerror = reject
        })
    }

    clearAll(){
        this.context.clearRect(0, 0, this.canva.width, this.canva.height);
    }
  
    //recoit un tableau de 0 et 1
    //1 est un mur, 0 est du sol
    map(mapArray){
        for (var i = 0; i < mapArray.length; i++) {
            for (var j = 0; j < mapArray[i].length; j++) {
                if (mapArray[i][j] == 0) {
                    this.context.drawImage(this.floor, j * this.floor.width, i * this.floor.height, this.floor.width, this.floor.height) //rend le sol
                }
                else {
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
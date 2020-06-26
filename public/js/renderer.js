class Renderer{

    constructor(){
        this.context = document.getElementById("renderer").getContext("2d")

        this.spriteWidth = Math.floor($("#renderer")[0].clientWidth / 60)
        this.spriteHeight = Math.floor($("#renderer")[0].clientHeight / 60)

        this.isAssetLoadingOver = false
    }

    async loadAssets(){
        this.floor = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_06.png", this.spriteWidth, this.spriteHeight)
        this.wall = await this._syncedLoadImg("/img/PNG/Default size/Blocks/block_03.png", this.spriteWidth, this.spriteHeight)
        this.trap = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_03.png", this.spriteWidth, this.spriteHeight)
        this.bonus = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_04.png", this.spriteWidth, this.spriteHeight)

        this.ennemyPlayer_Back1 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_01.png", this.spriteWidth/2, this.spriteHeight/2)
        this.ennemyPlayer_Back2 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_02.png", this.spriteWidth/2, this.spriteHeight/2)
        this.ennemyPlayer_Back3 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_24.png", this.spriteWidth/2, this.spriteHeight/2)
        this.ennemyPlayer_Front1 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_22.png", this.spriteWidth/2, this.spriteHeight/2)
        this.ennemyPlayer_Front2 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_23.png", this.spriteWidth/2, this.spriteHeight/2)
        this.ennemyPlayer_Front3 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_21.png", this.spriteWidth/2, this.spriteHeight/2)
        this.ennemyPlayer_Right1 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_10.png", this.spriteWidth/2, this.spriteHeight/2)
        this.ennemyPlayer_Right2 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_11.png", this.spriteWidth/2, this.spriteHeight/2)
        this.ennemyPlayer_Right2 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_09.png", this.spriteWidth/2, this.spriteHeight/2)
        this.ennemyPlayer_Left1 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_13.png", this.spriteWidth/2, this.spriteHeight/2)
        this.ennemyPlayer_Left2 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_14.png", this.spriteWidth/2, this.spriteHeight/2)
        this.ennemyPlayer_Left3 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_12.png", this.spriteWidth/2, this.spriteHeight/2)


        this.mainPlayer_Front1 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_04.png", this.spriteWidth/2, this.spriteHeight/2)
        this.mainPlayer_Front2 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_05.png", this.spriteWidth/2, this.spriteHeight/2)
        this.mainPlayer_Front3 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_03.png", this.spriteWidth/2, this.spriteHeight/2)
        this.mainPlayer_Back1 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_07.png", this.spriteWidth/2, this.spriteHeight/2)
        this.mainPlayer_Back2 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_08.png", this.spriteWidth/2, this.spriteHeight/2)
        this.mainPlayer_Back3 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_06.png", this.spriteWidth/2, this.spriteHeight/2)
        this.mainPlayer_Right1 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_16.png", this.spriteWidth/2, this.spriteHeight/2)
        this.mainPlayer_Right2 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_17.png", this.spriteWidth/2, this.spriteHeight/2)
        this.mainPlayer_Right3 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_15.png", this.spriteWidth/2, this.spriteHeight/2)
        this.mainPlayer_Left1 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_19.png", this.spriteWidth/2, this.spriteHeight/2)
        this.mainPlayer_Left2 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_20.png", this.spriteWidth/2, this.spriteHeight/2)
        this.mainPlayer_Left3 = await this._syncedLoadImg("file:///home/breizh/Desktop/Game2/public/img/PNG/Retina/Player/player_18.png", this.spriteWidth/2, this.spriteHeight/2)

        this.isAssetLoadingOver = true
    }

    async _syncedLoadImg(src_, width_, height_){
        let ctx = this.context
        return await new Promise( (resolve, reject) =>{
            let result = new Image(width_, height_)
            result.src = src_
            result.onload = () => {
                console.log(ctx)
                ctx.imageSmoothingEnabled = false; // empeche que ce soit degueu EN FAIT NON MDR
                resolve(result)
            }
            result.onerror = reject
        })
    }

    /*
    //recoit un tableau de 0 et 1
    //1 est un mur, 0 est du sol
    map(mapArray){
        for (var i = 0; i < mapArray.length; i++) {
            for (var j = 0; j < mapArray.length; j++) {
                if (mapArray[i][j] == 0) {
                    //canva render img  ground_06.png c'est du sol
                }
                else {
                }
                //canva block_03 c'est un mur
            }
        }
    }

    trap(trapArray){
        for (var i = 0; i < trapArray.length; i++) {
            float coordX = trapArray[i].x
            float coordY = trapArray[i].y
            if (myPlayer.role == "explorer") {
                //canvamescouilles x et y afficher environment07 
            } else {
                //canvamescouilles x et y afficher environment05 
            }
        }
    }

    bonus(bonusArray){
        for (var i = 0; i < bonusArray.length; i++) {
            float coordX = bonusArray[i].x
            float coordY = bonusArray[i].y
            if (myPlayer.role == "explorer") {
                //canvamescouilles x et y afficher environment07 
            } else {
                //canvamescouilles x et y afficher environment12
            }
        }
    }

    players(playersArray){
        for (var i = 0; i < playersArray.length; i++) {spriteWidth
            //canva draw mes couilles x y :)
        }
    }*/

    _numToImg(number_) {
        switch (number_) {
            case 0:
                return this.floor
            case 1:
                return this.wall
            case 2:
                return this.trap
            case 3:
                return this.bonus
        }
    }


    /** 
     * Fait le rendu de la même avec chaque case qui correspond au numéro donné
     * 0: sol
     * 1: mur
     * 2: piège
     * 3: bonus
     */
    renderMap(mapArray_) {
        if(!this.isAssetLoadingOver) {
            console.log("Les assets ont pas eu le temps de se charger :/")
            return false
        }
        for (let i in mapArray_) {
            for (let j in mapArray_[i]) {
                this.context.drawImage(this._numToImg(mapArray_[i][j]), j * this.spriteWidth, i * this.spriteHeight, this.spriteWidth, this.spriteHeight)
            }
        }
        return true
    }

}
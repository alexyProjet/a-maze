class Renderer{

    constructor(){
        this.context = document.getElementById("renderer").getContext("2d")

        this.spriteWidth = Math.floor($("#renderer")[0].clientWidth / 60)
        this.spriteHeight = Math.floor($("#renderer")[0].clientHeight / 40)

        this.isAssetLoadingOver = false
    }

    async loadAssets(){
        this.floor = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_06.png", this.spriteWidth, this.spriteHeight)
        this.wall = await this._syncedLoadImg("/img/PNG/Default size/Blocks/block_03.png", this.spriteWidth, this.spriteHeight)
        this.trap = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_03.png", this.spriteWidth, this.spriteHeight)
        this.bonus = await this._syncedLoadImg("/img/PNG/Default size/Ground/ground_04.png", this.spriteWidth, this.spriteHeight)
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
        for (var i = 0; i < playersArray.length; i++) {
            float coordX = playersArray[i].x
            float coordY = playersArray[i].y
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
                console.log(j * this.spriteWidth, i * this.spriteHeight, this.spriteWidth, this.spriteHeight)
            }
        }
        return true
    }

    renderOnce(num_){
        this.context.drawImage(this._numToImg(num_), 0, 0)
    }


}

[
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]
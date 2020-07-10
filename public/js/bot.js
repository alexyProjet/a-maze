class Bot {
    /**
     * -1 : mur (bloquant)
     * 0 : sol (marchable)
     * 1 : mur (bloquant)
     * 2 : mur detruit (marchable)
     * 3 : trace bombe (marchable)
     */
    constructor(refreshR, botName, speed) {
        this.refreshRate = refreshR*3
        this.name = botName
        this.intervalMove = null
        this.intervalPlace = null
        this.refreshModel = null
        this.model = null
        this.alreadyVisited = []
        this.nextCase = { x: null, y: null }
        this.actualCase = { x: null, y: null }
        this.dir = ""
        this.speed = speed*3
        this.fallBack = 0 //permet de revenir en arrière quand cul de sac
        this.entityMap = [[]] //contient une simulation de souvenir lorsque le bot était trapper, chaque entité à un pourcentage de "confiance"
        this.isOnEntityCase = false
    }

    startBot() {
        let self = this
        self.model = controller.getModel()
        let myPlayer = self.model.players.find(pl => pl.name == self.name)
        let yBot = myPlayer.position.x //échange car tableau fonctionne inversé
        let xBot = myPlayer.position.y
        this.actualCase.x = Math.floor(myPlayer.position.x)
        this.actualCase.y = Math.floor(myPlayer.position.y)
        this.nextCase = this.chooseNextCase(xBot, yBot, self.model)
        this.refreshModel = setInterval(function () { self.model = controller.getModel()}, 1000);
        this.intervalMove = setInterval(function () { self.makeMove(self); }, self.refreshRate);
        this.intervalPlace = setInterval(function () { self.place(self); }, 8000);
        console.log("bot : ", this.name, " starting....")
        this.directionReverse = { down: "up", up: "down", right: "left", left: "right" }
    }

    place(self) {
        let bot = self.model.players.find(pl => pl.name == self.name)
        if (bot.role == "trapper" && bot.inventory.length != 0) {
            let trapCoord = null
            let rewardCoord = null

            let map = self.model.map
            let mapLimitX = map.length
            let mapLimitY = map[0].length

            while (trapCoord == null) {
                let x = Math.floor(Math.random() * (mapLimitX - 1) + 1)
                let y = Math.floor(Math.random() * (mapLimitY - 1) + 1)

                if (map[x][y] != -1 && map[x][y] != 1) {
                    trapCoord = { x_: x, y_: y }
                }
            }

            while (rewardCoord == null) {
                let x = Math.floor(Math.random() * (mapLimitX - 1) + 1)
                let y = Math.floor(Math.random() * (mapLimitY - 1) + 1)

                if (map[x][y] != -1 && map[x][y] != 1) {
                    rewardCoord = { x_: x, y_: y }
                }
            }

            controller.place({ x_: trapCoord.y_, y_: trapCoord.x_ }, { x_: rewardCoord.y_, y_: rewardCoord.x_ }, bot.name)
        }
    }

    makeMove(self) {
        let bot = self.model.players.find(pl => pl.name == self.name)

        if (bot.role == "explorer") {
            let yBot = bot.position.x //échange car tableau fonctionne inversé
            let xBot = bot.position.y
            let myBotPosition = bot.position
            self.actualCase.x = Math.floor(bot.position.y)
            self.actualCase.y = Math.floor(bot.position.x)

            if (self.nextCase.x == self.actualCase.x && self.nextCase.y == self.actualCase.y) { //on est sur la case suivante
                if (self.isOnEntityCase) {
                    controller.moveBot(myBotPosition, self.name, "onEntity", self.dir) //position, name, moveType,dir   
                    self.isOnEntityCase = false
                } else {
                    self.nextCase = self.chooseNextCase(xBot, yBot, self.model)
                }
            } else {
                self.move(self.dir, myBotPosition)
            }
        }
    }

    entityAccessibleInView() {

    }

    move(dir, position) {
        switch (dir) {
            case 'up':
                position.y = position.y - this.speed
                break;
            case 'down':
                position.y = position.y + this.speed
                break;
            case 'left':
                position.x = position.x - this.speed
                break;
            case 'right':
                position.x = position.x + this.speed
                break;
            default:
                console.log(`erreur moveBot`);
        }
        controller.moveBot(position, this.name, "move", this.dir) //position, name, moveType,dir   
    }

    isEntityAround(x, y, mod) {
        x = Math.floor(x)
        y = Math.floor(y)
        let res = null

        mod.entities.some(function (entite) {
            if (entite.position.y_ == x + 1 && entite.position.x_ == y) { //pas un mur
                res = { x: x + 1, y: y, dir: "down" }
                return true
            }
            if (entite.position.y_ == x - 1 && entite.position.x_ == y) { //pas un mur
                res = { x: x - 1, y: y, dir: "up" }
                return true
            }
            if (entite.position.y_ == x && entite.position.x_ == y + 1) { //pas un mur
                res = { x: x, y: y + 1, dir: "right" }
                return true
            }
            if (entite.position.y_ == x && entite.position.x_ == y - 1) { //pas un mur
                res = { x: x, y: y - 1, dir: "left" }
                return true
            }
        })

        return res
    }

    chooseNextCase(xBot, yBot, mod) {
        let newPossibilities = []
        let coordEntity = this.isEntityAround(xBot, yBot, mod)

        if (coordEntity != null) {
            this.isOnEntityCase = true
            newPossibilities.push({ x: coordEntity.x, y: coordEntity.y, dir: coordEntity.dir })
        } else {
            if (this.isCaseFree(xBot + 1, yBot, mod)) { //haut
                if (!this.isCaseVisited(xBot + 1, yBot, mod)) {
                    newPossibilities.push({ x: xBot + 1, y: yBot, dir: "down" })
                }
            }
            if (this.isCaseFree(xBot - 1, yBot, mod)) {
                if (!this.isCaseVisited(xBot - 1, yBot, mod)) {
                    newPossibilities.push({ x: xBot - 1, y: yBot, dir: "up" })
                }
            }
            if (this.isCaseFree(xBot, yBot - 1, mod)) {
                if (!this.isCaseVisited(xBot, yBot - 1, mod)) {
                    newPossibilities.push({ x: xBot, y: yBot - 1, dir: "left" })
                }
            }
            if (this.isCaseFree(xBot, yBot + 1, mod)) {
                if (!this.isCaseVisited(xBot, yBot + 1, mod)) {
                    newPossibilities.push({ x: xBot, y: yBot + 1, dir: "right" })
                }
            }
        }

        if (newPossibilities.length != 0) {
            let nxt = newPossibilities[Math.floor(Math.random() * newPossibilities.length)]
            this.dir = nxt.dir
            this.alreadyVisited.push({ x: Math.floor(nxt.x), y: Math.floor(nxt.y) })
            if (this.fallBack != 0) {
                this.alreadyVisited = []
            }
            this.fallBack = 0
            return { x: Math.floor(nxt.x), y: Math.floor(nxt.y) } //reinverse

        } else {
            this.fallBack++
            let coord = this.alreadyVisited[(this.alreadyVisited.length - 1) - this.fallBack]
            this.dir = this.getDirection(this.actualCase.x, this.actualCase.y, coord.x, coord.y)
            return { x: coord.x, y: coord.y }
        }
    }
    //retourne vrai si jamais visités et pas un mur
    isCaseFree(x, y, mod) {
        x = Math.floor(x)
        y = Math.floor(y)
        if (mod.map[x][y] != 1 && mod.map[x][y] != -1) { //pas un mur
            return true
        }
        return false
    }

    isCaseVisited(x, y, mod) {
        x = Math.floor(x)
        y = Math.floor(y)
        let isVisited = this.alreadyVisited.some(pos => { //vrai si deja visité
            if (Math.floor(pos.x) == x && Math.floor(pos.y) == y) {
                console.log("true")
                return true
            }
        })
        if (isVisited) {
            return true
        } else {
            return false
        }
    }

    getDirection(oldX, oldY, newX, newY) {
        if (oldX < newX) {
            return "down"
        }
        if (oldX > newX) {
            return "up"
        }
        if (oldY < newY) {
            return "right"
        }
        if (oldY > newY) {
            return "left"
        }
    }

}
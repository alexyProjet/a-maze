
    var zKey = false;
    var sKey = false
    var qKey = false
    var dKey = false
    var speed = 0.15
    var myPlayerPosition = null
    var oldX = -1
    var oldY = -1
    var interval = null
    var renderPlayerTimeOut = null

    function initListener() {
        console.log("initializing listener....")
        myPlayerPosition = Object.assign({}, controller.getCurrentPlayer().position)
        oldY = myPlayerPosition.y
        oldX = myPlayerPosition.x
        setInterval(routine, refreshRate)
        console.log("listener initialised", oldX, oldY, myPlayerPosition)
    }

    var isWallPresent = { up: false, down: false, right: false, left: false }
    const position = (x, y) => Object({ x, y }) //creer un objet position

    const collisionUpDown = (pos, size) => {
        let a = [
            position(Math.floor(pos.x - size), Math.floor(pos.y - size)),// haut ET gauche
            position(Math.floor(pos.x - size), Math.floor(pos.y + size)),// haut droite
            position(Math.floor(pos.x + size), Math.floor(pos.y + size)),// bas droite
            position(Math.floor(pos.x + size), Math.floor(pos.y - size))// bas gauche
        ]
        console.log(a)
        return a
    }

    const playerHalfSize = 0.25
    function routine() {
        if (gameStarted) {
            if (zKey) {
                controller.getCurrentPlayer().direction = "up"
                let newY = myPlayerPosition.y - speed
                let newX = myPlayerPosition.x
                if (qKey || dKey) newY = myPlayerPosition.y - speed / 2.0

                if (Math.floor(newY) != Math.floor(oldY)) { //Si changement de case
                    console.log("NEW CASE", newX, newY)
                    oldY = newY
                    oldX = newX
                    myPlayerPosition.y = newY
                    controller.moveTo(myPlayerPosition,"up")
                }

                if (newY - Math.floor(newY) > playerHalfSize) { //si pas mur et veut avancer
                    oldY = myPlayerPosition.y
                    oldX = myPlayerPosition.x
                    myPlayerPosition.y = newY //c'est Okay on avance
                    controller.moveTo(myPlayerPosition,"up")
                } else {
                    let isColliding = collisionUpDown(position(newX, newY), playerHalfSize).some(pos => controller.getModel().map[pos.y][pos.x] == 1)
                    if (!isColliding) {
                        oldY = myPlayerPosition.y
                        oldX = myPlayerPosition.x
                        myPlayerPosition.y = newY //c'est Okay on avance
                        controller.moveTo(myPlayerPosition,"up")
                    } else {
                        console.log("UP STOPPED CAR COLLISION")
                        zKey = false
                    }
                }

            } else if (sKey) {
                controller.getCurrentPlayer().direction = "down"
                let newY = myPlayerPosition.y + speed
                let newX = myPlayerPosition.x
                if (qKey || dKey) newY = myPlayerPosition.y + speed / 2.0

                if (Math.floor(newY) != Math.floor(oldY)) { //Si changement de case
                    console.log("NEW CASE", newX, newY)
                    oldY = newY
                    oldX = newX
                    myPlayerPosition.y = newY
                    controller.moveTo(myPlayerPosition,"down")
                }

                if (Math.floor(newY + 1) - newY > playerHalfSize) { //si pas mur et veut avancer
                    oldY = myPlayerPosition.y
                    oldX = myPlayerPosition.x
                    myPlayerPosition.y = newY //c'est Okay on avance
                    controller.moveTo(myPlayerPosition,"down")
                } else {
                    let isColliding = collisionUpDown(position(newX, newY), playerHalfSize).some(pos => controller.getModel().map[pos.y][pos.x] == 1)
                    if (!isColliding) {
                        oldY = myPlayerPosition.y
                        oldX = myPlayerPosition.x
                        myPlayerPosition.y = newY //c'est Okay on avance
                        controller.moveTo(myPlayerPosition,"down")
                    } else {
                        console.log("DOWN STOPPED CAR COLLISION")
                        sKey = false
                    }
                }
            }
            if (qKey) {
                controller.getCurrentPlayer().direction = "left"
                let newY = myPlayerPosition.y
                let newX = myPlayerPosition.x - speed
                if (sKey || zKey) newX = myPlayerPosition.x - speed / 2.0

                if (Math.floor(newX) != Math.floor(oldX)) { //Si changement de case
                    console.log("NEW CASE", newX, newY)
                    oldY = newY
                    oldX = newX
                    myPlayerPosition.x = newX
                    controller.moveTo(myPlayerPosition,"left")
                }

                if (newX - Math.floor(newX) > playerHalfSize) { //si pas mur et veut avancer
                    oldY = myPlayerPosition.y
                    oldX = myPlayerPosition.x
                    myPlayerPosition.x = newX //c'est Okay on avance
                    controller.moveTo(myPlayerPosition,"left")
                } else {
                    let isColliding = collisionUpDown(position(newX, newY), playerHalfSize).some(pos => controller.getModel().map[pos.y][pos.x] == 1)
                    if (!isColliding) {
                        oldY = myPlayerPosition.y
                        oldX = myPlayerPosition.x
                        myPlayerPosition.x = newX //c'est Okay on avance
                        controller.moveTo(myPlayerPosition,"left")
                    } else {
                        console.log("LEFT STOPPED CAR COLLISION")
                        qKey = false
                    }
                }
                console.log("Q touche : ", newX)

            } else if (dKey) {
                controller.getCurrentPlayer().direction = "right"
                let newY = myPlayerPosition.y
                let newX = myPlayerPosition.x + speed
                if (sKey || zKey) newX = myPlayerPosition.x + speed / 2.0

                if (Math.floor(newX) != Math.floor(oldX)) { //Si changement de case
                    console.log("NEW CASE", newX, newY)
                    oldY = newY
                    oldX = newX
                    myPlayerPosition.x = newX
                    controller.moveTo(myPlayerPosition,"right")
                }

                if (Math.floor(newX + 1) - newX > playerHalfSize) { //si pas mur et veut avancer
                    oldY = myPlayerPosition.y
                    oldX = myPlayerPosition.x
                    myPlayerPosition.x = newX //c'est Okay on avance
                    controller.moveTo(myPlayerPosition,"right")
                } else {
                    let isColliding = collisionUpDown(position(newX, newY), playerHalfSize).some(pos => controller.getModel().map[pos.y][pos.x] == 1)
                    if (!isColliding) {
                        oldY = myPlayerPosition.y
                        oldX = myPlayerPosition.x
                        myPlayerPosition.x = newX //c'est Okay on avance
                        controller.moveTo(myPlayerPosition,"right")
                    } else {
                        console.log("RIGHT STOPPED CAR COLLISION")
                        dKey = false
                    }
                }
                console.log("d touche : ", newX)
            }
        }
    }

    document.body.onkeypress = function (event) {
        switch (event.key.toLowerCase()) {
            case 'z':
                zKey = true;
                break;
            case 's':
                sKey = true;
                break;
            case 'q':
                qKey = true;

                break;
            case 'd':
                dKey = true;
                break;
            default:
                break;
        }

    };

    document.body.onkeyup = function (event) {
        switch (event.key.toLowerCase()) {
            case 'z':
                zKey = false;
                break;
            case 's':
                sKey = false;
                break;
            case 'q':
                qKey = false;
                break;
            case 'd':
                dKey = false;
                break;
            default:
                break;
        }
    };
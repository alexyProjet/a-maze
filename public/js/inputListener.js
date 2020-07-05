var zKey = false;
var sKey = false
var qKey = false
var dKey = false
var speed = 0.11
var myPlayerPosition = null
var oldX = -1
var oldY = -1
var interval = null
var renderPlayerTimeOut = null

$(() => {
    
    function initListener() {
        console.log("initializing listener....")
        myPlayerPosition = Object.assign({}, controller.getCurrentPlayer().position)
        oldY = myPlayerPosition.y
        oldX = myPlayerPosition.x
        interval = setTimeout(() => setInterval(routine, refreshRate), 500)
        console.log("listener initialised",oldX,oldY,myPlayerPosition)
        renderPlayerTimeOut = setTimeout(renderPlayerTimeInterval = setInterval(() => vue.player(false,myPlayerPosition), refreshRate), 200) //render userPlayer avec la var global de position
    }

    var isWallPresent = { up: false, down: false, right: false, left: false }


    function checkNeighboors() {

        let x = myPlayerPosition.y
        let y = myPlayerPosition.x
        isWallPresent.up == false
        isWallPresent.down == false
        isWallPresent.right == false
        isWallPresent.left == false

        if (controller.getModel().map[x][y - 1] == 1) { //haut
            isWallPresent.up == true
        }
        if (controller.getModel().map[x][y + 1] == 1) { //bas
            isWallPresent.down == true
        }
        if (controller.getModel().map[x + 1][y] == 1) { //droite
            isWallPresent.right == true
        }
        if (controller.getModel().map[x - 1][y] == 1) { //gauche
            isWallPresent.left == true
        }
    }


    function routine() {
        if (gameStarted) {
            if (zKey) {
                let newY = myPlayerPosition.y - speed
                let newX = myPlayerPosition.x
                console.log(Math.floor(oldY), Math.floor(newY), Math.floor(oldX), Math.floor(newX))
                if (Math.floor(oldY) == Math.floor(newY) && Math.floor(oldX) == Math.floor(newX)) { //si sur meme case
                    console.log("toujours sur meme case")
                    oldY = myPlayerPosition.y
                    oldX = myPlayerPosition.x
                    myPlayerPosition.y = newY //c'est Okay on avance
                } else if (!isWallPresent.up) { //Si veut avancer sur una case pas murée
                    console.log("case non murée")
                    oldY = myPlayerPosition.y
                    oldX = myPlayerPosition.x
                    myPlayerPosition.y = newY
                    controller.moveTo(myPlayerPosition, controller.getCurrentPlayer()) //signale au controller le deplacement*/
                    //myPlayerPosition = Object.assign({}, controller.getCurrentPlayer().position)
                    checkNeighboors()
                }

                /*
                            } else if (sKey) {
                                position.y += speed
                                controller.moveTo(position, controller.getCurrentPlayer()) //signale au controller le deplacement
                            } else if (qKey) {
                                if (zKey == true || sKey == true) {
                                    position.x -= speed / 2.0
                                } else {
                                    position.x -= speed
                                }
                                controller.moveTo(position, controller.getCurrentPlayer()) //signale au controller le deplacement
                            } else if (dKey) {
                                if (zKey == true || sKey == true) {
                                    position.x += speed / 2.0
                                } else {
                                    position.x += speed
                                }
                                controller.moveTo(position, controller.getCurrentPlayer()) //signale au controller le deplacement
                            }*/
            } else {
                console.log("inputListener : game not started")
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
})
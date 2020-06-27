var keyPressed = false;

var interval;
var zKey = false;
var sKey = false
var qKey = false
var dKey = false
/*
function movement(direction){
    let position = controller.getCurrentPlayer().position //recupere position joueur
    switch (direction) {
        case 'up':
            position.y -= 0.1
            console.log("z - avancer appuyé",position.x);
            break;
         case 'down':
            position.y += 0.1
            console.log("s - reculer appuyé",position.x);
            break;
         case 'left':
            position.x -= 0.1
            console.log("q - gauche appuyé",position.x);
            break;
         case 'right':
            position.x += 0.1
            console.log("d - droite appuyé",position.x);
            break;
        default:
            console.log(`UNDEFINED DIRECTION`);
    }
    controller.moveTo(position) //signale au controller le deplacement
}*/

function routine(){
    console.log("routine")
    let position = controller.getCurrentPlayer().position
    if(zKey){
        console.log("zkey true")
        position.y -= 0.03
        controller.moveTo(position) //signale au controller le deplacement*/
    }else if(sKey){
        position.y += 0.03
        controller.moveTo(position) //signale au controller le deplacement*/
    }
    if(qKey){
        position.x -= 0.03
        controller.moveTo(position) //signale au controller le deplacement*/
    }else if(dKey){
        position.x += 0.03
        controller.moveTo(position) //signale au controller le deplacement*/
    }
}

var interval = setInterval(routine,10)

document.body.onkeypress = function(event){
    switch (event.key.toLowerCase()) {
        case 'z':
            zKey = true;
        break;
        case 's':
            keyPressed = true;
            sKey = true;

        break;
        case 'q':
            keyPressed = true;
            qKey = true;

        break;
        case 'd':
            keyPressed = true;
            dKey = true;
        break;
        default:
        break;
      }
      
};

document.body.onkeyup = function(event){
    switch (event.key.toLowerCase()) {
        case 'z':
            zKey = false;
            console.log("z - avancer RELEVE");
        break;
        case 's':
            sKey = false;
            keyPressed = false;
            console.log("s - reculer RELEVE");
        break;
        case 'q':
            qKey = false;
            keyPressed = false;
            console.log("q - gauche RELEVE");
        break;
        case 'd':
            dKey = false;
            keyPressed = false;
            console.log("d - droite RELEVE");
        break;
        default:
        break;
      }
      
};
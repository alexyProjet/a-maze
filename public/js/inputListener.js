var keyPressed = false;

var interval;
var zKey = false;
var sKey = false
var qKey = false
var dKey = false

var speed = 0.1

function routine(){
    let position = controller.getCurrentPlayer().position
    if(zKey){
        if(qKey == true || dKey == true){
            position.y -= speed/2
        } else {
            position.y -= speed
        }
        controller.moveTo(position) //signale au controller le deplacement*/
    }else if(sKey){
        if(qKey == true || dKey == true){
            position.y += speed/2
        } else {
            position.y += speed
        }
        controller.moveTo(position) //signale au controller le deplacement*/
    }
    if(qKey){
        if(zKey == true || sKey == true){
            position.x -= speed/2
        } else {
            position.x -= speed
        }
        controller.moveTo(position) //signale au controller le deplacement*/
    }else if(dKey){
        if(zKey == true || sKey == true){
            position.x += speed/2
        } else {
            position.x += speed
        }
        controller.moveTo(position) //signale au controller le deplacement*/
    }
}

var interval = setInterval(routine,16)

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
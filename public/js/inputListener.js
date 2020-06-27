var keyPressed = false;
var interval;
let sKey = false;
let zKey = false;
let qKey = false;
let dKey = false;

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
}

document.body.onkeydown = function(event){
    switch (event.key.toLowerCase()) {
        case 'z':
            keyPressed = true;
            zKey = true;
            interval = setInterval(movement('up'), 1000);
        break;
        case 's':
            keyPressed = true;
            sKey = true;
            interval = setInterval(movement('down'), 1000);
        break;
        case 'q':
            keyPressed = true;
            qKey = true;
            interval = setInterval(movement('left'), 1000);
            console.log("q - gauche appuyé");
        break;
        case 'd':
            keyPressed = true;
            dKey = true;
            interval = setInterval(movement('right'), 1000);
            console.log("d - droite appuyé");
        break;
        default:
        break;
      }
      
};

document.body.onkeyup = function(event){
    switch (event.key.toLowerCase()) {
        case 'z':
            zKey = false;
            keyPressed = false;

            if(zKey = false){
                clearInterval(interval);
            }
            console.log("z - avancer RELEVE");
        break;
        case 's':
            sKey = false;
            keyPressed = false;

            if(sKey = false){
                clearInterval(interval);
            }
            console.log("s - reculer RELEVE");
        break;
        case 'q':
            qKey = false;
            keyPressed = false;

            if(qKey = false){
                clearInterval(interval);
            }
            console.log("q - gauche RELEVE");
        break;
        case 'd':
            dKey = false;
            keyPressed = false;

            if(dKey = false){
                clearInterval(interval);
            }
            console.log("d - droite RELEVE");
        break;
        default:
        break;
      }
      
};
var zKey = false;
var sKey = false
var qKey = false
var dKey = false
var speed = 0.14

function routine(){
    if(gameStarted){
        let position = Object.assign({},controller.getCurrentPlayer().position)
        if(zKey){
            position.y -= speed
            controller.moveTo(position,controller.getCurrentPlayer()) //signale au controller le deplacement*/
        }else if(sKey){
            position.y += speed
            controller.moveTo(position,controller.getCurrentPlayer()) //signale au controller le deplacement*/
        }
        if(qKey){
            if(zKey == true || sKey == true){
                position.x -= speed/2.0
            } else {
                position.x -= speed
            }
            controller.moveTo(position,controller.getCurrentPlayer()) //signale au controller le deplacement*/
        }else if(dKey){
            if(zKey == true || sKey == true){
                position.x += speed/2.0
            } else {
                position.x += speed
            }
            controller.moveTo(position,controller.getCurrentPlayer()) //signale au controller le deplacement*/
        }
    }else{
        console.log("inputListener : game not started")
    }
}


var interval = setTimeout(() => setInterval(routine,16),500)

document.body.onkeypress = function(event){
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

document.body.onkeyup = function(event){
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
document.body.onkeydown = function(event){
    switch (event.key.toLowerCase()) {
        case 'z':

            console.log("z - avancer appuyé");
        break;
        case 's':
            console.log("s - reculer appuyé");
        break;
        case 'q':
            console.log("q - gauche appuyé");
        break;
        case 'd':
            console.log("d - droite appuyé");
        break;
        default:
        break;
      }
      
};

document.body.onkeyup = function(event){
    switch (event.key.toLowerCase()) {
        case 'z':
            
            console.log("z - avancer RELEVE");
        break;
        case 's':
            console.log("s - reculer RELEVE");
        break;
        case 'q':
            console.log("q - gauche RELEVE");
        break;
        case 'd':
            console.log("d - droite RELEVE");
        break;
        default:
        break;
      }
      
};
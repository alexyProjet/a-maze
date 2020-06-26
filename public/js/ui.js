class UI {
    /* Classe de plus haut niveau dans l'interface **/
    constructor() {
        this.mainPlayerID = null
        this.allPlayerIDs = new Set()
        this.renderer = 
    }

    /** */
    homeInterface() {
        //NOTTODO  
    }

    /**Contient le labyrinthe
        les joueurs
      les pièges/récompenses ?
    */
    gameInterface() {

    }

    /** */
    optionInterface() {
        //NOTTODO
    }

    /** Change l'interface de jeu pour passer en mode poseur de explorateur*/
    enableExplorerMode() {

    }

    /** Change l'interface de jeu pour passer en mode poseur de piège*/
    enableTrapperMode() {

    }

    /** Modifie la coordonnée du joueur donné */
    movePlayerTo(playerId_, coordinates_) {

    }

    renderMap(mapArray) {
        for (var i = 0; i < mapArray.length; i++) {
            for (var j = 0; j < mapArray.length; j++) {
                switch (mapArray[i][j]) {
                    case 0: //sol
                        document.getElementById("renderer").getContext("2d")
                        break;
                    case 1: //mur
                        break;
                    case 2: //bonus
                        break;
                    case 3: //piège
                        break;
                }
            }
        }

    }
}
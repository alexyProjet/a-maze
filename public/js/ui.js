class UI {
    /* Classe de plus haut niveau dans l'interface **/
    constructor() {
        this.mainPlayerID = null
        this.allPlayerIDs = new Set()
        this.vue = new Vue()
        this.vue.loadAssets()
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
}
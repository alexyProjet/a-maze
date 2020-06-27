class UI {
    /* Classe de plus haut niveau dans l'interface **/
    constructor() {
        this.mainPlayerID = null
        this.allPlayerIDs = new Set()
        this.vue = new Vue()
        this.vue.loadAssets()
    }
}
class UI {
    /* Classe de plus haut niveau dans l'interface **/
    constructor() {
        this.vue = new Vue()
    }

    loadGameInterface(){
        this.vue.initGame()
    }

    loadLobbyInterface(){
        this.vue.renderLobby()
    }
}
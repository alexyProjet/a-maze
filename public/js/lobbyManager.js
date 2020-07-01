/**
 * Gère le menu principal des salons
 */
$(() => {

    const roomContainer = document.getElementById('room-container')

    //
    this.socket.on('new-roon', room => {
        console.log("LobbyManager: Nouveau salon reçu :", room)
        const roomLink = document.createElement('button')
        roomLink.setAttribute("class","room")
        roomLink.setAttribute("id",room)
        roomLink.onclick = function () {
            window.location.replace("/"+room);
        };
        roomLink.innerText = room
        roomContainer.append(roomLink)
    })

    //Destruction de salon et retour menu pour cause : 1 seul joeur restant
    this.socket.on('exit-one-player-left', room => {
        alert("Plus de joueur dans le jeu, vous avez été déconnecté.");
        window.location.replace("/");
    })

    this.socket.on('lobby-already-in-game', () => {
        console.log("Salon déjà en jeu.")
        window.location.replace("/");
    })
    //
    this.socket.on('remove-room-from-lobby-menu', (room) => {
        console.log("Suppression du salon : ", room," dans le menu.")
        document.getElementById(room).parentNode.removeChild(document.getElementById(room));
    })

})
/**
 * Gère le menu principal des salons
 */
this.socket = io();
$(() => {

    const roomContainer = document.getElementById('room-container')

    //Nouveau salon dans le menu des salons
    this.socket.on('new-room', room => {
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

    //Tente de rejoindre un salon déjà en jeu
    this.socket.on('lobby-already-in-game', () => {
        console.log("Salon déjà en jeu.")
        window.location.replace("/");
    })
    //Supprime un salon du menu des salons
    this.socket.on('remove-room-from-lobby-menu', (room) => {
        console.log("Tentative de suppression du salon : ", room," dans le menu.")
        if(document.getElementById(room) == null){
            console.log(" ---> salon privé effacé.")
        }else{
            document.getElementById(room).parentNode.removeChild(document.getElementById(room));
        }
    })
})
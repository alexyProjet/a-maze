let controller = null

//pour être sur dom chargé
$(() =>{
    const wsUrl = `ws://localhost:3000` //a changer si multi
    controller = (() => {
        let ws //objet ws du client
        let model = { //init model
            players: [],
            traps: [],
            rewards:[],
            map:[[]],
            currentPlayer:''
        }
        
        let ui = new UI()//creer l'ui
        //ui.createGame()
    
        try {
            ws = new WebSocket(wsUrl)
            ws.onmessage = (event) => {
                Object.assign(model,JSON.parse(event.data)) //met ce que tu as recu dans le model (met à jour droite dans gauche) grave cool
            }
        } catch(e) {
            console.error(e)
        }
    
    const moveTo = (position,actualPlayer) => ws.send(JSON.stringify({ type : "MOVE", position: position, player: actualPlayer})) //send la position

    const place = (trapPosition, rewardPosition, actualplayer) => ws.send(JSON.stringify({ type : "PLACE", trap: trapPosition, reward: rewardPosition, player: actualplayer })) //place un piege ou recompense

    const getModel = () => model //renvoi le model
    const getCurrentPlayer = () => controller.getModel().players.filter(Boolean).filter(p => p.id == controller.getModel().currentPlayer)[0] //renvoi le current player
    setTimeout(setInterval(() => ui.vue.render(),66),200) //attend un peu puis lance le set interval pour être sur que tout pret
    return { moveTo, place, getModel,getCurrentPlayer} //
})()

})
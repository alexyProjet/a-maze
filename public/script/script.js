const wsUrl = `ws://localhost:3000`

const controller = (() => {

    let ws
    let model
    try {
        ws = new WebSocket(wsUrl)
        ws.onmessage = (event) => { 
            model = JSON.parse(event.data)
        }
    } catch(e) {
        console.error(e)
    }

    const moveTo = (position) => ws.send(JSON.stringify({ type : "MOVE", position: position }))

    const place = (trapPosition, rewardPosition) => ws.send(JSON.stringify({ type : "PLACE", trap: trapPosition, reward: rewardPosition }))

    const getModel = () => { return model }
    const getCurrentPlayer = () => controller.getModel().players.filter(Boolean).filter(p => p.id == controller.getModel().currentPlayer)[0]

    return { moveTo, place, getModel,getCurrentPlayer}

})()

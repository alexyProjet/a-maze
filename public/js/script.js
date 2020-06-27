let controller = null

$(() =>{
const wsUrl = `ws://localhost:3000`

    controller = (() => {

    let ws
    let model = {}

    let ui = new UI()

    try {
        ws = new WebSocket(wsUrl)
        ws.onmessage = (event) => {
            Object.assign(model,JSON.parse(event.data))
        }
    } catch(e) {
        console.error(e)
    }

    const moveTo = (position) => ws.send(JSON.stringify({ type : "MOVE", position: position }))

    const place = (trapPosition, rewardPosition) => ws.send(JSON.stringify({ type : "PLACE", trap: trapPosition, reward: rewardPosition }))

    const getModel = () => { return model }
    const getCurrentPlayer = () => controller.getModel().players.filter(Boolean).filter(p => p.id == controller.getModel().currentPlayer)[0]

    setInterval(() => ui.renderer.render(),16)
    return { moveTo, place, getModel,getCurrentPlayer}
})()

})
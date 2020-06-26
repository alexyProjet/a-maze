const wsUrl = `localhost:3000`

const controller = () => {

    let ws

    try {

        ws = new WebSocket(wsUrl)
        ws.onmessage = (event) => { model = (event |> JSON.parse) }

    } catch(e) {

        console.error(e)

    }

    const moveTo = (position) => ws.send(JSON.stringify({ type : "MOVE", position: position }))

    const place = (trapPosition, rewardPosition) => ws.send(JSON.stringify({ type : "PLACE", trap: trapPosition, reward: rewardPosition }))

    const getModel = () => { return model }

    return { moveTo, place, getModel }

}

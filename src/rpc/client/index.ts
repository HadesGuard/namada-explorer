import { replaceHTTPtoWebsocket } from '@/utils/helper'
import { Comet38Client, WebsocketClient } from '@cosmjs/tendermint-rpc'
import { StreamingSocket } from '@cosmjs/socket'

export async function validateConnection(rpcAddress: string): Promise<Boolean> {
  return new Promise((resolve) => {
    const wsUrl = replaceHTTPtoWebsocket(rpcAddress)
    const path = wsUrl.endsWith('/') ? 'websocket' : '/websocket'
    const socket = new StreamingSocket(wsUrl + path, 3000)
    console.log(socket)
    socket.events.subscribe({
      error: () => {
        resolve(false)
      },
    })

    socket.connect()
    socket.connected.then(() => resolve(true)).catch(() => resolve(false))
    return true
  })
}

export async function connectWebsocketClient(
  rpcAddress: string
): Promise<Comet38Client> {
  return new Promise(async (resolve, reject) => {
    try {
      const wsUrl = replaceHTTPtoWebsocket(rpcAddress)
      const wsClient = new WebsocketClient(wsUrl, (err) => {
        reject(err)
      })
      const tmClient = await Comet38Client.create(wsClient)
      if (!tmClient) {
        reject(new Error('cannot create tendermint client'))
      }

      const status = await tmClient.status()
      if (!status) {
        reject(new Error('cannot get client status'))
      }

      resolve(tmClient)
    } catch (err) {
      reject(err)
    }
  })
}

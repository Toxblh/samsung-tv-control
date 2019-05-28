import * as request from 'request'
import * as wol from 'wake_on_lan'
import * as WebSocket from 'ws'
import { KEYS } from './keys'

export interface Configuration {
  ip: string
  mac: string
  token?: string
  nameApp?: string
}

class Samsung {
  private IP: string
  private MAC: string
  private PORT: string
  private TOKEN: string
  private NAME_APP: string

  constructor(config: Configuration) {
    if (!config.ip) {
      throw new Error('You must provide IP in config')
    }

    if (!config.mac) {
      throw new Error('You must provide MAC in config')
    }

    this.IP = config.ip
    this.MAC = config.mac
    this.PORT = '8002'
    this.TOKEN = config.token || ''
    this.NAME_APP = Buffer.from(config.nameApp || 'NodeJS Remote').toString(
      'base64',
    )
  }

  public sendKey(key: KEYS, done?: () => void) {
    const wsUrl = `wss://${this.IP}:${
      this.PORT
    }/api/v2/channels/samsung.remote.control?name=${this.NAME_APP}${
      this.TOKEN !== '' ? ` &token=${this.TOKEN}` : ''
    }`
    const ws = new WebSocket(wsUrl, { rejectUnauthorized: false })

    // Here get token
    ws.on('message', async (message: string) => {
      const data: any = JSON.parse(message)
      if (data.event === 'ms.channel.connect') {
        console.info('message', JSON.stringify(data, null, 2))

        ws.send(this.getCommandByKey(key), (err) => {
          if (done) {
            done(err, data)
          }
        })
        ws.close()
      }
    })

    ws.on('response', (response: WebSocket.Data) => {
      console.log('response', response)
    })

    // TODO: change to correct type
    ws.on('error', (err: any) => {
      let errorMsg = ''
      if (err.code === 'EHOSTUNREACH' || err.code === 'ECONNREFUSED') {
        errorMsg = 'TV is off or unavalible'
      }
      console.error('error', errorMsg, err)
    })
  }

  public isAvaliable(): Promise<string> {
    return new Promise((resolve, reject) => {
      request.get(
        { url: `http://${this.IP}:8001/api/v2/`, timeout: 3000 },
        (err: any, res: { statusCode: number }) => {
          if (!err && res.statusCode === 200) {
            console.info('TV is avaliable')
            resolve('TV is avaliable')
          } else {
            console.error('No response from TV')
            reject('No response from TV')
          }
        },
      )
    })
  }

  public turnOn(): Promise<string> {
    return new Promise((resolve, reject) => {
      wol.wake(this.MAC, (err) => {
        if (err) {
          console.error('Fail turn on')
          reject('Fail turn on')
        } else {
          console.log('TV is avaliable')
          resolve('TV is avaliable')
        }
      })
    })
  }

  private getCommandByKey(key: KEYS): string {
    return JSON.stringify({
      method: 'ms.remote.control',
      params: {
        Cmd: 'Click',
        DataOfCmd: key,
        Option: 'false',
        TypeOfRemote: 'SendRemoteKey',
      },
    })
  }
}

export default Samsung

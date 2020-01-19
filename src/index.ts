import * as request from 'request'
import * as wol from 'wake_on_lan'
import * as WebSocket from 'ws'
import { KEYS } from './keys'

export interface Configuration {
  /** IP addess TV */
  ip: string
  /** MAC addess TV */
  mac: string
  /** Provide token for suppress notifications about access */
  token?: string
  /** Will show in notification how ask remote access. Default: NodeJS */
  nameApp?: string
  /** Verbose Mode */
  debug?: boolean
  /** Port, for old models 8001 (Default: 8002) */
  port?: number
}

interface App {
  appId: string
  app_type: number
  icon: string
  is_lock: number
  name: string
}

interface Command {
  method: string
  params: {
    Cmd?: string
    DataOfCmd?: string
    Option?: string
    TypeOfRemote?: string
    data?: string | object
    event?: string
    to?: string,
  }
}

class Samsung {
  private IP: string
  private MAC: string
  private PORT: number
  private TOKEN: string
  private NAME_APP: string
  private DEBUG: boolean

  constructor(config: Configuration) {
    if (!config.ip) {
      throw new Error('You must provide IP in config')
    }

    if (!config.mac) {
      throw new Error('You must provide MAC in config')
    }

    this.IP = config.ip
    this.MAC = config.mac
    this.PORT = Number(config.port) || 8002
    this.TOKEN = config.token || ''
    this.NAME_APP = Buffer.from(config.nameApp || 'NodeJS Remote').toString('base64')
    this.DEBUG = config.debug || false
  }

  public getToken(done: (token: number | null) => void) {
    this.sendKey(KEYS.KEY_HOME, (err, res) => {
      if (err) {
        throw new Error(err)
      } else {
        const token = (res && res.data && res.data.token && res.data.token) || null
        done(token)
      }
    })
  }

  public sendKey(key: KEYS, done?: (err?: any, res?: any) => void) {
    this._send(this._getCommandByKey(key), done, 'ms.channel.connect')
  }

  public getAppsFromTV(done?: (err?: any, res?: any) => void) {
    return this._send(
      {
        method: 'ms.channel.emit',
        params: {
          data: '',
          event: 'ed.installedApp.get',
          to: 'host',
        },
      },
      done,
    )
  }

  public openApp(appId: string, done?: (err?: any, res?: any) => void) {
    this.getAppsFromTV((err, res) => {
      if (err || res.data.data === undefined) {
        return false
      }
      const apps: App[] = res.data.data
      const app = apps.find((appIter) => appIter.appId === appId)

      if (!app) {
        throw new Error('This APP is not installed')
      }

      this._send(
        {
          method: 'ms.channel.emit',
          params: {
            data: {
              action_type: app.app_type === 2 ? 'DEEP_LINK' : 'NATIVE_LAUNCH',
              appId: app.appId,
            },
            event: 'ed.apps.launch',
            to: 'host',
          },
        },
        done,
      )
    })
  }

  public isAvaliable(): Promise<string> {
    return new Promise((resolve, reject) => {
      request.get(
        { url: `http://${this.IP}:8001/api/v2/`, timeout: 3000 },
        (err: any, res: { statusCode: number }) => {
          if (!err && res.statusCode === 200) {
            if (this.DEBUG) {
              console.info('TV is avaliable')
            }
            resolve('TV is avaliable')
          } else {
            if (this.DEBUG) {
              console.error('No response from TV')
            }
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
          if (this.DEBUG) {
            console.error('Fail turn on')
          }
          reject('Fail turn on')
        } else {
          if (this.DEBUG) {
            console.log('TV is avaliable')
          }
          resolve('TV is avaliable')
        }
      })
    })
  }

  private _send(command: Command, done?: (err?: any, res?: any) => void, eventHandle?: string) {
    const wsUrl = `${this.PORT === 8001 ? 'ws' : 'wss'}://${this.IP}:${this.PORT}/api/v2/channels/samsung.remote.control?name=${
      this.NAME_APP
    }${this.TOKEN !== '' ? ` &token=${this.TOKEN}` : ''}`
    const ws = new WebSocket(wsUrl, { rejectUnauthorized: false })

    ws.on('open', () => {
      ws.send(JSON.stringify(command))
    })

    ws.on('message', (message: string) => {
      const data: any = JSON.parse(message)
      if (this.DEBUG) {
        console.info('message', JSON.stringify(data, null, 2))
      }

      if (done && (data.event === command.params.event || data.event === eventHandle)) {
        done(null, data)
      }

      if (data.event !== 'ms.channel.connect') {
        ws.close()
      }
    })

    ws.on('response', (response: WebSocket.Data) => {
      if (this.DEBUG) {
        console.log('response', response)
      }
    })

    ws.on('error', (err: any) => {
      let errorMsg = ''
      if (err.code === 'EHOSTUNREACH' || err.code === 'ECONNREFUSED') {
        errorMsg = 'TV is off or unavalible'
      }
      console.error('error', errorMsg, err)
    })
  }

  private _getCommandByKey(key: KEYS): Command {
    return {
      method: 'ms.remote.control',
      params: {
        Cmd: 'Click',
        DataOfCmd: key,
        Option: 'false',
        TypeOfRemote: 'SendRemoteKey',
      },
    }
  }
}

export default Samsung

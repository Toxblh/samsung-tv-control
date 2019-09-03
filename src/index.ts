import * as fs from 'fs'
import * as path from 'path'
import * as request from 'request'
import * as wol from 'wake_on_lan'
import * as WebSocket from 'ws'
import { KEYS } from './keys'
import Logger from './logger'

export interface Configuration {
  /** IP addess TV */
  ip: string
  /** MAC addess TV */
  mac: string
  /** Provide token for suppress notifications about access */
  token?: string
  /** Will show in notification how ask remote access (Default: NodeJS) */
  nameApp?: string
  /** Verbose Mode */
  debug?: boolean
  /** Port, for old models 8001 (Default: 8002) */
  port?: number
  /** Autosave token (Default: false) */
  saveToken: boolean
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
  private LOGGER: Logger
  private SAVE_TOKEN: boolean
  private TOKEN_FILE = path.join(__dirname, 'token.txt')

  constructor(config: Configuration) {
    if (!config.ip) {
      throw new Error('You must provide IP in config')
    }

    if (!config.mac) {
      throw new Error('You must provide MAC in config')
    }

    this.IP = config.ip
    this.MAC = config.mac
    this.PORT = config.port || 8002
    this.TOKEN = config.token || ''
    this.NAME_APP = Buffer.from(config.nameApp || 'NodeJS Remote').toString('base64')
    this.SAVE_TOKEN = config.saveToken || false
    this.LOGGER = new Logger({ DEBUG_MODE: !!config.debug })

    this.LOGGER.log('config', config, 'constructor')

    if (this.SAVE_TOKEN) {
      try {
        fs.accessSync(this.TOKEN_FILE, fs.constants.F_OK)
        console.log('File suss!')
        const fileData = fs.readFileSync(this.TOKEN_FILE)
        this.TOKEN = fileData.toString()
      } catch (e) {
        console.log('File error!')
      }
    }

    this.LOGGER.log(
      'internal config',
      {
        IP: this.IP,
        MAC: this.MAC,
        PORT: this.PORT,
        TOKEN: this.TOKEN,
        NAME_APP: this.NAME_APP,
        SAVE_TOKEN: this.SAVE_TOKEN,
      },
      'constructor',
    )
  }

  public getToken(done: (token: string | null) => void) {
    this.LOGGER.log('getToken', '')

    if (this.SAVE_TOKEN && this.TOKEN !== 'null'  && this.TOKEN !== '') {
      done(this.TOKEN)
      return
    }

    this.sendKey(KEYS.KEY_HOME, (err, res) => {
      if (err) {
        this.LOGGER.error('after sendKey', err, 'getToken')
        throw new Error(err)
      } else {
        const token = (res && res.data && res.data.token && res.data.token) || null
        this.LOGGER.log('got token', token, 'getToken')
        this.TOKEN = token
        if (this.SAVE_TOKEN) {
          this._saveTokenToFile(token)
        }
        done(token)
      }
    })
  }

  public getTokenPromise(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.LOGGER.log('getTokenPromise', '')

      if (this.SAVE_TOKEN && this.TOKEN !== 'null'  && this.TOKEN !== '') {
        resolve(this.TOKEN)
        return
      }

      this.sendKey(KEYS.KEY_HOME, (err, res) => {
        if (err) {
          this.LOGGER.error('after sendKey', err, 'getTokenPromise')
          reject('after sendKey getTokenPromise')
        } else {
          const token = (res && res.data && res.data.token && res.data.token) || null
          this.LOGGER.log('got token', token, 'getTokenPromise')
          this.TOKEN = token
          if (this.SAVE_TOKEN) {
            this._saveTokenToFile(token)
          }
          resolve(token)
        }
      })
    })
  }

  public sendKey(key: KEYS, done?: (err?: any, res?: any) => void) {
    this.LOGGER.log('send key', key, 'sendKey')
    this._send(this._getCommandByKey(key), done, 'ms.channel.connect')
  }

  public sendKeyPromise(key: KEYS) {
    this.LOGGER.log('send key', key, 'sendKeyPromise')
    return this._sendPromise(this._getCommandByKey(key), 'ms.channel.connect')
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

  public getAppsFromTVPromise(): Promise<any> {
    return this._sendPromise({
      method: 'ms.channel.emit',
      params: {
        data: '',
        event: 'ed.installedApp.get',
        to: 'host',
      },
    })
  }

  public openApp(appId: string, done?: (err?: any, res?: any) => void) {
    this.getAppsFromTV((err, res) => {
      if (err || res.data.data === undefined) {
        this.LOGGER.error('getAppsFromTV error', err, 'openApp getAppsFromTV')
        return false
      }

      const apps: App[] = res.data.data
      const app = apps.find((appIter) => appIter.appId === appId)

      if (!app) {
        this.LOGGER.error('This APP is not installed', { appId, app }, 'openApp getAppsFromTV')
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

  public async openAppPromise(appId: string) {
    try {
      const res = await this.getAppsFromTVPromise()
      if (res && res.data && res.data.data === undefined) {
        this.LOGGER.error('getAppsFromTV res.data.data is undefined', '', 'openAppPromise getAppsFromTV')
        return false
      }

      const apps: App[] = res.data.data
      const app = apps.find((appIter) => appIter.appId === appId)

      if (!app) {
        this.LOGGER.error('This APP is not installed', { appId, app }, 'openAppPromise getAppsFromTV')
        throw new Error('This APP is not installed')
      }

      return this._sendPromise({
        method: 'ms.channel.emit',
        params: {
          data: {
            action_type: app.app_type === 2 ? 'DEEP_LINK' : 'NATIVE_LAUNCH',
            appId: app.appId,
          },
          event: 'ed.apps.launch',
          to: 'host',
        },
      })
    } catch (error) {
      this.LOGGER.error('getAppsFromTV error', error, 'openAppPromise getAppsFromTV')
      return false
    }
  }

  public isAvaliable(): Promise<string> {
    return new Promise((resolve, reject) => {
      request.get(
        { url: `http://${this.IP}:8001/api/v2/`, timeout: 3000 },
        (err: any, res: { statusCode: number; body: object; request: object }) => {
          if (!err && res.statusCode === 200) {
            this.LOGGER.log(
              'TV is avaliable',
              { request: res.request, body: res.body, code: res.statusCode },
              'isAvaliable',
            )
            resolve('TV is avaliable')
          } else {
            this.LOGGER.error(
              'TV is avaliable',
              { request: res.request, body: res.body, code: res.statusCode },
              'isAvaliable',
            )
            reject('No response from TV')
          }
        },
      )
    })
  }

  public turnOn(): Promise<string> {
    return new Promise((resolve, reject) => {
      wol.wake(this.MAC, { num_packets: 30 }, (err: any) => {
        if (err) {
          this.LOGGER.error('Fail turn on', err, 'turnOn')
          reject('Fail turn on')
        } else {
          this.LOGGER.log('WOL sent command to TV', '', 'turnOn')
          resolve('TV is avaliable')
        }
      })
    })
  }

  public getLogs() {
    this.LOGGER.saveLogToFile()
  }

  private _send(command: Command, done?: (err?: any, res?: any) => void, eventHandle?: string) {
    const wsUrl = `${this.PORT === 8002 ? 'wss' : 'ws'}://${this.IP}:${
      this.PORT
    }/api/v2/channels/samsung.remote.control?name=${this.NAME_APP}${
      this.TOKEN !== '' ? `&token=${this.TOKEN}` : ''
    }`
    const ws = new WebSocket(wsUrl, { rejectUnauthorized: false })

    this.LOGGER.log('command', command, '_send')
    this.LOGGER.log('wsUrl', wsUrl, '_send')

    ws.on('open', () => {
      ws.send(JSON.stringify(command))
    })

    ws.on('message', (message: string) => {
      const data: any = JSON.parse(message)

      this.LOGGER.log('data: ', JSON.stringify(data, null, 2), 'ws.on message')

      if (done && (data.event === command.params.event || data.event === eventHandle)) {
        this.LOGGER.log('if correct event', 'callback triggered', 'ws.on message')
        done(null, data)
      }

      if (data.event !== 'ms.channel.connect') {
        this.LOGGER.log('if not correct event', 'ws is close', 'ws.on message')
        ws.close()
      }

      // TODO, additional check on avaliable instead of ws.open
      // if(data.event == "ms.channel.connect") { _sendCMD() }
    })

    ws.on('response', (response: WebSocket.Data) => {
      this.LOGGER.log('response', response, 'ws.on response')
    })

    ws.on('error', (err: any) => {
      let errorMsg = ''
      if (err.code === 'EHOSTUNREACH' || err.code === 'ECONNREFUSED') {
        errorMsg = 'TV is off or unavalible'
      }
      console.error(errorMsg)
      this.LOGGER.error(errorMsg, err, 'ws.on error')
    })
  }

  private _sendPromise(command: Command, eventHandle?: string) {
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.PORT === 8002 ? 'wss' : 'ws'}://${this.IP}:${
        this.PORT
      }/api/v2/channels/samsung.remote.control?name=${this.NAME_APP}${
        this.TOKEN !== '' ? `&token=${this.TOKEN}` : ''
      }`
      const ws = new WebSocket(wsUrl, { rejectUnauthorized: false })

      this.LOGGER.log('command', command, '_sendPromise')
      this.LOGGER.log('wsUrl', wsUrl, '_sendPromise')

      ws.on('open', () => {
        ws.send(JSON.stringify(command))
      })

      ws.on('message', (message: string) => {
        const data: any = JSON.parse(message)

        this.LOGGER.log('data: ', JSON.stringify(data, null, 2), 'ws.on message')

        if (data.event === command.params.event || data.event === eventHandle) {
          this.LOGGER.log('if correct event', 'callback triggered', 'ws.on message')
          resolve(data)
        }

        if (data.event !== 'ms.channel.connect') {
          this.LOGGER.log('if not correct event', 'ws is close', 'ws.on message')
          ws.close()
        }

        // TODO, additional check on avaliable instead of ws.open
        // if(data.event == "ms.channel.connect") { _sendCMD() }
      })

      ws.on('response', (response: WebSocket.Data) => {
        this.LOGGER.log('response', response, 'ws.on response')
      })

      ws.on('error', (err: any) => {
        let errorMsg = ''
        if (err.code === 'EHOSTUNREACH' || err.code === 'ECONNREFUSED') {
          errorMsg = 'TV is off or unavalible'
        }
        console.error(errorMsg)
        this.LOGGER.error(errorMsg, err, 'ws.on error')
        reject(errorMsg)
      })
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

  private _saveTokenToFile(token: string) {
    try {
      fs.accessSync(this.TOKEN_FILE, fs.constants.F_OK)
      console.log('File suss!')
      fs.writeFileSync(this.TOKEN_FILE, token)
    } catch (e) {
      console.log('File error!')
      fs.writeFileSync(this.TOKEN_FILE, token)
    }
  }
}

export default Samsung

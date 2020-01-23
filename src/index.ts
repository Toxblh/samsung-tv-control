import { exec } from 'child_process'
import * as fs from 'fs'
import * as net from 'net'
import * as path from 'path'
import * as request from 'request'
import * as wol from 'wake_on_lan'
import * as WebSocket from 'ws'
import { KEYS } from './keys'
import Logger from './logger'
import { Configuration, WSData, App, Command } from './types'

class Samsung {
  private IP: string
  private MAC: string
  private PORT: number
  private APP_STRING: string
  private TV_APP_STRING: string
  private TOKEN: string
  private NAME_APP: string
  private LOGGER: Logger
  private SAVE_TOKEN: boolean
  private TOKEN_FILE = path.join(__dirname, 'token.txt')
  private WS_URL: string

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
    this.SAVE_TOKEN = config.saveToken || false
    // legacy 55000
    this.APP_STRING = config.appString || 'iphone..iapp.samsung'
    this.TV_APP_STRING = config.tvAppString || 'iphone.UE40NU7400.iapp.samsung'

    this.LOGGER = new Logger({ DEBUG_MODE: !!config.debug })

    this.LOGGER.log('config', config, 'constructor')

    if (this.SAVE_TOKEN) {
      try {
        fs.accessSync(this.TOKEN_FILE, fs.constants.F_OK)
        console.log('File suss!')
        const fileData = fs.readFileSync(this.TOKEN_FILE)
        this.TOKEN = fileData.toString()
      } catch (err) {
        console.log('File error!')
        this.LOGGER.error('if (this.SAVE_TOKEN)', err, 'constructor')
      }
    }

    this.WS_URL = `${this.PORT === 8001 ? 'ws' : 'wss'}://${this.IP}:${
      this.PORT
    }/api/v2/channels/samsung.remote.control?name=${this.NAME_APP}${
      this.TOKEN !== '' ? ` &token=${this.TOKEN}` : ''
    }`

    this.LOGGER.log(
      'internal config',
      {
        IP: this.IP,
        MAC: this.MAC,
        NAME_APP: this.NAME_APP,
        PORT: this.PORT,
        SAVE_TOKEN: this.SAVE_TOKEN,
        TOKEN: this.TOKEN,
        WS_URL: this.WS_URL
      },
      'constructor'
    )
  }

  public getToken(done: (token: string | null) => void) {
    this.LOGGER.log('getToken', '')

    if (this.SAVE_TOKEN && this.TOKEN !== 'null' && this.TOKEN !== '') {
      done(this.TOKEN)
      return
    }

    this.sendKey(KEYS.KEY_HOME, (err, res) => {
      if (err) {
        this.LOGGER.error('after sendKey', err, 'getToken')
        throw new Error('Error send Key')
      } else {
        const token = (res && typeof res !== 'string' && res.data && res.data.token && res.data.token) || null
        this.LOGGER.log('got token', String(token), 'getToken')
        this.TOKEN = token || ''
        if (this.SAVE_TOKEN && token) {
          this._saveTokenToFile(token)
          done(token)
        } else {
          done(null)
        }
      }
    })
  }

  public getTokenPromise(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.LOGGER.log('getTokenPromise', '')

      if (this.SAVE_TOKEN && this.TOKEN !== 'null' && this.TOKEN !== '') {
        resolve(this.TOKEN)
        return
      }

      this.sendKey(KEYS.KEY_HOME, (err, res) => {
        if (err) {
          this.LOGGER.error('after sendKey', err, 'getTokenPromise')
          reject('after sendKey getTokenPromise')
        } else {
          const token =
            (res && typeof res !== 'string' && res.data && res.data.token && res.data.token) || null
          this.LOGGER.log('got token', String(token), 'getTokenPromise')
          this.TOKEN = token || ''
          if (this.SAVE_TOKEN && token) {
            this._saveTokenToFile(token)
            resolve(token)
          } else {
            reject('Bad attempt to get token')
          }
        }
      })
    })
  }

  public sendKey(
    key: KEYS,
    done?: (err: Error | { code: string } | null, res: WSData | string | null) => void
  ) {
    this.LOGGER.log('send key', key, 'sendKey')
    if (this.PORT === 55000) {
      this._sendLegacy(key, done)
    } else {
      this._send(this._getCommandByKey(key), done, 'ms.channel.connect')
    }
  }

  public sendKeyPromise(key: KEYS) {
    this.LOGGER.log('send key', key, 'sendKeyPromise')
    if (this.PORT === 55000) {
      return this._sendLegacyPromise(key)
    } else {
      return this._sendPromise(this._getCommandByKey(key), 'ms.channel.connect')
    }
  }

  public getAppsFromTV(done?: (err: Error | { code: string } | null, res: WSData | string | null) => void) {
    return this._send(
      {
        method: 'ms.channel.emit',
        params: {
          data: '',
          event: 'ed.installedApp.get',
          to: 'host'
        }
      },
      done
    )
  }

  public getAppsFromTVPromise(): Promise<WSData | null> {
    return this._sendPromise({
      method: 'ms.channel.emit',
      params: {
        data: '',
        event: 'ed.installedApp.get',
        to: 'host'
      }
    })
  }

  public openApp(
    appId: string,
    done?: (err: Error | { code: string } | null, res: WSData | string | null) => void
  ) {
    this.getAppsFromTV((err, res) => {
      this.LOGGER.error('getAppsFromTV error', String(err), 'openApp getAppsFromTV')
      if (
        err ||
        (res && typeof res !== 'string' && res.data && res.data.data && res.data.data === undefined)
      ) {
        this.LOGGER.error('getAppsFromTV error', String(err), 'openApp getAppsFromTV')
        return false
      }

      const apps: App[] = res && typeof res !== 'string' && res.data && res.data.data ? res.data.data : []
      const app = apps.find(appIter => appIter.appId === appId)

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
              appId: app.appId
            },
            event: 'ed.apps.launch',
            to: 'host'
          }
        },
        done
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

      const apps: App[] = res && typeof res !== 'string' && res.data && res.data.data ? res.data.data : []
      const app = apps.find(appIter => appIter.appId === appId)

      if (!app) {
        this.LOGGER.error('This APP is not installed', { appId, app }, 'openAppPromise getAppsFromTV')
        throw new Error('This APP is not installed')
      }

      return this._sendPromise({
        method: 'ms.channel.emit',
        params: {
          data: {
            action_type: app.app_type === 2 ? 'DEEP_LINK' : 'NATIVE_LAUNCH',
            appId: app.appId
          },
          event: 'ed.apps.launch',
          to: 'host'
        }
      })
    } catch (err) {
      this.LOGGER.error('getAppsFromTV error', err, 'openAppPromise getAppsFromTV')
      return false
    }
  }

  public isAvaliable(): Promise<string> {
    return new Promise((resolve, reject) => {
      request.get(
        { url: `http://${this.IP}:8001${this.PORT === 55000 ? '/ms/1.0/' : '/api/v2/'}`, timeout: 3000 },
        (err: Error, res: request.RequestResponse) => {
          if (!err && res.statusCode === 200) {
            this.LOGGER.log(
              'TV is avaliable',
              { request: res.request, body: res.body as string, code: res.statusCode },
              'isAvaliable'
            )
            resolve('TV is avaliable')
          } else {
            this.LOGGER.error('TV is avaliable', { err }, 'isAvaliable')
            reject('No response from TV')
          }
        }
      )
    })
  }

  public isAvaliablePing(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec('ping -c 1 -W 1 ' + this.IP, (error, stdout, stderr) => {
        if (error) {
          this.LOGGER.error('TV is avaliable', { error }, 'isAvaliable')
          reject('No response from TV')
        } else {
          this.LOGGER.log('TV is avaliable', { stdout }, 'isAvaliable')
          resolve('TV is avaliable')
        }
      })
    })
  }

  public turnOn(): Promise<string> {
    return new Promise((resolve, reject) => {
      wol.wake(this.MAC, { num_packets: 30 }, (err: Error) => {
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

  private _send(
    command: Command,
    done?: (err: null | (Error & { code: string }), res: WSData | null) => void,
    eventHandle?: string
  ) {
    const ws = new WebSocket(this.WS_URL, { rejectUnauthorized: false })

    this.LOGGER.log('command', command, '_send')
    this.LOGGER.log('wsUrl', this.WS_URL, '_send')

    ws.on('open', () => {
      if (this.PORT === 8001) {
        setTimeout(() => ws.send(JSON.stringify(command)), 1000)
      } else {
        ws.send(JSON.stringify(command))
      }
    })

    ws.on('message', (message: string) => {
      const data: WSData = JSON.parse(message)

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

    ws.on('error', (err: Error & { code: string }) => {
      let errorMsg = ''
      if (err.code === 'EHOSTUNREACH' || err.code === 'ECONNREFUSED') {
        errorMsg = 'TV is off or unavalible'
      }
      console.error(errorMsg)
      this.LOGGER.error(errorMsg, err, 'ws.on error')
      if (done) {
        done(err, null)
      }
    })
  }

  private _sendPromise(command: Command, eventHandle?: string): Promise<WSData | null> {
    return new Promise((resolve, reject) => {
      this._send(
        command,
        (err, res) => {
          if (!err) {
            resolve(res)
          } else {
            reject(err)
          }
        },
        eventHandle
      )
    })
  }

  private _getCommandByKey(key: KEYS): Command {
    return {
      method: 'ms.remote.control',
      params: {
        Cmd: 'Click',
        DataOfCmd: key,
        Option: 'false',
        TypeOfRemote: 'SendRemoteKey'
      }
    }
  }

  private _sendLegacyPromise(key: KEYS) {
    return new Promise((resolve, reject) => {
      this._sendLegacy(key, (err, res) => {
        if (!err) {
          resolve(res)
        } else {
          reject(err)
        }
      })
    })
  }

  private _sendLegacy(key: KEYS, done?: (err: null | Error | { code: string }, res: string) => void) {
    if (!key) {
      this.LOGGER.error('send() missing command', { key })
      return
    }

    this.LOGGER.log('send key', key, 'sendKey')

    const connection = net.connect(this.PORT, this.IP)
    connection.setTimeout(3000)

    connection.on('connect', () => {
      const payload = this.getLegacyCommand(key)
      connection.write(payload.header)
      connection.write(payload.command)
      connection.end()
      connection.destroy()
      if (done) {
        done(null, key)
      }
    })

    connection.on('close', () => {
      this.LOGGER.log('closed connection', {}, 'connection.on close')
    })

    connection.on('error', (err: Error & { code: string }) => {
      let errorMsg = ''

      if (err.code === 'EHOSTUNREACH' || err.code === 'ECONNREFUSED') {
        errorMsg = 'Device is off or unreachable'
      } else {
        errorMsg = err.code
      }

      console.error(errorMsg)
      this.LOGGER.error(errorMsg, err, 'connection.on error')
      if (done) {
        done(err, key)
      }
    })

    connection.on('timeout', (err: Error) => {
      console.error('timeout')
      this.LOGGER.error('timeout', err, 'connection.on timeout')
      if (done) {
        done(err, key)
      }
    })
  }

  private getLegacyCommand(key: KEYS) {
    const payload = { header: '', command: '' }

    const headerData =
      this.chr(0x64) +
      this.chr(0x00) +
      this.chr(this.base64(this.IP).length) +
      this.chr(0x00) +
      this.base64(this.IP) +
      this.chr(this.base64(this.MAC).length) +
      this.chr(0x00) +
      this.base64(this.MAC) +
      this.chr(this.base64(this.NAME_APP).length) +
      this.chr(0x00) +
      this.base64(this.NAME_APP)

    payload.header =
      this.chr(0x00) +
      this.chr(this.APP_STRING.length) +
      this.chr(0x00) +
      this.APP_STRING +
      this.chr(headerData.length) +
      this.chr(0x00) +
      headerData

    const commandData =
      this.chr(0x00) +
      this.chr(0x00) +
      this.chr(0x00) +
      this.chr(this.base64(key).length) +
      this.chr(0x00) +
      this.base64(key)

    payload.command =
      this.chr(0x00) +
      this.chr(this.TV_APP_STRING.length) +
      this.chr(0x00) +
      this.TV_APP_STRING +
      this.chr(commandData.length) +
      this.chr(0x00) +
      commandData

    return payload
  }

  private chr(char: number) {
    return String.fromCharCode(char)
  }

  private base64(str: string) {
    return Buffer.from(str).toString('base64')
  }

  private _saveTokenToFile(token: string) {
    try {
      fs.accessSync(this.TOKEN_FILE, fs.constants.F_OK)
      console.log('File suss!')
      fs.writeFileSync(this.TOKEN_FILE, token)
    } catch (err) {
      console.log('File error!')
      this.LOGGER.error('catch fil esave', err, '_saveTokenToFile')
    }
  }
}

export default Samsung

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
  /** Provide appString */
  appString?: string
  /** Provide tvAppString */
  tvAppString?: string
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
  private APP_STRING: string
  private TV_APP_STRING: string
  private NAME_APP: string
  private LOGGER: Logger

  constructor(config: Configuration) {
    if (!config.ip) {
      throw new Error('You must provide IP in config')
    }

    if (!config.mac) {
      throw new Error('You must provide MAC in config')
    }

    this.IP = config.ip
    this.MAC = config.mac
    this.PORT = config.port || 55000
    this.APP_STRING = config.appString || 'iphone..iapp.samsung'
    this.TV_APP_STRING = config.appString || 'iphone.UE40NU7400.iapp.samsung'
    this.NAME_APP = Buffer.from(config.nameApp || 'NodeJS Remote').toString('base64')
    this.LOGGER = new Logger({ DEBUG_MODE: !!config.debug })

    this.LOGGER.log('config', config, 'constructor')
  }

}

import { App, Command } from './types'
import { KEYS } from './keys'

export function chr(char: number) {
  return String.fromCharCode(char)
}

export function base64(str: string) {
  return Buffer.from(str).toString('base64')
}


export function getCommandByKey(key: KEYS): Command {
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

export function getMsgInstalledApp() {
  return {
    method: 'ms.channel.emit',
    params: {
      data: '',
      event: 'ed.installedApp.get',
      to: 'host'
    }
  }
}

export function getMsgLaunchApp(app: App) {
  return {
    method: 'ms.channel.emit',
    params: {
      data: {
        action_type: app.app_type === 2 ? 'DEEP_LINK' : 'NATIVE_LAUNCH',
        appId: app.appId
      },
      event: 'ed.apps.launch',
      to: 'host'
    }
  }
}

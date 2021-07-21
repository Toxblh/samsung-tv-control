import { App, Command } from './types'
import { KEYS } from './keys'

export function chr(char: number) {
  return String.fromCharCode(char)
}

export function base64(str: string) {
  return Buffer.from(str).toString('base64')
}

export function getVideoId(url: string) {
  const regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  const videoId = match && match[1].length > 5 ? match[1] : false

  return videoId
}

export function getCommandByKey(key: KEYS): Command {
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

export function getSendTextCommand(text: any) {
  return {
    method: 'ms.remote.control',
    params: {
      Cmd: base64(text),
      DataOfCmd: 'base64',
      TypeOfRemote: 'SendInputString',
    },
  }
}

export function getMsgInstalledApp() {
  return {
    method: 'ms.channel.emit',
    params: {
      data: '',
      event: 'ed.installedApp.get',
      to: 'host',
    },
  }
}

export function getMsgAppIcon(iconPath: string) {
  return {
    method: 'ms.channel.emit',
    params: {
      data: {
        iconPath,
      },
      event: 'ed.apps.icon',
      to: 'host',
    },
  }
}

export function getMsgLaunchApp(app: App) {
  return {
    method: 'ms.channel.emit',
    params: {
      data: {
        action_type: app.app_type === 2 ? 'DEEP_LINK' : 'NATIVE_LAUNCH',
        appId: app.appId,
      },
      event: 'ed.apps.launch',
      to: 'host',
    },
  }
}

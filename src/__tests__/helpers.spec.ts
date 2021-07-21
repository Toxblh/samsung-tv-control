import {
  chr,
  base64,
  getVideoId,
  getMsgInstalledApp,
  getCommandByKey,
  getMsgLaunchApp,
  getSendTextCommand,
} from '../helpers'
import { KEYS } from '../keys'

describe('helpers', () => {
  it('should return chr', () => {
    expect(chr(0x00)).toEqual('\u0000')
  })

  it('should return base64', () => {
    expect(base64('node')).toEqual('bm9kZQ==')
  })

  it('should return videoId', () => {
    expect(getVideoId('https://www.youtube.com/watch?v=1111111')).toEqual('1111111')
  })

  it('should fail return videoId', () => {
    expect(getVideoId('https://www.youtube.com')).toBeFalsy()
  })

  it('should return command getMsgInstalledApp', () => {
    expect(getMsgInstalledApp()).toEqual({
      method: 'ms.channel.emit',
      params: {
        data: '',
        event: 'ed.installedApp.get',
        to: 'host',
      },
    })
  })

  it('should return command getCommandByKey', () => {
    expect(getCommandByKey(KEYS.KEY_0)).toEqual({
      method: 'ms.remote.control',
      params: {
        Cmd: 'Click',
        DataOfCmd: KEYS.KEY_0,
        Option: 'false',
        TypeOfRemote: 'SendRemoteKey',
      },
    })
  })

  it('should return command getSendTextCommand', () => {
    expect(getSendTextCommand('Text to be inserted')).toEqual({
      method: 'ms.remote.control',
      params: {
        Cmd: 'VGV4dCB0byBiZSBpbnNlcnRlZA==', // base64 representation of "Text to be inserted"
        DataOfCmd: 'base64',
        TypeOfRemote: 'SendInputString',
      },
    })
  })

  it('should return command getMsgLaunchApp', () => {
    expect(
      getMsgLaunchApp({
        appId: '123',
        app_type: 1,
        icon: 'icon',
        is_lock: 0,
        name: 'name',
      }),
    ).toEqual({
      method: 'ms.channel.emit',
      params: {
        data: {
          action_type: 'NATIVE_LAUNCH',
          appId: '123',
        },
        event: 'ed.apps.launch',
        to: 'host',
      },
    })
  })

  it('should return command getMsgLaunchApp DEEP_LINK', () => {
    expect(
      getMsgLaunchApp({
        appId: '123',
        app_type: 2,
        icon: 'icon',
        is_lock: 0,
        name: 'name',
      }),
    ).toEqual({
      method: 'ms.channel.emit',
      params: {
        data: {
          action_type: 'DEEP_LINK',
          appId: '123',
        },
        event: 'ed.apps.launch',
        to: 'host',
      },
    })
  })
})

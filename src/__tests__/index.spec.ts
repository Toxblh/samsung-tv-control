import Samsung from '../index'
import * as fs from 'fs'

jest.mock('fs')

describe('test config', () => {
  it('empty ip', () => {
    expect(() => {
      // @ts-ignore
      const _ = new Samsung({})
    }).toThrow('You must provide IP in config')
  })

  it('empty mac', () => {
    expect(() => {
      // @ts-ignore
      const _ = new Samsung({ ip: '123.123.123.123' })
    }).toThrow('You must provide MAC in config')
  })

  it('check saveToken', () => {
    // @ts-ignore
    const control = new Samsung({ ip: '123.123.123.123', mac: '12:34:56:78:90', saveToken: true })

    jest.spyOn(fs, 'accessSync')
    // @ts-ignore
    expect(control.SAVE_TOKEN).toEqual(true)
    expect(fs.accessSync).toHaveBeenCalled()
  })
})

describe('Tests 8001', () => {
  let control: Samsung
  const config = {
    debug: true, // Default: false
    ip: '192.168.1.2',
    mac: '123456789ABC',
    name: 'NodeJS-Test', // Default: NodeJS
    port: 8001, // Default: 8002
    token: '12345678'
  }

  beforeAll(() => {
    control = new Samsung(config)
  })

  it('Successful create instance', () => {
    expect(control).toBeInstanceOf(Samsung)
  })

  it('Check initial params', () => {
    expect(control).toHaveProperty('IP', config.ip)
    expect(control).toHaveProperty('MAC', config.mac)
    expect(control).toHaveProperty('PORT', config.port)
    expect(control).toHaveProperty('TOKEN', config.token)
    expect(control).toHaveProperty('NAME_APP', 'Tm9kZUpTIFJlbW90ZQ==')
    expect(control).toHaveProperty('LOGGER.DEBUG', config.debug)
    expect(control).toHaveProperty(
      'WS_URL',
      'ws://192.168.1.2:8001/api/v2/channels/samsung.remote.control?name=Tm9kZUpTIFJlbW90ZQ== &token=12345678'
    )
  })
})

describe('Minimal config', () => {
  let control: Samsung
  const config = {
    ip: '192.168.1.2',
    mac: '123456789ABC'
  }

  beforeAll(() => {
    control = new Samsung(config)
  })

  it('Successful create instance', () => {
    expect(control).toBeInstanceOf(Samsung)
  })

  it('Check initial params', () => {
    expect(control).toHaveProperty('IP', config.ip)
    expect(control).toHaveProperty('MAC', config.mac)
    expect(control).toHaveProperty('PORT', 8002)
    expect(control).toHaveProperty('TOKEN', '')
    expect(control).toHaveProperty('NAME_APP', 'Tm9kZUpTIFJlbW90ZQ==')
    expect(control).toHaveProperty('LOGGER.DEBUG', false)
    expect(control).toHaveProperty(
      'WS_URL',
      'wss://192.168.1.2:8002/api/v2/channels/samsung.remote.control?name=Tm9kZUpTIFJlbW90ZQ=='
    )
  })

  it('should sendYouTubeLink', () => {
    const spy = jest.spyOn(control, 'openYouTubeLink')
    control.openYouTubeLink('https://www.youtube.com/watch?v=1111111')

    expect(spy).toHaveBeenCalled()
  })
})

describe('private fns', () => {
  let control: Samsung
  beforeAll(() => {
    const config = { ip: '192.168.1.2', mac: '123456789ABC' }
    control = new Samsung(config)
  })

  it('should saveToken', () => {
    // jest.spyOn(fs, 'writeFileSync')
    jest.spyOn(fs, 'accessSync')

    // @ts-ignore
    control._saveTokenToFile('token')
    expect(fs.accessSync).toHaveBeenCalled()
    // expect(fs.writeFileSync).toHaveBeenCalled()
  })

  it('should saveToken error', () => {
    // @ts-ignore
    jest.spyOn(fs, 'writeFileSync').mockRejectedValue('error')
    jest.spyOn(fs, 'accessSync')

    // @ts-ignore
    control._saveTokenToFile('token')
    expect(fs.accessSync).toHaveBeenCalled()
    expect(fs.writeFileSync).toHaveBeenCalled()
  })
})

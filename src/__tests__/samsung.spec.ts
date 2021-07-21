import Samsung from '../samsung'
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
    token: '12345678',
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
      'ws://192.168.1.2:8001/api/v2/channels/samsung.remote.control?name=Tm9kZUpTIFJlbW90ZQ==&token=12345678',
    )
  })
})

describe('Minimal config', () => {
  let control: Samsung
  const config = {
    ip: '192.168.1.2',
    mac: '123456789ABC',
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
      'wss://192.168.1.2:8002/api/v2/channels/samsung.remote.control?name=Tm9kZUpTIFJlbW90ZQ==',
    )
  })

  it('should sendYouTubeLink', () => {
    const spy = jest.spyOn(control, 'openYouTubeLink')
    control.openYouTubeLink('https://www.youtube.com/watch?v=1111111')

    expect(spy).toHaveBeenCalled()
  })
})

describe('saveToken', () => {
  let control: Samsung
  beforeAll(() => {
    const config = { ip: '192.168.1.2', mac: '123456789ABC' }
    control = new Samsung(config)
  })

  it('should correct save token', () => {
    // jest.spyOn(fs, 'writeFileSync')
    jest.spyOn(fs, 'accessSync')

    // @ts-ignore
    control._saveTokenToFile('token')
    expect(fs.accessSync).toHaveBeenCalled()
    // expect(fs.writeFileSync).toHaveBeenCalled()
  })

  it('should correct save with exeption while save', () => {
    // @ts-ignore
    jest.spyOn(fs, 'writeFileSync').mockRejectedValue('error')
    jest.spyOn(fs, 'accessSync')

    // @ts-ignore
    control._saveTokenToFile('token')
    expect(fs.accessSync).toHaveBeenCalled()
    expect(fs.writeFileSync).toHaveBeenCalled()
  })

  it('should correct read with exeption while read', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('error')
    })

    // @ts-ignore
    let result = control._getTokenFromFile()
    expect(fs.readFileSync).toHaveBeenCalled()
    expect(result).toBe(null)
  })

  it('should correct read token', () => {
    // @ts-ignore
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => '1234')

    // @ts-ignore
    let result = control._getTokenFromFile()
    expect(fs.readFileSync).toHaveBeenCalled()
    expect(result).toBe('1234')
  })
})

describe('getToken', () => {
  it('should return token from response, saveToken is true, but token empty', async () => {
    let _token

    jest.spyOn(fs, 'readFileSync').mockImplementation(() => '')

    Samsung.prototype.sendKey = jest.fn().mockImplementation((_, cb) => {
      cb(null, { data: { token: '1234' } })
    })

    const config = { ip: '192.168.1.2', mac: '123456789ABC', saveToken: true }
    let control = new Samsung(config)

    await control.getToken((token) => {
      _token = token
    })
    expect(_token).toBe('1234')
    // @ts-ignore
    expect(control.TOKEN).toBe('1234')
  })

  it('should return token from response, saveToken is false', async () => {
    let _token

    jest.spyOn(fs, 'readFileSync').mockImplementation(() => '')

    Samsung.prototype.sendKey = jest.fn().mockImplementation((_, cb) => {
      cb(null, { data: { token: '1234' } })
    })

    const config = { ip: '192.168.1.2', mac: '123456789ABC' }
    let control = new Samsung(config)

    await control.getToken((token) => {
      _token = token
    })
    expect(_token).toBe('1234')
    // @ts-ignore
    expect(control.TOKEN).toBe('1234')
  })

  it('should return token from response token is number', async () => {
    let _token

    jest.spyOn(fs, 'readFileSync').mockImplementation(() => '')

    Samsung.prototype.sendKey = jest.fn().mockImplementation((_, cb) => {
      cb(null, { data: { token: 1234 } })
    })

    const config = { ip: '192.168.1.2', mac: '123456789ABC' }
    let control = new Samsung(config)

    await control.getToken((token) => {
      _token = token
    })
    expect(_token).toBe('1234')
    // @ts-ignore
    expect(control.TOKEN).toBe('1234')
  })

  it('should return null, empty response', async () => {
    let _token

    jest.spyOn(fs, 'readFileSync').mockImplementation(() => '')

    Samsung.prototype.sendKey = jest.fn().mockImplementation((_, cb) => {
      cb(null, { data: { token: '' } })
    })

    const config = { ip: '192.168.1.2', mac: '123456789ABC', saveToken: true }
    let control = new Samsung(config)

    await control.getToken((token) => {
      _token = token
    })
    expect(_token).toBe(null)
    // @ts-ignore
    expect(control.TOKEN).toBe('')
  })

  it('should return saved token from file', async () => {
    let _token

    jest.spyOn(fs, 'readFileSync').mockImplementation(() => 'test')

    const config = { ip: '192.168.1.2', mac: '123456789ABC', saveToken: true }
    let control = new Samsung(config)

    await control.getToken((token) => {
      _token = token
    })
    expect(_token).toBe('test')
    // @ts-ignore
    expect(control.TOKEN).toBe('test')
  })
})

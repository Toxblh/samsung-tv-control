import Samsung from '../index'

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
    expect(control).toHaveProperty('DEBUG', config.debug)
    expect(control).toHaveProperty('WS_URL', 'ws://192.168.1.2:8001/api/v2/channels/samsung.remote.control?name=Tm9kZUpTIFJlbW90ZQ== &token=12345678')
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
    expect(control).toHaveProperty('DEBUG', false)
    expect(control).toHaveProperty('WS_URL', 'wss://192.168.1.2:8002/api/v2/channels/samsung.remote.control?name=Tm9kZUpTIFJlbW90ZQ==')
  })
})

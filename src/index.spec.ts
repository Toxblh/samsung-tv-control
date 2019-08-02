import Samsung from './index'

describe('Samsung Class', () => {
  it('Successful create instance', () => {
    const config = {
      debug: true, // Default: false
      ip: '192.168.1.2',
      mac: '123456789ABC',
      name: 'NodeJS-Test', // Default: NodeJS
      port: 8001, // Default: 8002
      token: '12345678',
    }
    const control = new Samsung(config)
    expect(control).toBeInstanceOf(Samsung)
    // @ts-ignore
    expect(control.PORT).toEqual(config.port)
  })

  it('create instance with empty mac in config', () => {
    const config = {
      ip: '192.168.1.2',
    }
    // @ts-ignore
    expect(() => new Samsung(config)).toThrow(Error('You must provide MAC in config'))
  })

  it('create instance with empty ip in config', () => {
    const config = {
      mac: '123456789ABC',
    }
    // @ts-ignore
    expect(() => new Samsung(config)).toThrow(Error('You must provide IP in config'))
  })
})

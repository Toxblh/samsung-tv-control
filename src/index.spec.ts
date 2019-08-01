import Samsung from './index'

describe('sum', () => {
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
  })
})

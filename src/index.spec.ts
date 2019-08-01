import Samsung from './index'

describe('sum', () => {
  it('Successful create instance', () => {
    const config = {
      name: 'NodeJS-Test', // Default: NodeJS
      ip: '192.168.1.2',
      mac: '123456789ABC',
      token: '12345678',
      debug: true // Default: false
    }

    const control = new Samsung(config)
    expect(control).toBeInstanceOf(Samsung)
  })
})

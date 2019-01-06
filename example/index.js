const Samsung = require('samsung-tv-control')
const { KEYS } = require('samsung-tv-control/lib/keys')

const config = {
  name: 'NodeJS-Test',
  ip: '192.168.1.2',
  mac: '123456789ABC',
  token: '12345678'
}

const control = new Samsung(config)

control.turnOn()
control.isAvaliable().then(() => {
  control.sendKey(KEYS.KEY_HOME, function(err, res) {
    if (err) {
      throw new Error(err)
    } else {
      console.log(res)
    }
  })
}).catch(e => console.error(e))


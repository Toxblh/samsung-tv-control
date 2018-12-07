const Samsung = require('samsung-tv-control')
const { KEYS } = require('samsung-tv-control/lib/keys')

const config = {
  nameApp: 'NodeJS Remote',
  ip: '192.168.1.2'
}

const control = Samsung(config)

control.isAvaliable()
control.sendKey(KEYS.KEY_POWER, function(err, res) {
  if (err) {
    throw new Error(err)
  } else {
    console.log(res)
  }
})

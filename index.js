const Samsung = require('./lib')

const config = {
  nameApp: 'NodeJS Remote',
  ip: '192.168.1.2'
}

const control = Samsung(config)

control.isAvaliable()
control.sendKey('KEY_VOLUP', function(err, res) {
  if (err) {
    throw new Error(err)
  } else {
    console.log(res)
  }
})

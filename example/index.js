const { Samsung, APPS, KEYS } = require('../lib/index')

const config = {
  debug: true, // Default: false
  ip: '192.168.1.2',
  mac: '123456789ABC',
  name: 'NodeJS-Test', // Default: NodeJS
  port: 8002, // Default: 8002
  token: '12345678',
}

const control = new Samsung(config)

control.turnOn()
control
  .isAvaliable()
  .then(() => {
    // Get token for API
    control.getToken(token => {
      console.info('# Response getToken:', token)
    })

    // Send key to TV
    control.sendKey(KEYS.KEY_HOME, function(err, res) {
      if (!err) {
        console.log('# Response sendKey', res)
      }
    })

    // Send text to focused input on TV
    control.sendText('Text to be inserted in some focused input', function(err, res) {
      if (!err) {
        console.log('# Response sendText', res)
      }
    })

    // Get all installed apps from TV
    control.getAppsFromTV((err, res) => {
      if (!err) {
        console.log('# Response getAppsFromTV', res)
      }
    })

    // Open app by appId which you can get from getAppsFromTV
    control.openApp(APPS.YouTube, (err, res) => {
      if (!err) {
        console.log('# Response openApp', res)
      }
    })
  })
  .catch(e => console.error(e))

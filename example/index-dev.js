const Samsung = require('../lib/index').default
const { KEYS } = require('../lib/keys')
const { APPS } = require('../lib/apps')

const config = {
  name: 'NodeJS-Test', // Default: NodeJS
  ip: '192.168.1.2',
  mac: '123456789ABC',
  token: '12345678',
  debug: true // Default: false
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

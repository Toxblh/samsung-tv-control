const { Samsung, APPS, KEYS } = require('../lib/index')

/*
Typescript Example for Dinamic Keys
import { $enum } from 'ts-enum-util'
*/

const config = {
  debug: true, // Default: false
  ip: '192.168.1.2',
  mac: '123456789ABC',
  nameApp: 'NodeJS-Test', // Default: NodeJS
  port: 8002, // Default: 8002
  token: '12345678',
}

const control = new Samsung(config)

control.turnOn()
control
  .isAvailable()
  .then(() => {
    // Get token for API
    control.getToken((token) => {
      console.info('# Response getToken:', token)
    })

    /*
      Typescript Example for Dinamic Keys
      const KeyTypes = $enum(KEYS).getValues()

      const getEnumValue = (key: any) => {
        return KeyTypes[key]
      }
    */

    // Send key to TV
    control.sendKey(KEYS.KEY_HOME, function (err, res) {
      if (!err) {
        console.log('# Response sendKey', res)
      }
    })

    // Send text to focused input on TV
    control.sendText('Text to be inserted in some focused input', function (err, res) {
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

    // Get app icon by iconPath which you can get from getAppsFromTV
    control.getAppIcon(
      `/opt/share/webappservice/apps_icon/FirstScreen/${APPS.YouTube}/250x250.png`,
      (err, res) => {
        if (!err) {
          console.log('# Response getAppIcon', res)
        }
      },
    )

    // Open app by appId which you can get from getAppsFromTV
    control.openApp(APPS.YouTube, (err, res) => {
      if (!err) {
        console.log('# Response openApp', res)
      }
    })
  })
  .catch((e) => console.error(e))

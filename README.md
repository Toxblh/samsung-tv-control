## 📺 Library for remote control Samsung TV in your NodeJS application.

_Tested with Samsung UE43NU7400 and UN55NU7100_

[![Build Status](https://travis-ci.org/Toxblh/samsung-tv-control.svg?branch=master)](https://travis-ci.org/Toxblh/samsung-tv-control)
[![codecov](https://codecov.io/gh/Toxblh/samsung-tv-control/branch/master/graph/badge.svg)](https://codecov.io/gh/Toxblh/samsung-tv-control)
[![Latest Stable Version](https://img.shields.io/npm/v/samsung-tv-control.svg)](https://www.npmjs.com/package/samsung-tv-control)
[![Downloads total](https://img.shields.io/npm/dt/samsung-tv-control.svg)](https://www.npmjs.com/package/samsung-tv-control)
[![Downloads month](https://img.shields.io/npm/dm/samsung-tv-control.svg)](https://www.npmjs.com/package/samsung-tv-control)
[![License](https://img.shields.io/github/license/Toxblh/samsung-tv-control)](https://www.npmjs.com/package/samsung-tv-control) [![Paypal Donate](https://img.shields.io/badge/paypal-donate-blue.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=WUAAG2HH58WE4) [![Patreon](https://img.shields.io/badge/patreon-support-blue.svg)](https://www.patreon.com/toxblh)

## [📖 Documentation](https://toxblh.github.io/samsung-tv-control/)

## Installation

Requires Node v9 or above.

`npm install samsung-tv-control --save`

## <img src="http://nodered.org/node-red-icon.png" height="32px" /> NODE-RED

Also you can use the lib in your Node-RED https://github.com/Toxblh/node-red-contrib-samsung-tv-control

## Usage

You can try [example code](example/index.js)

```js
// import Samsung, { APPS, KEYS } from 'samsung-tv-control'
const { Samsung, KEYS, APPS } = require('samsung-tv-control')

const config = {
  debug: true, // Default: false
  ip: '192.168.1.2',
  mac: '123456789ABC',
  nameApp: 'NodeJS-Test', // Default: NodeJS
  port: 8001, // Default: 8002
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

    // Send key to TV
    control.sendKey(KEYS.KEY_HOME, function (err, res) {
      if (err) {
        throw new Error(err)
      } else {
        console.log(res)
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

    // Control will keep connection for next messages in 1 minute
    // If you would like to close it immediately, you can use `closeConnection()`
    control.closeConnection()
  })
  .catch((e) => console.error(e))
```

## Commands List

All commands you can find [here](src/keys.ts)

All popular apps you can find [here](src/apps.ts)

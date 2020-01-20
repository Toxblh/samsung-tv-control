## 📺 Library for remote control Samsung TV in your NodeJS application.

_Tested with Samsung UE43NU7400_

[![Build Status](https://travis-ci.org/Toxblh/samsung-tv-control.svg?branch=master)](https://travis-ci.org/Toxblh/samsung-tv-control)
[![codecov](https://codecov.io/gh/Toxblh/samsung-tv-control/branch/master/graph/badge.svg)](https://codecov.io/gh/Toxblh/samsung-tv-control)
[![Latest Stable Version](https://img.shields.io/npm/v/samsung-tv-control.svg)](https://www.npmjs.com/package/samsung-tv-control)
[![Dependency Status](https://david-dm.org/Toxblh/samsung-tv-control.svg)](https://david-dm.org/Toxblh/samsung-tv-control)
[![devDependency Status](https://david-dm.org/Toxblh/samsung-tv-control/dev-status.svg)](https://david-dm.org/Toxblh/samsung-tv-control#info=devDependencies)
[![Downloads total](https://img.shields.io/npm/dt/samsung-tv-control.svg)](https://www.npmjs.com/package/samsung-tv-control)
[![Downloads month](https://img.shields.io/npm/dm/samsung-tv-control.svg)](https://www.npmjs.com/package/samsung-tv-control)
[![License](https://img.shields.io/npm/l/samsung-tv-control.svg)](https://www.npmjs.com/package/samsung-tv-control)

## Installation

Requires Node v9 or above.

`npm install samsung-tv-control --save`

## <img src="http://nodered.org/node-red-icon.png" height="32px" /> NODE-RED

Also you can use the lib in your Node-RED https://github.com/Toxblh/node-red-contrib-samsung-tv-control

## Usage

You can try [example code](example/index.js)

```js
const Samsung = require('samsung-tv-control').default
const { KEYS } = require('samsung-tv-control/lib/keys')
const { APPS } = require('samsung-tv-control/lib/apps')

const config = {
  debug: true, // Default: false
  ip: '192.168.1.2',
  mac: '123456789ABC',
  name: 'NodeJS-Test', // Default: NodeJS
  port: 8001, // Default: 8002
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

    // Open app by appId which you can get from getAppsFromTV
    control.openApp(APPS.YouTube, (err, res) => {
      if (!err) {
        console.log('# Response openApp', res)
      }
    })
  })
  .catch(e => console.error(e))
```

## Commands List

All commands you can find [here](src/keys.ts)

All popular apps you can find [here](src/apps.ts)

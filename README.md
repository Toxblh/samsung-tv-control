### Library for remote control Samsung TV in your NodeJS application.

_Tested with Samsung UE43NU7400_

[![Latest Stable Version](https://img.shields.io/npm/v/samsung-tv-control.svg)](https://www.npmjs.com/package/samsung-tv-control)
[![License](https://img.shields.io/npm/l/samsung-tv-control.svg)](https://www.npmjs.com/package/samsung-tv-control)
[![NPM Downloads](https://img.shields.io/npm/dt/samsung-tv-control.svg)](https://www.npmjs.com/package/samsung-tv-control)

## Installation

Requires Node v9 or above.

`npm install samsung-tv-control --save`

## Usage

```js
const Samsung = require('samsung-tv-control').default
const { KEYS } = require('samsung-tv-control/lib/keys')

const config = {
  name: 'NodeJS-Test',
  ip: '192.168.1.2',
  mac: '123456789ABC',
  token: '12345678'
}

const control = new Samsung(config)

control.turnOn()
control
  .isAvaliable()
  .then(() => {
    control.getToken(res => {
      console.info('TOKEN:', res)
    })

    control.sendKey(KEYS.KEY_HOME, function(err, res) {
      if (err) {
        throw new Error(err)
      } else {
        console.log(res)
      }
    })
  })
  .catch(e => console.error(e))
```

## Commands List

All commands you can find [here](src/keys.ts)

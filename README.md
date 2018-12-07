### Library for remote control Samsung TV in your NodeJS application.
*Tested with Samsung UE43NU7400*

[![Latest Stable Version](https://img.shields.io/npm/v/samsung-tv-control.svg)](https://www.npmjs.com/package/samsung-tv-control)
[![License](https://img.shields.io/npm/l/samsung-tv-control.svg)](https://www.npmjs.com/package/samsung-tv-control)
[![NPM Downloads](https://img.shields.io/npm/dt/samsung-tv-control.svg)](https://www.npmjs.com/package/samsung-tv-control)

## Installation

Requires Node v9 or above.

`npm install samsung-tv-control --save`

## Usage

```js
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
```

## Commands List

All commands you can find [here](src/keys.ts)

## TODO 
 - [ ] Commands shoudn't request access every time
 - [ ] TurnOn TV from any state

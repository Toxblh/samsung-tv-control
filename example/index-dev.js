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
  saveToken: true
}

const control = new Samsung(config)

async function main() {
  await control.turnOn()
  await control.isAvailable()

  let token = await control.getTokenPromise()
  console.log('$$ token:', token)

  /*
    Typescript Example
    const KeyTypes = $enum(KEYS).getValues()

    const getEnumValue = (key: any) => {
      return KeyTypes[key]
    }
  */

  await control.sendKeyPromise(KEYS.KEY_HOME)
  await control.sendTextPromise('Text to be inserted in some focused input')
  await control.getAppsFromTVPromise()
  await control.openApp(APPS.Spotify)
  // await control.openApp(APPS.YouTube)
  await control.sendKeyPromise(KEYS.KEY_POWER)
  await control.getLogs()
  control.closeConnection()
  return
}

main()

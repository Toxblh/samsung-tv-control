const { Samsung, APPS, KEYS } = require('../lib/index')

const config = {
  debug: true, // Default: false
  ip: '192.168.1.2',
  mac: '123456789ABC',
  name: 'NodeJS-Test', // Default: NodeJS
  saveToken: true
}

const control = new Samsung(config)

async function main() {
  await control.turnOn()
  await control.isAvaliable()

  let token = await control.getTokenPromise()
  console.log('$$ token:', token)

  await control.sendKeyPromise(KEYS.KEY_HOME)
  await control.sendTextPromise('Text to be inserted in some focused input')
  await control.getAppsFromTVPromise()
  await control.openApp(APPS.Spotify)
  // await control.openApp(APPS.YouTube)
  await control.sendKeyPromise(KEYS.KEY_POWER)
  await control.getLogs()
  return
}

main()

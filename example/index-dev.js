const Samsung = require('../lib/index').default
const { KEYS } = require('../lib/keys')
const { APPS } = require('../lib/apps')

const config = {
  debug: true, // Default: false
  ip: '192.168.1.3',
  mac: '641CA1234567',
  name: 'NodeJS-Test', // Default: NodeJS
}

const control = new Samsung(config)

async function main() {
  await control.turnOn()
  await control.isAvaliable()

  let token = await control.getTokenPromise({})
  console.log('$$ token:', token)

  await control.sendKeyPromise(KEYS.KEY_HOME)
  await control.getAppsFromTVPromise()
  await control.openApp(APPS.Spotify)
  await control.openApp(APPS.YouTube)
  await control.getLogs()
}


main()

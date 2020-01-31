const Samsung = require('../lib/index').default
const { KEYS } = require('../lib/keys')
const { APPS } = require('../lib/apps')

const config = {
  debug: true, // Default: false
  ip: '192.168.123.3',
  mac: '641CAE48826E',
  token: '38689911',
}

const control = new Samsung(config)

async function main() {
  await control.turnOn()
  await control.isAvaliable()

  let token = await control.getTokenPromise()
  console.log('$$ token:', token)

  await control.sendKeyPromise(KEYS.KEY_HOME)
  await control.getAppsFromTVPromise()
  await control.openApp(APPS.Spotify)
  // await control.openApp(APPS.YouTube)
  await control.sendKeyPromise(KEYS.KEY_POWER)
  await control.getLogs()
  return
}

main()

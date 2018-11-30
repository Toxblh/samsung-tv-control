const WebSocket = require('ws')
const request = require('request')

module.exports = function(config) {
  if (!config.ip) {
    throw new Error('You must provide IP in config')
  }

  const IP = config.ip
  const PORT = '8002'
  const NAME_APP = new Buffer.from(config.nameApp || 'NodeJS Remote').toString('base64')

  return {
    sendKey: function(key, done) {
      var ws = new WebSocket(
        `wss://${IP}:${PORT}/api/v2/channels/samsung.remote.control?name=${NAME_APP}=&token=10985883`,
        { rejectUnauthorized: false }
      )

      ws.on('message', function(data) {
        var cmd = {
          method: 'ms.remote.control',
          params: {
            Cmd: 'Click',
            DataOfCmd: key,
            Option: 'false',
            TypeOfRemote: 'SendRemoteKey'
          }
        }

        data = JSON.parse(data)
        if (data.event === 'ms.channel.connect') {
          ws.send(JSON.stringify(cmd))
          ws.close()
        }
      })

      ws.on('response', function(response) {
        console.log(response)
      })

      ws.on('error', function(err) {
        let errorMsg = ''
        if (err.code === 'EHOSTUNREACH' || err.code === 'ECONNREFUSED') {
          errorMsg = 'TV is off or unavalible'
        }
        console.error(errorMsg, err)
      })
    },

    isAvaliable: function() {
      request.get({ url: `http://${config.ip}:8001/api/v2/`, timeout: 3000 }, function(
        err,
        res
      ) {
        if (!err && res.statusCode === 200) {
          console.info('TV is avaliable')
          return true
        } else {
          console.error('No response from TV')
          return false
        }
      })
    }
  }
}

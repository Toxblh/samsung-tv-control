#!/usr/bin/env node
'use strict'
const vorpal = require('vorpal')()

let remote = null
const send = function(key, callback) {
  if (remote) {
    return remote.send('KEY_' + key, callback)
  } else {
    return callback(new Error('No remote.'))
  }
}

const remoteKeys = ['ENTER']

// Add commands
vorpal.command('connect [ip]', 'Connect to TV').action(function(args, callback) {
  if (args.ip) {
    remote = new SamsungRemote({
      ip: args.ip // '192.168.1.126' // required: IP address of your Samsung Smart TV
    })
    this.log('Connecting to ' + args.ip)
    callback()
  } else {
    findTV((error, ip) => {
      if (error) {
        return callback(error)
      }
      if (!ip) {
        return callback(new Error('No Smart TV found.'))
      }
      this.log('Connecting to ' + ip)
      remote = new SamsungRemote({
        ip: ip
      })
      callback()
    })
  }
})

vorpal.command('alive', 'Check if TV is alive').action(function(args, callback) {
  if (remote) {
    return remote.isAlive(error => {
      if (error) {
        this.log('TV is offline.')
      } else {
        this.log('TV is alive.')
      }
      return callback()
    })
  } else {
    return callback(new Error('No remote.'))
  }
})

for (let key of remoteKeys) {
  let commandName = key.toLowerCase() //.split('_').join(' ');
  // Check to see if command already exists
  if (vorpal.find(commandName)) {
    commandName = `tv_${commandName}`
  }
  let command = `${commandName} [repeat] [delay]`
  // Add command
  vorpal.command(command, `Press ${commandName} key (KEY_${key})`).action(function(args, callback) {
    let repeat = args.repeat || 1
    let delay = args.delay || 300
    let tasks = []
    for (var i = 1; i <= repeat; i++) {
      tasks.push(key)
      if (i !== repeat) {
        tasks.push(delay)
      }
    }
    async.eachSeries(
      tasks,
      (task, callback) => {
        if (typeof task === 'string') {
          return send(task, callback)
        } else {
          return setTimeout(callback, task)
        }
      },
      callback
    )
  })
}

vorpal.delimiter('TV$').show()

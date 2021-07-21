import * as fs from 'fs'

interface LoggerConfig {
  DEBUG_MODE: boolean
}

interface LogMessage {
  funcName?: string
  logData: object | string
  message: string
  time: string
  type: TypeLog
}

enum TypeLog {
  ERROR = 'ERROR',
  LOG = 'LOG',
}

class Logger {
  private DEBUG: boolean = false
  private LogFile: LogMessage[] = []

  constructor(config: LoggerConfig) {
    this.DEBUG = config.DEBUG_MODE
  }

  public log(message: string, logData: object | string, funcName?: string) {
    this._addLogItem(TypeLog.LOG, message, logData, funcName)
  }

  public error(message: string, logData: object | string, funcName?: string) {
    this._addLogItem(TypeLog.ERROR, message, logData, funcName)
  }

  public saveLogToFile() {
    const nameOfFile = `log-${new Date().toISOString()}.txt`
    const file = fs.createWriteStream(nameOfFile)

    file.on('error', (err: Error) => {
      console.error('ERROR: Failed to write log file!', err)
      console.error('LOG File will be output in console!')
      console.info('----- LOG ------')
      this.LogFile.forEach((item) => console.info(this._printLog(item)))
      console.info('-- END OF LOG --')
    })

    file.on('finish', () => {
      console.log(`Wrote log to file "${nameOfFile}"`)
    })

    this.LogFile.forEach((item) => {
      file.write(this._printLog(item) + '\n')
    })

    file.end()
  }

  private _addLogItem(type: TypeLog, message: string, logData: object | string, funcName?: string) {
    if (!this.DEBUG) {
      return
    }

    let cnsl: Console['error'] | Console['log'] | Console['info']

    switch (type) {
      case TypeLog.ERROR:
        cnsl = console.error
        break

      case TypeLog.LOG:
        cnsl = console.info
        break

      default:
        cnsl = console.log
        break
    }

    this.LogFile.push({
      funcName,
      logData,
      message,
      time: new Date().toISOString(),
      type,
    })

    if (funcName) {
      cnsl(`# [${new Date().toISOString()}] #`)
      cnsl('FUNCTION:', funcName)
      cnsl(type, message)
      cnsl(logData)
      cnsl('### ### ###\n')
      return
    }

    cnsl(`# [${new Date().toISOString()}] #`)
    cnsl(type, message)
    cnsl(logData)
    cnsl('### ### ###\n')
  }

  private _printLog(item: LogMessage) {
    return `[${item.time}] ${item.type}${item.funcName ? ' "' + item.funcName + '": ' : ''} ${
      item.message
    } - ${JSON.stringify(item.logData, null, 2)}`
  }
}

export default Logger

import Logger from './logger'

describe('Logger', () => {
  it('Successful create instance', () => {
    const config = {
      DEBUG_MODE: true,
    }

    expect(new Logger(config)).toBeInstanceOf(Logger)
  })

  it('add log item', () => {
    const config = {
      DEBUG_MODE: true,
    }

    const logger = new Logger(config)

    expect(logger.log('log message', 'log data', 'function name')).toBeUndefined()
  })

  it('add error item', () => {
    const config = {
      DEBUG_MODE: true,
    }

    const logger = new Logger(config)

    expect(logger.error('error message', 'error data', 'error function name')).toBeUndefined()
  })

  it('write to file', () => {
    const config = {
      DEBUG_MODE: true,
    }

    const logger = new Logger(config)
    logger.log('log message', 'log data', 'function name')
    logger.error('error message', 'error data', 'error function name')

    expect(logger.saveLogToFile()).toBeUndefined()
  })

})

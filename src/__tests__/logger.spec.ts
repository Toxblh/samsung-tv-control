import Logger from '../logger'

describe('Logger', () => {
  const config = {
    DEBUG_MODE: true,
  }
  let logger: Logger

  beforeEach(() => {
    logger = new Logger(config)
  })

  it('Successful create instance', () => {
    expect(logger).toBeInstanceOf(Logger)
  })

  it('add log item', async () => {
    expect(logger.log('log message', 'log data', 'function name')).toBeUndefined()
  })

  it('add error item', async () => {
    expect(logger.error('error message', 'error data', 'error function name')).toBeUndefined()
  })

  it('write to file', async () => {
    logger.log('log message', 'log data', 'function name')
    logger.error('error message', 'error data', 'error function name')

    expect(logger.saveLogToFile()).toBeUndefined()
  })
})

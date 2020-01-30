import { CoreOptions, Response, RequestCallback } from 'request'

const request = (url: string, options?: CoreOptions, callback?: RequestCallback) => {
  if (callback) {
    callback(
      null,
      {
        statusCode: 200,
        statusMessage: '200',
        request: {},
        body: 'any',
        caseless: {},
        toJSON: {}
      } as Response,
      'data'
    )
  }
}

export default request

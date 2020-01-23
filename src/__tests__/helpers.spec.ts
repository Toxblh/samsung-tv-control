import {chr, base64} from '../helpers'

describe('helpers', () => {
  it('should return chr', () => {
    expect(chr(0x00)).toEqual('\u0000')
  })

  it('should return base64', () => {
    expect(base64('node')).toEqual('bm9kZQ==')
  })
})

import { greeter } from '../src'

/**
 * Greeter test
 */
describe('Greeter test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('returns "hello bob"', () => {
    expect(greeter('bob')).toBe('hello bob')
  })
})

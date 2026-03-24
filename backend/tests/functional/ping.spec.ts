import { test } from '@japa/runner'

test.group('Ping', () => {
  test('it should pass', async ({ assert }) => {
    assert.isTrue(true)
  })
})

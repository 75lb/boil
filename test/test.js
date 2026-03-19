import { strict as a } from 'assert'

const [test, only, skip] = [new Map(), new Map(), new Map()]

test.set('simple', async function () {
})

export { test, only, skip }

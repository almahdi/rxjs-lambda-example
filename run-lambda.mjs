import assert from 'assert/strict';
import { handler } from './index.mjs';

async function run() {
  const event = {};
  const context = {};

  // start high-resolution timer (nanoseconds)
  const start = process.hrtime.bigint();
  const res = await handler(event, context);
  const end = process.hrtime.bigint();
  const durationNs = end - start;
  const durationMs = Number(durationNs) / 1e6; // floating ms
  const billedMs = Math.ceil(durationMs); // AWS billable ms (rounded up)

  assert.equal(res.statusCode, 200, 'expected statusCode 200');
  assert.equal(res.headers['Content-Type'], 'application/json', 'expected JSON header');

  const body = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
  //assert.equal(body?.message, 'Hello, World!', 'expected hello message');

  //console.log('PASS — handler returned expected response');
  console.dir(res, { depth: null, colors: true });
  console.log('--------------------');
  console.dir(body, { depth: null, colors: true });
  console.log('--------------------');
  console.log(`Execution time: ${durationMs.toFixed(3)} ms (billed: ${billedMs} ms)`);
}

run().catch(err => {
  console.error('FAIL —', err);
  process.exit(1);
});

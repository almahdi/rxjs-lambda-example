# event-driven-logic

A small example project that demonstrates an event-driven / RxJS-based Lambda-style handler which simulates downloading and unzipping files.

This repository contains a minimal Lambda handler implemented with RxJS (bundled locally as `rxjs.umd.min.js`) and a small test harness to run the handler locally.

## Repository layout

- `index.mjs` — Exports an async `handler(event, context)` function which runs a simulated processing pipeline using RxJS and returns an API Gateway-style response.
- `run-lambda.mjs` — Test harness that imports `handler` and asserts the response; also prints details and execution time.
- `rxjs.umd.min.js` — Local UMD build of RxJS used by `index.mjs`.
- `package.json` — Project manifest. `npm test` runs the test harness.

## Requirements

- Node.js (v22+ recommended). The project uses ES modules (`.mjs`).
- Dependencies are listed in `package.json` (dev dependency: `rxjs`). The repository already includes `rxjs.umd.min.js` for offline use.

## Quick start

1. Install dependencies (if you want to use the npm-installed rxjs or update deps):

   npm install

2. Run the test harness (this runs `node run-lambda.mjs`):

   npm test

The harness will invoke the handler and print the response and timing information.

## What the handler does

- Simulates downloading several files (configured in `index.mjs`) using RxJS streams, with timers representing fetch/unzip latency.
- One of the files is set to simulate a network error; errors are caught and reported per-file.
- The handler returns an object with `statusCode`, `headers`, and a JSON `body` that contains a `results` array describing each file's status.

Example response body (partial):

```
{
  "results": [
    { "name": "archive-01.gz", "status": "success" },
    { "name": "data-corrupt.gz", "status": "failed", "error": "Network Failed (404 Not Found)" },
    ...
  ]
}
```
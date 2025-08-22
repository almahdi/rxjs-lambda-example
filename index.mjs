// Exports a single async function `handler(event, context)`.
// Returns an HTTP-style response compatible with API Gateway (proxy) integration.
/** @type {import('rxjs')} */
import rxjs from './rxjs.umd.min.js'; // Download URL: https://unpkg.com/rxjs@latest/dist/bundles/rxjs.umd.min.js
const { from, of, timer, throwError, lastValueFrom } = rxjs;
const { map, mergeMap, tap, finalize, toArray, catchError, concatMap } = rxjs.operators;

const FILES_TO_PROCESS = [
    { name: 'archive-01.gz', fetchTime: 1200, unzipTime: 800 },
    { name: 'document.gz', fetchTime: 800, unzipTime: 400 },
    { name: 'backup-large.gz', fetchTime: 2000, unzipTime: 1500 },
    { name: 'data-corrupt.gz', fetchTime: 1500, unzipTime: 0, shouldFail: true },
    { name: 'media-pack.gz', fetchTime: 1000, unzipTime: 1200 },
];


const downloadFile = (file) => of(null).pipe(
    tap(() => { console.log(`Downloading file ${file.name}...`); }),
    mergeMap(() => timer(file.fetchTime)),
    mergeMap(() => {
        if (file.shouldFail) {
            // Simulate a network error
            return throwError(() => new Error(`Network Failed (404 Not Found)`));
        }
        // Fetch successful, proceed to unzip
        return of(null);
    }),
    tap(() => { console.log(`Download complete: ${file.name}`); }),
    tap(() => { console.log(`Unzipping file ${file.name}...`); }),
    mergeMap(() => timer(file.unzipTime)),
    tap(() => { console.log(`Unzip complete: ${file.name}`); }),
    map(() => ({ name: file.name, status: 'success' }))
);

const startProcess = () => from(FILES_TO_PROCESS).pipe(
    // To make it parallel, use mergeMap, for synchronus use concatMap
    mergeMap(file => downloadFile(file).pipe(
        catchError(error => {
            console.error(`Error processing file ${file.name}: ${error.message}`);
            return of({ name: file.name, status: 'failed', error: error.message });
        })
    )),
    toArray(),
    finalize(() => { console.log('All files processed'); })
);

export async function handler(event, context) {
    // Ideally we would switch based on the event, like creating an event router.
    console.log('Event:', event);
    // Example:
    /*
        function processEvent(event) {
            if(event.type === 'file.process') {
                return startProcess();
            }
        }
        of(event).pipe(
            map(processEvent)
        )
    */
    return await lastValueFrom(
        // of({
        //     statusCode: 200,
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ message: 'Hello, World!' }),
        // })
        startProcess().pipe(
            map(results => ({
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ results })
            })),
            catchError(error => of({
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: error.message })
            })))
    );
};


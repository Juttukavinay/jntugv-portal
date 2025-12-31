const pdfLib = require('pdf-parse');
// Create a minimal valid PDF buffer to test if possible, or just a dummy one that might fail later but allows instantiation
// A dummy buffer will likely throw "Invalid PDF" during parsing, but we want to inspect the API.
const buffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000110 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n150\n%%EOF');

async function test() {
    console.log('--- Testing Instance ---');
    try {
        const instance = new pdfLib.PDFParse(buffer);
        console.log('Instance created.');
        console.log('Checking instance type:', typeof instance);
        console.log('Instance keys:', Object.keys(instance));
        console.log('Instance prototype keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));

        // Does it look like a promise?
        if (typeof instance.then === 'function') {
            console.log('Instance IS a Promise!');
            const result = await instance;
            console.log('Result keys:', Object.keys(result));
        }
    } catch (e) {
        console.log('Error:', e);
    }
}
test();

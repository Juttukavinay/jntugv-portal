const pdfLib = require('pdf-parse');
console.log('--- DEBUG INFO ---');
console.log('Type:', typeof pdfLib);
console.log('Is Function?', typeof pdfLib === 'function');
console.log('Keys:', Object.keys(pdfLib));
console.log('Export Value:', pdfLib);

try {
    if (typeof pdfLib === 'function') {
        console.log('It is a function, trying dummy call...');
        // pdfLib(Buffer.from('...')).catch(e => console.log('Dummy call error (expected):', e.message));
    } else {
        console.log('It is NOT a function.');
        if (pdfLib.default) {
            console.log('Has .default:', typeof pdfLib.default);
        }
    }
} catch (e) {
    console.log('Error verifying:', e);
}
console.log('--- END DEBUG ---');

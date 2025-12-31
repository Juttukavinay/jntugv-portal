const pdfLib = require('pdf-parse');
const buffer = Buffer.from('Dummy content');

console.log('--- Testing Invocation ---');
try {
    console.log('Trying new pdfLib.PDFParse(buffer)...');
    const parser = new pdfLib.PDFParse(buffer);
    console.log('Success with NEW!');
} catch (e) {
    console.log('Failed with NEW:', e.message);
}

try {
    console.log('Trying pdfLib.PDFParse(buffer)...');
    const result = pdfLib.PDFParse(buffer);
    console.log('Success WITHOUT new!');
} catch (e) {
    console.log('Failed WITHOUT new:', e.message);
}

// Maybe the default export IS the function but I missed it?
// Re-check keys
console.log('Keys:', Object.keys(pdfLib));

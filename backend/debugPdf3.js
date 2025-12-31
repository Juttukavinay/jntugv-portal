const pdfLib = require('pdf-parse');
console.log('Testing pdfLib.PDFParse...');
try {
    if (typeof pdfLib.PDFParse === 'function') {
        console.log('pdfLib.PDFParse IS a function!');
    } else {
        console.log('pdfLib.PDFParse is ' + typeof pdfLib.PDFParse);
    }
} catch (e) {
    console.log(e);
}

const pdf = require('pdf-parse');
console.log('Type of export:', typeof pdf);
console.log('Export:', pdf);
if (typeof pdf !== 'function') {
    console.log('Properties:', Object.keys(pdf));
}

const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://127.0.0.1:27017/timetable_db';

console.log('Connecting to:', MONGO_URI);
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected successfully');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed:', err);
        process.exit(1);
    });

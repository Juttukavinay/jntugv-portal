const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/university-scheduler');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const wipe = async () => {
    await connectDB();
    try {
        // Define minimal schema or just use collection directly
        const collections = await mongoose.connection.db.listCollections().toArray();
        const timetableCollection = collections.find(c => c.name === 'timetables');

        if (timetableCollection) {
            await mongoose.connection.db.collection('timetables').deleteMany({});
            console.log('All timetables have been deleted successfully.');
        } else {
            console.log('Timetables collection not found.');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

wipe();

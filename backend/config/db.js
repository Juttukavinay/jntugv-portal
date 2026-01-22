const mongoose = require('mongoose');

const connectDB = async () => {
    let connected = false;
    while (!connected) {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000
            });
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            connected = true;
        } catch (error) {
            console.error(`MongoDB connection error: ${error.message}`);
            console.log('Retrying in 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

module.exports = connectDB;

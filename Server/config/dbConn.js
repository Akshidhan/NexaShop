const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongodbPass = process.env.MONGODB_PASSWORD;
        if (!mongodbPass) {
          console.error('MONGODB_PASSWORD is not set in the environment variables.');
          process.exit(1);
        }
        await mongoose.connect(process.env.DATABASE_URI);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
}
module.exports = connectDB;
const mongoose = require('mongoose');
require('dotenv').config();

const dropIndex = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected');

    // Drop the problematic index
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    try {
      await collection.dropIndex('username_1');
      console.log('Successfully dropped username_1 index');
    } catch (error) {
      console.error('Error dropping index:', error.message);
    }

    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropIndex();

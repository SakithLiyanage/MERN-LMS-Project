const mongoose = require('mongoose');
require('dotenv').config();

const dropIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
    console.log('MongoDB Connected');

    // Get the users collection
    const db = mongoose.connection;
    const collection = db.collection('users');

    // List all indexes
    console.log('Current indexes:');
    const indexes = await collection.indexes();
    console.log(indexes);

    // Drop the problematic username index
    try {
      const result = await collection.dropIndex('username_1');
      console.log('Successfully dropped username_1 index:', result);
    } catch (error) {
      console.error('Error dropping index:', error.message);
    }

    // List indexes after drop
    console.log('Updated indexes:');
    const updatedIndexes = await collection.indexes();
    console.log(updatedIndexes);

    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropIndex();

const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// Connect to MongoDB
async function fixMongoIndex() {
  try {
    // Use the same connection string as your server
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms_new';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    // Get direct access to the collection
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check for users collection
    if (collections.find(c => c.name === 'users')) {
      const users = db.collection('users');
      
      // List all indexes
      const indexes = await users.indexes();
      console.log('Current indexes on users collection:', indexes);
      
      // Find and drop username index if it exists
      const usernameIndex = indexes.find(idx => 
        idx.key && idx.key.username === 1
      );
      
      if (usernameIndex) {
        console.log('Found username index:', usernameIndex.name);
        await users.dropIndex(usernameIndex.name);
        console.log('Successfully dropped username index');
      } else {
        console.log('No username index found');
      }
      
      // List remaining indexes
      const remainingIndexes = await users.indexes();
      console.log('Remaining indexes:', remainingIndexes);
    } else {
      console.log('Users collection not found');
    }
    
    console.log('Script completed successfully.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixMongoIndex();

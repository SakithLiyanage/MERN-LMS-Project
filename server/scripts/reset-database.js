const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function resetDatabase() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms_system_new';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB at', mongoURI);

    // Drop the entire users collection
    const result = await mongoose.connection.db.dropCollection('users')
      .catch(err => {
        if (err.codeName === 'NamespaceNotFound') {
          console.log('Collection does not exist, no need to drop');
          return { ok: 1 };
        }
        throw err;
      });
    
    console.log('Drop collection result:', result);
    console.log('Database reset complete');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetDatabase();

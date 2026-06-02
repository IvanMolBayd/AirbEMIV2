const mongoose = require('mongoose');
const fs = require('fs');

// Read .env from current folder to get MONGO_URI
const envPath = './.env';
let mongoUri = 'mongodb://localhost:27017/airbemi_db';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^MONGO_URI=(.*)$/m);
  if (match && match[1]) {
    mongoUri = match[1].trim();
    console.log('Loaded MONGO_URI from .env');
  }
}

async function run() {
  console.log('Attempting to connect to MongoDB...');
  console.log('URI:', mongoUri.replace(/:([^@]+)@/, ':****@')); // Hide password
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Successfully connected to MongoDB!');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(col => console.log(` - ${col.name}`));
    
    // Count items in major collections
    const collectionsToCount = ['properties', 'users', 'reservations', 'reviews'];
    for (const name of collectionsToCount) {
      try {
        const count = await db.collection(name).countDocuments();
        console.log(`\nCollection "${name}" has ${count} documents.`);
        if (count > 0) {
          const sample = await db.collection(name).findOne();
          console.log(`Sample document from "${name}":`, JSON.stringify(sample, null, 2));
        }
      } catch (err) {
        console.log(`Could not query collection "${name}":`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
}

run();

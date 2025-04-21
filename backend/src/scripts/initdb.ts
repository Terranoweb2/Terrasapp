import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';
import fs from 'fs';
import path from 'path';
import { connectDB, disconnectDB } from '../config/database';

// Load environment variables
dotenv.config();

async function init() {
  try {
    // Connect to MongoDB using the database configuration
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Check if Users collection exists
    if (!mongoose.connection || !mongoose.connection.db) {
      console.error('Database connection not established');
      return;
    }
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Existing collections:', collectionNames);
      
      // Create default admin user if Users collection is empty
      const userCount = await User.countDocuments();
      
      if (userCount === 0) {
        console.log('Creating default admin user...');
        
        const adminUser = new User({
          name: 'Admin User',
          email: 'admin@terrasapp.com',
          password: 'admin123',
          phoneNumber: '+123456789',
          verified: true,
          status: 'online',
        });
        
        await adminUser.save();
        console.log('Admin user created successfully.');
        console.log('Email: admin@terrasapp.com');
        console.log('Password: admin123');
      } else {
        console.log(`Users collection already contains ${userCount} documents.`);
      }
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('Created uploads directory.');
      }
      
      console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  } finally {
    // Close the MongoDB connection
    await disconnectDB();
  }
}

// Run the initialization function
init().catch(error => {
  console.error('Fatal error during initialization:', error);
  process.exit(1);
});

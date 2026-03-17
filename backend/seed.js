// Seed script to create admin user
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Seeding data...\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@neediest.com' });

    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: 'admin@neediest.com',
        phone: '9999999999',
        password: 'admin123',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          address: 'NeedNest HQ',
          pincode: '400001'
        },
        role: 'admin'
      });
      console.log('✅ Admin user created:');
      console.log('   Email: admin@neediest.com');
      console.log('   Password: admin123\n');
    } else {
      console.log('ℹ️  Admin user already exists.\n');
    }

    console.log('🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();

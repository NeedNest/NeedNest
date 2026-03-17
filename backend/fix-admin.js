require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

(async () => {
  await connectDB();
  const result = await User.findOneAndUpdate(
    { email: 'admin@neediest.com' },
    { role: 'admin', name: 'Admin', userType: 'both' },
    { new: true }
  );
  if (result) {
    console.log('✅ Admin role set for:', result.email, '| Role:', result.role);
  } else {
    console.log('❌ User not found. Running full seed instead...');
  }
  process.exit(0);
})();

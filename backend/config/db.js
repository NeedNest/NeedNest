const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS — ISP/network DNS blocks MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  const atlasURI = process.env.MONGODB_URI;
  const localURI = 'mongodb://127.0.0.1:27017/neednest';

  // Try Atlas first
  try {
    const conn = await mongoose.connect(atlasURI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    return;
  } catch (atlasError) {
    console.warn(`⚠️  Atlas connection failed: ${atlasError.message}`);
    console.log('🔄 Trying local MongoDB fallback...');
  }

  // Fall back to local MongoDB
  try {
    const conn = await mongoose.connect(localURI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
  } catch (localError) {
    console.error('❌ Both Atlas and local MongoDB failed.');
    process.exit(1);
  }
};

module.exports = connectDB;

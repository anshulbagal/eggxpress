/**
 * create-admin.js
 * Run once from the backend folder to seed an admin account:
 *   node create-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL || 'admin@eggxpress.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';
const ADMIN_NAME     = process.env.ADMIN_NAME || 'EggXpress Admin';

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('✅ Connected to MongoDB');

  // Remove old admin if exists so this script is re-runnable
  await User.deleteOne({ email: ADMIN_EMAIL });

  const admin = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  });

  console.log('\n🎉 Admin account created!');
  console.log('   Email   :', ADMIN_EMAIL);
  console.log('   Password:', ADMIN_PASSWORD);
  console.log('   Role    :', admin.role);
  console.log('   ID      :', admin._id);
  console.log('\nLog in at http://localhost:3000/auth\n');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});

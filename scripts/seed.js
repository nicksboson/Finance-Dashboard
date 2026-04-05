require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/User');

const SEED_USERS = [
  {
    name: 'Alice Admin',
    email: 'alice@finance.dev',
    password: 'admin123',
    role: 'admin',
    status: 'active',
  },
  {
    name: 'Bob Analyst',
    email: 'bob@finance.dev',
    password: 'analyst123',
    role: 'analyst',
    status: 'active',
  },
  {
    name: 'Carol Viewer',
    email: 'carol@finance.dev',
    password: 'viewer123',
    role: 'viewer',
    status: 'active',
  },
];

const seed = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/financedb';

  try {
    await mongoose.connect(uri);
    console.log('[SEED] Connected to MongoDB');

    for (const userData of SEED_USERS) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`[SEED] Skipped (already exists): ${userData.email}`);
        continue;
      }
      const user = await User.create(userData);
      console.log(`[SEED] Created user: ${user.name} (${user.role}) — ID: ${user._id}`);
    }

    console.log('[SEED] Done.');
  } catch (err) {
    console.error(`[SEED] Error: ${err.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();

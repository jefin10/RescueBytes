import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import RescueCenter from './models/rescueCenter.model.js';
import User from './models/user.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_DB_URI || 'mongodb://localhost:27017/rescuebytes';

await mongoose.connect(MONGO_URI);
console.log('Connected to MongoDB');

// Ensure the Kottayam rescue center exists
let rc = await RescueCenter.findOne({ location: 'Kottayam' });
if (!rc) {
  rc = await RescueCenter.create({ location: 'Kottayam', contactNumber: '0000000000' });
  console.log('Created rescue center: Kottayam');
} else {
  console.log('Rescue center found:', rc.location);
}

// Check if admin already exists
const existing = await User.findOne({ email: 'kottayam@email.com' });
if (existing) {
  console.log('User kottayam@email.com already exists — skipping.');
  await mongoose.disconnect();
  process.exit(0);
}

const hashedPassword = await bcrypt.hash('admin123', 10);

await User.create({
  name: 'Kottayam Admin',
  email: 'kottayam@email.com',
  password: hashedPassword,
  role: 'admin',
  RescueCenters: rc._id,
  pfpLink: 'https://avatar.iran.liara.run/public',
  sessionToken: uuidv4(),
});

console.log('Admin user created: kottayam@email.com / admin123');
await mongoose.disconnect();

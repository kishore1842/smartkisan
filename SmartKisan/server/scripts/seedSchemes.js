import mongoose from 'mongoose';
import Scheme from '../models/schemeModel.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dotenv loads the correct config file
const envPath = path.resolve(__dirname, '../config/config.env');
dotenv.config({ path: envPath });

const schemes = [];

async function seed() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI not set');
    await mongoose.connect(process.env.MONGO_URI.replace(/`/g, ''), {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await Scheme.deleteMany();
    await Scheme.insertMany(schemes);
    console.log('Schemes seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed(); 
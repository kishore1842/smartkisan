import mongoose from 'mongoose';
import MarketPrice from '../models/marketPriceModel.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan';

const sampleData = [
  {
    commodity: { name: 'Tomato', category: 'Vegetables', unit: 'Kg' },
    market: { name: 'Bangalore', state: 'Karnataka', district: 'Bangalore Urban' },
    priceData: { minPrice: 1500, maxPrice: 2000, modalPrice: 1800, arrivalQuantity: 100, unit: 'Quintal' },
    date: new Date(),
    source: 'Manual',
  },
  {
    commodity: { name: 'Potato', category: 'Vegetables', unit: 'Kg' },
    market: { name: 'Pune', state: 'Maharashtra', district: 'Pune' },
    priceData: { minPrice: 1200, maxPrice: 1700, modalPrice: 1500, arrivalQuantity: 80, unit: 'Quintal' },
    date: new Date(),
    source: 'Manual',
  },
  {
    commodity: { name: 'Wheat', category: 'Grains', unit: 'Kg' },
    market: { name: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur' },
    priceData: { minPrice: 1800, maxPrice: 2200, modalPrice: 2000, arrivalQuantity: 120, unit: 'Quintal' },
    date: new Date(),
    source: 'Manual',
  },
  {
    commodity: { name: 'Onion', category: 'Vegetables', unit: 'Kg' },
    market: { name: 'Nashik', state: 'Maharashtra', district: 'Nashik' },
    priceData: { minPrice: 1000, maxPrice: 1400, modalPrice: 1200, arrivalQuantity: 90, unit: 'Quintal' },
    date: new Date(),
    source: 'Manual',
  },
  {
    commodity: { name: 'Rice', category: 'Grains', unit: 'Kg' },
    market: { name: 'Kolkata', state: 'West Bengal', district: 'Kolkata' },
    priceData: { minPrice: 2000, maxPrice: 2500, modalPrice: 2300, arrivalQuantity: 110, unit: 'Quintal' },
    date: new Date(),
    source: 'Manual',
  },
  {
    commodity: { name: 'Banana', category: 'Fruits', unit: 'Dozen' },
    market: { name: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
    priceData: { minPrice: 900, maxPrice: 1200, modalPrice: 1050, arrivalQuantity: 60, unit: 'Dozen' },
    date: new Date(),
    source: 'Manual',
  },
  {
    commodity: { name: 'Chilli', category: 'Spices', unit: 'Kg' },
    market: { name: 'Guntur', state: 'Andhra Pradesh', district: 'Guntur' },
    priceData: { minPrice: 3000, maxPrice: 4000, modalPrice: 3500, arrivalQuantity: 70, unit: 'Quintal' },
    date: new Date(),
    source: 'Manual',
  },
  {
    commodity: { name: 'Apple', category: 'Fruits', unit: 'Kg' },
    market: { name: 'Shimla', state: 'Himachal Pradesh', district: 'Shimla' },
    priceData: { minPrice: 5000, maxPrice: 7000, modalPrice: 6000, arrivalQuantity: 40, unit: 'Quintal' },
    date: new Date(),
    source: 'Manual',
  },
  {
    commodity: { name: 'Sugarcane', category: 'Grains', unit: 'Kg' },
    market: { name: 'Meerut', state: 'Uttar Pradesh', district: 'Meerut' },
    priceData: { minPrice: 800, maxPrice: 1200, modalPrice: 1000, arrivalQuantity: 200, unit: 'Quintal' },
    date: new Date(),
    source: 'Manual',
  },
  {
    commodity: { name: 'Mango', category: 'Fruits', unit: 'Kg' },
    market: { name: 'Hyderabad', state: 'Telangana', district: 'Hyderabad' },
    priceData: { minPrice: 2500, maxPrice: 3500, modalPrice: 3000, arrivalQuantity: 50, unit: 'Quintal' },
    date: new Date(),
    source: 'Manual',
  }
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  await MarketPrice.deleteMany({});
  await MarketPrice.insertMany(sampleData);
  console.log('✅ MarketPrice collection seeded with sample data!');
  await mongoose.disconnect();
}

seed(); 
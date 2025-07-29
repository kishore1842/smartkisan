import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  eligibility: { type: String, required: true },
  benefit: { type: String },
  deadline: { type: String },
  category: { type: String },
  website: { type: String }
}, {
  timestamps: true
});

const Scheme = mongoose.model('Scheme', schemeSchema);
export default Scheme; 
import mongoose from 'mongoose';

const rescueCenterSchema = new mongoose.Schema({ 
  location: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  }
});

const RescueCenter = mongoose.model('RescueCenter', rescueCenterSchema);

export default RescueCenter;
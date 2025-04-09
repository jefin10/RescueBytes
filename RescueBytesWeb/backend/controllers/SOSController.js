import SOS from '../models/sos.model.js';
import User from '../models/user.model.js';
import RescueCenter from '../models/rescueCenter.model.js';

// Create new SOS alert
export const createSOS = async (req, res) => {
  try {
    const { userId, rescueCenter, location } = req.body;
    
    if (!userId || !location || !rescueCenter) {
      return res.status(400).json({ message: 'User ID, rescue center ID, and location are required' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if rescue center exists
    const rescueCenterExists = await RescueCenter.findById(rescueCenter);
    if (!rescueCenterExists) {
      return res.status(404).json({ message: 'Rescue center not found' });
    }
    
    // Format location data
    const locationString = typeof location === 'object' ? 
      `${location.latitude},${location.longitude}` : 
      location;
    
    // Create new SOS alert
    const newSOS = new SOS({
      location: locationString,
      user: userId,
      rescueCenter: rescueCenter
    });
    
    await newSOS.save();
    
    return res.status(201).json({ 
      message: 'SOS alert created successfully',
      sos: newSOS
    });
  } catch (error) {
    console.error('SOS creation error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all SOS alerts (for admin dashboard)
export const getAllSOS = async (req, res) => {
  try {
    const sosAlerts = await SOS.find()
      .populate('user', 'email pfpLink')
      .populate('rescueCenter', 'location contactNumber')
      .sort({ createdAt: -1 }); // Most recent first
      
    return res.status(200).json(sosAlerts);
  } catch (error) {
    console.error('Get SOS alerts error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get SOS by rescue center ID
export const getSOSByRescueCenter = async (req, res) => {
  try {
    const { rescueCenterId } = req.params;
    
    const sosAlerts = await SOS.find({ rescueCenter: rescueCenterId })
      .populate('user', 'email pfpLink')
      .sort({ createdAt: -1 });
    
    return res.status(200).json(sosAlerts);
  } catch (error) {
    console.error('Get SOS by rescue center error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get SOS by ID
export const getSOSById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sosAlert = await SOS.findById(id)
      .populate('user', 'email pfpLink')
      .populate('rescueCenter', 'location contactNumber');
      
    if (!sosAlert) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }
    
    return res.status(200).json(sosAlert);
  } catch (error) {
    console.error('Get SOS by ID error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get SOS alerts by user ID
export const getSOSByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const sosAlerts = await SOS.find({ user: userId })
      .populate('rescueCenter', 'location contactNumber')
      .sort({ createdAt: -1 });
    
    return res.status(200).json(sosAlerts);
  } catch (error) {
    console.error('Get SOS by user error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete SOS alert
export const deleteSOS = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedSOS = await SOS.findByIdAndDelete(id);
    if (!deletedSOS) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }
    
    return res.status(200).json({ message: 'SOS alert deleted successfully' });
  } catch (error) {
    console.error('Delete SOS error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
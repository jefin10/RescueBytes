import express from 'express';
import {
  createSOS,
  getAllSOS,
  getSOSById,
  getSOSByUser,
  getSOSByRescueCenter,
  deleteSOS
} from '../controllers/SOSController.js';

const router = express.Router();

// Create new SOS alert
router.post('/', createSOS);

// Get all SOS alerts
router.get('/', getAllSOS);

// Get SOS by ID
router.get('/:id', getSOSById);

// Get SOS alerts by user ID
router.get('/user/:userId', getSOSByUser);

// Get SOS alerts by rescue center ID
router.get('/rescuecenter/:rescueCenterId', getSOSByRescueCenter);

// Delete SOS alert
router.delete('/:id', deleteSOS);

export default router;
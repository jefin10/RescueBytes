import mongoose from 'mongoose';
const emergencyReportSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: [],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const EmergencyReport = mongoose.model('EmergencyReport', emergencyReportSchema);

export default EmergencyReport;

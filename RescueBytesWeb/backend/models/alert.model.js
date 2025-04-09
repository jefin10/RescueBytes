import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    severity: {
        type: String,
        required: true
    },
    rescueCenters: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RescueCenter',
        required: true
    }
}, { timestamps: true });

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;

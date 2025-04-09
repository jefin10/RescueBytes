import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phNo: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    fieldOfExpertise: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

export default Volunteer;

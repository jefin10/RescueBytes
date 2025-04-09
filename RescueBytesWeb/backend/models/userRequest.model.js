import mongoose from "mongoose";

const userRequestSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    item: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const UserRequest = mongoose.model('UserRequest', userRequestSchema);

export default UserRequest;

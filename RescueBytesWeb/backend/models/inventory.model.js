import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    item: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true,
        min: 0
    },
    rescueCenters: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RescueCenter',
        required: true
    }
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
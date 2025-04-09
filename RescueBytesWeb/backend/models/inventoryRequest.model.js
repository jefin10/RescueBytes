import mongoose from 'mongoose';
const inventoryRequestSchema = new mongoose.Schema({
    item:{
        type:String,
        required:true
    },
    count:{
        type:Number,
        required:true
    },
    fromCenter:{
        type:String,
        required:true
    },
});

const EmergencyReport = mongoose.model('InventoryRequest', inventoryRequestSchema);

export default EmergencyReport;

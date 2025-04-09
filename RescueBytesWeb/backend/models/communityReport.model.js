
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const communityReportSchema = new Schema({
    type: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    location:{
        type: String,
        required: true,
    },
    approved:{
        type: Boolean,
        default: false
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{ timestamps: true });

const CommunityReport = mongoose.model('CommunityReport', communityReportSchema);

export default CommunityReport;
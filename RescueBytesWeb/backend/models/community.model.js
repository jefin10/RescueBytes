import mongoose from "mongoose";
const Schema = mongoose.Schema;



const CommunitySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
   
    
});

const Community = mongoose.model('Community',CommunitySchema);

export default Community;
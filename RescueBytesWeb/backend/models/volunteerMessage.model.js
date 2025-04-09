import mongoose from "mongoose";

const volunteerMessageScheme = new mongoose.Schema({
    subject:{
        type: String,
        required: true,
    },
    message:{
        type: String,
        required: true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
},{timestamps: true});

const VolunteerMessage = mongoose.model("VolunteerMessage", volunteerMessageScheme);

export default VolunteerMessage;

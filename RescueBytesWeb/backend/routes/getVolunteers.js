import VolunteerMessage from "../models/volunteerMessage.model.js";
import Volunteer from "../models/volunteer.model.js";
import User from "../models/user.model.js";

export const getVolunteers = async (req,res)=>{
    try{
        const {user_id}=req.cookies;
        const volunteers=await Volunteer.find().populate({
            path:'user',
            match:{RescueCenters:user_id}
        });
        const filteredResponse = volunteers.filter(req => req.user !== null);

        return res.status(200).json(filteredResponse);
    }catch(error){
        console.log(error.message)
        res.status(500).json({error:error.message})
    }
}

export const getVolunteerMessagesById = async (req,res)=>{
    try{
        const {id}=req.params;
        const volunteerMessages=await VolunteerMessage.find({userId:id});
        return res.status(200).json(volunteerMessages);
    }catch(err){
        console.log(err.message)
        res.status(500).json({error:err.message})
    }
}

export const addVolunteerMessage = async (req,res)=>{
    try{
        const {subject,message,userId}=req.body;
        const newVolunteerMessage=new VolunteerMessage({
            subject,
            message,
            userId
        });
        await newVolunteerMessage.save();
        res.status(200).json("Volunteer Message added successfully!");
    }catch(error){
        console.log(error.message)
        res.status(500).json({error:error.message})
    }
}
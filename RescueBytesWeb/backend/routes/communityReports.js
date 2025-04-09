import CommunityReport from "../models/communityReport.model.js";

export const addComReport=async(req,res)=>{
    try{
        console.log(req.body);
        const {type,description,location,user}=req.body;
        const newComReport=new CommunityReport({
            type,
            description,
            location,
            user
        });
        await newComReport.save();
        res.json('Community Report added successfully!');
    }catch(err){
        console.log(err);
    }
}

export const getComReportsAdmin=async(req,res)=>{
    try{
        console.log('hi');
        const comRep= await CommunityReport.find({approved:false});
        res.json(comRep);
    }catch(err){
        console.log(err);
    }
}

export const comReportsRejected=async(req,res)=>{
    try{
        console.log(req.body);
        const {id}=req.body;
        await CommunityReport.findByIdAndDelete(id);
        res.json('Report rejected successfully!');
    }catch(err){
        console.err(err);
    }
}

export const getComReportsUser=async(req,res)=>{
    try{
        const rep=await CommunityReport.find({approved:true});
        res.json(rep);  
    }catch(error){
        console.error(error);
    }
}

export const approveComReq=async(req,res)=>{
    try{
        console.log(req.body);
        const {id}=req.body;
        console.log(id);
        await CommunityReport.updateOne({_id:id},{approved:true});
        res.json('Report approved successfully!');
    }catch(error){
        console.error(error);
    }
}
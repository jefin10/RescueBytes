import UserRequest from "../models/userRequest.model.js";

const rejectUserReq=async(req,res)=>{
    try{
        const {userId,item,count}=req.body;
        console.log(req.body);
        const deleteRequest = await UserRequest.deleteOne({
            item: item,
            user: userId,
        });
        
        if (deleteRequest.deletedCount > 0) {
            res.json('Request rejected successfully!');
        } else {
            res.status(404).json('No matching request found to reject.');
        }
    }catch(error){  
        console.error(error);
    }
}

export default rejectUserReq;
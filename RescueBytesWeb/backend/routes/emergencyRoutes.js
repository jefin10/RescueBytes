import EmergencyReq from '../models/emergencyReq.model.js';

const emergencyRoutes = async(req,res)=>{
    try{
        const {type,description,location,userId}=req.body;

        const newEmergencyReq=new EmergencyReq({
            type,
            description,
            location,
            user:userId
        });

        await newEmergencyReq.save();

        res.send('Emergency Request added successfully!');
    }catch(err){
        console.log(err);
    }
}

export default emergencyRoutes;
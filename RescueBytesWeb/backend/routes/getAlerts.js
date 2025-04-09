import Alert from "../models/alert.model.js";

export const getAlerts=async(req,res)=>{
    try{
        const alerts=await Alert.find();
        res.json(alerts);
    }catch(error){
        console.error(error);
    }
}

export const getLatestAlerts=async(req,res)=>{
    try{
        const latestAlerts=await Alert.find().sort({createdAt:-1}).limit(1);
        console.log(latestAlerts)
        const data={
            title:latestAlerts[0].title,
            description:latestAlerts[0].description,
        }
        res.json(data)
    }catch(error){
        console.error(error);   
    }
} ;   
import RescueCenter from "../models/rescueCenter.model.js";
import Alert from "../models/alert.model.js";

const alertRoute=async(req,res)=>{
    try{
        console.log(req.body);
        const {title,description,time,severity,RescueCenterLocation}=req.body;

        const rescueCenter=await RescueCenter.findOne({location:RescueCenterLocation},{_id:1});
        if(!rescueCenter){
            return res.status(400).send('Rescue Center does not exist');
        }
        const newAlert=new Alert({
            title,
            description,
            severity,
            time,
            rescueCenters:rescueCenter._id
        });
        await newAlert.save();
        res.json('Alert added successfully!');
    }catch(error){
        console.error(error);
    }
}


export default alertRoute;
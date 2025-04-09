import UserRequest from "../models/userRequest.model.js";
import Volunteer from "../models/volunteer.model.js";
import SOS from "../models/sos.model.js";

const getStatistics=async(req ,res)=>{
    try{
        const sosCount=await SOS.countDocuments();
        const volunteerCount=await Volunteer.countDocuments();
        const userReq= await UserRequest.countDocuments();

        res.status(200).json({
            sosCount,
            volunteerCount,
            userReq
        })
    }catch(error){
        console.error(error.message)
        res.status(500).json({error:error.message})
    }
}

export default getStatistics;
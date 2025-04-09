import UserRequest from "../models/userRequest.model.js";


export const getUserReq = async (req, res) => {
    try {
        const { user_id } = req.cookies;
        console.log("user_id from cookies:", user_id);

        const response = await UserRequest.find().populate({
            path: 'user',
            match: { RescueCenters: user_id }
        });

        // Filter out requests where the populate didn't match (i.e. user is null)
        const filteredResponse = response.filter(req => req.user !== null);

        console.log(filteredResponse);
        res.send(filteredResponse);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
};


export const getUserReqbyId= async(req,res)=>{
    try{
        console.log(req.params.id);
        console.log('sent')
        const response = await UserRequest.find({user:req.params.id});
        console.log('sent')
        res.json(response);
        console.log(response);
    }catch(error){
        console.error(error);
    }
}
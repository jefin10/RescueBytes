import UserRequest from '../models/userRequest.model.js';
const addUserReq=async(req,res)=>{
    try{
        const {type,item,count,user}=req.body;
        console.log(req.body);

        const newUserReq=new UserRequest({
            type,
            item,
            count,
            user
        });
        await newUserReq.save();
        res.send('User Request added successfully!');
    }catch(error){
        console.error(error);
    }
}

export default addUserReq;
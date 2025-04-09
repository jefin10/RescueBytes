import User from "../models/user.model.js";

const getUsers=async(req,res)=>{
    try{
        const users=await User.find({});

        const filteredUsers=users.map(user=>{
            return {
                _id:user._id,
                email:user.email,
            }
        })
        
        res.send(filteredUsers);
    }catch(error){
        console.error(error);
    }
}


export default getUsers;
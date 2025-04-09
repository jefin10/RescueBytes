import Inventory from "../models/inventory.model.js";
const getInventory=async(req,res)=>{
    try{
        const {user_id}=req.cookies;
        console.log(user_id);
        const inventory=await Inventory.find({rescueCenters:user_id});
        // console.log(inventory);
        res.send(inventory);
    }catch(error){
        console.error(error);
    }
}

export default getInventory;
import Inventory from "../models/inventory.model.js";
import RescueCenter from "../models/rescueCenter.model.js";
import UserRequest from "../models/userRequest.model.js";

const approveUserReq= async(req, res) => {
    try{
        const {userId,item,count,rescueCenter}=req.body;
        const findRescueCenter= await RescueCenter.find({_id:rescueCenter});
        if(findRescueCenter.length==0){
            return res.status(400).json('Rescue Center does not exist');
        }
        const itemExists=await Inventory.find({item:item,rescueCenters:rescueCenter});
        if(itemExists.length==0){
            return res.status(400).json('Item does not exist');
        }
        const updateInventory=await Inventory.updateOne({item:item,RescueCenters:rescueCenter},{$inc:{count:-count}});
        const deleteRequest=await UserRequest.deleteOne({
            userId:userId,
            item:item,
        });

        res.json('Request approved successfully!');
    }catch(error){
        console.error(error);
    }
}

export default approveUserReq
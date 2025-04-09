import RescueCenter from "../models/rescueCenter.model.js";
import InventoryRequest from "../models/inventoryRequest.model.js";
import Inventory from "../models/inventory.model.js";

const addInvReqRC=async(req,res)=>{
    try{
        const {item,count,fromCenter}=req.body;
        console.log(req.body);
        const rescueCenters=await RescueCenter.findOne({location:fromCenter},{_id:1});
        if(!rescueCenters){
            return res.status(400).send('Rescue Center does not exist');
        }
        const itemExists=await InventoryRequest.findOne({item,fromCenter:rescueCenters._id});
        if(itemExists){
            const updateInventory=await InventoryRequest.findOneAndUpdate({item,fromCenter:rescueCenters._id},{$inc:{count}},{
                new:true
            });
            await updateInventory.save();
        }else{
            const newInventory=new InventoryRequest({
                item,
                count,
                fromCenter:rescueCenters._id
            });
            await newInventory.save();
        }
        console.log('done')
        res.json('Inventory Request added successfully!');
    }catch(err){
        console.log(err);
    }
}

export default addInvReqRC;
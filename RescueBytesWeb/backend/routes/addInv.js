import RescueCenter from "../models/rescueCenter.model.js";
import Inventory from "../models/inventory.model.js";

const addInv=async(req,res)=>{
    try{
        const {item,count,rescueCenters}=req.body;
        console.log(req.body);
        const rescueCenter=await RescueCenter.findOne({location:rescueCenters},{_id:1});
        if(!rescueCenter){
            return res.status(400).send('Rescue Center does not exist');
        }
        const itemExists=await Inventory.findOne({item,rescueCenters:rescueCenter._id});
        if(itemExists){
            const updateInventory=await Inventory.findOneAndUpdate({item,rescueCenters:rescueCenter._id},{$inc:{count}},{
                new:true
            });
            await updateInventory.save();
        }
        else{
            const newInventory=new Inventory({
                item,
                count,
                rescueCenters:rescueCenter._id
            });
            await newInventory.save();
        }
        res.json('Inventory added successfully!');
    }
    catch(error){
        console.error(error);
    }
}

export default addInv;
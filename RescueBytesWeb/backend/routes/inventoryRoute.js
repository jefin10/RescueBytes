import Inventory from "../models/inventory.model.js";
import RescueCenter from "../models/rescueCenter.model.js";

const inventoryRoute = async(req,res)=>{
    const {item,count,toCenter,fromCenter}=req.body;  
    try{
        console.log(req.body);
        const rescueCenter1=await RescueCenter.findOne({location:toCenter},{_id:1});
        const rescueCenter2=await RescueCenter.findOne({location:fromCenter},{_id:1});
        console.log(rescueCenter1);
        if(!rescueCenter1){
            return res.status(400).send('Rescue Center does not exist');
        }
        const itemExists=await Inventory.findOne({item,rescueCenters:rescueCenter2._id});
        if(itemExists){
            const updateInventory=await Inventory.findOneAndUpdate({item,rescueCenters:rescueCenter1._id},{$inc:{count}},{
                new:true
            });
            const updateInventory2=await Inventory.findOneAndUpdate({item,rescueCenters:rescueCenter2._id},{$inc: {count: -count}},{
                new:true
            }); 
            await updateInventory.save();
            await updateInventory2.save();
        }
        else{
            const newInventory=new Inventory({
                item,
                count,
                rescueCenters:rescueCenter1._id
            });
            await newInventory.save();
        }
        
        res.send('Inventory added successfully!');
    }
    catch(error){
        console.error(error);
    }
}

export default inventoryRoute;
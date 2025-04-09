import InventoryRequest from '../models/inventoryRequest.model.js';
const getInvReqRc = async (req, res) => {
    try{

        const {user_id}=req.cookies;
        const inventoryRequest = await InventoryRequest.find({ fromCenter: { $ne: user_id } });
        res.send(inventoryRequest);
    }catch(err){
        console.log(err);
    }
}

export default getInvReqRc;
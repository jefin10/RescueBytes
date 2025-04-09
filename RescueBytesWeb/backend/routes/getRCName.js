import RescueCenter from "../models/rescueCenter.model.js";


const getRCName = async (req, res) => {
    try {
        const { user_id } = req.cookies;
        console.log(user_id);
        const inventoryRequest = await RescueCenter.find({ _id:user_id });
        console.log(inventoryRequest);
        if (!inventoryRequest) {
            return res.status(404).json({ message: "Rescue Center not found" });
        }
        res.json(inventoryRequest[0].location);
    } catch (err) {
        console.log(err);
    }
}

export default getRCName;
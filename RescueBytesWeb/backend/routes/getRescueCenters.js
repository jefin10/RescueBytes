import RescueCenter from '../models/rescueCenter.model.js';

const getRescueCenters = async (req, res) => {
    try{
        const rescueCenters=await RescueCenter.find();
        res.send(rescueCenters);
    }catch(error){
        console.error(error);
    }
}

export default getRescueCenters
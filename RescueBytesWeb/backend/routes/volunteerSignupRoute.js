import User from '../models/user.model.js';
import Volunteer from '../models/volunteer.model.js';

const volunteerSignup =async(req, res) => {
    try{
        console.log(req.body);
        const{email,name,address,phNo,fieldOfExpertise}=req.body;
       
        const user = await User.findOne({email},'_id');
        const volunteerExists=await Volunteer.findOne({user:user._id});
        if(volunteerExists){
            return res.status(400).send('Volunteer already exists');
        }
        const volunteer=new Volunteer({
            user:user._id,
            name,
            address,
            phNo,
            fieldOfExpertise
        });
        await volunteer.save();
        await User.findByIdAndUpdate(user._id, { role: 'volunteer' }, { new: true });
        
        res.send('Volunteer added successfully!');
    }catch(error){
        console.error(error);
    }
}

export default volunteerSignup;
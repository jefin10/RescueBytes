import Alert from '../models/alert.model.js'

const deleteAlert =async(req,res)=>{
    try {
        const {_id} = req.body
        console.log(req.body)
        const alert = await Alert.findByIdAndDelete(_id)
        res.status(200).json({message:'Alert deleted successfully'});
    } catch (error) {
        console.log(error)
    }
}

export default deleteAlert
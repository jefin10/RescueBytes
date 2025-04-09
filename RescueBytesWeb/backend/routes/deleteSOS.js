import SOS from "../models/sos.model.js";

const deleteSOS=async (req, res) => {
    try {
        const { id } = req.body;
        console.log(id);
        const deletedSOS = await SOS.findByIdAndDelete(id);
        if (!deletedSOS) {
            return res.status(404).json({ message: "SOS not found" });
        }
        res.status(200).json({ message: "SOS deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export default deleteSOS;
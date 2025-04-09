import UserRequest from "../models/userRequest.model.js";

const getUserReqbyId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log("Searching for requests with user ID:", userId);
    
    const allRequests = await UserRequest.find();
    console.log("Total requests in database:", allRequests.length);
    console.log("All requests:", JSON.stringify(allRequests, null, 2));
    
    const response = await UserRequest.find({ user: userId });
    
    console.log("Matching requests:", response);
    
    res.send(response);
  } catch (error) {
    console.error("Error in getUserReqbyId:", error);
    res.status(500).send({ error: "An error occurred", details: error.message });
  }
}

export default getUserReqbyId;
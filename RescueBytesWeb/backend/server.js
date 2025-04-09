import volunteerSignup from './routes/volunteerSignupRoute.js';
import volunteerSignupRoute from './routes/volunteerSignupRoute.js';
import alertRoute from './routes/alertRoute.js';
import inventoryRoute from './routes/inventoryRoute.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import {getAlerts} from './routes/getAlerts.js';
import getInventory from './routes/getInventory.js';
import getRescueCenters from './routes/getRescueCenters.js';
import addInv from './routes/addInv.js';
import addInvReqRC from './routes/addInvReqRc.js';
import getInvReqRc from './routes/getInvReqRc.js';
import addUserReq from './routes/addUserReq.js';
import {getUserReq} from './routes/getUserReq.js';
import getUsers from './routes/getUsers.js';
import approveUserReq from './routes/approveUserReq.js';
import rejectUserReq from './routes/rejectUserReq.js';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/AuthRoutes.js';
import newsRoutes from './routes/NewsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import sosRoutes from './routes/SOSROutes.js';
import User from './models/user.model.js';
//import RescueCenter from './models/rescueCenter.model.js';
import {getRescueCenterId} from './controllers/AuthController.js';
import deleteAlert from './routes/deleteAlert.js';
import { addCommunity } from './routes/addCommunity.js';
import getUserReqbyId from './routes/getUserReqbyId.js';
import { getLatestAlerts } from './routes/getlatestAlerts.js';
//import getUserReqbyId from './routes/getUserReqbyId.js';
import RescueCenter from './models/rescueCenter.model.js';
import {addComReport,approveComReq,comReportsRejected,getComReportsAdmin,getComReportsUser} from './routes/communityReports.js';
import {getVolunteers,addVolunteerMessage,getVolunteerMessagesById} from './routes/getVolunteers.js';
import getStats from './routes/getStatistics.js';
import path from 'path';
import bcrypt from 'bcryptjs';
import deleteSOS from './routes/deleteSOS.js';
import getRCName from './routes/getRCName.js';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();
const __dirname=path.resolve()

const connectToMongoDB= async()=>{
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error(error);
    }
}

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());  // Enables reading cookies

const allowedOrigins = [
    "http://localhost:5173",  
    "http://localhost:8081", 
    "http://172.16.195.186:8081", 
    "http://10.0.2.2:3000"  ,
    'https://rescuebytezwebfrontend.onrender.com'
      // Add this for Android emulator
];
  
app.use(
  cors({
    origin:"http://localhost:5173" , // This allows all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true, // Allow credentials if needed
  })
);
// Routes

app.use("/auth", authRoutes); // Authentication routes
app.use("/news", newsRoutes);
app.use("/chat", aiRoutes);
app.use("/sos", sosRoutes);
app.post('/registercom', addCommunity);
// Test Route



app.post('/volunteerSignup',volunteerSignupRoute)
app.post('/addAlert',alertRoute);
app.post('/addInventory',addInv);
app.post('/manageInv',inventoryRoute);
app.post('/emergencyReport',emergencyRoutes)
app.post('/invReqRc',addInvReqRC);
app.post('/addUserReq',addUserReq);
app.post('/approveUserReq',approveUserReq);
app.post('/rejectUserReq',rejectUserReq);
app.post('/deleteAlert',deleteAlert);  
app.post('/addComRep',addComReport)
app.post('/approveComReq',approveComReq)
app.post('/comReportsRejected',comReportsRejected)
app.post('/addVolunteerMessage',addVolunteerMessage)
app.post('/deleteSOS',deleteSOS)

app.get('/getComRepAdm',getComReportsAdmin);
app.get('/getComRepUser',getComReportsUser);
app.get('/getInvReqRc',getInvReqRc);
app.get('/getUserReq',getUserReq);
app.get('/getUserReqbyId/:userId',getUserReqbyId);
app.get('/getAlerts',getAlerts);
app.post('/getLatestAlerts',getLatestAlerts);
app.get("/auth/check", (req, res) => {
  if (req.cookies.session_token) {
    return res.json({ authenticated: true });
  }
  return res.status(401).json({ authenticated: false });
});

//app.get('/getLatestAlert',getLatestAlerts)
//app.get('/getUserReqbyId/:id',getUserReqbyId);
app.get('/getInv',getInventory);
app.get('/getRC',getRescueCenters);
app.get('/getUsers',getUsers)
app.get('/getVolunteers',getVolunteers)
app.get('/getVolMessagebyId/:id',getVolunteerMessagesById)
app.get('/getStats',getStats)
app.get('/getRCName',getRCName)

app.post('/addRC', async(req, res) => {
    try{
        console.log(req.body);
        const{location,contactNumber}=req.body;
        const newRescueCenter=new RescueCenter({
            location,
            contactNumber
        });
        await newRescueCenter.save();
        res.send('Rescue Center added successfully!');
    }
    catch(error){
        console.error(error);
    }
});
app.post('/hash', async (req, res)=> {
  try {
    const users = await User.find({}); 

    for (let user of users) {
      if (!user.password.startsWith("$2b$")) { 
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await User.updateOne({ _id: user._id },{password:hashedPassword });
      }
    }

    res.status(200).send("Passwords hashed !");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error while hashing passwords.");
  }
})

app.use('/rescueCenterId', getRescueCenterId);

// Signup Route
app.post("/signup", async (req, res) => {
    try {
      console.log(req.body);
      const { name,email, password, confirmPassword, rescueCenter, role } = req.body;
     
      if (password !== confirmPassword) {
        console.log("Passwords do not match");
        return res.status(400).json("Passwords do not match");
      }

      const hashedPassword= await bcrypt.hash(password,10);
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("User already exists");
        return res.status(400).json("User already exists");
      }
 
      const pfp = "https://avatar.iran.liara.run/public/girl";
      const rescueCenterData = await RescueCenter.findOne({ location: rescueCenter }, { _id: 1 });
      
      if (!rescueCenterData) {
        console.log("Rescue Center does not exist");
        return res.status(400).json("Rescue Center does not exist");
      }
      console.log("Here");
      // Restrict admin creation (you can replace this check with an invite system or approval process)
      let userRole = "user";
      if (role === "admin") {
        const adminExists = await User.findOne({ role: "admin", RescueCenters: rescueCenterData._id });
        if (adminExists) {
          console.log("An admin already exists for this rescue center.");
          return res.status(403).json("An admin already exists for this rescue center.");
        }
        userRole = "admin";
      }

      const sessionToken = uuidv4();
  
      
      const newUser = new User({
        name,
        email,
        password:hashedPassword,
        pfpLink: pfp,
        RescueCenters: rescueCenterData._id,
        sessionToken,
        role: userRole, // Assigning the role here
      });
      
      await newUser.save();
      console.log("User saved");
      res.status(201).json({
        message: "Login successful",
        role: newUser.role,
        userId: newUser._id.toString(),
        sessionToken,
        rescueCenter: newUser.RescueCenters
      });
    } catch (error) {
      console.error(error);
      res.status(500).json("Server error");
    }
  });
app.use(express.static(path.join(__dirname,"/frontend/dist")))
app.get("*",(req,res)=>{
  res.sendFile(path.join(__dirname,"frontend","dist","index.html"))
})

// Start Server only after MongoDB is connected
connectToMongoDB().then(() => {
  app.listen(3000, () => {
    console.log("🚀 Server is running on port 3000");
  });
});

import User from '../models/user.model.js';
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found for email:", email);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log("Comparing password for:", email);
        console.log("Input password:", password);
        console.log("Stored hash:", user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password did not match for", email);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (user.role !== "admin") {
            console.log("Unauthorized login attempt for:", email);
            return res.status(403).json({ message: "Access denied. Only admins can log in." });
        }

        // Generate session token
        const sessionToken = uuidv4();
        user.sessionToken = sessionToken;
        await user.save();

        // Set cookies for session token & userId
        res.cookie("session_token", sessionToken, {
            httpOnly: true,
            secure: true,// Set to true in production
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.cookie("user_id", user.RescueCenters.toString(), {
            httpOnly: true,
            secure: false, // Set to true in production
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.json({ message: "Admin login successful", role: user.role, userId: user._id });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


  export const loginUserApp = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  
      const sessionToken = uuidv4();
      user.sessionToken = sessionToken;
      await user.save();
  
      res.json({
        message: "Login successful",
        role: user.role,
        userId: user._id.toString(),
        sessionToken,
        rescueCenter: user.RescueCenters
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  export const validateSession = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1] || '';
      
      const user = await User.findOne({ sessionToken: token });
      res.json({ isValid: !!user });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
  
  export const logoutMobile = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1] || '';
      
      await User.findOneAndUpdate(
        { sessionToken: token },
        { sessionToken: null }
      );
      
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
export const getRescueCenterId = async (req, res) => {
    try {
      // Extract user_id from cookies (ensure you have cookie-parser middleware configured)
      const { user_id } = req.cookies;
      if (!user_id) {
        return res.status(401).json({ message: "Unauthorized: user_id missing" });
      }
      return res.status(200).json({ rescueCenter:user_id });
      // Return the rescue center id from the user record
      res.status(200).json({ rescueCenter: user.RescueCenters });
    } catch (error) {
      console.error("Error fetching rescue center id:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
export const logoutUser = async (req, res) => {
  try {
    const sessionToken = req.cookies.session_token;

    if (!sessionToken) {
      return res.status(400).json({ message: "No active session" });
    }

    // Find the user by session token and remove it
    const user = await User.findOneAndUpdate({ sessionToken }, { sessionToken: null });
    if (!user) {
      return res.status(400).json({ message: "Invalid session" });
    }

    // Clear cookies
    res.clearCookie("session_token");
    res.clearCookie("user_id");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update all fields
    const { name, email, address, phone } = req.body;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (address !== undefined) user.address = address;
    if (phone !== undefined) user.phone = phone;

    user.lastUpdated = Date.now();
    await user.save();

    res.status(200).json({
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      rescuecenter: user.RescueCenters?.name 
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Server error" });
  }
};
export const fetchData = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).populate('RescueCenters', 'name');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json({
      name: user.name,
      email: user.email,
      rescuecenter: user.RescueCenters ? user.RescueCenters.name : null,
      address: user.address || '', // Add these if they exist in your schema
      phone: user.phone || ''
    });
  } catch (e) {
    console.error("Error fetching user data:", e);
    res.status(500).json({ error: "Server error" });
  }
};

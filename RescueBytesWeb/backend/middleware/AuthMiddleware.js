import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
  try {
    const sessionToken = req.cookies.session_token;

    if (!sessionToken) {
      return res.status(401).json({ message: "Unauthorized - No session token" });
    }

    // Find user by session token
    const user = await User.findOne({ sessionToken });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid session" });
    }

    req.user = user; // Store user info in request object
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

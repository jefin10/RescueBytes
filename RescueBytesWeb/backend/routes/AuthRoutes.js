import express from "express";
import { fetchData, loginUser, loginUserApp, logoutMobile, logoutUser, updateUser, validateSession } from "../controllers/AuthController.js";
import { protect } from "../middleware/AuthMiddleware.js";
const router = express.Router();

router.post("/login", loginUser);
router.post("/loginApp", loginUserApp);
router.post("/logout", logoutUser);
router.get("/protected", protect, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});
router.post('/login-app', loginUserApp);
router.get('/validate-session', validateSession);
router.post('/logout-mobile', logoutMobile);
router.put('/users/:id', updateUser);
router.get('/users/:id', fetchData);

export default router;

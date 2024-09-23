import { Router } from "express";
import { changeCurrentPassword, getAgentCustomers, getAllUsers, loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router()


router.post('/register', upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }, 
    {
        name: "coverImage",
        maxCount: 1
    }
]),isAdmin, registerUser);

router.get('/all-users', verifyJWT, isAdmin, getAllUsers);
router.get('/agent-customers',verifyJWT , getAgentCustomers);
router.post('/login', loginUser)
router.post('/logout', verifyJWT, logoutUser)
router.put('/update-password',verifyJWT,changeCurrentPassword )


















export default router
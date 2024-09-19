import { Router } from "express";
import { createCustomer, getAllCustomers, updateCustomer } from "../controllers/customer.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()




router.post('/create', verifyJWT, createCustomer);
router.get('/get-all', verifyJWT, getAllCustomers)
router.put('/update',verifyJWT,updateCustomer)





export default router
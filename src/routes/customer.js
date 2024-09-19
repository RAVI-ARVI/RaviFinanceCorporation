import { Router } from "express";
import { addLoan, createCustomer, getAllCustomers, getCustomerDetails, recordTransaction } from "../controllers/customer.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()




router.post('/create', verifyJWT, createCustomer);
router.get('/get-all', verifyJWT, getAllCustomers)
// router.put('/update', verifyJWT, updateCustomer)
router.get('/:customerId', verifyJWT, getCustomerDetails)
router.post('/:customerId/loan', verifyJWT, addLoan)

router.post('/:customerId/transaction',verifyJWT,recordTransaction)





export default router
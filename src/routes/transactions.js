import { Router } from "express";
import { deleteTransaction, getAllTransactions } from "../controllers/transaction.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()





router.get('/get-all', verifyJWT, getAllTransactions)

router.delete('/:transactionId', verifyJWT, deleteTransaction)






export default router
import { Router } from "express";
import { cashFlowStatement, deleteTransaction, getAllTransactions } from "../controllers/transaction.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()





router.get('/get-all', verifyJWT, getAllTransactions)
router.get('/cashflow',verifyJWT,cashFlowStatement)

router.delete('/:transactionId', verifyJWT, deleteTransaction)






export default router
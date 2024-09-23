import { Loan } from "../models/loan.model.js"
import { Transaction } from "../models/transaction.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getAllTransactions = asyncHandler(async (req, res) => {
    const allTransactions = await Transaction.find()
    res.status(201).json({
        success: true,
        data:allTransactions
    })
     
})

const deleteTransaction = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
  
    // Find the transaction
    const transaction = await Transaction.findById(transactionId);
  
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
  
    // Fetch the associated loan
    const loan = await Loan.findById(transaction.loan);
  
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
  
    // Update loan based on the transaction type and amount
    if (transaction.transactionType === "interest payment") {
      loan.totalInterestPaid -= transaction.amount;
      loan.totalInterestPaid = Math.max(0, loan.totalInterestPaid); // Ensure it doesn't go below 0
    } else if (transaction.transactionType === "principal payment") {
      loan.principalAmount += transaction.amount;
    } else if (transaction.transactionType === "corporation payment") {
      loan.amountPaid -= transaction.amount;
      loan.amountPaid = Math.max(0, loan.amountPaid); // Ensure it doesn't go below 0
  
      // Reopen the loan if it was closed and has outstanding payments
      if (loan.status === "closed" && loan.amountPaid < loan.repaymentAmount) {
        loan.status = "open";
      }
    }
  
    await loan.save(); // Save the updated loan
  
    // Delete the transaction
    await Transaction.findByIdAndDelete(transactionId);
  
    return res.status(200).json({
      message: "Transaction deleted successfully",
      updatedLoan: loan,
    });
  });
  
 

export { deleteTransaction, getAllTransactions }


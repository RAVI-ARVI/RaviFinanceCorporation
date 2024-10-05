import CashFlow from "../models/cashFlow.model.js"
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

const cashFlowStatement = asyncHandler(async (req, res) => {
  const cashflow = await CashFlow.findOne();
  res.status(200).json({
    success: true,
    data:cashflow
  })
})

const deleteTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  // Fetch the CashFlow record or create one if it doesn't exist
  let cashFlow = await CashFlow.findOne();
  if (!cashFlow) {
    cashFlow = new CashFlow({
      availableCash: 0,
      corporationReceivable: 0,
      principalReceivable: 0,
      lastUpdated: Date.now(),
    });
    await cashFlow.save();
  }

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

  // Update available cash by subtracting the transaction amount
  cashFlow.availableCash -= transaction.amount;

  // Update loan and cash flow based on the transaction type
  if (transaction.transactionType === "interest payment") {
    loan.totalInterestPaid -= transaction.amount;
    loan.totalInterestPaid = Math.max(0, loan.totalInterestPaid); // Ensure it doesn't go below 0
  } else if (transaction.transactionType === "principal payment") {
    loan.principalAmount += transaction.amount; // Reverse the principal payment
    cashFlow.principalReceivable -= Number(transaction.amount); // Decrease principal receivable
  } else if (transaction.transactionType === "corporation payment") {
    loan.amountPaid -= transaction.amount; // Reverse the corporation payment
    cashFlow.corporationReceivable -= Number(transaction.amount); // Decrease corporation receivable
    loan.amountPaid = Math.max(0, loan.amountPaid); // Ensure it doesn't go below 0

    // Reopen the loan if it was closed and has outstanding payments
    if (loan.status === "closed" && loan.amountPaid < loan.repaymentAmount) {
      loan.status = "active";
    }
  }

  // Save the updated loan and cash flow
  await loan.save();
  await cashFlow.save();

  // Delete the transaction
  await Transaction.findByIdAndDelete(transactionId);

  return res.status(200).json({
    message: "Transaction deleted successfully",
    updatedLoan: loan,
    updatedCashFlow: cashFlow, // Optionally return updated cash flow for reference
  });
});

  
 

export { cashFlowStatement, deleteTransaction, getAllTransactions }


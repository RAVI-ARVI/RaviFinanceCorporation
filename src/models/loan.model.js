import mongoose from "mongoose";
const loanSchema = new mongoose.Schema({
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    loanType: {
      type: String,
      enum: ['interest', 'corporation'],
      required: true
    },
    principalAmount: {
      type: Number,
      required: true
    },
    interestRate: Number, // Only for interest loans
    repaymentAmount: Number, // For corporation loans
    amountPaid: {
      type: Number,
      default: 0 // Tracks total amount paid for corporation loans
    },
    totalInterestPaid: {
      type: Number,
      default: 0 // Tracks the total interest paid for interest loans
    },
    durationDays: Number, // For corporation loans
    interestDuePeriod: {
      type: String,
      enum: ['monthly', 'yearly'], // For interest loans
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date, // Expected repayment completion date
    status: {
      type: String,
      enum: ['active', 'closed', 'defaulted'],
      default: 'active'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Agent or admin who created the loan
    }
});
  


export const Loan = mongoose.model("loan", loanSchema)
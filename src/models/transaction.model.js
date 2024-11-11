import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "loan",
    required: true,
  },
  transactionType: {
    type: String,
    enum: ["interest payment", "principal payment", "corporation payment"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Agent who collected the payment
  },
  remainingAmount: Number, // For corporation loan balance
  interestPaid: Number, // For total interest paid
});

export const Transaction = mongoose.model("transaction", transactionSchema);

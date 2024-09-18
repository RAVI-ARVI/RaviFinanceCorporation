import mongoose from "mongoose";


const customerSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: String,
    loans: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan'
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Tracks the agent or admin who created the customer
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
},{timestamps:true});
  

export const Customer = mongoose.model("Customer", customerSchema)
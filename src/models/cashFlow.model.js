import mongoose from 'mongoose';

const cashFlowSchema = new mongoose.Schema({
  availableCash: {
    type: Number,
    default: 0,
  },
  corporationReceivable: {
    type: Number,
    default: 0,
  },
  principalReceivable: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now, 
    },
 
});

// Model export
const CashFlow = mongoose.model('CashFlow', cashFlowSchema);

export default CashFlow;

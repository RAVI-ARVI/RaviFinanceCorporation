import { Customer } from "../models/customer.model.js";
import { Loan } from "../models/loan.model.js";
import { Transaction } from "../models/transaction.model.js";
import { ApiError } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCustomer = asyncHandler(async (req, res) => {
    const { name, email, phone  ,address} = req.body;
    if (
        [name,  phone].some((field) => !field || field.trim() === "")
      ) {
        throw new ApiError(400, "All fields are required");
    }

const existedCustomer = await Customer.findOne({
    $or: [{ phone }, { name }]
})

if (existedCustomer) {
    throw new ApiError(409, "User with phone number or name already exists")
}
    
    
const customer = await Customer.create({
    name,
 address,
    email,
    phone,
    createdBy:req.user.id

 
    
})

    
return res.status(201).json(
    {
        message:"User created successfully",
        customer, 
    }
)
    
    

    
})


const getAllCustomers = asyncHandler(async (req, res) => {
       
    const allCustomers = await Customer.find().select('-loans -transactions')
    
    res.status(201).json({
        success: true,
        data:allCustomers
    })
})



const updateCustomer = asyncHandler(async (req, res) => {

    const { name, phone, address } = req.body
   const UpdatedCustomer= await Customer.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                name,
                phone,
                address
            }
        },
        {new: true}
   )
    
   return res
   .status(200)
   .json(
       {
           message: "Customer updated successfully",
           UpdatedCustomer
   }
   )
    
})

const getCustomerDetails = asyncHandler(async(req, res) => {
    const { customerId } = req.params;
    const customer = await Customer.findById(customerId).populate('createdBy', 'name role');
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }





    // Aggregation to gather customer loans and transaction details
    const customerDetails = await Customer.aggregate([
        { $match: { _id:customer._id} },
        {
          $lookup: {
            from: 'loans',
            localField: '_id',
            foreignField: 'customer',
            as: 'loans'
          }
        },
        {
          $lookup: {
            from: 'transactions',
            localField: '_id',
            foreignField: 'customer',
            as: 'transactions'
          }
        },
        {
          $addFields: {
            totalLoanAmount: { $sum: '$loans.principalAmount' }, // Sum of all loan principal amounts
            totalPaidAmount: { $sum: '$loans.amountPaid' }, // Total paid for corporation loans
            totalInterestPaid: { $sum: '$loans.totalInterestPaid' }, // Total interest paid for interest loans
            remainingAmount: {
              $sum: {
                $map: {
                  input: '$loans',
                  as: 'loan',
                  in: {
                    $cond: [
                      { $eq: ['$$loan.loanType', 'corporation'] },
                      { $subtract: ['$$loan.repaymentAmount', '$$loan.amountPaid'] }, // Remaining for corporation loans
                      { $subtract: ['$$loan.principalAmount', '$$loan.collectedPrincipalAmount'] } // Remaining for interest loans
                    ]
                  }
                }
              }
            }
          }
        }
    ]);
 
  
      // If customer has no loans or transactions, return basic info
      if (!customerDetails.length) {
        return res.status(200).json({
          message: "Customer details retrieved",
          customer,
          loans: [],
          transactions: [],
          totalLoanAmount: 0,
          totalPaidAmount: 0,
          totalInterestPaid: 0,
          remainingAmount: 0,
        });
      }
  
      // Return enriched customer details
      return res.status(200).json({
        message: "Customer details retrieved successfully",
        customer: customerDetails[0],
      });

    

    
})

const addLoan = asyncHandler(async (req, res) => {
    const { customerId } = req.params;
    const {
        loanType, principalAmount, interestRate, repaymentAmount, durationDays,
        interestDuePeriod, startDate, endDate, createdBy,loanName
    } = req.body;
    const isInterestLoan = loanType === 'interest';
    const isCorporationLoan = loanType === 'corporation';
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
      // Validate loan type and required fields based on type
      if (loanType === 'interest') {
        if (!interestRate || !interestDuePeriod) {
          return res.status(400).json({ message: "Interest rate and due period are required for interest loans" });
        }
      } else if (loanType === 'corporation') {
        if (!repaymentAmount || !durationDays) {
          return res.status(400).json({ message: "Repayment amount and duration days are required for corporation loans" });
        }
      } else {
        return res.status(400).json({ message: "Invalid loan type" });
      }
    // Check if loan name is unique
    const existingLoan = await Loan.findOne({ loanName });
    if (existingLoan) {
      return res.status(400).json({ message: 'Loan with this name already exists' });
    }
   // Set default start date to now if not provided
   const startLoanDate = startDate ? new Date(startDate) : new Date();

   // Automatically calculate the end date if durationDays is provided and endDate is not
   let calculatedEndDate = endDate;
   if (!calculatedEndDate && durationDays) {
    calculatedEndDate = new Date(startLoanDate.getTime() + durationDays * 24 * 60 * 60 * 1000); // Adding durationDays in milliseconds
  }
    
      const loanData = {
        customer: customerId,
        loanName,
        loanType,
        principalAmount,
        interestRate: isInterestLoan ? interestRate : undefined,
        repaymentAmount: isCorporationLoan ? repaymentAmount : undefined,
        durationDays: isCorporationLoan ? durationDays : undefined,
        interestDuePeriod: isInterestLoan ? interestDuePeriod : undefined,
        startDate: startLoanDate,
        endDate:calculatedEndDate ,
        createdBy:req.user.id,
      };


    const newCustomerLoan = await Loan.create(loanData)
    customer.loans.push(newCustomerLoan._id);
    await customer.save();

    return res.status(201).json({
        message: "Loan successfully added",
        loan: newCustomerLoan,
      });
  
    
})

const deleteLoan = asyncHandler(async (req, res) => {
  const { customerId, loanId } = req.params;

  // Fetch the customer and loan
  const customer = await Customer.findById(customerId);
  const loan = await Loan.findById(loanId);

  if (!customer || !loan) {
    return res.status(404).json({ message: "Customer or Loan not found" });
  }

  // Ensure the loan belongs to the customer
  if (String(loan.customer) !== customerId) {
    return res.status(400).json({ message: "Loan does not belong to this customer" });
  }

// Check if there are any transactions for the loan
const loanTransactions = await Transaction.find({ loan: loanId });

if (loanTransactions.length > 0) {
  return res.status(400).json({
    message: "Cannot delete the loan because there are associated transactions."
  });
}

  // Remove loan from the customer's loan array
  customer.loans = customer.loans.filter((id) => id.toString() !== loanId);
  await customer.save();

  // Delete the loan itself
  await loan.deleteOne();

  return res.status(200).json({
    message: "Loan deleted successfully",
  });
});



const recordTransaction = asyncHandler(async (req, res) => {
    const { customerId } = req.params;
    const { transactionType, amount, loanId ,paymentDate } = req.body;
    const agentId = req.user.id; // Assuming authenticated user info
  
    // Fetch the customer and loan
    const customer = await Customer.findById(customerId);
    const loan = await Loan.findById(loanId);
  
    if (!customer || !loan) {
      return res.status(404).json({ message: 'Customer or Loan not found' });
    }
  
    // Ensure the loan belongs to the customer
    if (String(loan.customer) !== customerId) {
      return res.status(400).json({ message: 'Loan does not belong to this customer' });
    }
  
    // Validate the transaction type
    if (!['interest payment', 'principal payment', 'corporation payment'].includes(transactionType)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }
  
    // Variables to store loan updates
    let remainingAmount = null;
    let interestPaid = null;
  
    // Handle the transaction based on loan and transaction types
    const handleTransaction = () => {
      switch (loan.loanType) {
        case 'interest':
          if (transactionType === 'interest payment') {
            return handleInterestPayment();
          } else if (transactionType === 'principal payment') {
            return handlePrincipalPayment();
          }
          break;
        case 'corporation':
          if (transactionType === 'corporation payment') {
            return handleCorporationPayment();
          }
          break;
        default:
          throw new Error(`Invalid transaction for loan type: ${loan.loanType}`);
      }
    };
  
    const handleInterestPayment = () => {
      loan.totalInterestPaid += Number(amount);
      interestPaid = loan.totalInterestPaid;
    };
  
    const handlePrincipalPayment = () => {
      loan.principalAmount -= amount;
  
      // Ensure principal amount doesn't go below zero
      if (loan.principalAmount <= 0) {
        loan.principalAmount = 0;
        loan.status = 'closed';
      }
    };
  
    const handleCorporationPayment = () => {
      loan.amountPaid += Number(amount);
      remainingAmount = loan.repaymentAmount - loan.amountPaid;
  
      // Close loan if fully repaid
      if (loan.amountPaid >= loan.repaymentAmount) {
        loan.status = 'closed';
      }
    };
  

      handleTransaction();
      await loan.save(); // Save loan after updating fields
  
      // Create the transaction record
      const savedTransaction = await Transaction.create({
        customer: customerId,
        loan: loanId,
        transactionType,
        amount,
        paymentDate:paymentDate || new Date() ,
        agent: agentId,
        remainingAmount, // Only relevant for corporation payments
        interestPaid,    // Only relevant for interest payments
      });
  
      return res.status(201).json({
        message: 'Transaction recorded successfully',
        transaction: savedTransaction,
        updatedLoan: loan,
      });
    

    
})

export { addLoan, createCustomer, deleteLoan, getAllCustomers, getCustomerDetails, recordTransaction };


import { Customer } from "../models/customer.model.js";
import { ApiError } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCustomer = asyncHandler(async (req, res) => {
    const { name, email, phone  ,address} = req.body;
    if (
        [name, email, phone].some((field) => !field || field.trim() === "")
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

export { createCustomer, getAllCustomers };


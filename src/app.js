
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"

const app = express()

app.use(cors({
      origin:process.env.CORS_ORIGIN,
      credentials: true
}))
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



//routes import
import customerRouter from './routes/customer.js'
import transactionRouter from './routes/transactions.js'
import userRouter from './routes/user.js'

//Routes
app.use("/api/v1/users", userRouter)
app.use("/api/v1/customer", customerRouter)
app.use("/api/v1/transactions",transactionRouter )

export { app }

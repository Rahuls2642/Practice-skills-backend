import express from "express"
import authRoutes from "./routes/auth.routes"
import { protect } from "./middleware/auth.middleware";
import cors from "cors"
const app=express()
app.use(cors())
app.use(express.json())
app.use("/api/auth",authRoutes)
app.get("/api/test", protect, (req, res) => {
  res.json({ message: "Protected route working" });
});
app.get('/',(req,res)=>{
    res.send("API is running...")
})
export default app;
import express from "express"
import authRoutes from "./routes/auth.routes"
import questionRoutes from "./routes/question.routes"
import { protect } from "./middleware/auth.middleware";
import sessionRoutes from "./routes/session.routes"
import reportRoutes from "./routes/report.routes"
import { errorHandler } from "./middleware/error.middleware";
import cors from "cors"
const app=express()
app.use(cors())
app.use(express.json())
app.use("/api/auth",authRoutes)
app.use("/api/questions",questionRoutes);
app.use("/api/session",sessionRoutes)
app.use("/api/report",reportRoutes)
app.get("/api/test", protect, (req, res) => {
  res.json({ message: "Protected route working" });
});
app.get('/',(req,res)=>{
    res.send("API is running...")
})
app.use(errorHandler)
export default app;
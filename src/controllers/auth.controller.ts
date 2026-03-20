import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const registerUser = async (req: Request, res: Response,next:NextFunction) => {
  try {
    const { name, email, password } = req.body;

  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
  next(error);
}
};

export const loginUser=async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const{email,password}=req.body
    //chec=k user
    const user=await User.findOne({email});
    if(!user){
      return res.status(400).json({message:"Invalid credentials"})

    }
    //match psswrd
    const isMatch =await bcrypt.compare(password,user.password);
    if(!isMatch){
   return res.status(400).json({message:"Invalid credentials"})

    }
    const token =jwt.sign(
      {id:user._id},
      process.env.JWT_SECRET as string,
      {expiresIn:"7D"}

    )
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
  next(error);
}
}
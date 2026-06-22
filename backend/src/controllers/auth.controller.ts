import prisma from "../db/prisma.js";
import z from "zod";
import bcrypt from "bcrypt";
import type { Request , Response } from "express"
import { generateToken } from "../utils/token.js";

const Schema = z.object({
    email: z.string().email('invalid email address'),
    password: z.string().min(8, 'password must be at least 8 characters')
})

export const signup= async(req:Request , res:Response)=>{
    try{
        

        const parasafe = Schema.safeParse(req.body);

        if(!parasafe.success){
            return res.status(400).json({err:"validation err"})
        }
        const {email, password} = parasafe.data;
       

        const user = await prisma.user.findUnique({where:{email}})

        if(user){
          return  res.status(400).json({error:"user already exists"})
            
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password , salt)
        const newUser = await prisma.user.create({data:{
            email , password: hashedPassword
        }})
        if(newUser){
            const token = generateToken(newUser.id)
           
           return res.status(201).json({ user: { id: newUser.id, email: newUser.email }, token})
        }
    }
    catch(err:any){
        console.error( err.message);
    return res.status(500).json({ error: "internal server error in signup" });
    }
}

export const login
 = async(req:Request , res:Response)=>{

    try{

        const parasafe = Schema.safeParse(req.body);

        if(!parasafe.success){
            return res.status(400).json({err:"validation err"})
        }
        const {email, password} = parasafe.data;

        const user = await prisma.user.findUnique({where:{email}})
        if(!user){
            return res.status(401).json({ error: "user does not exist" });

        }

        const comparePassword = await bcrypt.compare(password , user.password)
       if(!comparePassword){
        return res.status(400).json({ error: "invalid password" });
       }
       const token = generateToken(user.id)

       return res.status(200).json({ user: { id: user.id, email: user.email }, token})

    }
    catch(err:any){
        console.error( err.message);
    return res.status(500).json({ error: "internal server error in login" });
    }
}

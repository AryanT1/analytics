import z from "zod";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import prisma from "../db/prisma.js";
import { generateApiKey } from "../utils/generateApiKey.js";
import redis from "../db/redis.js";

const createSchema = z.object({
  name: z.string(),
});

export const create = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
        return res.status(401).json({
          error: "Unauthorized - Please login first",
        });
      }
      const userId = req.user?.id;

    const parasafe = createSchema.safeParse(req.body);
    if (!parasafe.success) {
      return res.status(400).json({ err: "validation err" });
    }
    const { name } = parasafe.data;

    const project = await prisma.project.findUnique({ where: {userId_name:  { userId , name }} });

    if (project) {
      return res.status(400).json({ error: "project already exists" });
    }
    const apiKey = generateApiKey()
    const newProject = await prisma.project.create({data:{
       name , userId , apiKey
    }})
    if(newProject){
       return res.status(201).json({ projectId: newProject.id, name: newProject.name, apiKey })
    }


  } catch (err: any) {
    console.error( err.message); 
    return res.status(500).json({ error: "internal server error in creating the project " });
  }
};

export const list = async(req:AuthRequest , res:Response) => {
  try {
    if (!req.user) {
        return res.status(401).json({
          error: "Unauthorized - Please login first",
        });
      }
      const userId = req.user?.id;
      const projects = await prisma.project.findMany({where:{userId}, select:{
        id: true, name: true, apiKey: true, createdAt: true
      }})
    
    res.status(200).json({projects})

  } catch (err: any) {
    console.error( err.message); 
    return res.status(500).json({ error: "internal server error in listing the project " });
  }
};

export const getProject = async(req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized - Please login first" });
    }
    const userId = req.user.id;
    const { id } = req.params as { id: string };

    const project = await prisma.project.findUnique({ where: { id }, select: { id: true, name: true, apiKey: true, createdAt: true, userId: true } });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (project.userId !== userId) {
      return res.status(403).json({ error: "You don't own this project" });
    }

    return res.status(200).json({ id: project.id, name: project.name, apiKey: project.apiKey, createdAt: project.createdAt });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).json({ error: "Internal server error in getting the project" });
  }
};

export const rotateApiKey = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized - Please login first" });
    }
    const userId = req.user.id;
    const { id } = req.params as { id: string };

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.userId !== userId) return res.status(403).json({ error: "You don't own this project" });

    const apiKey = generateApiKey();
    await prisma.project.update({ where: { id }, data: { apiKey } });
    await redis.del(`apikey:${project.apiKey}`);

    return res.status(200).json({ apiKey });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).json({ error: "Internal server error in rotating API key" });
  }
};

export const deleteProject = async(req:AuthRequest , res:Response) => {
  try {
    if (!req.user) {
        return res.status(401).json({
          error: "Unauthorized - Please login first",
        });
      }
      const userId = req.user?.id;
      const {id} = req.params as {id: string}
      const project = await prisma.project.findUnique({where:{ id }})

      if(!project){
       return res.status(400).json({error:"project does not exist"})
      }
      if (project.userId !== userId) {
        return res.status(403).json({ error: "You don't own this project" })
      }

      await prisma.project.delete({where:{id }})
      res.status(200).json({message:"project deleted"})

  } catch (err: any) {
 
    console.error( err.message); 
    return res.status(500).json({ error: "internal server error in deleting the project " });
  }
};

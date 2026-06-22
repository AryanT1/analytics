import prisma from "../db/prisma.js";
import type { AuthRequest } from "./auth.middleware.js";
import type { NextFunction, Response } from "express";

export const verifyProjectOwnership = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized - Please login first" });
        }

        const userId = req.user.id;
        const projectId = req.params.projectId as string;

        if (!projectId) {
            return res.status(400).json({ error: "Bad Request - projectId is required" });
        }

        const project = await prisma.project.findFirst({ where: { id: projectId , userId }, select:{id: true} });

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }


        next();
    } catch (err: any) {
        console.error("Error in verifyProjectOwnership:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};
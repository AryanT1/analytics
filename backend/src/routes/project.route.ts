import { Router } from "express";
import { GeneralAuth } from "../middleware/auth.middleware.js";
import { create, list, getProject, rotateApiKey, deleteProject } from "../controllers/project.controller.js";

export const projectRouter = Router();

projectRouter.post("/create", GeneralAuth, create)
projectRouter.get("/list", GeneralAuth, list)
projectRouter.get("/:id", GeneralAuth, getProject)
projectRouter.post("/:id/rotate-key", GeneralAuth, rotateApiKey)
projectRouter.delete("/:id", GeneralAuth, deleteProject)
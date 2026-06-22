import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { authHeader, TEST_USER_ID, TEST_PROJECT_ID, TEST_API_KEY } from "./helpers.js";

vi.mock("../db/prisma.js");
vi.mock("../db/redis.js");

const { default: prisma } = await import("../db/prisma.js");
const { default: redis } = await import("../db/redis.js");

const mockUser = { id: TEST_USER_ID };
const mockProject = {
    id: TEST_PROJECT_ID,
    name: "My App",
    apiKey: TEST_API_KEY,
    userId: TEST_USER_ID,
    createdAt: new Date(),
};

beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    vi.mocked(redis.get).mockResolvedValue(null);
    vi.mocked(redis.incr).mockResolvedValue(1);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, email: "t@t.com", password: "x", createdAt: new Date() });
});

describe("POST /api/v1/project/create", () => {
    it("creates a project and returns apiKey", async () => {
        vi.mocked(prisma.project.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.project.create).mockResolvedValue(mockProject);

        const res = await request(app)
            .post("/api/v1/project/create")
            .set(authHeader())
            .send({ name: "My App" });

        expect(res.status).toBe(201);
        expect(res.body.projectId).toBeDefined();
        expect(res.body.apiKey).toBeDefined();
    });

    it("returns 400 if project name already exists", async () => {
        vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject);

        const res = await request(app)
            .post("/api/v1/project/create")
            .set(authHeader())
            .send({ name: "My App" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("project already exists");
    });

    it("returns 401 without token", async () => {
        const res = await request(app)
            .post("/api/v1/project/create")
            .send({ name: "My App" });

        expect(res.status).toBe(401);
    });
});

describe("GET /api/v1/project/list", () => {
    it("returns user projects with apiKey", async () => {
        vi.mocked(prisma.project.findMany).mockResolvedValue([mockProject]);

        const res = await request(app)
            .get("/api/v1/project/list")
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.projects).toHaveLength(1);
        expect(res.body.projects[0].apiKey).toBeDefined();
    });
});

describe("POST /api/v1/project/:id/rotate-key", () => {
    it("rotates the API key and invalidates cache", async () => {
        vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject);
        vi.mocked(prisma.project.update).mockResolvedValue({ ...mockProject, apiKey: "ak_newkey" });

        const res = await request(app)
            .post(`/api/v1/project/${TEST_PROJECT_ID}/rotate-key`)
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.apiKey).toBeDefined();
        expect(redis.del).toHaveBeenCalledWith(`apikey:${TEST_API_KEY}`);
    });

    it("returns 403 if user doesn't own project", async () => {
        vi.mocked(prisma.project.findUnique).mockResolvedValue({ ...mockProject, userId: "other-user" });

        const res = await request(app)
            .post(`/api/v1/project/${TEST_PROJECT_ID}/rotate-key`)
            .set(authHeader());

        expect(res.status).toBe(403);
    });
});

describe("DELETE /api/v1/project/:id", () => {
    it("deletes the project", async () => {
        vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject);
        vi.mocked(prisma.project.delete).mockResolvedValue(mockProject);

        const res = await request(app)
            .delete(`/api/v1/project/${TEST_PROJECT_ID}`)
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("project deleted");
    });

    it("returns 403 if user doesn't own project", async () => {
        vi.mocked(prisma.project.findUnique).mockResolvedValue({ ...mockProject, userId: "other-user" });

        const res = await request(app)
            .delete(`/api/v1/project/${TEST_PROJECT_ID}`)
            .set(authHeader());

        expect(res.status).toBe(403);
    });
});

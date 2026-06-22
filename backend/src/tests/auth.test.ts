import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";

vi.mock("../db/prisma.js");
vi.mock("../db/redis.js");
vi.mock("bcrypt", () => ({
    default: {
        genSalt: vi.fn().mockResolvedValue("salt"),
        hash: vi.fn().mockResolvedValue("hashed-password"),
        compare: vi.fn().mockResolvedValue(true),
    },
}));

const { default: prisma } = await import("../db/prisma.js");

beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
});

describe("POST /api/v1/auth/signup", () => {
    it("creates a new user and returns token", async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.user.create).mockResolvedValue({
            id: "user-1",
            email: "test@test.com",
            password: "hashed-password",
            createdAt: new Date(),
        });

        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send({ email: "test@test.com", password: "password123" });

        expect(res.status).toBe(201);
        expect(res.body.user.email).toBe("test@test.com");
        expect(res.body.token).toBeDefined();
    });

    it("returns 400 if user already exists", async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: "user-1",
            email: "test@test.com",
            password: "hashed",
            createdAt: new Date(),
        });

        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send({ email: "test@test.com", password: "password123" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("user already exists");
    });

    it("returns 400 on invalid input", async () => {
        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send({ email: "not-an-email", password: "short" });

        expect(res.status).toBe(400);
    });
});

describe("POST /api/v1/auth/login", () => {
    it("returns token on valid credentials", async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: "user-1",
            email: "test@test.com",
            password: "hashed-password",
            createdAt: new Date(),
        });

        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: "test@test.com", password: "password123" });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it("returns 401 if user not found", async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: "nobody@test.com", password: "password123" });

        expect(res.status).toBe(401);
    });

    it("returns 400 on wrong password", async () => {
        const bcrypt = await import("bcrypt");
        vi.mocked(bcrypt.default.compare).mockResolvedValue(false as never);

        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: "user-1",
            email: "test@test.com",
            password: "hashed-password",
            createdAt: new Date(),
        });

        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: "test@test.com", password: "wrongpassword" });

        expect(res.status).toBe(400);
    });
});

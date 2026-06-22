import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { TEST_API_KEY, TEST_PROJECT_ID, TEST_USER_ID } from "./helpers.js";

vi.mock("../db/prisma.js");
vi.mock("../db/redis.js");

const { default: prisma } = await import("../db/prisma.js");
const { default: redis } = await import("../db/redis.js");

const mockProject = { id: TEST_PROJECT_ID, userId: TEST_USER_ID };

beforeEach(() => {
    vi.mocked(redis.get).mockResolvedValue(null);
    vi.mocked(redis.incr).mockResolvedValue(1);
    vi.mocked(prisma.project.findUnique).mockResolvedValue({
        id: TEST_PROJECT_ID,
        userId: TEST_USER_ID,
        name: "Test Project",
        apiKey: TEST_API_KEY,
        createdAt: new Date(),
    });
});

describe("POST /api/v1/track", () => {
    it("buffers event and returns success", async () => {
        const res = await request(app)
            .post("/api/v1/track")
            .set("x-api-key", TEST_API_KEY)
            .send({ eventName: "page_view", userId: "user-abc" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(redis.rpush).toHaveBeenCalled();
    });

    it("buffers event with null userId when not provided", async () => {
        const res = await request(app)
            .post("/api/v1/track")
            .set("x-api-key", TEST_API_KEY)
            .send({ eventName: "page_view", anonymousId: "anon-xyz" });

        expect(res.status).toBe(200);
        const buffered = JSON.parse(
            vi.mocked(redis.rpush).mock.calls[0]?.[1] as string
        );
        expect(buffered.userId).toBeNull();
        expect(buffered.anonymousId).toBe("anon-xyz");
    });

    it("returns 401 when API key is missing", async () => {
        const res = await request(app)
            .post("/api/v1/track")
            .send({ eventName: "page_view" });

        expect(res.status).toBe(401);
    });

    it("returns 401 when API key is invalid", async () => {
        vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

        const res = await request(app)
            .post("/api/v1/track")
            .set("x-api-key", "invalid-key")
            .send({ eventName: "page_view" });

        expect(res.status).toBe(401);
    });

    it("returns 400 on missing eventName", async () => {
        const res = await request(app)
            .post("/api/v1/track")
            .set("x-api-key", TEST_API_KEY)
            .send({ userId: "user-abc" });

        expect(res.status).toBe(400);
    });
});

describe("POST /api/v1/track/identify", () => {
    it("merges anonymous identity into userId", async () => {
        vi.mocked(prisma.event.updateMany).mockResolvedValue({ count: 3 });

        const res = await request(app)
            .post("/api/v1/track/identify")
            .set("x-api-key", TEST_API_KEY)
            .send({ anonymousId: "anon-xyz", userId: "user-abc" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(prisma.event.updateMany).toHaveBeenCalledWith({
            where: { projectId: TEST_PROJECT_ID, anonymousId: "anon-xyz", userId: null },
            data: { userId: "user-abc" },
        });
        expect(redis.set).toHaveBeenCalledWith(
            `identity:${TEST_PROJECT_ID}:anon-xyz`,
            "user-abc",
            "EX",
            604800
        );
    });

    it("returns 400 when anonymousId or userId is missing", async () => {
        const res = await request(app)
            .post("/api/v1/track/identify")
            .set("x-api-key", TEST_API_KEY)
            .send({ anonymousId: "anon-xyz" });

        expect(res.status).toBe(400);
    });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { authHeader, TEST_USER_ID, TEST_PROJECT_ID } from "./helpers.js";

vi.mock("../db/prisma.js");
vi.mock("../db/redis.js");

const { default: prisma } = await import("../db/prisma.js");
const { default: redis } = await import("../db/redis.js");

beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    vi.mocked(redis.get).mockResolvedValue(null);
    vi.mocked(redis.incr).mockResolvedValue(1);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: TEST_USER_ID, email: "t@t.com", password: "x", createdAt: new Date(),
    });
    vi.mocked(prisma.project.findFirst).mockResolvedValue({
        id: TEST_PROJECT_ID, name: "Test", apiKey: "ak_x", userId: TEST_USER_ID, createdAt: new Date(),
    });
});

describe("GET /api/v1/analytics/:projectId/summary", () => {
    it("returns summary stats", async () => {
        vi.mocked(prisma.event.count).mockResolvedValue(100);
        vi.mocked(prisma.$queryRaw).mockResolvedValue([{ count: BigInt(5) }]);
        vi.mocked(prisma.event.groupBy).mockResolvedValue([
            { eventName: "click" } as any,
            { eventName: "page_view" } as any,
        ]);

        const res = await request(app)
            .get(`/api/v1/analytics/${TEST_PROJECT_ID}/summary`)
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.totalEvents).toBe(100);
        expect(res.body.uniqueUsers).toBe(5);
        expect(res.body.uniqueEventTypes).toBe(2);
    });

    it("serves from cache on second request", async () => {
        const cached = JSON.stringify({ totalEvents: 99, uniqueUsers: 3, uniqueEventTypes: 1 });
        vi.mocked(redis.get).mockResolvedValue(cached);

        const res = await request(app)
            .get(`/api/v1/analytics/${TEST_PROJECT_ID}/summary`)
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.totalEvents).toBe(99);
        expect(prisma.event.count).not.toHaveBeenCalled();
    });

    it("returns 401 without token", async () => {
        const res = await request(app)
            .get(`/api/v1/analytics/${TEST_PROJECT_ID}/summary`);

        expect(res.status).toBe(401);
    });
});

describe("GET /api/v1/analytics/:projectId/events", () => {
    it("returns paginated events by name", async () => {
        vi.mocked(prisma.$queryRaw)
            .mockResolvedValueOnce([{ eventName: "click", count: BigInt(50) }])
            .mockResolvedValueOnce([{ count: BigInt(1) }]);

        const res = await request(app)
            .get(`/api/v1/analytics/${TEST_PROJECT_ID}/events?limit=10&offset=0`)
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.events[0].eventName).toBe("click");
        expect(res.body.events[0].count).toBe(50);
        expect(res.body.limit).toBe(10);
        expect(res.body.offset).toBe(0);
        expect(res.body.total).toBe(1);
    });
});

describe("GET /api/v1/analytics/:projectId/users", () => {
    it("returns top users using COALESCE of userId and anonymousId", async () => {
        vi.mocked(prisma.$queryRaw).mockResolvedValue([
            { identifier: "user-abc", isAnonymous: false, eventCount: BigInt(30) },
            { identifier: "anon-xyz", isAnonymous: true, eventCount: BigInt(10) },
        ]);

        const res = await request(app)
            .get(`/api/v1/analytics/${TEST_PROJECT_ID}/users`)
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.users[0].identifier).toBe("user-abc");
        expect(res.body.users[0].isAnonymous).toBe(false);
        expect(res.body.users[0].eventCount).toBe(30);
        expect(res.body.users[1].identifier).toBe("anon-xyz");
        expect(res.body.users[1].isAnonymous).toBe(true);
    });
});

describe("GET /api/v1/analytics/:projectId/countries", () => {
    it("returns events by country with pagination", async () => {
        vi.mocked(prisma.$queryRaw)
            .mockResolvedValueOnce([{ country: "IN", count: BigInt(20) }])
            .mockResolvedValueOnce([{ count: BigInt(1) }]);

        const res = await request(app)
            .get(`/api/v1/analytics/${TEST_PROJECT_ID}/countries`)
            .set(authHeader());

        expect(res.status).toBe(200);
        expect(res.body.countries[0].country).toBe("IN");
        expect(res.body.countries[0].count).toBe(20);
    });
});

import prisma from "../db/prisma.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";

const parsePagination = (query: Record<string, any>) => {
    const limit = Math.min(parseInt(query.limit) || 50, 200);
    const offset = parseInt(query.offset) || 0;
    return { limit, offset };
};

export const getSummary = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params as { projectId: string };

        const [totalEvents, uniqueUsersResult, uniqueEventTypes] = await Promise.all([
            prisma.event.count({ where: { projectId } }),
            prisma.$queryRaw<{ count: bigint }[]>`
                SELECT COUNT(DISTINCT COALESCE("userId", "anonymousId")) AS count
                FROM "Event"
                WHERE "projectId" = ${projectId}
                  AND COALESCE("userId", "anonymousId") IS NOT NULL
            `,
            prisma.event.groupBy({ by: ["eventName"], where: { projectId } }),
        ]);

        return res.status(200).json({
            totalEvents,
            uniqueUsers: Number(uniqueUsersResult[0]?.count ?? 0),
            uniqueEventTypes: uniqueEventTypes.length,
        });
    } catch (err: any) {
        console.error(err.message);
        return res.status(500).json({ error: "Internal server error in getSummary" });
    }
};

export const getEventsByName = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params as { projectId: string };
        const { limit, offset } = parsePagination(req.query);

        const [events, totalResult] = await Promise.all([
            prisma.$queryRaw<{ eventName: string; count: bigint }[]>`
                SELECT "eventName", COUNT(*) AS count
                FROM "Event"
                WHERE "projectId" = ${projectId}
                GROUP BY "eventName"
                ORDER BY count DESC
                LIMIT ${limit} OFFSET ${offset}
            `,
            prisma.$queryRaw<{ count: bigint }[]>`
                SELECT COUNT(DISTINCT "eventName") AS count FROM "Event" WHERE "projectId" = ${projectId}
            `,
        ]);

        return res.status(200).json({
            total: Number(totalResult[0]?.count ?? 0),
            limit,
            offset,
            events: events.map((e) => ({ eventName: e.eventName, count: Number(e.count) })),
        });
    } catch (err: any) {
        console.error(err.message);
        return res.status(500).json({ error: "Internal server error in getEventsByName" });
    }
};

export const getEventsOverTime = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params as { projectId: string };
        const { from, to } = req.query as { from?: string; to?: string };

        const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const toDate = to ? new Date(to) : new Date();

        const result = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
            SELECT TO_CHAR(DATE("createdAt"), 'YYYY-MM-DD') AS date, COUNT(*) AS count
            FROM "Event"
            WHERE "projectId" = ${projectId}
              AND "createdAt" >= ${fromDate}
              AND "createdAt" <= ${toDate}
            GROUP BY DATE("createdAt")
            ORDER BY DATE("createdAt") ASC
        `;

        return res.status(200).json({
            events: result.map((r) => ({ date: r.date, count: Number(r.count) })),
        });
    } catch (err: any) {
        console.error(err.message);
        return res.status(500).json({ error: "Internal server error in getEventsOverTime" });
    }
};

export const getUniqueUsersOverTime = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params as { projectId: string };
        const { from, to } = req.query as { from?: string; to?: string };

        const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const toDate = to ? new Date(to) : new Date();

        const result = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
            SELECT TO_CHAR(DATE("createdAt"), 'YYYY-MM-DD') AS date,
                   COUNT(DISTINCT COALESCE("userId", "anonymousId")) AS count
            FROM "Event"
            WHERE "projectId" = ${projectId}
              AND "createdAt" >= ${fromDate}
              AND "createdAt" <= ${toDate}
              AND COALESCE("userId", "anonymousId") IS NOT NULL
            GROUP BY DATE("createdAt")
            ORDER BY DATE("createdAt") ASC
        `;

        return res.status(200).json({
            users: result.map((r) => ({ date: r.date, count: Number(r.count) })),
        });
    } catch (err: any) {
        console.error(err.message);
        return res.status(500).json({ error: "Internal server error in getUniqueUsersOverTime" });
    }
};

export const getEventsByCountry = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params as { projectId: string };
        const { limit, offset } = parsePagination(req.query);

        const [countries, totalResult] = await Promise.all([
            prisma.$queryRaw<{ country: string | null; count: bigint }[]>`
                SELECT "country", COUNT(*) AS count
                FROM "Event"
                WHERE "projectId" = ${projectId}
                GROUP BY "country"
                ORDER BY count DESC
                LIMIT ${limit} OFFSET ${offset}
            `,
            prisma.$queryRaw<{ count: bigint }[]>`
                SELECT COUNT(DISTINCT "country") AS count FROM "Event" WHERE "projectId" = ${projectId}
            `,
        ]);

        return res.status(200).json({
            total: Number(totalResult[0]?.count ?? 0),
            limit,
            offset,
            countries: countries.map((c) => ({ country: c.country ?? "Unknown", count: Number(c.count) })),
        });
    } catch (err: any) {
        console.error(err.message);
        return res.status(500).json({ error: "Internal server error in getEventsByCountry" });
    }
};

export const getEventsByDevice = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params as { projectId: string };
        const { limit, offset } = parsePagination(req.query);

        const [devices, totalResult] = await Promise.all([
            prisma.$queryRaw<{ deviceType: string | null; count: bigint }[]>`
                SELECT "deviceType", COUNT(*) AS count
                FROM "Event"
                WHERE "projectId" = ${projectId}
                GROUP BY "deviceType"
                ORDER BY count DESC
                LIMIT ${limit} OFFSET ${offset}
            `,
            prisma.$queryRaw<{ count: bigint }[]>`
                SELECT COUNT(DISTINCT "deviceType") AS count FROM "Event" WHERE "projectId" = ${projectId}
            `,
        ]);

        return res.status(200).json({
            total: Number(totalResult[0]?.count ?? 0),
            limit,
            offset,
            devices: devices.map((d) => ({ deviceType: d.deviceType ?? "Unknown", count: Number(d.count) })),
        });
    } catch (err: any) {
        console.error(err.message);
        return res.status(500).json({ error: "Internal server error in getEventsByDevice" });
    }
};

export const getTopUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params as { projectId: string };
        const { limit, offset } = parsePagination(req.query);

        const users = await prisma.$queryRaw<{ identifier: string; isAnonymous: boolean; eventCount: bigint }[]>`
            SELECT
                COALESCE("userId", "anonymousId") AS identifier,
                ("userId" IS NULL)               AS "isAnonymous",
                COUNT(*)                          AS "eventCount"
            FROM "Event"
            WHERE "projectId" = ${projectId}
              AND COALESCE("userId", "anonymousId") IS NOT NULL
            GROUP BY COALESCE("userId", "anonymousId"), ("userId" IS NULL)
            ORDER BY "eventCount" DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        return res.status(200).json({
            limit,
            offset,
            users: users.map((u) => ({
                identifier: u.identifier,
                isAnonymous: u.isAnonymous,
                eventCount: Number(u.eventCount),
            })),
        });
    } catch (err: any) {
        console.error(err.message);
        return res.status(500).json({ error: "Internal server error in getTopUsers" });
    }
};

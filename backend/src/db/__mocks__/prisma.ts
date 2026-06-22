import { vi } from "vitest";

const prisma = {
    user: {
        findUnique: vi.fn(),
        create: vi.fn(),
    },
    project: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
    event: {
        count: vi.fn(),
        groupBy: vi.fn(),
        updateMany: vi.fn(),
        createMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
};

export default prisma;

import jwt from "jsonwebtoken";

export const TEST_SECRET = "test-secret";
export const TEST_USER_ID = "user-test-123";
export const TEST_PROJECT_ID = "project-test-123";
export const TEST_API_KEY = "ak_testkey123";

export const makeToken = (userId = TEST_USER_ID) =>
    jwt.sign({ userId }, TEST_SECRET, { expiresIn: "1h" });

export const authHeader = (userId = TEST_USER_ID) => ({
    Authorization: `Bearer ${makeToken(userId)}`,
});

import http from "node:http";
import mongoose from "mongoose";
import app from "./src/app.js";
import { User } from "./src/models/user.model.js";
import { Scan } from "./src/models/scan.model.js";
import { Report } from "./src/models/report.model.js";
import { Event } from "./src/models/event.model.js";
import { Finding } from "./src/models/finding.model.js";
import { generateAccessToken, generateRefreshToken } from "./src/services/token.service.js";
import { RiskLevel, ScanStatus } from "./src/types/scan.types.js";

interface TestResult {
  group: string;
  name: string;
  method: string;
  path: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  responseSnippet: string;
}

const results: TestResult[] = [];

function chainable(data: any) {
  return {
    select: () => chainable(data),
    sort: () => chainable(data),
    limit: () => chainable(data),
    lean: async () => data,
    then: (resolve: any, reject: any) => Promise.resolve(data).then(resolve, reject),
  };
}

async function setupMocksIfDbDisconnected() {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    console.log("Database is connected. Running tests against live MongoDB.");
    return;
  }

  console.log("Database offline or IP unwhitelisted. Initializing in-memory mock adapters for Mongoose models...");

  const testUserId = "user_test_123";
  const inMemoryUsers: any[] = [
    {
      _id: testUserId,
      name: "Test User",
      email: "test@example.com",
      isActive: true,
      refreshTokenHash: "mock_hash",
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      save: async function () {
        return this;
      },
    },
  ];
  const inMemoryScans: any[] = [];

  // Mock User
  (User as any).findOne = (query: any) => {
    const user = inMemoryUsers.find((u) => u.email === query.email?.toLowerCase());
    return chainable(user ? { ...user, save: async () => user } : null);
  };

  (User as any).findById = (id: string) => {
    const user = inMemoryUsers.find((u) => u._id === id);
    return chainable(user ? { ...user, save: async () => user } : null);
  };

  (User as any).create = async (doc: any) => {
    const created = {
      _id: `user_${Date.now()}`,
      ...doc,
      save: async function () {
        return this;
      },
    };
    inMemoryUsers.push(created);
    return created;
  };

  // Mock Scan
  (Scan as any).create = async (doc: any) => {
    const created = {
      _id: `scan_doc_${Date.now()}`,
      ...doc,
      save: async function () {
        return this;
      },
    };
    inMemoryScans.push(created);
    return created;
  };

  (Scan as any).findOne = (query: any) => {
    let scan = inMemoryScans.find((s) => s.scanId === query.scanId);
    if (!scan) {
      scan = {
        scanId: query.scanId,
        userId: query.userId || testUserId,
        jobUrl: "https://example.com/job/123",
        status: ScanStatus.COMPLETED,
        riskScore: 35,
        riskLevel: RiskLevel.MEDIUM,
        startedAt: new Date(),
        completedAt: new Date(),
        error: null,
      };
    }
    return chainable(scan);
  };

  (Scan as any).find = (query: any) => {
    const list = inMemoryScans.filter((s) => !query.userId || s.userId === query.userId);
    return chainable(list.length > 0 ? list : [{
      scanId: "scan_test_123",
      userId: testUserId,
      jobUrl: "https://example.com/job/123",
      status: ScanStatus.COMPLETED,
      riskScore: 35,
      riskLevel: RiskLevel.MEDIUM,
      startedAt: new Date(),
      completedAt: new Date(),
      createdAt: new Date(),
      error: null,
    }]);
  };

  (Scan as any).updateOne = async () => ({ acknowledged: true, modifiedCount: 1 });

  // Mock Report
  (Report as any).findOne = (query: any) => {
    const report = {
      scanId: query.scanId,
      jobUrl: "https://example.com/job/123",
      riskScore: 35,
      riskLevel: "MEDIUM",
      summary: "1 suspicious signal detected.",
      findings: [],
      timeline: [],
      domainChecks: {
        originalDomain: "example.com",
        finalDomain: "example.com",
        externalRedirectDetected: false,
      },
      recommendedAction: "PROCEED_WITH_CAUTION",
    };
    return chainable(report);
  };

  // Mock Event
  (Event as any).find = () =>
    chainable([
      {
        scanId: "scan_test_123",
        type: "REQUEST",
        timestamp: new Date(),
        url: "https://example.com/job/123",
        data: { method: "GET", status: 200 },
      },
    ]);

  // Mock Finding
  (Finding as any).find = () =>
    chainable([
      {
        scanId: "scan_test_123",
        type: "SUSPICIOUS_REDIRECT",
        severity: "MEDIUM",
        score: 35,
        evidence: "Example redirect",
        source: "DOM",
      },
    ]);
}

async function runTests() {
  await setupMocksIfDbDisconnected();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`Test server running at ${baseUrl}\n`);

  // Generate tokens
  const testUserId = "user_test_123";
  const testUserEmail = "test@example.com";
  const validToken = generateAccessToken(testUserId, testUserEmail);
  const authHeader = { Authorization: `Bearer ${validToken}` };

  async function test(
    group: string,
    name: string,
    method: string,
    path: string,
    expectedStatus: number,
    headers: Record<string, string> = {},
    body?: any,
  ) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...headers,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      const text = await response.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }

      const passed = response.status === expectedStatus;
      const snippet = typeof parsed === "object" ? JSON.stringify(parsed).slice(0, 100) : String(parsed).slice(0, 100);

      results.push({
        group,
        name,
        method,
        path,
        expectedStatus,
        actualStatus: response.status,
        passed,
        responseSnippet: snippet,
      });

      const mark = passed ? "✓ PASS" : "✗ FAIL";
      console.log(`${mark} [${response.status}/${expectedStatus}] ${method} ${path} - ${name}`);
    } catch (err: any) {
      results.push({
        group,
        name,
        method,
        path,
        expectedStatus,
        actualStatus: -1,
        passed: false,
        responseSnippet: err.message,
      });
      console.log(`✗ FAIL [ERR] ${method} ${path} - ${name}: ${err.message}`);
    }
  }

  // 1. GENERAL / SYSTEM
  console.log("\n--- [1] SYSTEM & GENERAL ROUTES ---");
  await test("System", "Root info endpoint", "GET", "/", 200);
  await test("System", "Health check endpoint", "GET", "/api/v1/health", 200);
  await test("System", "404 handler for unknown routes", "GET", "/api/v1/non-existent-route", 404);

  // 2. AUTH REGISTRATION
  console.log("\n--- [2] AUTH: REGISTER ---");
  await test("Auth", "Register with empty body fails validation", "POST", "/api/v1/auth/register", 400, {}, {});
  await test("Auth", "Register with invalid email fails validation", "POST", "/api/v1/auth/register", 400, {}, {
    name: "John Doe",
    email: "not-an-email",
    password: "Password123!",
  });
  await test("Auth", "Register with password < 8 chars fails validation", "POST", "/api/v1/auth/register", 400, {}, {
    name: "John Doe",
    email: "john@example.com",
    password: "123",
  });
  await test("Auth", "Register valid user succeeds", "POST", "/api/v1/auth/register", 201, {}, {
    name: "John Doe",
    email: "john@example.com",
    password: "SecurePassword123!",
  });

  // 3. AUTH LOGIN
  console.log("\n--- [3] AUTH: LOGIN ---");
  await test("Auth", "Login with empty body fails validation", "POST", "/api/v1/auth/login", 400, {}, {});
  await test("Auth", "Login with invalid email fails validation", "POST", "/api/v1/auth/login", 400, {}, {
    email: "invalid-email",
    password: "any",
  });
  await test("Auth", "Login with valid credentials succeeds", "POST", "/api/v1/auth/login", 200, {}, {
    email: "john@example.com",
    password: "SecurePassword123!",
  });

  // 4. AUTH REFRESH & LOGOUT
  console.log("\n--- [4] AUTH: REFRESH & LOGOUT ---");
  await test("Auth", "Refresh token empty body fails", "POST", "/api/v1/auth/refresh", 400, {}, {});
  await test("Auth", "Logout without Authorization header fails", "POST", "/api/v1/auth/logout", 401);
  await test("Auth", "Logout with invalid Bearer token fails", "POST", "/api/v1/auth/logout", 401, {
    Authorization: "Bearer invalid.fake.token",
  });
  await test("Auth", "Logout with valid Bearer token succeeds", "POST", "/api/v1/auth/logout", 200, authHeader);

  // 5. AUTH CURRENT USER (ME)
  console.log("\n--- [5] AUTH: ME ---");
  await test("Auth", "Get me without token fails", "GET", "/api/v1/auth/me", 401);
  await test("Auth", "Get me with valid Bearer token succeeds", "GET", "/api/v1/auth/me", 200, authHeader);

  // 6. SCANS
  console.log("\n--- [6] SCANS: CREATE & RETRIEVE ---");
  await test("Scans", "Create scan without token fails", "POST", "/api/v1/scans", 401, {}, { jobUrl: "https://example.com" });
  await test("Scans", "Create scan with invalid URL fails validation", "POST", "/api/v1/scans", 400, authHeader, {
    jobUrl: "not-a-url",
  });
  await test("Scans", "Create scan with non-http URL fails validation", "POST", "/api/v1/scans", 400, authHeader, {
    jobUrl: "ftp://example.com/job",
  });
  await test("Scans", "Create scan with valid jobUrl succeeds", "POST", "/api/v1/scans", 201, authHeader, {
    jobUrl: "https://careers.google.com/jobs/results/12345",
  });
  await test("Scans", "Get scan details without token fails", "GET", "/api/v1/scans/scan_test_123", 401);
  await test("Scans", "Get scan details with valid token succeeds", "GET", "/api/v1/scans/scan_test_123", 200, authHeader);
  await test("Scans", "Get all user scans without token fails", "GET", "/api/v1/scans", 401);
  await test("Scans", "Get all user scans with valid token succeeds", "GET", "/api/v1/scans", 200, authHeader);

  // 7. REPORTS
  console.log("\n--- [7] REPORTS ---");
  await test("Reports", "Get report without token fails", "GET", "/api/v1/reports/scan_test_123", 401);
  await test("Reports", "Get report with valid token succeeds", "GET", "/api/v1/reports/scan_test_123", 200, authHeader);

  // 8. EVIDENCE
  console.log("\n--- [8] EVIDENCE: EVENTS & FINDINGS ---");
  await test("Evidence", "Get scan events without token fails", "GET", "/api/v1/scans/scan_test_123/events", 401);
  await test("Evidence", "Get scan events with valid token succeeds", "GET", "/api/v1/scans/scan_test_123/events", 200, authHeader);
  await test("Evidence", "Get scan findings without token fails", "GET", "/api/v1/scans/scan_test_123/findings", 401);
  await test("Evidence", "Get scan findings with valid token succeeds", "GET", "/api/v1/scans/scan_test_123/findings", 200, authHeader);

  // 9. AI ANALYSIS
  console.log("\n--- [9] AI ANALYSIS ---");
  await test("AI", "Analyze scan without token fails", "POST", "/api/v1/ai/analyze/scan_test_123", 401);

  server.close();

  console.log("\n==================================================");
  console.log("             API TEST SUMMARY REPORT              ");
  console.log("==================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log(`Total Endpoints Tested: ${total}`);
  console.log(`Passed:                ${passed}`);
  console.log(`Failed:                ${failed}`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test runner encountered error:", e);
  process.exit(1);
});


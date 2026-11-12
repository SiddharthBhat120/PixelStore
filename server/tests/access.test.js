const { test, describe, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { app, mock, tokenFor, fakeUser, stubFindById } = require("./helpers");

afterEach(() => mock.restoreAll());

describe("general", () => {
  test("GET /api/health responds", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  test("unknown routes return a JSON 404", async () => {
    const res = await request(app).get("/api/does-not-exist");
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});

describe("protect middleware (login required)", () => {
  test("no token gives 401", async () => {
    const res = await request(app).get("/api/orders/my");
    assert.equal(res.status, 401);
  });

  test("a made-up token gives 401", async () => {
    const res = await request(app).get("/api/orders/my").set("Authorization", "Bearer not-a-real-token");
    assert.equal(res.status, 401);
  });

  test("a token signed with a different secret gives 401", async () => {
    const forged = jwt.sign({ id: "64b000000000000000000001" }, "some-other-secret");
    const res = await request(app).get("/api/orders/my").set("Authorization", `Bearer ${forged}`);
    assert.equal(res.status, 401);
  });

  test("an expired token gives 401", async () => {
    const expired = jwt.sign({ id: "64b000000000000000000001" }, process.env.JWT_SECRET, { expiresIn: -10 });
    const res = await request(app).get("/api/orders/my").set("Authorization", `Bearer ${expired}`);
    assert.equal(res.status, 401);
  });

  test("a valid token for a deleted user gives 401", async () => {
    stubFindById(null);
    const res = await request(app)
      .get("/api/orders/my")
      .set("Authorization", `Bearer ${tokenFor("64b000000000000000000001")}`);
    assert.equal(res.status, 401);
    assert.equal(res.body.message, "User not found.");
  });
});

describe("adminOnly middleware", () => {
  const adminRoutes = [
    ["get", "/api/products/stats"],
    ["post", "/api/products/seed"],
    ["delete", "/api/products/64b0000000000000000000aa"],
    ["get", "/api/orders/admin/all"],
    ["get", "/api/orders/admin/stats"],
    ["put", "/api/orders/64b0000000000000000000aa/status"],
  ];

  for (const [method, path] of adminRoutes) {
    test(`${method.toUpperCase()} ${path} refuses a normal user with 403`, async () => {
      stubFindById(fakeUser({ role: "user" }));
      const res = await request(app)[method](path).set("Authorization", `Bearer ${tokenFor("64b000000000000000000001")}`);
      assert.equal(res.status, 403);
      assert.equal(res.body.message, "Admin access required.");
    });

    test(`${method.toUpperCase()} ${path} refuses a visitor with 401`, async () => {
      const res = await request(app)[method](path);
      assert.equal(res.status, 401);
    });
  }
});

const { test, describe, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { app, User, mock, fakeUser, stubFindOne } = require("./helpers");

afterEach(() => mock.restoreAll());

describe("POST /api/auth/register", () => {
  test("rejects a request with missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "a@b.com" });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test("rejects a password shorter than 6 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Asha", email: "asha@example.com", password: "12345" });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /at least 6/);
  });

  test("returns 409 when the email is already registered", async () => {
    stubFindOne(fakeUser());
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Asha", email: "asha@example.com", password: "secret12" });
    assert.equal(res.status, 409);
  });

  test("looks the email up in lower case", async () => {
    const findOne = stubFindOne(fakeUser());
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Asha", email: "Asha@Example.COM", password: "secret12" });
    assert.deepEqual(findOne.mock.calls[0].arguments[0], { email: "asha@example.com" });
  });

  test("creates the account and returns a signed token, without the password", async () => {
    stubFindOne(null);
    const create = mock.method(User, "create", async (doc) => fakeUser({ name: doc.name, email: doc.email }));
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Asha", email: "asha@example.com", password: "secret12" });

    assert.equal(res.status, 201);
    assert.equal(create.mock.callCount(), 1);
    assert.equal(res.body.user.email, "asha@example.com");
    assert.equal(res.body.user.password, undefined);
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    assert.equal(decoded.id, "64b000000000000000000001");
  });
});

describe("POST /api/auth/login", () => {
  test("rejects a request with no password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "asha@example.com" });
    assert.equal(res.status, 400);
  });

  test("returns 401 for an unknown email", async () => {
    stubFindOne(null);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "correct-password" });
    assert.equal(res.status, 401);
  });

  test("returns 401 for a wrong password, with the same message as an unknown email", async () => {
    stubFindOne(fakeUser());
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "asha@example.com", password: "wrong-password" });
    assert.equal(res.status, 401);
    assert.equal(res.body.message, "Invalid email or password.");
    assert.equal(res.body.token, undefined);
  });

  test("returns a token for the right password", async () => {
    stubFindOne(fakeUser());
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "asha@example.com", password: "correct-password" });
    assert.equal(res.status, 200);
    assert.ok(jwt.verify(res.body.token, process.env.JWT_SECRET));
  });
});

describe("POST /api/auth/seed-admin (demo helper)", () => {
  afterEach(() => delete process.env.ALLOW_DEMO_SEED);

  test("is refused when ALLOW_DEMO_SEED is not set, and never touches the database", async () => {
    const findOne = stubFindOne(null);
    const create = mock.method(User, "create", async () => fakeUser());
    const res = await request(app).post("/api/auth/seed-admin");
    assert.equal(res.status, 403);
    assert.equal(res.body.credentials, undefined);
    assert.equal(findOne.mock.callCount(), 0);
    assert.equal(create.mock.callCount(), 0);
  });

  test("is refused when ALLOW_DEMO_SEED is anything other than 'true'", async () => {
    process.env.ALLOW_DEMO_SEED = "1";
    const res = await request(app).post("/api/auth/seed-admin");
    assert.equal(res.status, 403);
  });

  test("creates the demo admin when ALLOW_DEMO_SEED=true", async () => {
    process.env.ALLOW_DEMO_SEED = "true";
    stubFindOne(null);
    const create = mock.method(User, "create", async () => fakeUser({ role: "admin" }));
    const res = await request(app).post("/api/auth/seed-admin");
    assert.equal(res.status, 200);
    assert.equal(create.mock.calls[0].arguments[0].role, "admin");
  });
});

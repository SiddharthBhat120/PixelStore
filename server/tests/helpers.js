// Shared test setup. The tests call the real Express app over HTTP.
// Only the database calls on the User model are replaced with fakes,
// so no MongoDB is needed to run them.
const { mock } = require("node:test");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret-not-used-anywhere-else";

const app = require("../app");
const User = require("../models/User");

const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });

// A stand-in for a user document, with the two methods the controllers call.
const fakeUser = (overrides = {}) => {
  const data = { _id: "64b000000000000000000001", name: "Asha", email: "asha@example.com", role: "user", ...overrides };
  return {
    ...data,
    comparePassword: async (candidate) => candidate === "correct-password",
    toPublicJSON: () => ({ ...data }),
  };
};

// The auth middleware calls User.findById(id).select("-password").
const stubFindById = (user) =>
  mock.method(User, "findById", () => ({ select: async () => user }));

// The login controller calls User.findOne({ email }).select("+password");
// register and seed-admin await User.findOne({ email }) directly.
// This fake supports both.
const stubFindOne = (user) =>
  mock.method(User, "findOne", () => {
    const query = Promise.resolve(user);
    query.select = async () => user;
    return query;
  });

module.exports = { app, User, mock, tokenFor, fakeUser, stubFindById, stubFindOne };

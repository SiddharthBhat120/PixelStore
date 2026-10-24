const mongoose = require("mongoose");
const dns = require("dns");

const configureDns = () => {
  const configuredServers = process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(",").map((server) => server.trim()).filter(Boolean)
    : [];
  const currentServers = dns.getServers();
  const onlyLocalDns = currentServers.length > 0 && currentServers.every((server) =>
    server === "127.0.0.1" || server === "::1" || server.startsWith("127.")
  );

  if (configuredServers.length > 0 || onlyLocalDns) {
    dns.setServers(configuredServers.length > 0 ? configuredServers : ["1.1.1.1", "8.8.8.8"]);
  }
};

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing. Add it to server/.env.");
    }

    configureDns();
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

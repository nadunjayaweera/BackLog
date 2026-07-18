require("dotenv").config();

const app = require("./app");
const environment = require("./config/environment");

const server = app.listen(environment.port, () => {
  console.log("============================================");
  console.log("Node.js Express backend started");
  console.log(`Port: ${environment.port}`);
  console.log(`Environment: ${environment.nodeEnv}`);
  console.log(`Trust proxy: ${environment.trustProxy}`);
  console.log(`IP tracking: ${environment.enableIpTracking}`);
  console.log(`Header tracking: ${environment.enableHeaderTracking}`);
  console.log(`URL: http://localhost:${environment.port}`);
  console.log("============================================");
});

const gracefullyShutdownServer = (signal) => {
  console.log(`\n${signal} received. Closing HTTP server...`);

  server.close(() => {
    console.log("HTTP server closed successfully.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Could not close server gracefully.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGINT", () => {
  gracefullyShutdownServer("SIGINT");
});

process.on("SIGTERM", () => {
  gracefullyShutdownServer("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  gracefullyShutdownServer("UNCAUGHT_EXCEPTION");
});

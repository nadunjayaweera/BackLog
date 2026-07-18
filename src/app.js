const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const environment = require("./config/environment");

const ipTrackingMiddleware = require("./middleware/ipTracking.middleware");

const requestHeadersMiddleware = require("./middleware/requestHeaders.middleware");

const routeNotFoundMiddleware = require("./middleware/routeNotFound.middleware");

const errorHandlerMiddleware = require("./middleware/errorHandler.middleware");

const app = express();

// =====================================================
// PROXY CONFIGURATION
// =====================================================

if (environment.trustProxy) {
  app.set("trust proxy", 1);
}

// =====================================================
// SECURITY AND STANDARD MIDDLEWARE
// =====================================================

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

if (environment.nodeEnv !== "production") {
  app.use(morgan("dev"));
}

// =====================================================
// TRACKING MIDDLEWARE
// =====================================================

app.use(ipTrackingMiddleware);
app.use(requestHeadersMiddleware);

// =====================================================
// TEST ENDPOINTS
// =====================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Backend API is running.",
    tracking: {
      ipAddress: req.clientIp || null,
      browserInformation: req.browserInformation || null,
    },
  });
});

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is healthy.",
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// ERROR MIDDLEWARE
// =====================================================

app.use(routeNotFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;

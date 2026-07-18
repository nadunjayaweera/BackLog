const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const environment = require("./config/environment");

const ipTrackingMiddleware = require("./middleware/ipTracking.middleware");

const requestHeadersMiddleware = require("./middleware/requestHeaders.middleware");

const routeNotFoundMiddleware = require("./middleware/routeNotFound.middleware");

const errorHandlerMiddleware = require("./middleware/errorHandler.middleware");

const trackingRoutes = require("./routes/tracking.routes");

const app = express();

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

app.use(express.json({ limit: "100kb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "100kb",
  }),
);

if (environment.nodeEnv !== "production") {
  app.use(morgan("dev"));
}

// Existing tracking middleware
app.use(ipTrackingMiddleware);
app.use(requestHeadersMiddleware);

// Serve the frontend collector page
app.use(express.static(path.join(__dirname, "../public")));

// Tracking API
app.use("/api/v1/tracking", trackingRoutes);

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

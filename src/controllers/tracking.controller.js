const { prepareBrowserTrackingData } = require("../services/tracking.service");

const collectBrowserProperties = (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Valid browser information is required.",
      });
    }

    const trackingData = prepareBrowserTrackingData({
      requestData: req.body,

      ipAddress: req.clientIp || req.ip || req.socket?.remoteAddress,

      userAgent: req.get("user-agent"),
    });

    console.log("\n============ BROWSER PROPERTY TRACKING ============");

    console.dir(trackingData, {
      depth: null,
      colors: true,
    });

    console.log("===================================================\n");

    return res.status(200).json({
      success: true,
      message: "Browser properties received successfully.",
      receivedAt: trackingData.serverReceivedAt,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  collectBrowserProperties,
};

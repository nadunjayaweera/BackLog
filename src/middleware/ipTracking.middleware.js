const environment = require("../config/environment");

const {
  getClientIp,
  getRequestPath,
  getRequestProtocol,
} = require("../utils/request.util");

const ipTrackingMiddleware = (req, res, next) => {
  if (!environment.enableIpTracking) {
    return next();
  }

  const clientIp = getClientIp(req);

  req.clientIp = clientIp;

  const ipInformation = {
    trackingType: "IP_ADDRESS",
    ipAddress: clientIp,

    proxyIpChain: Array.isArray(req.ips) ? req.ips : [],

    request: {
      method: req.method,
      path: getRequestPath(req),
      protocol: getRequestProtocol(req),
      hostname: req.hostname || null,
    },

    timestamp: new Date().toISOString(),
  };

  console.log("\n================ IP TRACKING ================");
  console.dir(ipInformation, {
    depth: null,
    colors: true,
  });
  console.log("=============================================\n");

  return next();
};

module.exports = ipTrackingMiddleware;

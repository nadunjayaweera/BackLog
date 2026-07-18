const environment = require("../config/environment");

const {
  getHeader,
  getClientIp,
  getRequestPath,
  getRequestProtocol,
} = require("../utils/request.util");

const { extractClientHints } = require("../utils/clientHints.util");

const requestHeadersMiddleware = (req, res, next) => {
  if (!environment.enableHeaderTracking) {
    return next();
  }

  /*
   * Request additional User-Agent Client Hints.
   *
   * Browsers may send these on the current request or on
   * later requests after receiving this response header.
   *
   * Some values require HTTPS and browser support.
   */
  res.setHeader(
    "Accept-CH",
    [
      "Sec-CH-UA",
      "Sec-CH-UA-Mobile",
      "Sec-CH-UA-Platform",
      "Sec-CH-UA-Platform-Version",
      "Sec-CH-UA-Arch",
      "Sec-CH-UA-Bitness",
      "Sec-CH-UA-Model",
      "Sec-CH-UA-Full-Version-List",
      "Sec-CH-UA-Form-Factors",
    ].join(", "),
  );

  const headerInformation = {
    trackingType: "REQUEST_HEADERS",

    request: {
      ipAddress: req.clientIp || getClientIp(req),
      method: req.method,
      path: getRequestPath(req),
      protocol: getRequestProtocol(req),
      hostname: req.hostname || null,
    },

    browser: {
      userAgent: getHeader(req, "user-agent"),
      clientHints: extractClientHints(req),
    },

    preferences: {
      language: getHeader(req, "accept-language"),
      encoding: getHeader(req, "accept-encoding"),
      acceptedContent: getHeader(req, "accept"),
      saveData: getHeader(req, "save-data"),
    },

    navigation: {
      origin: getHeader(req, "origin"),
      referrer: getHeader(req, "referer"),
      fetchSite: getHeader(req, "sec-fetch-site"),
      fetchMode: getHeader(req, "sec-fetch-mode"),
      fetchDestination: getHeader(req, "sec-fetch-dest"),
      fetchUser: getHeader(req, "sec-fetch-user"),
    },

    privacyPreferences: {
      doNotTrack: getHeader(req, "dnt"),
      globalPrivacyControl: getHeader(req, "sec-gpc"),
    },

    connection: {
      forwardedHost: getHeader(req, "x-forwarded-host"),
      forwardedProtocol: getHeader(req, "x-forwarded-proto"),
    },

    timestamp: new Date().toISOString(),
  };

  req.browserInformation = headerInformation.browser;

  console.log("\n============ HEADER / USER-AGENT TRACKING ============");

  console.dir(headerInformation, {
    depth: null,
    colors: true,
  });

  console.log("=======================================================\n");

  return next();
};

module.exports = requestHeadersMiddleware;

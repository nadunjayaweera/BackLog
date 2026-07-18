const MAX_ARRAY_LENGTH = 20;
const MAX_STRING_LENGTH = 500;

const cleanString = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim().slice(0, MAX_STRING_LENGTH);
};

const cleanNumber = (value) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const cleanBoolean = (value) => {
  return typeof value === "boolean" ? value : null;
};

const cleanStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.slice(0, MAX_ARRAY_LENGTH).map(cleanString).filter(Boolean);
};

// =====================================================
// BROWSER PROPERTY TRACKING
// =====================================================

const prepareBrowserTrackingData = ({ requestData, ipAddress, userAgent }) => {
  const screen = requestData?.screen || {};
  const language = requestData?.language || {};
  const timezone = requestData?.timezone || {};
  const hardware = requestData?.hardware || {};
  const touch = requestData?.touch || {};
  const connection = requestData?.connection || {};
  const capabilities = requestData?.capabilities || {};
  const documentInformation = requestData?.document || {};

  return {
    trackingType: "BROWSER_PROPERTIES",

    request: {
      ipAddress: cleanString(ipAddress),
      userAgent: cleanString(userAgent),
    },

    screen: {
      width: cleanNumber(screen.width),
      height: cleanNumber(screen.height),
      availableWidth: cleanNumber(screen.availableWidth),
      availableHeight: cleanNumber(screen.availableHeight),
      colorDepth: cleanNumber(screen.colorDepth),
      pixelDepth: cleanNumber(screen.pixelDepth),
      devicePixelRatio: cleanNumber(screen.devicePixelRatio),
      viewportWidth: cleanNumber(screen.viewportWidth),
      viewportHeight: cleanNumber(screen.viewportHeight),
      orientation: cleanString(screen.orientation),
      orientationAngle: cleanNumber(screen.orientationAngle),
    },

    language: {
      primaryLanguage: cleanString(language.primaryLanguage),
      languages: cleanStringArray(language.languages),
    },

    timezone: {
      timezone: cleanString(timezone.timezone),
      locale: cleanString(timezone.locale),
      calendar: cleanString(timezone.calendar),
      numberingSystem: cleanString(timezone.numberingSystem),
      utcOffsetMinutes: cleanNumber(timezone.utcOffsetMinutes),
    },

    hardware: {
      logicalProcessors: cleanNumber(hardware.logicalProcessors),
      deviceMemory: cleanNumber(hardware.deviceMemory),
      platform: cleanString(hardware.platform),
      mobile: cleanBoolean(hardware.mobile),
    },

    touch: {
      maxTouchPoints: cleanNumber(touch.maxTouchPoints),
      touchEventSupported: cleanBoolean(touch.touchEventSupported),
    },

    connection: {
      effectiveType: cleanString(connection.effectiveType),
      downlink: cleanNumber(connection.downlink),
      roundTripTime: cleanNumber(connection.roundTripTime),
      saveData: cleanBoolean(connection.saveData),
    },

    capabilities: {
      cookiesEnabled: cleanBoolean(capabilities.cookiesEnabled),
      localStorageAvailable: cleanBoolean(capabilities.localStorageAvailable),
      sessionStorageAvailable: cleanBoolean(
        capabilities.sessionStorageAvailable,
      ),
      indexedDbAvailable: cleanBoolean(capabilities.indexedDbAvailable),
      serviceWorkerSupported: cleanBoolean(capabilities.serviceWorkerSupported),
      webSocketSupported: cleanBoolean(capabilities.webSocketSupported),
      webWorkerSupported: cleanBoolean(capabilities.webWorkerSupported),
      pdfViewerEnabled: cleanBoolean(capabilities.pdfViewerEnabled),
      online: cleanBoolean(capabilities.online),
      doNotTrack: cleanString(capabilities.doNotTrack),
      globalPrivacyControl: cleanBoolean(capabilities.globalPrivacyControl),
    },

    document: {
      pageUrl: cleanString(documentInformation.pageUrl),
      pageTitle: cleanString(documentInformation.pageTitle),
      referrer: cleanString(documentInformation.referrer),
      visibilityState: cleanString(documentInformation.visibilityState),
    },

    clientCollectedAt: cleanString(requestData?.collectedAt),

    serverReceivedAt: new Date().toISOString(),
  };
};

// =====================================================
// CANVAS FINGERPRINT TRACKING
// =====================================================

const SHA256_PATTERN = /^[a-f0-9]{64}$/i;

const cleanSha256Hash = (value) => {
  const cleanedValue = cleanString(value);

  if (!cleanedValue || !SHA256_PATTERN.test(cleanedValue)) {
    return null;
  }

  return cleanedValue.toLowerCase();
};

const prepareCanvasTrackingData = ({ requestData, ipAddress, userAgent }) => {
  const canvas = requestData?.canvas || {};
  const rendering = requestData?.rendering || {};

  const canvasHash = cleanSha256Hash(requestData?.canvasHash);

  const pixelSampleHash = cleanSha256Hash(requestData?.pixelSampleHash);

  if (!canvasHash) {
    const error = new Error("A valid canvas SHA-256 hash is required.");

    error.statusCode = 400;

    throw error;
  }

  return {
    trackingType: "CANVAS_FINGERPRINT",

    request: {
      ipAddress: cleanString(ipAddress),
      userAgent: cleanString(userAgent),
    },

    fingerprint: {
      canvasHash,
      pixelSampleHash,
    },

    canvas: {
      width: cleanNumber(canvas.width),
      height: cleanNumber(canvas.height),
      dataUrlLength: cleanNumber(canvas.dataUrlLength),
    },

    rendering: {
      textBaseline: cleanString(rendering.textBaseline),
      direction: cleanString(rendering.direction),
      imageSmoothingEnabled: cleanBoolean(rendering.imageSmoothingEnabled),
      globalCompositeOperation: cleanString(rendering.globalCompositeOperation),
    },

    clientCollectedAt: cleanString(requestData?.collectedAt),

    serverReceivedAt: new Date().toISOString(),
  };
};

module.exports = {
  prepareBrowserTrackingData,
  prepareCanvasTrackingData,
};

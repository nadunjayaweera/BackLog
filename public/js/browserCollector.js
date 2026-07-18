const collectButton = document.getElementById("collectButton");
const resultElement = document.getElementById("result");

const checkStorageAvailability = (storageType) => {
  try {
    const storage = window[storageType];
    const testKey = "__browser_tracking_test__";

    storage.setItem(testKey, "1");
    storage.removeItem(testKey);

    return true;
  } catch (error) {
    return false;
  }
};

const getConnectionInformation = () => {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!connection) {
    return null;
  }

  return {
    effectiveType: connection.effectiveType || null,
    downlink: connection.downlink ?? null,
    roundTripTime: connection.rtt ?? null,
    saveData: connection.saveData ?? null,
  };
};

const getTouchInformation = () => {
  return {
    maxTouchPoints: navigator.maxTouchPoints || 0,

    touchEventSupported:
      "ontouchstart" in window || navigator.maxTouchPoints > 0,
  };
};

const getScreenInformation = () => {
  return {
    width: window.screen?.width || null,
    height: window.screen?.height || null,

    availableWidth: window.screen?.availWidth || null,
    availableHeight: window.screen?.availHeight || null,

    colorDepth: window.screen?.colorDepth || null,
    pixelDepth: window.screen?.pixelDepth || null,

    devicePixelRatio: window.devicePixelRatio || 1,

    viewportWidth: window.innerWidth || null,
    viewportHeight: window.innerHeight || null,

    orientation: window.screen?.orientation?.type || null,

    orientationAngle: window.screen?.orientation?.angle ?? null,
  };
};

const getLanguageInformation = () => {
  return {
    primaryLanguage: navigator.language || null,

    languages: Array.isArray(navigator.languages) ? navigator.languages : [],
  };
};

const getTimezoneInformation = () => {
  const resolvedOptions = Intl.DateTimeFormat().resolvedOptions();

  return {
    timezone: resolvedOptions.timeZone || null,

    locale: resolvedOptions.locale || null,

    calendar: resolvedOptions.calendar || null,

    numberingSystem: resolvedOptions.numberingSystem || null,

    utcOffsetMinutes: new Date().getTimezoneOffset(),
  };
};

const getHardwareInformation = () => {
  return {
    logicalProcessors: navigator.hardwareConcurrency || null,

    deviceMemory: navigator.deviceMemory || null,

    platform: navigator.userAgentData?.platform || navigator.platform || null,

    mobile: navigator.userAgentData?.mobile ?? null,
  };
};

const getBrowserCapabilities = () => {
  return {
    cookiesEnabled: navigator.cookieEnabled,

    localStorageAvailable: checkStorageAvailability("localStorage"),

    sessionStorageAvailable: checkStorageAvailability("sessionStorage"),

    indexedDbAvailable: typeof window.indexedDB !== "undefined",

    serviceWorkerSupported: "serviceWorker" in navigator,

    webSocketSupported: "WebSocket" in window,

    webWorkerSupported: "Worker" in window,

    pdfViewerEnabled: navigator.pdfViewerEnabled ?? null,

    online: navigator.onLine,

    doNotTrack: navigator.doNotTrack || window.doNotTrack || null,

    globalPrivacyControl: navigator.globalPrivacyControl ?? null,
  };
};

const collectBrowserInformation = () => {
  return {
    screen: getScreenInformation(),

    language: getLanguageInformation(),

    timezone: getTimezoneInformation(),

    hardware: getHardwareInformation(),

    touch: getTouchInformation(),

    connection: getConnectionInformation(),

    capabilities: getBrowserCapabilities(),

    document: {
      pageUrl: window.location.href,
      pageTitle: document.title || null,
      referrer: document.referrer || null,
      visibilityState: document.visibilityState || null,
    },

    collectedAt: new Date().toISOString(),
  };
};

const sendBrowserInformation = async () => {
  collectButton.disabled = true;
  resultElement.textContent = "Collecting information...";

  try {
    const browserInformation = collectBrowserInformation();

    const response = await fetch("/api/v1/tracking/browser-properties", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(browserInformation),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      throw new Error(
        responseBody.message || "Could not send browser information.",
      );
    }

    resultElement.textContent = JSON.stringify(
      {
        collectedInformation: browserInformation,
        serverResponse: responseBody,
      },
      null,
      2,
    );
  } catch (error) {
    console.error("Browser collection error:", error);

    resultElement.textContent = JSON.stringify(
      {
        success: false,
        message: error.message,
      },
      null,
      2,
    );
  } finally {
    collectButton.disabled = false;
  }
};

collectButton.addEventListener("click", sendBrowserInformation);

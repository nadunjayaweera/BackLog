const runAllButton = document.getElementById("runAllButton");

const progressContainer = document.getElementById("progressContainer");

const progressText = document.getElementById("progressText");

const progressPercentage = document.getElementById("progressPercentage");

const progressValue = document.getElementById("progressValue");

const statusMessage = document.getElementById("statusMessage");

const summarySection = document.getElementById("summarySection");

const summaryGrid = document.getElementById("summaryGrid");

const methodStatusList = document.getElementById("methodStatusList");

const combinedResultElement = document.getElementById("combinedResult");

const completeAnalysisResult = {
  startedAt: null,
  completedAt: null,
  durationMilliseconds: null,
  methods: {},
};

const methodConfiguration = {
  ip: {
    name: "IP Address",
    statusElementId: "ipStatus",
    resultElementId: "ipResult",
  },

  browser: {
    name: "Browser Properties",
    statusElementId: "browserStatus",
    resultElementId: "result",
  },

  canvas: {
    name: "Canvas Fingerprint",
    statusElementId: "canvasStatus",
    resultElementId: "canvasResult",
  },

  webgl: {
    name: "WebGL/GPU Fingerprint",
    statusElementId: "webglStatus",
    resultElementId: "webglResult",
  },

  audio: {
    name: "Audio Fingerprint",
    statusElementId: "audioStatus",
    resultElementId: "audioResult",
  },

  font: {
    name: "Font Fingerprint",
    statusElementId: "fontStatus",
    resultElementId: "fontResult",
  },
};

// =====================================================
// DISPLAY HELPERS
// =====================================================

const displayJson = (elementId, value) => {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.textContent = JSON.stringify(value, null, 2);
};

const setMethodStatus = (methodKey, status, label) => {
  const configuration = methodConfiguration[methodKey];

  if (!configuration) {
    return;
  }

  const statusElement = document.getElementById(configuration.statusElementId);

  if (!statusElement) {
    return;
  }

  statusElement.className = `status-badge ${status}`;

  statusElement.textContent = label || status;
};

const setProgress = (currentStep, totalSteps, message) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  progressText.textContent = `Step ${currentStep} of ${totalSteps}`;

  progressPercentage.textContent = `${percentage}%`;

  progressValue.style.width = `${percentage}%`;

  statusMessage.textContent = message;
};

const resetResults = () => {
  for (const methodKey of Object.keys(methodConfiguration)) {
    const configuration = methodConfiguration[methodKey];

    setMethodStatus(methodKey, "pending", "Pending");

    const resultElement = document.getElementById(
      configuration.resultElementId,
    );

    if (resultElement) {
      resultElement.textContent = "Not collected yet.";
    }
  }

  completeAnalysisResult.startedAt = null;
  completeAnalysisResult.completedAt = null;
  completeAnalysisResult.durationMilliseconds = null;

  completeAnalysisResult.methods = {};

  summaryGrid.innerHTML = "";
  methodStatusList.innerHTML = "";
  combinedResultElement.textContent = "";

  summarySection.classList.remove("active");

  progressValue.style.width = "0%";
  progressPercentage.textContent = "0%";
  progressText.textContent = "Preparing analysis...";

  statusMessage.textContent = "Waiting to start.";
};

// =====================================================
// BACKEND REQUEST
// =====================================================

const sendTrackingData = async (endpoint, data) => {
  const response = await fetch(endpoint, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  });

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(
      responseBody.message || `Request failed with status ${response.status}.`,
    );
  }

  return responseBody;
};

// =====================================================
// IP COLLECTION
// =====================================================

const collectIpInformation = async () => {
  const response = await fetch("/api/v1/tracking/client-ip", {
    method: "GET",

    headers: {
      Accept: "application/json",
    },
  });

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(
      responseBody.message || "Could not retrieve the client IP address.",
    );
  }

  return responseBody;
};

// =====================================================
// INDIVIDUAL METHOD RUNNER
// =====================================================

const executeMethod = async ({ methodKey, execute }) => {
  const configuration = methodConfiguration[methodKey];

  setMethodStatus(methodKey, "running", "Running");

  try {
    const result = await execute();

    completeAnalysisResult.methods[methodKey] = {
      success: true,
      name: configuration.name,
      result,
    };

    displayJson(configuration.resultElementId, result);

    setMethodStatus(methodKey, "success", "Success");

    return result;
  } catch (error) {
    const errorResult = {
      success: false,
      message: error?.message || "Unknown collection error.",
    };

    completeAnalysisResult.methods[methodKey] = {
      success: false,
      name: configuration.name,
      error: errorResult,
    };

    displayJson(configuration.resultElementId, errorResult);

    setMethodStatus(methodKey, "error", "Failed");

    return null;
  }
};

// =====================================================
// SUMMARY HELPERS
// =====================================================

const getNestedValue = (object, path, fallback = null) => {
  try {
    const value = path
      .split(".")
      .reduce((currentValue, key) => currentValue?.[key], object);

    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
};

const truncateHash = (value) => {
  if (typeof value !== "string" || value.length <= 20) {
    return value || "Unavailable";
  }

  return `${value.slice(0, 12)}...${value.slice(-8)}`;
};

const createSummaryItem = (label, value) => {
  const item = document.createElement("div");

  item.className = "summary-item";

  const labelElement = document.createElement("span");

  labelElement.className = "summary-label";

  labelElement.textContent = label;

  const valueElement = document.createElement("span");

  valueElement.className = "summary-value";

  valueElement.textContent =
    value === null || value === undefined || value === ""
      ? "Unavailable"
      : String(value);

  item.appendChild(labelElement);
  item.appendChild(valueElement);

  return item;
};

const renderSummary = () => {
  summaryGrid.innerHTML = "";
  methodStatusList.innerHTML = "";

  const ipData = completeAnalysisResult.methods.ip?.result;

  const browserData =
    completeAnalysisResult.methods.browser?.result?.collectedInformation;

  const canvasData =
    completeAnalysisResult.methods.canvas?.result?.collectedInformation;

  const webglData =
    completeAnalysisResult.methods.webgl?.result?.collectedInformation;

  const audioData =
    completeAnalysisResult.methods.audio?.result?.collectedInformation;

  const fontData =
    completeAnalysisResult.methods.font?.result?.collectedInformation;

  const summaryItems = [
    {
      label: "Client IP Address",

      value: ipData?.data?.ipAddress || ipData?.ipAddress || "Unavailable",
    },

    {
      label: "Forwarded IP",

      value: ipData?.data?.forwardedFor || "Not provided",
    },

    {
      label: "Browser Platform",

      value: getNestedValue(browserData, "hardware.platform", "Unavailable"),
    },

    {
      label: "Timezone",

      value: getNestedValue(browserData, "timezone.timezone", "Unavailable"),
    },

    {
      label: "Screen Resolution",

      value:
        browserData?.screen?.width && browserData?.screen?.height
          ? `${browserData.screen.width} × ${browserData.screen.height}`
          : "Unavailable",
    },

    {
      label: "Logical Processors",

      value: getNestedValue(
        browserData,
        "hardware.logicalProcessors",
        "Unavailable",
      ),
    },

    {
      label: "Device Memory",

      value: browserData?.hardware?.deviceMemory
        ? `${browserData.hardware.deviceMemory} GB`
        : "Unavailable",
    },

    {
      label: "Canvas Hash",

      value: truncateHash(canvasData?.canvasHash),
    },

    {
      label: "WebGL Hash",

      value: truncateHash(webglData?.fingerprintHash),
    },

    {
      label: "GPU Renderer",

      value:
        webglData?.renderer?.unmaskedRenderer ||
        webglData?.renderer?.standardRenderer ||
        "Unavailable",
    },

    {
      label: "Audio Hash",

      value: truncateHash(audioData?.fingerprintHash),
    },

    {
      label: "Font Hash",

      value: truncateHash(fontData?.fingerprintHash),
    },

    {
      label: "Detected Fonts",

      value: fontData?.detectedFontCount ?? "Unavailable",
    },

    {
      label: "Analysis Duration",

      value:
        completeAnalysisResult.durationMilliseconds !== null
          ? `${completeAnalysisResult.durationMilliseconds} ms`
          : "Unavailable",
    },
  ];

  for (const summaryItem of summaryItems) {
    summaryGrid.appendChild(
      createSummaryItem(summaryItem.label, summaryItem.value),
    );
  }

  for (const [methodKey, configuration] of Object.entries(
    methodConfiguration,
  )) {
    const methodResult = completeAnalysisResult.methods[methodKey];

    const statusItem = document.createElement("div");

    statusItem.className = "method-status-item";

    const methodName = document.createElement("span");

    methodName.textContent = configuration.name;

    const methodStatus = document.createElement("span");

    const succeeded = methodResult?.success === true;

    methodStatus.className = `status-badge ${succeeded ? "success" : "error"}`;

    methodStatus.textContent = succeeded ? "Success" : "Failed";

    statusItem.appendChild(methodName);
    statusItem.appendChild(methodStatus);

    methodStatusList.appendChild(statusItem);
  }

  combinedResultElement.textContent = JSON.stringify(
    completeAnalysisResult,
    null,
    2,
  );

  summarySection.classList.add("active");
};

// =====================================================
// COMPLETE COLLECTION
// =====================================================

const runCompleteAnalysis = async () => {
  resetResults();

  runAllButton.disabled = true;
  runAllButton.textContent = "Analysis Running...";

  progressContainer.classList.add("active");

  const startedTimestamp = Date.now();

  completeAnalysisResult.startedAt = new Date(startedTimestamp).toISOString();

  const totalSteps = 6;

  try {
    setProgress(1, totalSteps, "Retrieving IP address from the backend...");

    await executeMethod({
      methodKey: "ip",
      execute: collectIpInformation,
    });

    setProgress(2, totalSteps, "Collecting browser and device properties...");

    await executeMethod({
      methodKey: "browser",

      execute: async () => {
        const collectedInformation = collectBrowserInformation();

        const serverResponse = await sendTrackingData(
          "/api/v1/tracking/browser-properties",
          collectedInformation,
        );

        return {
          collectedInformation,
          serverResponse,
        };
      },
    });

    setProgress(3, totalSteps, "Generating canvas fingerprint...");

    await executeMethod({
      methodKey: "canvas",

      execute: async () => {
        const collectedInformation = await generateCanvasFingerprint();

        const serverResponse = await sendTrackingData(
          "/api/v1/tracking/canvas-fingerprint",
          collectedInformation,
        );

        return {
          collectedInformation,
          serverResponse,
        };
      },
    });

    setProgress(4, totalSteps, "Generating WebGL and GPU fingerprint...");

    await executeMethod({
      methodKey: "webgl",

      execute: async () => {
        const collectedInformation = await generateWebglFingerprint();

        const serverResponse = await sendTrackingData(
          "/api/v1/tracking/webgl-fingerprint",
          collectedInformation,
        );

        return {
          collectedInformation,
          serverResponse,
        };
      },
    });

    setProgress(5, totalSteps, "Generating offline audio fingerprint...");

    await executeMethod({
      methodKey: "audio",

      execute: async () => {
        const collectedInformation = await generateAudioFingerprint();

        const serverResponse = await sendTrackingData(
          "/api/v1/tracking/audio-fingerprint",
          collectedInformation,
        );

        return {
          collectedInformation,
          serverResponse,
        };
      },
    });

    setProgress(
      6,
      totalSteps,
      "Checking font availability and text measurements...",
    );

    await executeMethod({
      methodKey: "font",

      execute: async () => {
        const collectedInformation = await generateFontFingerprint();

        const serverResponse = await sendTrackingData(
          "/api/v1/tracking/font-fingerprint",
          collectedInformation,
        );

        return {
          collectedInformation,
          serverResponse,
        };
      },
    });
  } finally {
    const completedTimestamp = Date.now();

    completeAnalysisResult.completedAt = new Date(
      completedTimestamp,
    ).toISOString();

    completeAnalysisResult.durationMilliseconds =
      completedTimestamp - startedTimestamp;

    setProgress(totalSteps, totalSteps, "Analysis completed.");

    renderSummary();

    runAllButton.disabled = false;
    runAllButton.textContent = "Run Analysis Again";
  }
};

runAllButton.addEventListener("click", runCompleteAnalysis);

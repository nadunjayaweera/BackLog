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

// =====================================================
// WEBGL FINGERPRINT TRACKING
// =====================================================

const cleanNumberArray = (value, maximumLength = 20) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(0, maximumLength)
    .map(cleanNumber)
    .filter((item) => item !== null);
};

const cleanUnknownParameter = (value) => {
  if (typeof value === "string") {
    return cleanString(value);
  }

  if (typeof value === "number") {
    return cleanNumber(value);
  }

  if (typeof value === "boolean") {
    return cleanBoolean(value);
  }

  if (Array.isArray(value)) {
    return cleanNumberArray(value);
  }

  return null;
};

const cleanPrecisionInformation = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return {
    rangeMin: cleanNumber(value.rangeMin),
    rangeMax: cleanNumber(value.rangeMax),
    precision: cleanNumber(value.precision),
  };
};

const prepareWebglTrackingData = ({ requestData, ipAddress, userAgent }) => {
  const fingerprintHash = cleanSha256Hash(requestData?.fingerprintHash);

  const renderingHash = cleanSha256Hash(requestData?.renderingHash);

  if (!fingerprintHash || !renderingHash) {
    const error = new Error(
      "Valid WebGL fingerprint and rendering hashes are required.",
    );

    error.statusCode = 400;
    throw error;
  }

  const renderer = requestData?.renderer || {};

  const versionInformation = requestData?.versionInformation || {};

  const contextAttributes = requestData?.contextAttributes || {};

  const limits = requestData?.limits || {};

  const shaderPrecision = requestData?.shaderPrecision || {};

  const canvas = requestData?.canvas || {};

  const extensions = Array.isArray(requestData?.extensions)
    ? requestData.extensions
        .slice(0, 200)
        .map(cleanString)
        .filter(Boolean)
        .sort()
    : [];

  return {
    trackingType: "WEBGL_FINGERPRINT",

    request: {
      ipAddress: cleanString(ipAddress),
      userAgent: cleanString(userAgent),
    },

    fingerprint: {
      fingerprintHash,
      renderingHash,
    },

    renderer: {
      standardVendor: cleanString(renderer.standardVendor),

      standardRenderer: cleanString(renderer.standardRenderer),

      unmaskedVendor: cleanString(renderer.unmaskedVendor),

      unmaskedRenderer: cleanString(renderer.unmaskedRenderer),

      debugRendererExtensionAvailable: cleanBoolean(
        renderer.debugRendererExtensionAvailable,
      ),
    },

    versionInformation: {
      contextType: cleanString(versionInformation.contextType),

      version: cleanString(versionInformation.version),

      shadingLanguageVersion: cleanString(
        versionInformation.shadingLanguageVersion,
      ),
    },

    contextAttributes: {
      alpha: cleanBoolean(contextAttributes.alpha),

      antialias: cleanBoolean(contextAttributes.antialias),

      depth: cleanBoolean(contextAttributes.depth),

      failIfMajorPerformanceCaveat: cleanBoolean(
        contextAttributes.failIfMajorPerformanceCaveat,
      ),

      powerPreference: cleanString(contextAttributes.powerPreference),

      premultipliedAlpha: cleanBoolean(contextAttributes.premultipliedAlpha),

      preserveDrawingBuffer: cleanBoolean(
        contextAttributes.preserveDrawingBuffer,
      ),

      stencil: cleanBoolean(contextAttributes.stencil),

      desynchronized: cleanBoolean(contextAttributes.desynchronized),
    },

    limits: Object.fromEntries(
      Object.entries(limits)
        .slice(0, 50)
        .map(([key, value]) => [cleanString(key), cleanUnknownParameter(value)])
        .filter(([key]) => Boolean(key)),
    ),

    shaderPrecision: {
      vertexHighFloat: cleanPrecisionInformation(
        shaderPrecision.vertexHighFloat,
      ),

      vertexMediumFloat: cleanPrecisionInformation(
        shaderPrecision.vertexMediumFloat,
      ),

      vertexLowFloat: cleanPrecisionInformation(shaderPrecision.vertexLowFloat),

      fragmentHighFloat: cleanPrecisionInformation(
        shaderPrecision.fragmentHighFloat,
      ),

      fragmentMediumFloat: cleanPrecisionInformation(
        shaderPrecision.fragmentMediumFloat,
      ),

      fragmentLowFloat: cleanPrecisionInformation(
        shaderPrecision.fragmentLowFloat,
      ),

      vertexHighInt: cleanPrecisionInformation(shaderPrecision.vertexHighInt),

      fragmentHighInt: cleanPrecisionInformation(
        shaderPrecision.fragmentHighInt,
      ),
    },

    extensions,

    canvas: {
      width: cleanNumber(canvas.width),
      height: cleanNumber(canvas.height),

      drawingBufferWidth: cleanNumber(canvas.drawingBufferWidth),

      drawingBufferHeight: cleanNumber(canvas.drawingBufferHeight),
    },

    clientCollectedAt: cleanString(requestData?.collectedAt),

    serverReceivedAt: new Date().toISOString(),
  };
};

// =====================================================
// AUDIO FINGERPRINT TRACKING
// =====================================================

const cleanObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
};

const prepareAudioTrackingData = ({ requestData, ipAddress, userAgent }) => {
  const fingerprintHash = cleanSha256Hash(requestData?.fingerprintHash);

  const renderingHash = cleanSha256Hash(requestData?.renderingHash);

  if (!fingerprintHash || !renderingHash) {
    const error = new Error(
      "Valid audio fingerprint and rendering hashes are required.",
    );

    error.statusCode = 400;
    throw error;
  }

  const audioBuffer = cleanObject(requestData?.audioBuffer);

  const sampleRange = cleanObject(requestData?.sampleRange);

  const statistics = cleanObject(requestData?.statistics);

  const capabilities = cleanObject(requestData?.capabilities);

  const processingConfiguration = cleanObject(
    requestData?.processingConfiguration,
  );

  const oscillator = cleanObject(processingConfiguration.oscillator);

  const gain = cleanObject(processingConfiguration.gain);

  const filter = cleanObject(processingConfiguration.filter);

  const compressor = cleanObject(processingConfiguration.compressor);

  return {
    trackingType: "AUDIO_FINGERPRINT",

    request: {
      ipAddress: cleanString(ipAddress),
      userAgent: cleanString(userAgent),
    },

    fingerprint: {
      fingerprintHash,
      renderingHash,
    },

    audioBuffer: {
      duration: cleanNumber(audioBuffer.duration),

      length: cleanNumber(audioBuffer.length),

      numberOfChannels: cleanNumber(audioBuffer.numberOfChannels),

      sampleRate: cleanNumber(audioBuffer.sampleRate),
    },

    sampleRange: {
      start: cleanNumber(sampleRange.start),

      end: cleanNumber(sampleRange.end),

      sampleCount: cleanNumber(sampleRange.sampleCount),
    },

    statistics: {
      sampleCount: cleanNumber(statistics.sampleCount),

      minimum: cleanNumber(statistics.minimum),

      maximum: cleanNumber(statistics.maximum),

      mean: cleanNumber(statistics.mean),

      absoluteMean: cleanNumber(statistics.absoluteMean),

      rootMeanSquare: cleanNumber(statistics.rootMeanSquare),

      zeroCrossings: cleanNumber(statistics.zeroCrossings),
    },

    capabilities: {
      supported: cleanBoolean(capabilities.supported),

      sampleRate: cleanNumber(capabilities.sampleRate),

      baseLatency: cleanNumber(capabilities.baseLatency),

      outputLatency: cleanNumber(capabilities.outputLatency),

      state: cleanString(capabilities.state),

      destinationMaxChannelCount: cleanNumber(
        capabilities.destinationMaxChannelCount,
      ),

      error: cleanString(capabilities.error),
    },

    processingConfiguration: {
      sampleRate: cleanNumber(processingConfiguration.sampleRate),

      durationSeconds: cleanNumber(processingConfiguration.durationSeconds),

      channelCount: cleanNumber(processingConfiguration.channelCount),

      oscillator: {
        type: cleanString(oscillator.type),

        frequency: cleanNumber(oscillator.frequency),
      },

      gain: {
        value: cleanNumber(gain.value),
      },

      filter: {
        type: cleanString(filter.type),

        frequency: cleanNumber(filter.frequency),

        q: cleanNumber(filter.q),
      },

      compressor: {
        threshold: cleanNumber(compressor.threshold),

        knee: cleanNumber(compressor.knee),

        ratio: cleanNumber(compressor.ratio),

        attack: cleanNumber(compressor.attack),

        release: cleanNumber(compressor.release),

        reduction: cleanNumber(compressor.reduction),
      },
    },

    microphoneUsed: cleanBoolean(requestData?.microphoneUsed),

    audibleOutputUsed: cleanBoolean(requestData?.audibleOutputUsed),

    clientCollectedAt: cleanString(requestData?.collectedAt),

    serverReceivedAt: new Date().toISOString(),
  };
};

module.exports = {
  prepareBrowserTrackingData,
  prepareCanvasTrackingData,
  prepareWebglTrackingData,
  prepareAudioTrackingData,
};

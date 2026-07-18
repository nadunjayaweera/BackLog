const fontButton = document.getElementById("fontButton");
const fontResultElement = document.getElementById("fontResult");

// =====================================================
// CONFIGURATION
// =====================================================

const FONT_TEST_TEXT = "mmmmmmmmmmlli WWW 1234567890 😀 漢字";

const FONT_SIZE = "72px";

const BASE_FONTS = ["monospace", "sans-serif", "serif"];

/*
 * Keep this list limited and documented.
 * Do not scan hundreds or thousands of font names.
 */
const FONT_CANDIDATES = [
  "Arial",
  "Arial Black",
  "Calibri",
  "Cambria",
  "Candara",
  "Comic Sans MS",
  "Consolas",
  "Courier New",
  "Georgia",
  "Helvetica",
  "Impact",
  "Lucida Console",
  "Microsoft Sans Serif",
  "Segoe UI",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
  "Roboto",
  "Ubuntu",
  "Noto Sans",
  "Noto Serif",
  "DejaVu Sans",
  "Liberation Sans",
  "Apple Color Emoji",
  "Segoe UI Emoji",
];

// =====================================================
// HASHING
// =====================================================

const createFontSha256Hash = async (value) => {
  if (!window.crypto?.subtle) {
    throw new Error("Web Crypto API is unavailable. Use HTTPS or localhost.");
  }

  const encodedValue = new TextEncoder().encode(String(value));

  const hashBuffer = await window.crypto.subtle.digest("SHA-256", encodedValue);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

// =====================================================
// FONT NAME HANDLING
// =====================================================

const quoteFontName = (fontName) => {
  return `"${String(fontName).replaceAll('"', '\\"')}"`;
};

// =====================================================
// CSS FONT API CHECK
// =====================================================

const checkFontWithFontFaceSet = (fontName) => {
  if (!document.fonts?.check) {
    return null;
  }

  try {
    return document.fonts.check(
      `16px ${quoteFontName(fontName)}`,
      FONT_TEST_TEXT,
    );
  } catch (error) {
    return null;
  }
};

// =====================================================
// CANVAS TEXT MEASUREMENTS
// =====================================================

const createMeasurementContext = () => {
  const canvas = document.createElement("canvas");

  canvas.width = 2000;
  canvas.height = 300;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  context.textBaseline = "alphabetic";
  context.textAlign = "left";

  return context;
};

const normalizeMeasurement = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  /*
   * Reduce insignificant floating-point noise.
   */
  return Number(number.toFixed(4));
};

const measureTextMetrics = (context, fontDeclaration) => {
  context.font = fontDeclaration;

  const metrics = context.measureText(FONT_TEST_TEXT);

  return {
    width: normalizeMeasurement(metrics.width),

    actualBoundingBoxLeft: normalizeMeasurement(metrics.actualBoundingBoxLeft),

    actualBoundingBoxRight: normalizeMeasurement(
      metrics.actualBoundingBoxRight,
    ),

    actualBoundingBoxAscent: normalizeMeasurement(
      metrics.actualBoundingBoxAscent,
    ),

    actualBoundingBoxDescent: normalizeMeasurement(
      metrics.actualBoundingBoxDescent,
    ),

    fontBoundingBoxAscent: normalizeMeasurement(metrics.fontBoundingBoxAscent),

    fontBoundingBoxDescent: normalizeMeasurement(
      metrics.fontBoundingBoxDescent,
    ),
  };
};

// =====================================================
// BASELINE MEASUREMENTS
// =====================================================

const getBaseFontMeasurements = (context) => {
  return Object.fromEntries(
    BASE_FONTS.map((baseFont) => [
      baseFont,
      measureTextMetrics(context, `${FONT_SIZE} ${baseFont}`),
    ]),
  );
};

// =====================================================
// FALLBACK COMPARISON
// =====================================================

const measurementsDiffer = (firstMeasurement, secondMeasurement) => {
  const keys = [
    "width",
    "actualBoundingBoxLeft",
    "actualBoundingBoxRight",
    "actualBoundingBoxAscent",
    "actualBoundingBoxDescent",
  ];

  return keys.some((key) => {
    const firstValue = firstMeasurement[key];
    const secondValue = secondMeasurement[key];

    if (firstValue === null || secondValue === null) {
      return false;
    }

    return Math.abs(firstValue - secondValue) > 0.01;
  });
};

const detectFontUsingMeasurements = (
  context,
  fontName,
  baselineMeasurements,
) => {
  const fallbackResults = {};

  for (const baseFont of BASE_FONTS) {
    const fontDeclaration = `${FONT_SIZE} ${quoteFontName(fontName)}, ${baseFont}`;

    const candidateMeasurement = measureTextMetrics(context, fontDeclaration);

    const baseline = baselineMeasurements[baseFont];

    fallbackResults[baseFont] = {
      measurement: candidateMeasurement,

      differsFromFallback: measurementsDiffer(candidateMeasurement, baseline),
    };
  }

  const detected = Object.values(fallbackResults).some(
    (result) => result.differsFromFallback,
  );

  return {
    detected,
    fallbackResults,
  };
};

// =====================================================
// INDIVIDUAL FONT TEST
// =====================================================

const testFont = (context, fontName, baselineMeasurements) => {
  const fontFaceSetResult = checkFontWithFontFaceSet(fontName);

  const measurementResult = detectFontUsingMeasurements(
    context,
    fontName,
    baselineMeasurements,
  );

  /*
   * Canvas measurement comparison is the primary signal.
   * FontFaceSet.check() is retained as an additional signal.
   */
  const detected = measurementResult.detected || fontFaceSetResult === true;

  return {
    name: fontName,
    detected,

    fontFaceSetCheck: fontFaceSetResult,

    measurementDetected: measurementResult.detected,

    measurements: measurementResult.fallbackResults,
  };
};

// =====================================================
// GENERATE FINGERPRINT
// =====================================================

const generateFontFingerprint = async () => {
  /*
   * Wait for fonts already associated with the page.
   */
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch (error) {
      console.warn("Could not wait for document fonts:", error);
    }
  }

  const context = createMeasurementContext();

  const baselineMeasurements = getBaseFontMeasurements(context);

  const testedFonts = FONT_CANDIDATES.map((fontName) =>
    testFont(context, fontName, baselineMeasurements),
  );

  const detectedFonts = testedFonts
    .filter((font) => font.detected)
    .map((font) => font.name)
    .sort();

  /*
   * Include measurements in the hash source, but do not
   * send unnecessary canvas image data.
   */
  const fingerprintSource = {
    testText: FONT_TEST_TEXT,
    fontSize: FONT_SIZE,
    baseFonts: BASE_FONTS,
    baselineMeasurements,
    testedFonts,
  };

  const fingerprintHash = await createFontSha256Hash(
    JSON.stringify(fingerprintSource),
  );

  const detectedFontsHash = await createFontSha256Hash(
    JSON.stringify(detectedFonts),
  );

  return {
    fingerprintHash,
    detectedFontsHash,

    detectedFonts,
    detectedFontCount: detectedFonts.length,
    testedFontCount: testedFonts.length,

    fontFaceSet: {
      supported: Boolean(document.fonts),

      checkSupported: Boolean(document.fonts?.check),

      status: document.fonts?.status || null,
    },

    configuration: {
      fontSize: FONT_SIZE,
      testTextLength: FONT_TEST_TEXT.length,

      baseFonts: BASE_FONTS,
    },

    baselineMeasurements,
    testedFonts,

    collectedAt: new Date().toISOString(),
  };
};

// =====================================================
// SEND TO BACKEND
// =====================================================

const sendFontFingerprint = async () => {
  fontButton.disabled = true;

  fontResultElement.textContent = "Generating font fingerprint...";

  try {
    const fingerprint = await generateFontFingerprint();

    const response = await fetch("/api/v1/tracking/font-fingerprint", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(fingerprint),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      throw new Error(
        responseBody.message || "Could not send font fingerprint.",
      );
    }

    fontResultElement.textContent = JSON.stringify(
      {
        fingerprint,
        serverResponse: responseBody,
      },
      null,
      2,
    );
  } catch (error) {
    console.error("Font fingerprint error:", error);

    fontResultElement.textContent = JSON.stringify(
      {
        success: false,
        message: error.message,
      },
      null,
      2,
    );
  } finally {
    fontButton.disabled = false;
  }
};

fontButton.addEventListener("click", sendFontFingerprint);

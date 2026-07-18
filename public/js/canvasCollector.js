const canvasButton = document.getElementById("canvasButton");
const canvasResultElement = document.getElementById("canvasResult");

// =====================================================
// SHA-256 HASHING
// =====================================================

const createSha256Hash = async (value) => {
  if (!window.crypto?.subtle) {
    throw new Error("Web Crypto API is not supported in this browser.");
  }

  const encodedValue = new TextEncoder().encode(value);

  const hashBuffer = await window.crypto.subtle.digest("SHA-256", encodedValue);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

// =====================================================
// CREATE CANVAS
// =====================================================

const createFingerprintCanvas = () => {
  const canvas = document.createElement("canvas");

  canvas.width = 500;
  canvas.height = 220;

  canvas.style.display = "none";

  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    throw new Error("Canvas 2D rendering is not supported.");
  }

  return {
    canvas,
    context,
  };
};

// =====================================================
// DRAW FINGERPRINT CONTENT
// =====================================================

const drawFingerprintContent = (context) => {
  // Background
  context.fillStyle = "#f3f3f3";
  context.fillRect(0, 0, 500, 220);

  // Gradient
  const gradient = context.createLinearGradient(0, 0, 500, 0);

  gradient.addColorStop(0, "#ff0000");
  gradient.addColorStop(0.5, "#00ff00");
  gradient.addColorStop(1, "#0000ff");

  context.fillStyle = gradient;
  context.fillRect(10, 10, 480, 35);

  // First text line
  context.textBaseline = "alphabetic";
  context.font = "18px Arial";
  context.fillStyle = "#1a1a1a";

  context.fillText("Canvas fingerprint test 1234567890", 15, 80);

  // Font rendering test
  context.font = "21px 'Times New Roman'";
  context.fillStyle = "#6a0dad";

  context.fillText("AaBbCcDd MmWw @#%&", 15, 115);

  // Emoji rendering differences
  context.font = "28px Arial, 'Segoe UI Emoji', sans-serif";

  context.fillText("😀 🚀 🌍 🧪 ⚙️", 15, 155);

  // Semi-transparent shapes
  context.globalAlpha = 0.75;

  context.fillStyle = "#ff6600";
  context.beginPath();
  context.arc(350, 115, 42, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#0077cc";
  context.fillRect(380, 85, 80, 65);

  // Restore opacity
  context.globalAlpha = 1;

  // Stroke test
  context.strokeStyle = "#111111";
  context.lineWidth = 1.5;

  context.beginPath();
  context.moveTo(15, 185);
  context.bezierCurveTo(130, 140, 250, 230, 470, 175);
  context.stroke();

  // Compositing test
  context.globalCompositeOperation = "multiply";

  context.fillStyle = "#ff00ff";
  context.fillRect(310, 165, 90, 35);

  context.fillStyle = "#00ffff";
  context.fillRect(355, 175, 90, 35);

  context.globalCompositeOperation = "source-over";
};

// =====================================================
// GET PIXEL SAMPLE
// =====================================================

const getPixelSample = (context) => {
  const imageData = context.getImageData(0, 0, 500, 220);

  const pixels = imageData.data;

  /*
   * Do not send the entire pixel array.
   * Create a small sample for diagnostic purposes.
   */
  const sample = [];

  const step = Math.max(4, Math.floor(pixels.length / 64));

  for (
    let index = 0;
    index < pixels.length && sample.length < 64;
    index += step
  ) {
    sample.push(pixels[index]);
  }

  return sample;
};

// =====================================================
// GENERATE CANVAS FINGERPRINT
// =====================================================

const generateCanvasFingerprint = async () => {
  const { canvas, context } = createFingerprintCanvas();

  drawFingerprintContent(context);

  const dataUrl = canvas.toDataURL("image/png");

  const pixelSample = getPixelSample(context);

  const canvasHash = await createSha256Hash(dataUrl);

  const pixelSampleHash = await createSha256Hash(JSON.stringify(pixelSample));

  return {
    canvasHash,
    pixelSampleHash,

    canvas: {
      width: canvas.width,
      height: canvas.height,
      dataUrlLength: dataUrl.length,
    },

    rendering: {
      textBaseline: context.textBaseline,
      direction: context.direction || null,
      imageSmoothingEnabled: context.imageSmoothingEnabled,
      globalCompositeOperation: context.globalCompositeOperation,
    },

    collectedAt: new Date().toISOString(),
  };
};

// =====================================================
// SEND TO BACKEND
// =====================================================

const sendCanvasFingerprint = async () => {
  canvasButton.disabled = true;

  canvasResultElement.textContent = "Generating canvas fingerprint...";

  try {
    const fingerprint = await generateCanvasFingerprint();

    const response = await fetch("/api/v1/tracking/canvas-fingerprint", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(fingerprint),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      throw new Error(
        responseBody.message || "Could not send canvas fingerprint.",
      );
    }

    canvasResultElement.textContent = JSON.stringify(
      {
        fingerprint,
        serverResponse: responseBody,
      },
      null,
      2,
    );
  } catch (error) {
    console.error("Canvas fingerprint error:", error);

    canvasResultElement.textContent = JSON.stringify(
      {
        success: false,
        message: error.message,
      },
      null,
      2,
    );
  } finally {
    canvasButton.disabled = false;
  }
};

canvasButton.addEventListener("click", sendCanvasFingerprint);

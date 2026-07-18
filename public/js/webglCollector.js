const webglButton = document.getElementById("webglButton");
const webglResultElement = document.getElementById("webglResult");

// =====================================================
// SHA-256
// =====================================================

const createWebglSha256Hash = async (value) => {
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
// WEBGL CONTEXT
// =====================================================

const createWebglContext = () => {
  const canvas = document.createElement("canvas");

  canvas.width = 400;
  canvas.height = 250;
  canvas.style.display = "none";

  const contextAttributes = {
    alpha: true,
    antialias: true,
    depth: true,
    stencil: true,
    preserveDrawingBuffer: true,
    powerPreference: "default",
  };

  const webgl2 = canvas.getContext("webgl2", contextAttributes);

  if (webgl2) {
    return {
      canvas,
      gl: webgl2,
      contextType: "webgl2",
    };
  }

  const webgl =
    canvas.getContext("webgl", contextAttributes) ||
    canvas.getContext("experimental-webgl", contextAttributes);

  if (!webgl) {
    throw new Error("WebGL is disabled or unsupported in this browser.");
  }

  return {
    canvas,
    gl: webgl,
    contextType: "webgl",
  };
};

// =====================================================
// SAFE WEBGL PARAMETER READER
// =====================================================

const readWebglParameter = (gl, parameter) => {
  try {
    const value = gl.getParameter(parameter);

    if (ArrayBuffer.isView(value)) {
      return Array.from(value);
    }

    if (
      typeof WebGLShaderPrecisionFormat !== "undefined" &&
      value instanceof WebGLShaderPrecisionFormat
    ) {
      return {
        rangeMin: value.rangeMin,
        rangeMax: value.rangeMax,
        precision: value.precision,
      };
    }

    return value ?? null;
  } catch (error) {
    return null;
  }
};

// =====================================================
// DEBUG RENDERER INFORMATION
// =====================================================

const getRendererInformation = (gl) => {
  const debugExtension = gl.getExtension("WEBGL_debug_renderer_info");

  return {
    standardVendor: readWebglParameter(gl, gl.VENDOR),

    standardRenderer: readWebglParameter(gl, gl.RENDERER),

    unmaskedVendor: debugExtension
      ? readWebglParameter(gl, debugExtension.UNMASKED_VENDOR_WEBGL)
      : null,

    unmaskedRenderer: debugExtension
      ? readWebglParameter(gl, debugExtension.UNMASKED_RENDERER_WEBGL)
      : null,

    debugRendererExtensionAvailable: Boolean(debugExtension),
  };
};

// =====================================================
// CONTEXT ATTRIBUTES
// =====================================================

const getWebglContextAttributes = (gl) => {
  const attributes = gl.getContextAttributes();

  if (!attributes) {
    return null;
  }

  return {
    alpha: attributes.alpha,
    antialias: attributes.antialias,
    depth: attributes.depth,
    failIfMajorPerformanceCaveat: attributes.failIfMajorPerformanceCaveat,
    powerPreference: attributes.powerPreference || null,
    premultipliedAlpha: attributes.premultipliedAlpha,
    preserveDrawingBuffer: attributes.preserveDrawingBuffer,
    stencil: attributes.stencil,
    desynchronized: attributes.desynchronized ?? null,
  };
};

// =====================================================
// GRAPHICS LIMITS
// =====================================================

const getWebglLimits = (gl) => {
  return {
    maxTextureSize: readWebglParameter(gl, gl.MAX_TEXTURE_SIZE),

    maxCubeMapTextureSize: readWebglParameter(gl, gl.MAX_CUBE_MAP_TEXTURE_SIZE),

    maxRenderbufferSize: readWebglParameter(gl, gl.MAX_RENDERBUFFER_SIZE),

    maxViewportDimensions: readWebglParameter(gl, gl.MAX_VIEWPORT_DIMS),

    maxVertexAttributes: readWebglParameter(gl, gl.MAX_VERTEX_ATTRIBS),

    maxVertexUniformVectors: readWebglParameter(
      gl,
      gl.MAX_VERTEX_UNIFORM_VECTORS,
    ),

    maxFragmentUniformVectors: readWebglParameter(
      gl,
      gl.MAX_FRAGMENT_UNIFORM_VECTORS,
    ),

    maxVaryingVectors: readWebglParameter(gl, gl.MAX_VARYING_VECTORS),

    maxCombinedTextureImageUnits: readWebglParameter(
      gl,
      gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS,
    ),

    maxVertexTextureImageUnits: readWebglParameter(
      gl,
      gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS,
    ),

    maxTextureImageUnits: readWebglParameter(gl, gl.MAX_TEXTURE_IMAGE_UNITS),

    aliasedLineWidthRange: readWebglParameter(gl, gl.ALIASED_LINE_WIDTH_RANGE),

    aliasedPointSizeRange: readWebglParameter(gl, gl.ALIASED_POINT_SIZE_RANGE),

    redBits: readWebglParameter(gl, gl.RED_BITS),

    greenBits: readWebglParameter(gl, gl.GREEN_BITS),

    blueBits: readWebglParameter(gl, gl.BLUE_BITS),

    alphaBits: readWebglParameter(gl, gl.ALPHA_BITS),

    depthBits: readWebglParameter(gl, gl.DEPTH_BITS),

    stencilBits: readWebglParameter(gl, gl.STENCIL_BITS),
  };
};

// =====================================================
// SHADER PRECISION
// =====================================================

const getShaderPrecision = (gl, shaderType, precisionType) => {
  try {
    const precision = gl.getShaderPrecisionFormat(shaderType, precisionType);

    if (!precision) {
      return null;
    }

    return {
      rangeMin: precision.rangeMin,
      rangeMax: precision.rangeMax,
      precision: precision.precision,
    };
  } catch (error) {
    return null;
  }
};

const getShaderPrecisionInformation = (gl) => {
  return {
    vertexHighFloat: getShaderPrecision(gl, gl.VERTEX_SHADER, gl.HIGH_FLOAT),

    vertexMediumFloat: getShaderPrecision(
      gl,
      gl.VERTEX_SHADER,
      gl.MEDIUM_FLOAT,
    ),

    vertexLowFloat: getShaderPrecision(gl, gl.VERTEX_SHADER, gl.LOW_FLOAT),

    fragmentHighFloat: getShaderPrecision(
      gl,
      gl.FRAGMENT_SHADER,
      gl.HIGH_FLOAT,
    ),

    fragmentMediumFloat: getShaderPrecision(
      gl,
      gl.FRAGMENT_SHADER,
      gl.MEDIUM_FLOAT,
    ),

    fragmentLowFloat: getShaderPrecision(gl, gl.FRAGMENT_SHADER, gl.LOW_FLOAT),

    vertexHighInt: getShaderPrecision(gl, gl.VERTEX_SHADER, gl.HIGH_INT),

    fragmentHighInt: getShaderPrecision(gl, gl.FRAGMENT_SHADER, gl.HIGH_INT),
  };
};

// =====================================================
// SHADER HELPERS
// =====================================================

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error("Could not create WebGL shader.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!compiled) {
    const shaderError =
      gl.getShaderInfoLog(shader) || "Unknown shader compilation error.";

    gl.deleteShader(shader);

    throw new Error(shaderError);
  }

  return shader;
};

const createWebglProgram = (gl, vertexShaderSource, fragmentShaderSource) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );

  const program = gl.createProgram();

  if (!program) {
    throw new Error("Could not create WebGL program.");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!linked) {
    const programError =
      gl.getProgramInfoLog(program) || "Unknown WebGL program link error.";

    gl.deleteProgram(program);

    throw new Error(programError);
  }

  return program;
};

// =====================================================
// RENDER TEST SCENE
// =====================================================

const renderWebglScene = (gl) => {
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec3 a_color;

    varying vec3 v_color;

    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_color = a_color;
    }
  `;

  const fragmentShaderSource = `
    precision highp float;

    varying vec3 v_color;

    void main() {
      float wave = sin(gl_FragCoord.x * 0.07)
                 * cos(gl_FragCoord.y * 0.05);

      vec3 adjustedColor = v_color +
        vec3(wave * 0.08, wave * 0.04, wave * 0.02);

      gl_FragColor = vec4(adjustedColor, 1.0);
    }
  `;

  const program = createWebglProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
  );

  gl.useProgram(program);

  const vertices = new Float32Array([
    // x, y, r, g, b
    -0.85, -0.75, 1.0, 0.15, 0.1, 0.8, -0.65, 0.1, 1.0, 0.2, 0.05, 0.85, 0.1,
    0.25, 1.0,
  ]);

  const buffer = gl.createBuffer();

  if (!buffer) {
    gl.deleteProgram(program);

    throw new Error("Could not create WebGL buffer.");
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const stride = 5 * Float32Array.BYTES_PER_ELEMENT;

  const positionLocation = gl.getAttribLocation(program, "a_position");

  const colorLocation = gl.getAttribLocation(program, "a_color");

  gl.enableVertexAttribArray(positionLocation);

  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);

  gl.enableVertexAttribArray(colorLocation);

  gl.vertexAttribPointer(
    colorLocation,
    3,
    gl.FLOAT,
    false,
    stride,
    2 * Float32Array.BYTES_PER_ELEMENT,
  );

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.clearColor(0.12, 0.16, 0.21, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.finish();

  gl.deleteBuffer(buffer);
  gl.deleteProgram(program);
};

// =====================================================
// PIXEL HASH
// =====================================================

const getWebglPixelHash = async (gl) => {
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;

  const pixels = new Uint8Array(width * height * 4);

  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  /*
   * Hash the raw pixel bytes directly.
   * The pixel array itself is not sent to the backend.
   */
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", pixels);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

// =====================================================
// COMBINED FINGERPRINT
// =====================================================

const generateWebglFingerprint = async () => {
  const { canvas, gl, contextType } = createWebglContext();

  const renderer = getRendererInformation(gl);

  const versionInformation = {
    contextType,

    version: readWebglParameter(gl, gl.VERSION),

    shadingLanguageVersion: readWebglParameter(gl, gl.SHADING_LANGUAGE_VERSION),
  };

  const contextAttributes = getWebglContextAttributes(gl);

  const limits = getWebglLimits(gl);

  const shaderPrecision = getShaderPrecisionInformation(gl);

  const extensions = (gl.getSupportedExtensions() || []).slice().sort();

  renderWebglScene(gl);

  const renderingHash = await getWebglPixelHash(gl);

  const fingerprintSource = {
    renderer,
    versionInformation,
    contextAttributes,
    limits,
    shaderPrecision,
    extensions,
    renderingHash,
  };

  const fingerprintHash = await createWebglSha256Hash(
    JSON.stringify(fingerprintSource),
  );

  return {
    fingerprintHash,
    renderingHash,

    renderer,
    versionInformation,
    contextAttributes,
    limits,
    shaderPrecision,
    extensions,

    canvas: {
      width: canvas.width,
      height: canvas.height,
      drawingBufferWidth: gl.drawingBufferWidth,
      drawingBufferHeight: gl.drawingBufferHeight,
    },

    collectedAt: new Date().toISOString(),
  };
};

// =====================================================
// SEND TO BACKEND
// =====================================================

const sendWebglFingerprint = async () => {
  webglButton.disabled = true;

  webglResultElement.textContent = "Generating WebGL fingerprint...";

  try {
    const fingerprint = await generateWebglFingerprint();

    const response = await fetch("/api/v1/tracking/webgl-fingerprint", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(fingerprint),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      throw new Error(
        responseBody.message || "Could not send WebGL fingerprint.",
      );
    }

    webglResultElement.textContent = JSON.stringify(
      {
        fingerprint,
        serverResponse: responseBody,
      },
      null,
      2,
    );
  } catch (error) {
    console.error("WebGL fingerprint error:", error);

    webglResultElement.textContent = JSON.stringify(
      {
        success: false,
        message: error.message,
      },
      null,
      2,
    );
  } finally {
    webglButton.disabled = false;
  }
};

webglButton.addEventListener("click", sendWebglFingerprint);

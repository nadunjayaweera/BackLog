const audioButton = document.getElementById("audioButton");
const audioResultElement = document.getElementById("audioResult");

// =====================================================
// SHA-256 HELPERS
// =====================================================

const hashArrayBuffer = async (arrayBuffer) => {
  if (!window.crypto?.subtle) {
    throw new Error("Web Crypto API is unavailable. Use HTTPS or localhost.");
  }

  const hashBuffer = await window.crypto.subtle.digest("SHA-256", arrayBuffer);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const hashString = async (value) => {
  const encodedValue = new TextEncoder().encode(String(value));

  return hashArrayBuffer(encodedValue);
};

// =====================================================
// AUDIO SUPPORT
// =====================================================

const getOfflineAudioContextConstructor = () => {
  return window.OfflineAudioContext || window.webkitOfflineAudioContext || null;
};

const getRealtimeAudioContextConstructor = () => {
  return window.AudioContext || window.webkitAudioContext || null;
};

// =====================================================
// AUDIO CAPABILITIES
// =====================================================

const collectAudioCapabilities = async () => {
  const AudioContextConstructor = getRealtimeAudioContextConstructor();

  if (!AudioContextConstructor) {
    return {
      supported: false,
      sampleRate: null,
      baseLatency: null,
      outputLatency: null,
      state: null,
      destinationMaxChannelCount: null,
    };
  }

  let audioContext = null;

  try {
    audioContext = new AudioContextConstructor();

    const capabilities = {
      supported: true,

      sampleRate: Number(audioContext.sampleRate) || null,

      baseLatency: Number.isFinite(audioContext.baseLatency)
        ? audioContext.baseLatency
        : null,

      outputLatency: Number.isFinite(audioContext.outputLatency)
        ? audioContext.outputLatency
        : null,

      state: audioContext.state || null,

      destinationMaxChannelCount:
        Number(audioContext.destination?.maxChannelCount) || null,
    };

    await audioContext.close();

    return capabilities;
  } catch (error) {
    if (audioContext && audioContext.state !== "closed") {
      try {
        await audioContext.close();
      } catch (closeError) {
        console.error("Could not close AudioContext:", closeError);
      }
    }

    return {
      supported: true,
      error: error.message,
      sampleRate: null,
      baseLatency: null,
      outputLatency: null,
      state: null,
      destinationMaxChannelCount: null,
    };
  }
};

// =====================================================
// CREATE AUDIO PROCESSING GRAPH
// =====================================================

const createAudioGraph = (offlineContext) => {
  /*
   * Oscillator generates a constant waveform.
   */
  const oscillator = offlineContext.createOscillator();

  oscillator.type = "triangle";
  oscillator.frequency.value = 10000;

  /*
   * Gain controls the signal level.
   */
  const gainNode = offlineContext.createGain();
  gainNode.gain.value = 0.5;

  /*
   * Biquad filter introduces another browser-dependent
   * signal-processing operation.
   */
  const filter = offlineContext.createBiquadFilter();

  filter.type = "lowpass";
  filter.frequency.value = 5000;
  filter.Q.value = 1.25;

  /*
   * Compressor adds nonlinear signal processing.
   */
  const compressor = offlineContext.createDynamicsCompressor();

  compressor.threshold.value = -50;
  compressor.knee.value = 40;
  compressor.ratio.value = 12;
  compressor.attack.value = 0;
  compressor.release.value = 0.25;

  oscillator.connect(gainNode);
  gainNode.connect(filter);
  filter.connect(compressor);
  compressor.connect(offlineContext.destination);

  oscillator.start(0);

  return {
    oscillator,
    gainNode,
    filter,
    compressor,
  };
};

// =====================================================
// EXTRACT SAMPLE STATISTICS
// =====================================================

const calculateAudioStatistics = (samples) => {
  let minimum = Infinity;
  let maximum = -Infinity;
  let sum = 0;
  let absoluteSum = 0;
  let squareSum = 0;
  let zeroCrossings = 0;

  for (let index = 0; index < samples.length; index += 1) {
    const value = samples[index];

    minimum = Math.min(minimum, value);
    maximum = Math.max(maximum, value);

    sum += value;
    absoluteSum += Math.abs(value);
    squareSum += value * value;

    if (index > 0) {
      const previousValue = samples[index - 1];

      if (
        (previousValue < 0 && value >= 0) ||
        (previousValue >= 0 && value < 0)
      ) {
        zeroCrossings += 1;
      }
    }
  }

  const sampleCount = samples.length;

  return {
    sampleCount,

    minimum: Number.isFinite(minimum) ? minimum : null,

    maximum: Number.isFinite(maximum) ? maximum : null,

    mean: sampleCount > 0 ? sum / sampleCount : null,

    absoluteMean: sampleCount > 0 ? absoluteSum / sampleCount : null,

    rootMeanSquare: sampleCount > 0 ? Math.sqrt(squareSum / sampleCount) : null,

    zeroCrossings,
  };
};

// =====================================================
// NORMALIZE FLOAT AUDIO DATA
// =====================================================

const convertFloatSamplesToInt16 = (samples) => {
  const int16Samples = new Int16Array(samples.length);

  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));

    int16Samples[index] = sample < 0 ? sample * 32768 : sample * 32767;
  }

  return int16Samples;
};

// =====================================================
// GENERATE AUDIO FINGERPRINT
// =====================================================

const generateAudioFingerprint = async () => {
  const OfflineAudioContextConstructor = getOfflineAudioContextConstructor();

  if (!OfflineAudioContextConstructor) {
    throw new Error("OfflineAudioContext is unsupported in this browser.");
  }

  const sampleRate = 44100;
  const durationSeconds = 1;
  const channelCount = 1;

  const frameCount = sampleRate * durationSeconds;

  const offlineContext = new OfflineAudioContextConstructor(
    channelCount,
    frameCount,
    sampleRate,
  );

  const audioGraph = createAudioGraph(offlineContext);

  /*
   * startRendering() renders the configured graph to
   * an AudioBuffer rather than playing it.
   */
  const renderedBuffer = await offlineContext.startRendering();

  const channelData = renderedBuffer.getChannelData(0);

  /*
   * Skip the initial part of the signal to reduce
   * startup/transient inconsistencies.
   */
  const sampleStart = 4500;
  const sampleEnd = Math.min(channelData.length, 25000);

  const selectedSamples = channelData.slice(sampleStart, sampleEnd);

  const normalizedSamples = convertFloatSamplesToInt16(selectedSamples);

  const renderingHash = await hashArrayBuffer(normalizedSamples.buffer);

  const statistics = calculateAudioStatistics(selectedSamples);

  const capabilities = await collectAudioCapabilities();

  const processingConfiguration = {
    sampleRate,
    durationSeconds,
    channelCount,

    oscillator: {
      type: audioGraph.oscillator.type,
      frequency: audioGraph.oscillator.frequency.value,
    },

    gain: {
      value: audioGraph.gainNode.gain.value,
    },

    filter: {
      type: audioGraph.filter.type,
      frequency: audioGraph.filter.frequency.value,
      q: audioGraph.filter.Q.value,
    },

    compressor: {
      threshold: audioGraph.compressor.threshold.value,

      knee: audioGraph.compressor.knee.value,

      ratio: audioGraph.compressor.ratio.value,

      attack: audioGraph.compressor.attack.value,

      release: audioGraph.compressor.release.value,

      reduction: Number.isFinite(audioGraph.compressor.reduction)
        ? audioGraph.compressor.reduction
        : null,
    },
  };

  const fingerprintSource = {
    renderingHash,
    statistics,
    capabilities,
    processingConfiguration,
  };

  const fingerprintHash = await hashString(JSON.stringify(fingerprintSource));

  return {
    fingerprintHash,
    renderingHash,

    audioBuffer: {
      duration: renderedBuffer.duration,
      length: renderedBuffer.length,
      numberOfChannels: renderedBuffer.numberOfChannels,
      sampleRate: renderedBuffer.sampleRate,
    },

    sampleRange: {
      start: sampleStart,
      end: sampleEnd,
      sampleCount: selectedSamples.length,
    },

    statistics,
    capabilities,
    processingConfiguration,

    microphoneUsed: false,
    audibleOutputUsed: false,

    collectedAt: new Date().toISOString(),
  };
};

// =====================================================
// SEND TO BACKEND
// =====================================================

const sendAudioFingerprint = async () => {
  audioButton.disabled = true;

  audioResultElement.textContent = "Generating audio fingerprint...";

  try {
    const fingerprint = await generateAudioFingerprint();

    const response = await fetch("/api/v1/tracking/audio-fingerprint", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(fingerprint),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      throw new Error(
        responseBody.message || "Could not send audio fingerprint.",
      );
    }

    audioResultElement.textContent = JSON.stringify(
      {
        fingerprint,
        serverResponse: responseBody,
      },
      null,
      2,
    );
  } catch (error) {
    console.error("Audio fingerprint error:", error);

    audioResultElement.textContent = JSON.stringify(
      {
        success: false,
        message: error.message,
      },
      null,
      2,
    );
  } finally {
    audioButton.disabled = false;
  }
};

audioButton.addEventListener("click", sendAudioFingerprint);

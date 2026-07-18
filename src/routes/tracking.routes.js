const express = require("express");

const {
  getClientIpInformation,
  collectBrowserProperties,
  collectCanvasFingerprint,
  collectWebglFingerprint,
  collectAudioFingerprint,
  collectFontFingerprint,
} = require("../controllers/tracking.controller");

const router = express.Router();

router.get("/client-ip", getClientIpInformation);

router.post("/browser-properties", collectBrowserProperties);

router.post("/canvas-fingerprint", collectCanvasFingerprint);

router.post("/webgl-fingerprint", collectWebglFingerprint);

router.post("/audio-fingerprint", collectAudioFingerprint);

router.post("/font-fingerprint", collectFontFingerprint);

module.exports = router;

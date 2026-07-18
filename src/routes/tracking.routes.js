const express = require("express");

const {
  collectBrowserProperties,
  collectCanvasFingerprint,
  collectWebglFingerprint,
} = require("../controllers/tracking.controller");

const router = express.Router();

router.post("/browser-properties", collectBrowserProperties);

router.post("/canvas-fingerprint", collectCanvasFingerprint);

router.post("/webgl-fingerprint", collectWebglFingerprint);

module.exports = router;

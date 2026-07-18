const express = require("express");

const {
  collectBrowserProperties,
  collectCanvasFingerprint,
} = require("../controllers/tracking.controller");

const router = express.Router();

router.post("/browser-properties", collectBrowserProperties);

router.post("/canvas-fingerprint", collectCanvasFingerprint);

module.exports = router;

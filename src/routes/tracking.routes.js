const express = require("express");

const {
  collectBrowserProperties,
} = require("../controllers/tracking.controller");

const router = express.Router();

router.post("/browser-properties", collectBrowserProperties);

module.exports = router;

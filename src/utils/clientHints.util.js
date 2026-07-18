const { getHeader } = require("./request.util");

const removeHeaderQuotes = (value) => {
  if (!value) {
    return null;
  }

  return String(value).replace(/^"(.*)"$/, "$1");
};

const parseBooleanClientHint = (value) => {
  if (!value) {
    return null;
  }

  const normalizedValue = String(value).trim().toLowerCase();

  if (normalizedValue === "?1") {
    return true;
  }

  if (normalizedValue === "?0") {
    return false;
  }

  return null;
};

const extractClientHints = (req) => {
  return {
    brands: getHeader(req, "sec-ch-ua"),

    mobile: parseBooleanClientHint(getHeader(req, "sec-ch-ua-mobile")),

    platform: removeHeaderQuotes(getHeader(req, "sec-ch-ua-platform")),

    platformVersion: removeHeaderQuotes(
      getHeader(req, "sec-ch-ua-platform-version"),
    ),

    architecture: removeHeaderQuotes(getHeader(req, "sec-ch-ua-arch")),

    bitness: removeHeaderQuotes(getHeader(req, "sec-ch-ua-bitness")),

    model: removeHeaderQuotes(getHeader(req, "sec-ch-ua-model")),

    fullVersionList: getHeader(req, "sec-ch-ua-full-version-list"),

    formFactors: getHeader(req, "sec-ch-ua-form-factors"),
  };
};

module.exports = {
  extractClientHints,
};

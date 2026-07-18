const getBooleanEnvironmentValue = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  return String(value).toLowerCase() === "true";
};

const environment = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),

  trustProxy: getBooleanEnvironmentValue(process.env.TRUST_PROXY, false),

  enableIpTracking: getBooleanEnvironmentValue(
    process.env.ENABLE_IP_TRACKING,
    true,
  ),

  enableHeaderTracking: getBooleanEnvironmentValue(
    process.env.ENABLE_HEADER_TRACKING,
    true,
  ),
};

module.exports = environment;

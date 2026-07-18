const normalizeIpAddress = (ipAddress) => {
  if (!ipAddress) {
    return null;
  }

  let normalizedIp = String(ipAddress).trim();

  if (normalizedIp.startsWith("::ffff:")) {
    normalizedIp = normalizedIp.substring(7);
  }

  if (normalizedIp === "::1") {
    normalizedIp = "127.0.0.1";
  }

  return normalizedIp;
};

const getClientIp = (req) => {
  return normalizeIpAddress(
    req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress,
  );
};

const getHeader = (req, headerName) => {
  const value = req.get(headerName);

  if (value === undefined || value === null || value === "") {
    return null;
  }

  return String(value).trim();
};

const getRequestProtocol = (req) => {
  return req.protocol || null;
};

const getRequestPath = (req) => {
  return req.originalUrl || req.url || null;
};

module.exports = {
  normalizeIpAddress,
  getClientIp,
  getHeader,
  getRequestProtocol,
  getRequestPath,
};

const DEFAULT_CLIENT_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

const normalizeOrigin = (value) => {
  const origin = value.trim().replace(/\/$/, '');
  if (!origin) return null;

  // Environment dashboards are often filled with a hostname only. Browser
  // requests always send a full origin, so make that configuration unambiguous.
  return /^https?:\/\//i.test(origin) ? origin : `https://${origin}`;
};

const allowedOrigins = [
  ...(process.env.CLIENT_URL || '').split(',').map(normalizeOrigin).filter(Boolean),
  ...DEFAULT_CLIENT_ORIGINS
];

module.exports = [...new Set(allowedOrigins)];

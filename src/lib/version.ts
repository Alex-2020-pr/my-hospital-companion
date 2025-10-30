// Auto-generated build version
// Update this timestamp whenever deploying a new version
// IMPORTANTE: Usar sempre horário de Brasília (America/Sao_Paulo)
export const BUILD_VERSION = {
  date: '2025-01-30',
  time: '17:45',
  timezone: 'America/Sao_Paulo (Brasília)',
  version: '1.0.0'
};

export const getFormattedVersion = () => {
  return `v${BUILD_VERSION.version} (${BUILD_VERSION.date} ${BUILD_VERSION.time})`;
};

export const getShortVersion = () => {
  return `v${BUILD_VERSION.version}`;
};

import { formatBrazilDate, nowInBrazil } from './timezone';

// Auto-generated build version
// IMPORTANTE: Usar sempre horário de Brasília (America/Sao_Paulo)
export const BUILD_VERSION = {
  date: '2025-02-04',
  time: '02:30',
  timezone: 'America/Sao_Paulo (Brasília)',
  version: '1.0.1'
};

export const getFormattedVersion = () => {
  return `v${BUILD_VERSION.version} (${BUILD_VERSION.date} ${BUILD_VERSION.time} BRT)`;
};

export const getShortVersion = () => {
  return `v${BUILD_VERSION.version}`;
};

// Retorna data/hora atual formatada de Brasília
export const getCurrentBrazilDateTime = () => {
  return formatBrazilDate(nowInBrazil());
};

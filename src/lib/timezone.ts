/**
 * Biblioteca de timezone para Brasília (America/Sao_Paulo)
 * Todas as funções de data/hora do sistema devem usar estas utilities
 */

export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

/**
 * Retorna a data/hora atual no timezone de Brasília
 */
export const nowInBrazil = (): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }));
};

/**
 * Converte uma data para o timezone de Brasília
 */
export const toBrazilTime = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }));
};

/**
 * Formata uma data no formato brasileiro com timezone de Brasília
 * @param date - Data a ser formatada
 * @param options - Opções de formatação (padrão: data e hora completas)
 */
export const formatBrazilDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: BRAZIL_TIMEZONE
  }
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR', options);
};

/**
 * Formata apenas a data (sem hora) no formato brasileiro
 */
export const formatBrazilDateOnly = (date: Date | string): string => {
  return formatBrazilDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: BRAZIL_TIMEZONE
  });
};

/**
 * Formata apenas a hora no formato brasileiro
 */
export const formatBrazilTimeOnly = (date: Date | string): string => {
  return formatBrazilDate(date, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: BRAZIL_TIMEZONE
  });
};

/**
 * Retorna uma string ISO no timezone de Brasília
 * Útil para enviar datas para APIs ou banco de dados
 */
export const toISOStringBrazil = (date?: Date | string): string => {
  const d = date ? (typeof date === 'string' ? new Date(date) : date) : nowInBrazil();
  const brazilDate = toBrazilTime(d);
  return brazilDate.toISOString();
};

/**
 * Retorna apenas a parte da data no formato YYYY-MM-DD no timezone de Brasília
 */
export const toDateStringBrazil = (date?: Date | string): string => {
  const d = date ? (typeof date === 'string' ? new Date(date) : date) : nowInBrazil();
  const brazilDate = toBrazilTime(d);
  return brazilDate.toISOString().split('T')[0];
};

/**
 * Compara se uma data é hoje (no timezone de Brasília)
 */
export const isToday = (date: Date | string): boolean => {
  const today = toDateStringBrazil();
  const compareDate = toDateStringBrazil(date);
  return today === compareDate;
};

/**
 * Retorna o timestamp atual no timezone de Brasília
 */
export const nowTimestampBrazil = (): number => {
  return nowInBrazil().getTime();
};

/**
 * Calcula diferença em dias entre duas datas no timezone de Brasília
 */
export const daysDifferenceBrazil = (date1: Date | string, date2: Date | string): number => {
  const d1 = toBrazilTime(date1);
  const d2 = toBrazilTime(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Adiciona dias a uma data no timezone de Brasília
 */
export const addDaysBrazil = (date: Date | string, days: number): Date => {
  const d = toBrazilTime(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Subtrai dias de uma data no timezone de Brasília
 */
export const subDaysBrazil = (date: Date | string, days: number): Date => {
  return addDaysBrazil(date, -days);
};

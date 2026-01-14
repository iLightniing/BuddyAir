/**
 * Tente de parser une chaîne de date en objet Date.
 * Gère les formats YYYY-MM-DD, DD/MM/YYYY, DD.MM.YYYY.
 */
export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  // Format YYYY-MM-DD (ISO-like)
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }

  // Format DD/MM/YYYY ou DD.MM.YYYY
  const match = dateStr.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    // new Date() est plus fiable avec le format YYYY-MM-DD
    const d = new Date(`${year}-${month}-${day}T12:00:00Z`); // Utilise UTC pour éviter les pbs de timezone
    if (!isNaN(d.getTime()) && d.getUTCDate() === parseInt(day || '')) {
      return d;
    }
  }
  
  // Fallback pour les formats natifs (ex: MM/DD/YYYY)
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  return null;
}

/**
 * Tente de parser une chaîne de montant en nombre.
 * Gère les symboles monétaires, les espaces et les virgules décimales.
 */
export const parseAmount = (amountStr: string): number | null => {
    if (!amountStr) return null;
    // Enlève les symboles monétaires, les espaces, et remplace la virgule par un point.
    const cleanedStr = amountStr
      .replace(/[€$£]/g, '')
      .replace(/\s/g, '')
      .replace(',', '.');
    
    const amount = parseFloat(cleanedStr);
    return isNaN(amount) ? null : amount;
}
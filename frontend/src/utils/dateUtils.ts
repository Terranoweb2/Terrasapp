/**
 * Utilitaires de formatage de date qui remplacent date-fns
 */

/**
 * Formate une date selon un format spécifié
 * Formats supportés:
 * - 'HH:mm' - heures et minutes (24h)
 * - 'dd/MM/yyyy' - jour, mois, année
 * - 'EEE' - abréviation du jour de la semaine
 */
export function format(date: Date | number | string, formatString: string): string {
  const d = new Date(date);
  
  // Format HH:mm (heure et minutes)
  if (formatString === 'HH:mm') {
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // Format dd/MM/yyyy
  if (formatString === 'dd/MM/yyyy') {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  // Format EEE (abréviation du jour de la semaine)
  if (formatString === 'EEE') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()];
  }
  
  // Format par défaut
  return d.toLocaleString();
}

/**
 * Vérifie si deux dates sont le même jour
 */
export function isSameDay(date1: Date | number | string, date2: Date | number | string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Soustrait un nombre spécifié de jours à une date
 */
export function subtractDays(date: Date | number | string, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

/**
 * Vérifie si une date est comprise dans les X derniers jours
 */
export function isWithinLastDays(date: Date | number | string, days: number): boolean {
  const d = new Date(date);
  const now = new Date();
  const limitDate = subtractDays(now, days);
  
  return d >= limitDate;
}

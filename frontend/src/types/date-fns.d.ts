declare module 'date-fns' {
  export function format(date: Date | number, format: string, options?: object): string;
  export function isToday(date: Date | number): boolean;
  export function isYesterday(date: Date | number): boolean;
  export function isSameDay(dateLeft: Date | number, dateRight: Date | number): boolean;
  export function addDays(date: Date | number, amount: number): Date;
  export function subDays(date: Date | number, amount: number): Date;
  export function isSameWeek(dateLeft: Date | number, dateRight: Date | number, options?: object): boolean;
  // Ajoutez d'autres fonctions au besoin
}

// Tiny date helpers for consistent formatting & grouping

// 12h time, locale-stable.
export function formatTime12h(date: Date) {
  const hours = date.getHours() % 12 || 12;
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = date.getHours() >= 12 ? 'pm' : 'am';
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

// Strict UTC date key to avoid SSR/client timezone differences.
// Example: '2025-08-07'
export function isoDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

// local comparison helpers (kept for general use)
export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Locale-stable day label to avoid hydration mismatch.
// Always renders like "Aug 7, 2025" regardless of user locale.
export function formatDayLabel(date: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';

  // Use a fixed locale so server and client match exactly.
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

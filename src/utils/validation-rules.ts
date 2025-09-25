// Centralized validation rules and regex patterns for login

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  // Basic format check
  if (!emailRegex.test(email)) return false;
  // Additional domain structure check
  const [, domain] = email.split('@');
  if (!domain || domain.startsWith('-') || domain.endsWith('-')) return false;
  if (domain.split('.').some((part) => part.length < 2)) return false;
  return true;
}

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export function isStrongPassword(password: string): boolean {
  return passwordRegex.test(password);
}

export const requiredField = (value: string) => value.trim().length > 0;

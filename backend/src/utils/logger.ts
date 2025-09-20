export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  },
  info: (message: string) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
  warn: (message: string, data?: any) => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || ''),
  error: (message: string, error?: Error | any) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '')
};
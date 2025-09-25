

//  Check if token is valid (assumes JWT, but can be adapted)
export const checkTokenValidity = async (token: string | null): Promise<boolean> => {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // decode JWT payload
    const isExpired = payload.exp * 1000 < Date.now();

    return !isExpired;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

//  Log access attempts (for audit & debugging)
export const logAccessAttempt = (path: string, status: 'granted' | 'denied') => {
  const logEntry = {
    path,
    status,
    timestamp: new Date().toISOString(),
  };

  // For now, just log to console
  console.log('[Route Access Log]', logEntry);


};

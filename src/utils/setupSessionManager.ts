// src/utils/setupSessionManager.ts
let inactivityTimer: number | null = null;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 15 minutes

export const setupSessionManager = (): (() => void) => {
  const resetTimer = () => {
    if (inactivityTimer) {
      window.clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = window.setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }, INACTIVITY_TIMEOUT);
  };

  // Reset timer on user activity
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  activityEvents.forEach(event => {
    window.addEventListener(event, resetTimer);
  });

  // Initialize timer
  resetTimer();

  // Store session start time
  localStorage.setItem('sessionStart', Date.now().toString());

  // Return cleanup function
  return () => {
    if (inactivityTimer) {
      window.clearTimeout(inactivityTimer);
    }
    activityEvents.forEach(event => {
      window.removeEventListener(event, resetTimer);
    });
  };
};
export const triggerHaptic = (ms = 10) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(ms);
    } catch (e) {
      // Ignore vibration errors
    }
  }
};

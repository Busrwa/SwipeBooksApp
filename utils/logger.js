// utils/logger.js
export const logError = (message, error) => {
  if (process.env.NODE_ENV !== 'production') {
    // Geliştirme sırasında konsola yaz
    console.error(message, error);
  }
};
// Uyarı loglama
export const logWarning = (message) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(message);
  }
};

export const logInfo = (message) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message);
  }
};
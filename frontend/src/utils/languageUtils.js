// src/utils/languageUtils.js

/**
 * Checks if a string contains Arabic characters.
 * The Unicode range U+0600 to U+06FF covers the Arabic script.
 * @param {string} text - The text to check.
 * @returns {boolean} - True if Arabic characters are found, otherwise false.
 */
export const containsArabic = (text) => {
  if (!text || typeof text !== 'string') {
    return false;
  }
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};
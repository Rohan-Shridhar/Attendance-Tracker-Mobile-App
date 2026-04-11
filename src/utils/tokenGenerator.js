/**
 * Generates an attendance token based on the current time or a provided date.
 * Format: HHMMSSYYYYMMDD
 * The seconds are rounded down to the nearest 20-second block (00, 20, 40).
 * 
 * @param {Date} [date] - Optional date to generate token for. Defaults to now.
 * @returns {string} The formatted token
 */
const generateAttendanceToken = (date = new Date()) => {
  const YYYY = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const DD = String(date.getDate()).padStart(2, '0');
  
  const HH = String(date.getHours()).padStart(2, '0');
  const MM = String(date.getMinutes()).padStart(2, '0');
  
  const rawSeconds = date.getSeconds();
  const SS = String(Math.floor(rawSeconds / 20) * 20).padStart(2, '0');
  
  return `${HH}${MM}${SS}${YYYY}${month}${DD}`;
};

/**
 * Calculates the number of seconds remaining until the 20-second interval changes.
 * 
 * @returns {number} Seconds until next token change
 */
export const getSecondsUntilNextToken = () => {
  const currentSeconds = new Date().getSeconds();
  const nextReset = (Math.floor(currentSeconds / 20) + 1) * 20;
  return nextReset - currentSeconds;
};

export default generateAttendanceToken;

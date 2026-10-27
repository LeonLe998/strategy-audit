/**
 * Cáº¥u hÃ¬nh á»©ng dá»¥ng vÃ  káº¿t ná»‘i API Google Sheets (Google Apps Script)
 */

// Láº¥y URL Apps Script Ä‘Ã£ Ä‘Æ°á»£c lÆ°u trong localStorage hoáº·c tá»« biáº¿n mÃ´i trÆ°á»ng náº¿u cÃ³
export const getGasApiUrl = (): string => {
  return localStorage.getItem('quant_gas_api_url') || 'https://script.google.com/macros/s/AKfycbyH6xzJc9J4Dj8fKJi-Rp91tfeS0tZbLtjz0m26bON4kjLKFnMLjS8btAxo66CoPDCGbA/exec';
};

// LÆ°u URL Apps Script má»›i vÃ o localStorage Ä‘á»ƒ sá»­ dá»¥ng cho toÃ n bá»™ á»©ng dá»¥ng
export const setGasApiUrl = (url: string): void => {
  localStorage.setItem('quant_gas_api_url', url.trim());
};

// Tráº¡ng thÃ¡i cáº¥u hÃ¬nh hiá»‡n táº¡i Ä‘Ã£ sáºµn sÃ ng hay chÆ°a
export const isGasConfigured = (): boolean => {
  return getGasApiUrl() !== '';
};

/**
 * Endpoint Google Apps Script cho trang SÃ¡u Ã” (/sauo)
 * Chá»§ site cÃ³ thá»ƒ cáº¥u hÃ¬nh biáº¿n mÃ´i trÆ°á»ng VITE_SAUO_GAS_URL trÃªn Netlify
 * hoáº·c dÃ¡n trá»±c tiáº¿p link Web App URL vÃ o háº±ng sá»‘ dÆ°á»›i Ä‘Ã¢y:
 */
export const SAUO_GAS_ENDPOINT = 
  import.meta.env.VITE_SAUO_GAS_URL || 
  'https://script.google.com/macros/s/AKfycbyH6xzJc9J4Dj8fKJi-Rp91tfeS0tZbLtjz0m26bON4kjLKFnMLjS8btAxo66CoPDCGbA/exec';


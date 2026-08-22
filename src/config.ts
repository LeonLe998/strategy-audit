/**
 * Cấu hình ứng dụng và kết nối API Google Sheets (Google Apps Script)
 */

// Lấy URL Apps Script đã được lưu trong localStorage hoặc từ biến môi trường nếu có
export const getGasApiUrl = (): string => {
  return localStorage.getItem('quant_gas_api_url') || 'https://script.google.com/macros/s/AKfycbyH6xzJc9J4Dj8fKJi-Rp91tfeS0tZbLtjz0m26bON4kjLKFnMLjS8btAxo66CoPDCGbA/exec';
};

// Lưu URL Apps Script mới vào localStorage để sử dụng cho toàn bộ ứng dụng
export const setGasApiUrl = (url: string): void => {
  localStorage.setItem('quant_gas_api_url', url.trim());
};

// Trạng thái cấu hình hiện tại đã sẵn sàng hay chưa
export const isGasConfigured = (): boolean => {
  return getGasApiUrl() !== '';
};

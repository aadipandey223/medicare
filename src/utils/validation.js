// Reusable form validation helpers

export const isEmail = (value) => {
  if (!value) return false;
  // Basic RFC 5322 compliant-ish regex kept pragmatic
  const re = /^(?:[a-zA-Z0-9_'^&+\-])+(?:\.(?:[a-zA-Z0-9_'^&+\-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return re.test(String(value).trim());
};

export const isPhone = (value) => {
  if (!value) return false;
  // Allow only digits, 10 digits (e.g., India/US local mobile style)
  const digits = String(value).replace(/\D/g, '');
  return digits.length === 10;
};

export const normalizePhone = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '').slice(0, 10);
};

export const isName = (value) => {
  if (!value) return false;
  const trimmed = String(value).trim();
  if (trimmed.length < 2 || trimmed.length > 80) return false;
  // Letters, spaces, hyphens, apostrophes
  return /^[A-Za-z][A-Za-z '\-]*$/.test(trimmed);
};

export const isAge = (value) => {
  if (value === '' || value === null || typeof value === 'undefined') return false;
  const num = Number(value);
  return Number.isInteger(num) && num >= 1 && num <= 120;
};

export const isStrongPassword = (value) => {
  if (!value) return false;
  // Min 8 chars, at least 1 letter and 1 number
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(String(value));
};

export const getPasswordHint = () => 'Use at least 8 characters with a mix of letters and numbers.';

// Strength: 0 (empty), 1 (weak), 2 (fair), 3 (good), 4 (strong)
export const getPasswordStrength = (value) => {
  const v = String(value || '');
  if (!v) return { score: 0, label: 'Empty', color: '#64748B' };
  let score = 0;
  if (v.length >= 8) score += 1;
  if (/[A-Z]/.test(v) || /[a-z]/.test(v)) score += 1;
  if (/\d/.test(v)) score += 1;
  if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) score += 1; // bonus for symbols or long length
  const labelMap = ['Empty', 'Weak', 'Fair', 'Good', 'Strong'];
  const colorMap = ['#64748B', '#EF4444', '#F59E0B', '#10B981', '#22C55E'];
  return { score, label: labelMap[score], color: colorMap[score] };
};

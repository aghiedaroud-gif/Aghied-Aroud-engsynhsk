export interface PhoneValidationResult {
  isValid: boolean;
  e164: string;
  providerType: string;
  error?: string;
}

export function validateAndFormatPhone(rawInput: string): PhoneValidationResult {
  if (!rawInput || !rawInput.trim()) {
    return { isValid: false, e164: '', providerType: 'فارغ', error: 'يرجى إدخال رقم الهاتف' };
  }

  // Strip float artifacts (e.g. 996832568.0) and non-digits
  const cleanStr = rawInput.split('.')[0].trim();
  let digits = cleanStr.replace(/\D/g, '');

  // Strip leading international prefix or 0
  if (digits.startsWith('963')) {
    digits = digits.substring(3);
  }
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  const gsmPrefixes = ['93', '94', '95', '98', '99'];
  const rcellPrefix = '52';

  // GSM Check: exactly 9 digits
  if (gsmPrefixes.some(p => digits.startsWith(p)) && digits.length === 9) {
    return {
      isValid: true,
      e164: `+963${digits}`,
      providerType: digits.startsWith('94') || digits.startsWith('95') || digits.startsWith('98') ? 'Syriatel' : 'MTN'
    };
  }

  // Rcell VoIP/Data Check: 052 / 52 with 8 or 9 digits
  if (digits.startsWith(rcellPrefix) && (digits.length === 8 || digits.length === 9)) {
    return {
      isValid: true,
      e164: `+963${digits}`,
      providerType: 'Rcell (VoIP / Data 4G+)'
    };
  }

  // International formats support
  if (digits.length >= 8 && digits.length <= 15) {
    return {
      isValid: true,
      e164: `+${digits}`,
      providerType: 'رقم دولي معتمد'
    };
  }

  return {
    isValid: false,
    e164: '',
    providerType: 'غير صالح',
    error: 'صيغة الرقم غير متوافقة (يجب أن تبدأ بـ 09x أو 052)'
  };
}

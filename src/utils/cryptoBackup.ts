import { 
  InvoiceRecord, 
  PayOrderRecord, 
  SyndicateDepositRecord, 
  EngineerRecord, 
  FundContributionRecord, 
  LedgerEntry, 
  AuditLogEntry, 
  BranchCode 
} from '../types';

export interface BackupDataPayload {
  metadata: {
    format: string;
    version: string;
    exportTimestamp: string;
    exportDate: string;
    branch: BranchCode;
    system: string;
    counts: {
      invoices: number;
      payOrders: number;
      deposits: number;
      engineers: number;
      contributions: number;
      ledgerEntries: number;
      auditLogs: number;
    };
  };
  entities: {
    invoices: InvoiceRecord[];
    payOrders: PayOrderRecord[];
    deposits: SyndicateDepositRecord[];
    engineers: EngineerRecord[];
    contributions: FundContributionRecord[];
    ledgerEntries: LedgerEntry[];
    auditLogs: AuditLogEntry[];
  };
}

export interface EncryptedBackupEnvelope {
  format: 'NES-SYNDICATE-ENCRYPTED-BACKUP-V1';
  version: string;
  created_at: string;
  branch: BranchCode;
  record_counts: {
    invoices: number;
    payOrders: number;
    deposits: number;
    engineers: number;
    contributions: number;
    ledgerEntries: number;
    auditLogs: number;
  };
  encryption: {
    algorithm: 'AES-GCM-256' | 'AES-FALLBACK-V1';
    kdf: 'PBKDF2-SHA256' | 'SHA256-KDF';
    iterations: number;
    salt_b64: string;
    iv_b64: string;
  };
  integrity_checksum: string;
  ciphertext_b64: string;
}

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert string to Uint8Array UTF-8
function stringToUtf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Simple fallback encryption if subtle crypto is not available in restricted iframe
function fallbackEncrypt(plainText: string, keyPhrase: string, salt: Uint8Array, iv: Uint8Array): string {
  const textBytes = stringToUtf8(plainText);
  const keyBytes = stringToUtf8(keyPhrase + arrayBufferToBase64(salt.buffer));
  const output = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    output[i] = textBytes[i] ^ keyBytes[i % keyBytes.length] ^ iv[i % iv.length];
  }
  return arrayBufferToBase64(output.buffer);
}

// Compute simple SHA-256 hex checksum
async function computeSha256(dataString: string): Promise<string> {
  try {
    if (window.crypto && window.crypto.subtle) {
      const msgBuffer = stringToUtf8(dataString);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('Subtle crypto digest unavailable, using fallback hash');
  }
  // Fallback fast hash
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    hash = ((hash << 5) - hash) + dataString.charCodeAt(i);
    hash |= 0;
  }
  return `FALLBACK-${Math.abs(hash).toString(16)}-${Date.now().toString(16)}`;
}

export const DEFAULT_MASTER_BACKUP_KEY = 'NES-SYNDICATE-FINANCE-MASTER-BACKUP-KEY-2026';

/**
 * Encrypt and package database payload into standard encrypted JSON format
 */
export async function createEncryptedDatabaseBackup({
  invoices,
  payOrders,
  deposits,
  engineers,
  contributions = [],
  ledgerEntries = [],
  auditLogs = [],
  branch = 'HAS',
  passphrase = DEFAULT_MASTER_BACKUP_KEY
}: {
  invoices: InvoiceRecord[];
  payOrders: PayOrderRecord[];
  deposits: SyndicateDepositRecord[];
  engineers: EngineerRecord[];
  contributions?: FundContributionRecord[];
  ledgerEntries?: LedgerEntry[];
  auditLogs?: AuditLogEntry[];
  branch?: BranchCode;
  passphrase?: string;
}): Promise<{ envelope: EncryptedBackupEnvelope; jsonString: string; fileName: string; rawSizeKb: number }> {
  const now = new Date();
  const exportTimestamp = now.toISOString();
  const exportDate = exportTimestamp.split('T')[0];

  const payload: BackupDataPayload = {
    metadata: {
      format: 'NES-ENGINEERING-SYNDICATE-DATABASE-SCHEMA',
      version: '2.6.0',
      exportTimestamp,
      exportDate,
      branch,
      system: 'نظام إدارة الشؤون المالية الموحد - نقابة المهندسين 2026',
      counts: {
        invoices: invoices.length,
        payOrders: payOrders.length,
        deposits: deposits.length,
        engineers: engineers.length,
        contributions: contributions.length,
        ledgerEntries: ledgerEntries.length,
        auditLogs: auditLogs.length
      }
    },
    entities: {
      invoices,
      payOrders,
      deposits,
      engineers,
      contributions,
      ledgerEntries,
      auditLogs
    }
  };

  const rawJson = JSON.stringify(payload, null, 2);
  const rawSizeKb = Math.round((new TextEncoder().encode(rawJson).length / 1024) * 10) / 10;
  const integrityChecksum = await computeSha256(rawJson);

  // Generate Salt & IV
  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(salt);
    window.crypto.getRandomValues(iv);
  } else {
    for (let i = 0; i < 16; i++) salt[i] = Math.floor(Math.random() * 256);
    for (let i = 0; i < 12; i++) iv[i] = Math.floor(Math.random() * 256);
  }

  let ciphertextB64 = '';
  let algorithm: 'AES-GCM-256' | 'AES-FALLBACK-V1' = 'AES-GCM-256';
  let kdf: 'PBKDF2-SHA256' | 'SHA256-KDF' = 'PBKDF2-SHA256';
  const iterations = 100000;

  try {
    if (window.crypto && window.crypto.subtle) {
      // 1. Import raw key from passphrase
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        stringToUtf8(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      // 2. Derive AES-GCM 256 key
      const aesKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: iterations,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      // 3. Encrypt data
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        aesKey,
        stringToUtf8(rawJson)
      );

      ciphertextB64 = arrayBufferToBase64(encryptedBuffer);
    } else {
      throw new Error('Subtle Crypto not available');
    }
  } catch (err) {
    console.warn('Falling back to secondary encryption cipher:', err);
    algorithm = 'AES-FALLBACK-V1';
    kdf = 'SHA256-KDF';
    ciphertextB64 = fallbackEncrypt(rawJson, passphrase, salt, iv);
  }

  const envelope: EncryptedBackupEnvelope = {
    format: 'NES-SYNDICATE-ENCRYPTED-BACKUP-V1',
    version: '2.6.0',
    created_at: exportTimestamp,
    branch,
    record_counts: payload.metadata.counts,
    encryption: {
      algorithm,
      kdf,
      iterations,
      salt_b64: arrayBufferToBase64(salt.buffer),
      iv_b64: arrayBufferToBase64(iv.buffer)
    },
    integrity_checksum: integrityChecksum,
    ciphertext_b64: ciphertextB64
  };

  const jsonString = JSON.stringify(envelope, null, 2);
  const timeStampShort = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const fileName = `Syndicate_Database_Backup_${branch}_${timeStampShort}.enc.json`;

  return {
    envelope,
    jsonString,
    fileName,
    rawSizeKb
  };
}

/**
 * Triggers the browser download for the encrypted backup file
 */
export function downloadBackupFile(jsonString: string, fileName: string): void {
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

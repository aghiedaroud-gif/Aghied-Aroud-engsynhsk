/**
 * CSV Import Parser and Importer Utilities for Syrian Engineers Syndicate Portal
 * Supports RFC 4180 parsing, quoted values with commas/newlines, UTF-8 BOM detection,
 * automatic header matching (Arabic & English), data validation, preview, and batch importing.
 */

import {
  InvoiceRecord,
  PayOrderRecord,
  SyndicateDepositRecord,
  FundContributionRecord,
  LedgerEntry,
  EngineerRecord,
  BranchCode
} from '../types';

export type CSVImportTarget = 'ledger' | 'invoices' | 'payorders' | 'deposits' | 'contributions' | 'engineers';

export interface CSVImportValidationResult {
  totalRows: number;
  validRows: number;
  errorRows: number;
  headers: string[];
  sampleData: Array<Record<string, any>>;
  errors: Array<{ row: number; field: string; message: string; data?: any }>;
  parsedEntries: any[];
}

/**
 * Robust CSV parser handling RFC 4180 rules, quoted strings, escaped quotes, commas, and newlines.
 */
export function parseCSVString(csvText: string): string[][] {
  // Strip UTF-8 BOM if present
  let cleanText = csvText.replace(/^\uFEFF/, '');

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuotes = false;
  let i = 0;

  while (i < cleanText.length) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentVal += '"';
          i += 2;
          continue;
        } else {
          // End of quoted field
          insideQuotes = false;
          i++;
          continue;
        }
      } else {
        currentVal += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
        i++;
        continue;
      } else if (char === ',' || char === ';') {
        // Field delimiter (support comma or semicolon)
        currentRow.push(currentVal.trim());
        currentVal = '';
        i++;
        continue;
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentVal.trim());
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentVal = '';
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentVal.trim());
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentVal = '';
        i++;
        continue;
      } else {
        currentVal += char;
        i++;
        continue;
      }
    }
  }

  // Push remaining field & row
  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Normalizes header keys for case-insensitive and Arabic-friendly key mapping
 */
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\s_\-#/\\()\[\]]/g, '')
    .trim();
}

/**
 * Validates and maps parsed CSV rows into target data structures
 */
export function validateAndParseCSV(
  target: CSVImportTarget,
  csvText: string,
  currentBranch: BranchCode
): CSVImportValidationResult {
  const rawRows = parseCSVString(csvText);

  if (rawRows.length === 0) {
    return {
      totalRows: 0,
      validRows: 0,
      errorRows: 0,
      headers: [],
      sampleData: [],
      errors: [{ row: 0, field: 'file', message: 'الملف فارغ أو لا يحتوي على أسطر صالحة.' }],
      parsedEntries: []
    };
  }

  const rawHeaders = rawRows[0];
  const dataRows = rawRows.slice(1);
  const normalizedHeaders = rawHeaders.map(h => ({
    original: h,
    normalized: normalizeKey(h)
  }));

  const errors: Array<{ row: number; field: string; message: string; data?: any }> = [];
  const parsedEntries: any[] = [];
  const sampleData: Array<Record<string, any>> = [];

  // Helper to extract value by multiple possible synonyms (English + Arabic)
  const getValue = (rowObj: Record<string, string>, synonyms: string[]): string => {
    for (const syn of synonyms) {
      const normSyn = normalizeKey(syn);
      for (const key of Object.keys(rowObj)) {
        if (normalizeKey(key) === normSyn) {
          return rowObj[key] || '';
        }
      }
    }
    return '';
  };

  dataRows.forEach((row, rowIndex) => {
    // Skip empty lines or summary rows (like "TOTALS")
    if (row.length === 0 || row.every(cell => !cell || cell.trim() === '')) return;
    if (row[0]?.toUpperCase().includes('TOTAL') || row[0]?.includes('المجموع')) return;

    const rowNumber = rowIndex + 2; // 1-based + 1 for header
    const rowObj: Record<string, string> = {};
    rawHeaders.forEach((h, colIndex) => {
      rowObj[h] = row[colIndex] || '';
    });

    try {
      if (target === 'ledger') {
        const debitRaw = getValue(rowObj, ['debit', 'مدين', 'المدين', 'debitamount']);
        const creditRaw = getValue(rowObj, ['credit', 'دائن', 'الدائن', 'creditamount']);
        const debit = parseFloat(debitRaw.replace(/,/g, '')) || 0;
        const credit = parseFloat(creditRaw.replace(/,/g, '')) || 0;
        const accountName = getValue(rowObj, ['accountname', 'اسم الحساب', 'account_name', 'account', 'الحساب']) || 'حساب عام';
        const accountCode = getValue(rowObj, ['accountcode', 'رمز الحساب', 'account_code', 'code']) || (debit > 0 ? '3101' : '2201');
        const description = getValue(rowObj, ['description', 'البيان', 'شرح القيد', 'notes', 'ملاحظات']) || 'قيد مرحل من ملف CSV';
        const date = getValue(rowObj, ['date', 'التاريخ', 'timestamp', 'تاريخ القيد']) || new Date().toISOString().split('T')[0];
        const docRef = getValue(rowObj, ['documentref', 'documentid', 'رقم المستند', 'رقم الفاتورة', 'docref']);
        const branchRaw = getValue(rowObj, ['branch', 'الفرع', 'branchcode']) || currentBranch;
        const branchCode: BranchCode = (['HAS', 'QAM', 'DER'].includes(branchRaw.toUpperCase()) ? branchRaw.toUpperCase() : currentBranch) as BranchCode;
        const partyName = getValue(rowObj, ['partyname', 'صاحب العلاقة', 'المستفيد', 'المهندس']);
        const currency = (getValue(rowObj, ['currency', 'العملة']).toUpperCase() === 'USD' ? 'USD' : 'SYP') as 'SYP' | 'USD';

        if (debit === 0 && credit === 0) {
          errors.push({
            row: rowNumber,
            field: 'debit/credit',
            message: 'يجب تحديد مبلغ مدين أو دائن أكبر من الصفر.',
            data: rowObj
          });
          return;
        }

        const entry: LedgerEntry = {
          id: getValue(rowObj, ['entryid', 'id', 'رقم القيد']) || `GL-IMP-${Date.now()}-${rowIndex + 1}`,
          date,
          timestamp: `${date} ${new Date().toLocaleTimeString('en-US', { hour12: false })}`,
          branchCode,
          accountCode,
          accountName,
          description,
          debit,
          credit,
          balance: debit - credit,
          documentId: docRef || undefined,
          partyName: partyName || undefined,
          currency,
          notes: `مستورد عبر CSV (${date})`
        };

        parsedEntries.push(entry);
      } else if (target === 'invoices') {
        const clientName = getValue(rowObj, ['clientname', 'اسم صاحب العلاقة', 'العميل', 'المشروع', 'client_name', 'name']);
        const totalRaw = getValue(rowObj, ['totalamount', 'المبلغ الإجمالي', 'إجمالي الفاتورة', 'amount', 'total', 'الأتعاب']);
        const totalAmount = parseFloat(totalRaw.replace(/,/g, '')) || 0;
        const invNum = getValue(rowObj, ['invoicenumber', 'serialno', 'رقم الفاتورة', 'serial_no', 'invoice_number', 'id']) || `INV-${currentBranch}-2026-IMP${rowIndex + 1}`;
        const branchRaw = getValue(rowObj, ['branch', 'الفرع', 'branchcode']) || currentBranch;
        const branchCode: BranchCode = (['HAS', 'QAM', 'DER'].includes(branchRaw.toUpperCase()) ? branchRaw.toUpperCase() : currentBranch) as BranchCode;
        const modelType = getValue(rowObj, ['modeltype', 'نموذج الفاتورة', 'model', 'النموذج']) || 'GS Model';
        const date = getValue(rowObj, ['date', 'التاريخ', 'date/time', 'تاريخ الفاتورة']) || new Date().toISOString().split('T')[0];
        const clientPhone = getValue(rowObj, ['clientphone', 'هاتف صاحب العلاقة', 'phone', 'الهاتف']) || '0900000000';
        const currency = (getValue(rowObj, ['currency', 'العملة']).toUpperCase() === 'USD' ? 'USD' : 'SYP') as 'SYP' | 'USD';

        if (!clientName) {
          errors.push({
            row: rowNumber,
            field: 'clientName',
            message: 'اسم صاحب العلاقة مفقود.',
            data: rowObj
          });
          return;
        }

        if (totalAmount <= 0) {
          errors.push({
            row: rowNumber,
            field: 'totalAmount',
            message: 'المبلغ الإجمالي للفاتورة يجب أن يكون أكبر من الصفر.',
            data: rowObj
          });
          return;
        }

        const entry: InvoiceRecord = {
          id: `inv-imp-${Date.now()}-${rowIndex + 1}`,
          invoiceNumber: invNum,
          date,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          clientName,
          clientPhone,
          totalAmount,
          currency,
          branchCode,
          modelType,
          status: 'Issued',
          issuedBy: 'استيراد CSV محاسبي'
        };

        parsedEntries.push(entry);
      } else if (target === 'payorders') {
        const epoNum = getValue(rowObj, ['orderno', 'payordernumber', 'رقم أمر الصرف', 'pay_order_number', 'id']) || `EPO-${currentBranch}-2026-IMP${rowIndex + 1}`;
        const relatedInvoice = getValue(rowObj, ['linkedinvoice', 'relatedinvoice', 'الفاتورة المرتبطة', 'linked_inv', 'invoice']) || '';
        const totalRaw = getValue(rowObj, ['engineerpayout', 'totalamount', 'المبلغ المصروف', 'amount', 'total']);
        const totalAmount = parseFloat(totalRaw.replace(/,/g, '')) || 0;
        const date = getValue(rowObj, ['date', 'التاريخ', 'date/time']) || new Date().toISOString().split('T')[0];
        const branchRaw = getValue(rowObj, ['branch', 'الفرع', 'branchcode']) || currentBranch;
        const branchCode: BranchCode = (['HAS', 'QAM', 'DER'].includes(branchRaw.toUpperCase()) ? branchRaw.toUpperCase() : currentBranch) as BranchCode;
        const modelType = getValue(rowObj, ['modeltype', 'النموذج', 'model']) || 'GS Model';
        const currency = (getValue(rowObj, ['currency', 'العملة']).toUpperCase() === 'USD' ? 'USD' : 'SYP') as 'SYP' | 'USD';

        if (totalAmount <= 0) {
          errors.push({
            row: rowNumber,
            field: 'totalAmount',
            message: 'مبلغ أمر الصرف يجب أن يكون أكبر من الصفر.',
            data: rowObj
          });
          return;
        }

        const entry: PayOrderRecord = {
          id: `epo-imp-${Date.now()}-${rowIndex + 1}`,
          payOrderNumber: epoNum,
          relatedInvoice: relatedInvoice || `INV-${currentBranch}-2026-REF`,
          date,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          totalAmount,
          currency,
          branchCode,
          modelType,
          status: 'Issued',
          issuedBy: 'استيراد CSV محاسبي',
          breakdown: [
            {
              engineerName: 'مهندس معتمد (قيد مجمع)',
              discipline: 'مدني / عمارة',
              role: 'دراسة',
              netAmount: totalAmount
            }
          ]
        };

        parsedEntries.push(entry);
      } else if (target === 'deposits') {
        const depositNum = getValue(rowObj, ['depositno', 'depositnumber', 'رقم الإيداع', 'deposit_number', 'id']) || `SFD-${currentBranch}-2026-IMP${rowIndex + 1}`;
        const relatedInvoice = getValue(rowObj, ['linkedinvoice', 'relatedinvoice', 'الفاتورة المرتبطة', 'linked_inv', 'invoice']) || '';
        const totalRaw = getValue(rowObj, ['fundstotal', 'totalamount', 'المبلغ المودع', 'amount', 'total']);
        const totalAmount = parseFloat(totalRaw.replace(/,/g, '')) || 0;
        const date = getValue(rowObj, ['date', 'التاريخ', 'date/time']) || new Date().toISOString().split('T')[0];
        const branchRaw = getValue(rowObj, ['branch', 'الفرع', 'branchcode']) || currentBranch;
        const branchCode: BranchCode = (['HAS', 'QAM', 'DER'].includes(branchRaw.toUpperCase()) ? branchRaw.toUpperCase() : currentBranch) as BranchCode;
        const modelType = getValue(rowObj, ['modeltype', 'النموذج', 'model']) || 'GS Model';
        const currency = (getValue(rowObj, ['currency', 'العملة']).toUpperCase() === 'USD' ? 'USD' : 'SYP') as 'SYP' | 'USD';

        if (totalAmount <= 0) {
          errors.push({
            row: rowNumber,
            field: 'totalAmount',
            message: 'مبلغ إيداع الصناديق يجب أن يكون أكبر من الصفر.',
            data: rowObj
          });
          return;
        }

        const entry: SyndicateDepositRecord = {
          id: `sfd-imp-${Date.now()}-${rowIndex + 1}`,
          depositNumber: depositNum,
          relatedInvoice: relatedInvoice || `INV-${currentBranch}-2026-REF`,
          date,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          totalAmount,
          currency,
          branchCode,
          modelType,
          issuedBy: 'استيراد CSV محاسبي',
          fundsBreakdown: [
            {
              fundName: 'صندوق التعاون المشترك والرسوم',
              amount: totalAmount,
              description: 'إيداع مستورد عبر CSV'
            }
          ]
        };

        parsedEntries.push(entry);
      } else if (target === 'contributions') {
        const engineerName = getValue(rowObj, ['engineername', 'اسم المهندس', 'المهندس', 'engineer', 'name']);
        const fundName = getValue(rowObj, ['fundname', 'اسم الصندوق', 'الصندوق', 'fund']) || 'صندوق المساعدة الفورية';
        const amountRaw = getValue(rowObj, ['amount', 'المبلغ', 'deductedcontribution', 'قيمة الاشتراك']);
        const amount = parseFloat(amountRaw.replace(/,/g, '')) || 0;
        const date = getValue(rowObj, ['date', 'التاريخ']) || new Date().toISOString().split('T')[0];
        const depositId = getValue(rowObj, ['depositid', 'رقم الإيداع', 'deposit_no']) || `SFD-${currentBranch}-REF`;
        const discipline = getValue(rowObj, ['discipline', 'الاختصاص', 'التخصص']) || 'مدني';
        const fundStatus = getValue(rowObj, ['fundstatus', 'حالة الصندوق', 'status']) || 'داخل';
        const currency = (getValue(rowObj, ['currency', 'العملة']).toUpperCase() === 'USD' ? 'USD' : 'SYP') as 'SYP' | 'USD';

        if (!engineerName) {
          errors.push({
            row: rowNumber,
            field: 'engineerName',
            message: 'اسم المهندس مفقود.',
            data: rowObj
          });
          return;
        }

        if (amount <= 0) {
          errors.push({
            row: rowNumber,
            field: 'amount',
            message: 'مبلغ الاشتراك يجب أن يكون أكبر من الصفر.',
            data: rowObj
          });
          return;
        }

        const entry: FundContributionRecord = {
          id: `contrib-imp-${Date.now()}-${rowIndex + 1}`,
          date,
          depositId,
          relatedInvoice: `INV-${currentBranch}-REF`,
          engineerName,
          discipline,
          fundName,
          fundStatus,
          amount,
          currency
        };

        parsedEntries.push(entry);
      } else if (target === 'engineers') {
        const fullName = getValue(rowObj, ['fullname', 'الاسم الكامل', 'اسم المهندس', 'name', 'engineer_name']);
        const department = getValue(rowObj, ['department', 'الشعبة', 'القسم', 'discipline']) || 'مدني';
        const specialization = getValue(rowObj, ['specialization', 'الاختصاص', 'التخصص']) || department;
        const phone = getValue(rowObj, ['phone', 'رقم الهاتف', 'الهاتف', 'mobile']) || '0900000000';
        const rank = (getValue(rowObj, ['rank', 'المرتبة', 'الدرجة']) || 'ممارس') as any;
        const fundStatus = (getValue(rowObj, ['fundstatus', 'الصندوق', 'حالة الصندوق']) || 'داخل') as any;
        const branchRaw = getValue(rowObj, ['branch', 'الفرع', 'workcity', 'المدينة']) || currentBranch;
        const branch: BranchCode = (['HAS', 'QAM', 'DER'].includes(branchRaw.toUpperCase()) ? branchRaw.toUpperCase() : currentBranch) as BranchCode;
        const pointsRaw = getValue(rowObj, ['points', 'النقاط', 'الرصيد']);
        const points = parseInt(pointsRaw, 10) || 0;

        if (!fullName) {
          errors.push({
            row: rowNumber,
            field: 'fullName',
            message: 'اسم المهندس مفقود.',
            data: rowObj
          });
          return;
        }

        const entry: EngineerRecord = {
          id: `eng-imp-${Date.now()}-${rowIndex + 1}`,
          serial: rowIndex + 100,
          fullName,
          department,
          specialization,
          roleQualification: 'دراسة,تدريب,تدقيق',
          rank,
          fundStatus,
          phone,
          workCity: branch === 'HAS' ? 'الحسكة' : branch === 'QAM' ? 'القامشلي' : 'ديريك',
          points,
          monthlyPoints: 0,
          ytdPoints: points,
          branch
        };

        parsedEntries.push(entry);
      }

      if (sampleData.length < 5) {
        sampleData.push(rowObj);
      }
    } catch (err: any) {
      errors.push({
        row: rowNumber,
        field: 'general',
        message: err.message || 'خطأ أثناء معالجة السطر.',
        data: rowObj
      });
    }
  });

  return {
    totalRows: dataRows.length,
    validRows: parsedEntries.length,
    errorRows: errors.length,
    headers: rawHeaders,
    sampleData,
    errors,
    parsedEntries
  };
}

/**
 * Returns sample CSV template for accountants to download and fill
 */
export function getSampleCSVTemplate(target: CSVImportTarget, branchCode: BranchCode): { filename: string; content: string } {
  const dateStr = new Date().toISOString().split('T')[0];

  if (target === 'ledger') {
    const headers = 'Entry_ID,Date,Timestamp,Branch,Account_Code,Account_Name,Description,Debit,Credit,Balance,Currency,Document_Ref,Party_Name,Notes';
    const rows = [
      `GL-SMP-001,${dateStr},${dateStr} 10:00:00,${branchCode},3101,أتعاب المهندسين المستحقة للصرف,أمر صرف أتعاب تدقيق ودراسة,1250000,0,1250000,SYP,EPO-${branchCode}-2026-0001,م. ريزان أحمد,قيد تجريبي`,
      `GL-SMP-002,${dateStr},${dateStr} 10:05:00,${branchCode},2201,حساب الصناديق النقابية والرسوم المودعة,إيداع حصة الصندوق المشترك والنقابة,0,625000,-625000,SYP,SFD-${branchCode}-2026-0001,صندوق التعاون,قيد تجريبي`
    ];
    return {
      filename: `Template_General_Ledger_${branchCode}.csv`,
      content: '\uFEFF' + [headers, ...rows].join('\r\n')
    };
  }

  if (target === 'invoices') {
    const headers = 'SERIAL_NO,DATE,CLIENT_NAME,PHONE,CATEGORY,BRANCH,MODEL,TOTAL_AMOUNT,CURRENCY,STATUS';
    const rows = [
      `INV-${branchCode}-2026-0099,${dateStr},فرهاد مسعود خليل,0933123456,الأبنية السكنية والفلل,${branchCode},GS Model,2500000,SYP,Issued`,
      `INV-${branchCode}-2026-0100,${dateStr},شيرين بهجت علي,0944789012,المشاريع التجارية,${branchCode},SC Model,1800,USD,Issued`
    ];
    return {
      filename: `Template_Invoices_${branchCode}.csv`,
      content: '\uFEFF' + [headers, ...rows].join('\r\n')
    };
  }

  if (target === 'payorders') {
    const headers = 'ORDER_NO,LINKED_INV,DATE,BRANCH,MODEL,ENGINEER_PAYOUT,CURRENCY,STATUS';
    const rows = [
      `EPO-${branchCode}-2026-0099,INV-${branchCode}-2026-0099,${dateStr},${branchCode},GS Model,1500000,SYP,Issued`,
      `EPO-${branchCode}-2026-0100,INV-${branchCode}-2026-0100,${dateStr},${branchCode},SC Model,1080,USD,Issued`
    ];
    return {
      filename: `Template_PayOrders_${branchCode}.csv`,
      content: '\uFEFF' + [headers, ...rows].join('\r\n')
    };
  }

  if (target === 'deposits') {
    const headers = 'DEPOSIT_NO,LINKED_INV,DATE,BRANCH,MODEL,FUNDS_TOTAL,CURRENCY';
    const rows = [
      `SFD-${branchCode}-2026-0099,INV-${branchCode}-2026-0099,${dateStr},${branchCode},GS Model,625000,SYP`,
      `SFD-${branchCode}-2026-0100,INV-${branchCode}-2026-0100,${dateStr},${branchCode},SC Model,450,USD`
    ];
    return {
      filename: `Template_Syndicate_Deposits_${branchCode}.csv`,
      content: '\uFEFF' + [headers, ...rows].join('\r\n')
    };
  }

  if (target === 'contributions') {
    const headers = 'DATE,DEPOSIT_ID,ENGINEER_NAME,DISCIPLINE,FUND_NAME,STATUS,AMOUNT,CURRENCY';
    const rows = [
      `${dateStr},SFD-${branchCode}-2026-0099,م. ألان مراد,عمارة,صندوق التعاون والمساعدة,داخل,150000,SYP`,
      `${dateStr},SFD-${branchCode}-2026-0099,م. آزاد رشيد,مدني,صندوق الرعاية الاجتماعية,داخل,100000,SYP`
    ];
    return {
      filename: `Template_Fund_Contributions_${branchCode}.csv`,
      content: '\uFEFF' + [headers, ...rows].join('\r\n')
    };
  }

  // target === 'engineers'
  const headers = 'FULL_NAME,DEPARTMENT,SPECIALIZATION,RANK,FUND_STATUS,PHONE,CITY,POINTS,BRANCH';
  const rows = [
    `م. دلير خليل خليل,مدني,إنشائي,استشاري,داخل,0933111222,الحسكة,120,${branchCode}`,
    `م. لافا جوان صبري,عمارة,تصميم داخلي,ممارس,داخل,0944333444,القامشلي,85,${branchCode}`
  ];
  return {
    filename: `Template_Engineers_Directory_${branchCode}.csv`,
    content: '\uFEFF' + [headers, ...rows].join('\r\n')
  };
}

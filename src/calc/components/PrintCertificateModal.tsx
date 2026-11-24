import React, { useState } from 'react';
import { X, Printer, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { toBengaliDigits } from '@shared';

export interface PrintCertificateRow {
  readonly name: string;
  readonly parentage?: string;
  readonly shareFraction: string; // ১=১৬ আনা
  readonly share1?: string;       // ১.০০০ ভিত্তিক (দিলে আলাদা কলাম আসে)
  readonly share1000: string;     // ১০০০ ভিত্তিক
  readonly percentage?: string;
  readonly landAmount: string;    // প্রাপ্ত জমি
  readonly remarks?: string;
}

export interface PrintCertificateModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly subtitle?: string;
  readonly division?: string;
  readonly district?: string;
  readonly upazila?: string;
  readonly mouza?: string;
  readonly jlNo?: string;
  readonly khatianType?: string;
  readonly khatianNo?: string;
  readonly totalLand?: string;
  readonly landUnit?: string;
  readonly digitLocale?: 'bn' | 'en';
  // আউল বা রদ হলে সমন্বয়ের ব্যাখ্যা; না দিলে রিপোর্টে কিছু আসে না
  readonly adjustmentNote?: string;
  readonly rows: readonly PrintCertificateRow[];
  readonly totalRow?: {
    readonly totalTraditional?: string;
    readonly totalShare1?: string;
    readonly totalShare1000?: string;
    readonly totalLand?: string;
    readonly totalShare?: string;
    readonly totalPercentage?: string;
  };
}

// প্রিন্ট-উইন্ডোর HTML-এ ব্যবহারকারীর লেখা বসানোর আগে বিশেষ চিহ্ন নিরাপদ করা
const esc = (s: string | undefined | null): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const PrintCertificateModal: React.FC<PrintCertificateModalProps> = ({
  isOpen,
  onClose,
  title = 'হিস্যা বণ্টন প্রতিবেদন',
  subtitle,
  division,
  district,
  upazila,
  mouza,
  jlNo,
  khatianType,
  khatianNo,
  totalLand = '১০০.০০',
  landUnit = 'শতাংশ',
  adjustmentNote,
  rows,
  totalRow,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // রেফারেন্স নম্বর ঐচ্ছিক; ফাঁকা থাকলে রিপোর্টে আসে না
  const [smarakNo, setSmarakNo] = useState('');
  const [reportDate, setReportDate] = useState(() => {
    return new Date().toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  if (!isOpen) return null;

  // কোনো সারিতে ১.০০০ ভিত্তিক মান দেওয়া থাকলে তিনটি সাব-কলাম, নইলে আগের মতো দুটি
  const showShare1 = rows.some((r) => r.share1 !== undefined);
  const shareColSpan = showShare1 ? 3 : 2;
  const label1000 = showShare1 ? '১০০০.০০০০' : '১.০০০=১০০০';

  // খতিয়ানের শিরোনাম, যেমন "সি.এস. খতিয়ান নং- ৪৪১"
  const getKhatianLabel = (type?: string, no?: string) => {
    const cleanNo = toBengaliDigits(no || '—');
    let prefix = 'সি.এস.';
    if (type) {
      const upper = type.toUpperCase();
      if (upper.includes('SA') || upper.includes('এস.এ') || upper.includes('এস এ') || upper.includes('এস. এ')) {
        prefix = 'এস.এ.';
      } else if (upper.includes('RS') || upper.includes('আর.এস') || upper.includes('আর এস') || upper.includes('আর. এস')) {
        prefix = 'আর.এস.';
      } else if (upper.includes('BS') || upper.includes('বি.এস') || upper.includes('বি এস') || upper.includes('বি. এস')) {
        prefix = 'বি.এস.';
      } else if (upper.includes('CS') || upper.includes('সি.এস') || upper.includes('সি এস') || upper.includes('সি. এস')) {
        prefix = 'সি.এস.';
      } else {
        prefix = type;
      }
    }
    return `${prefix} খতিয়ান নং- ${cleanNo}`;
  };

  const finalTotalTraditional = totalRow?.totalTraditional || '১ (১৬ আনা পূর্ণ)';
  const finalTotalShare1 = totalRow?.totalShare1 || '১.০০০';
  const finalTotalShare1000 = totalRow?.totalShare1000 || totalRow?.totalShare || '১০০০.০০০০';
  const finalTotalLand = totalRow?.totalLand || toBengaliDigits(totalLand);

  const DISCLAIMER_TEXT =
    'এই প্রতিবেদনটি ভূমিসেবা.বাংলা সাইটের ক্যালকুলেটর দিয়ে স্বয়ংক্রিয়ভাবে তৈরি। এটি অফিসিয়াল সনদ বা সরকারি নথি নয়, সাধারণ হিসাব-সহায়তা মাত্র। সব তথ্য শুধু আপনার ব্রাউজারে প্রক্রিয়া হয়েছে। ভুল পেলে জানান।';

  // ব্রাউজারের নিজস্ব প্রিন্ট / PDF সংরক্ষণ
  const handleOpenInNativePdfViewer = () => {
    setIsGeneratingPdf(true);
    setErrorMessage(null);

    try {
      const khatianLabel = khatianNo ? getKhatianLabel(khatianType, khatianNo) : '';
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked');
      }

      const rowsHtml = rows
        .map((row, idx) => {
          const serialBn = toBengaliDigits(idx + 1);
          const landDisplay =
            row.landAmount !== '—'
              ? `${esc(row.landAmount)} <span style="font-size: 10px; color: #047857; font-weight: normal;">${esc(landUnit)}</span>`
              : '—';
          const subInfo = row.parentage
            ? `<div style="font-size: 10px; color: #4b5563; font-weight: 500; margin-top: 2px;">${esc(row.parentage)}</div>`
            : row.remarks
            ? `<div style="font-size: 10px; color: #6b7280; font-weight: 500; margin-top: 2px;">${esc(row.remarks)}</div>`
            : '';

          const share1Cell = showShare1
            ? `<td style="padding: 7px 10px; text-align: right; font-weight: bold; border-right: 1px solid #e5e7eb; color: #064e3b;">
                ${esc(row.share1 ?? '—')}
              </td>`
            : '';

          return `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 7px 8px; text-align: center; font-weight: bold; border-right: 1px solid #e5e7eb; color: #4b5563;">
                ${serialBn}
              </td>
              <td style="padding: 7px 10px; text-align: left; border-right: 1px solid #e5e7eb;">
                <div style="color: #111827; font-weight: bold; font-size: 13px;">${esc(row.name) || 'অজ্ঞাত অংশীদার'}</div>
                ${subInfo}
              </td>
              <td style="padding: 7px 8px; text-align: left; font-weight: 600; border-right: 1px solid #e5e7eb; color: #1f2937;">
                ${esc(toBengaliDigits(row.shareFraction))}
              </td>
              ${share1Cell}
              <td style="padding: 7px 10px; text-align: right; font-weight: bold; border-right: 1px solid #e5e7eb; color: #064e3b;">
                ${esc(row.share1000)}
              </td>
              <td style="padding: 7px 10px; text-align: right; font-weight: bold; background-color: #f0fdf4; color: #064e3b;">
                ${landDisplay}
              </td>
            </tr>
          `;
        })
        .join('');

      const geoItems = [
        division ? `<span><strong style="color: #6b7280;">বিভাগ:</strong> <b style="color: #111827;">${esc(division)}</b></span>` : '',
        district ? `<span><strong style="color: #6b7280;">জেলা:</strong> <b style="color: #111827;">${esc(district)}</b></span>` : '',
        upazila ? `<span><strong style="color: #6b7280;">উপজেলা:</strong> <b style="color: #111827;">${esc(upazila)}</b></span>` : '',
        mouza && mouza !== '—' ? `<span><strong style="color: #6b7280;">মৌজা:</strong> <b style="color: #111827;">${esc(mouza)}</b></span>` : '',
        jlNo ? `<span><strong style="color: #6b7280;">জে.এল. নং:</strong> <b style="color: #111827;">${esc(toBengaliDigits(jlNo))}</b></span>` : '',
      ].filter(Boolean).join('<span style="color: #d1d5db; margin: 0 6px;">•</span>');

      const referenceHtml = smarakNo.trim()
        ? `<div>রেফারেন্স: <span>${esc(smarakNo.trim())}</span></div>`
        : '<div></div>';

      const adjustmentHtml = adjustmentNote
        ? `<div style="background-color: #fffbeb; border: 1px solid #fcd34d; color: #78350f; padding: 9px 12px; border-radius: 6px; font-size: 11px; margin-top: 14px;">${esc(adjustmentNote)}</div>`
        : '';

      const share1HeaderCell = showShare1
        ? `<th style="border-right: 1px solid #d1d5db; width: 80px; padding: 4px 8px; text-align: right;">১.০০০</th>`
        : '';

      const share1TotalCell = showShare1
        ? `<td style="padding: 9px 10px; text-align: right; border-right: 1px solid #d1d5db; color: #064e3b; font-size: 13px;">
            ${esc(finalTotalShare1)}
          </td>`
        : '';

      const fullHtml = `
        <!DOCTYPE html>
        <html lang="bn">
        <head>
          <meta charset="utf-8">
          <title>${khatianLabel ? esc(khatianLabel) + ' - ' : ''}ভূমিসেবা.বাংলা প্রতিবেদন</title>
          <style>
            @font-face {
              font-family: 'Kalpurush';
              src: url('/fonts/Kalpurush.ttf') format('truetype');
              font-display: swap;
            }
            @font-face {
              font-family: 'SolaimanLipi';
              src: url('/fonts/SolaimanLipi.ttf') format('truetype');
              font-display: swap;
            }

            @page {
              size: A4 portrait;
              margin: 12mm 14mm;
            }

            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body {
              margin: 0;
              padding: 0;
              background-color: #f3f4f6;
              font-family: 'Kalpurush', 'SolaimanLipi', sans-serif;
              color: #111827;
              display: flex;
              flex-direction: column;
              align-items: center;
              font-size: 13px;
              line-height: 1.4;
            }

            .screen-toolbar {
              width: 100%;
              background: #0f172a;
              color: white;
              padding: 12px 24px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: sticky;
              top: 0;
              z-index: 1000;
              box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            }
            .screen-toolbar .title {
              font-size: 14px;
              font-weight: bold;
              color: #34d399;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .screen-toolbar .actions {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .btn {
              padding: 8px 18px;
              font-family: inherit;
              font-size: 13px;
              font-weight: bold;
              border-radius: 8px;
              border: none;
              cursor: pointer;
              transition: all 0.15s;
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }
            .btn-primary {
              background: #059669;
              color: white;
            }
            .btn-primary:hover {
              background: #047857;
            }
            .btn-secondary {
              background: #334155;
              color: #cbd5e1;
            }
            .btn-secondary:hover {
              background: #475569;
              color: white;
            }

            .certificate-sheet {
              width: 210mm;
              min-height: 297mm;
              padding: 18mm 20mm;
              margin: 24px auto;
              background: #ffffff;
              box-shadow: 0 6px 24px rgba(0,0,0,0.08);
              border-radius: 6px;
            }

            @media print {
              body {
                background: #ffffff !important;
              }
              .screen-toolbar {
                display: none !important;
              }
              .certificate-sheet {
                width: 100% !important;
                min-height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border-radius: 0 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="screen-toolbar no-print">
            <div class="title">
              <span>📄 ভূমিসেবা.বাংলা - প্রিন্ট ও PDF প্রিভিউ</span>
            </div>
            <div class="actions">
              <button type="button" class="btn btn-primary" onclick="window.print();" title="প্রিন্ট করুন বা PDF হিসেবে সংরক্ষণ করুন">
                🖨️ প্রিন্ট / PDF সংরক্ষণ করুন (Ctrl + P)
              </button>
              <button type="button" class="btn btn-secondary" onclick="window.close();">
                ✕ বন্ধ করুন
              </button>
            </div>
          </div>

          <div class="certificate-sheet">
            <!-- Header -->
            <div style="border-bottom: 2px solid #064e3b; text-align: center; padding-bottom: 12px;">
              <h1 style="color: #064e3b; font-size: 26px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">
                ভূমিসেবা.বাংলা
              </h1>
              <h2 style="color: #111827; font-size: 16px; font-weight: bold; margin: 5px 0 0 0;">
                ${esc(title)}
              </h2>
              ${subtitle ? `<p style="color: #4b5563; font-size: 12px; margin: 3px 0 0 0; font-weight: 500;">${esc(subtitle)}</p>` : ''}
            </div>

            <!-- Reference & Date -->
            <div style="border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: bold; padding: 10px 0; color: #1f2937;">
              ${referenceHtml}
              <div>তারিখ: <span>${esc(reportDate)}</span></div>
            </div>

            <!-- Khatian Badge -->
            ${khatianLabel ? `
              <div style="text-align: center; padding: 12px 0 6px 0;">
                <div style="display: inline-block; background-color: #ecfdf5; border: 1.5px solid #a7f3d0; color: #064e3b; padding: 5px 22px; border-radius: 8px; font-size: 17px; font-weight: 900; letter-spacing: 0.5px;">
                  ${esc(khatianLabel)}
                </div>
              </div>
            ` : ''}

            <!-- Geographic Details -->
            ${geoItems ? `
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 7px 12px; margin: 6px 0 14px 0; text-align: center; font-size: 11.5px;">
                ${geoItems}
              </div>
            ` : ''}

            <!-- Main Table -->
            <div style="border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden; margin: 12px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                <thead>
                  <tr style="background-color: #f3f4f6; color: #111827; border-bottom: 1px solid #d1d5db; font-weight: bold; text-align: center;">
                    <th rowspan="2" style="border-right: 1px solid #d1d5db; width: 56px; padding: 8px 6px;">ক্রমিক নং</th>
                    <th rowspan="2" style="border-right: 1px solid #d1d5db; padding: 8px 12px; text-align: left;">মালিক পরিচিতি</th>
                    <th colspan="${shareColSpan}" style="border-bottom: 1px solid #d1d5db; border-right: 1px solid #d1d5db; background-color: #e5e7eb; padding: 5px 6px; text-align: center;">অংশ</th>
                    <th rowspan="2" style="background-color: #ecfdf5; color: #064e3b; width: 140px; padding: 8px 12px; text-align: right;">প্রাপ্ত জমি (${esc(landUnit)})</th>
                  </tr>
                  <tr style="background-color: #fef3c7; color: #1f2937; border-bottom: 1px solid #d1d5db; font-weight: bold; text-align: center; font-size: 11px;">
                    <th style="border-right: 1px solid #d1d5db; width: 160px; padding: 4px 6px;">১=১৬ আনা</th>
                    ${share1HeaderCell}
                    <th style="border-right: 1px solid #d1d5db; width: 110px; padding: 4px 8px; text-align: right;">${esc(label1000)}</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                  <!-- Total Row -->
                  <tr style="background-color: #f3f4f6; color: #111827; border-top: 2px solid #9ca3af; font-weight: bold;">
                    <td colspan="2" style="padding: 9px 12px; text-align: left; border-right: 1px solid #d1d5db; font-size: 12px;">
                      সর্বমোট হিস্যা ও মোট জমি
                    </td>
                    <td style="padding: 9px 8px; text-align: left; border-right: 1px solid #d1d5db; font-size: 12px;">
                      ${esc(finalTotalTraditional)}
                    </td>
                    ${share1TotalCell}
                    <td style="padding: 9px 10px; text-align: right; border-right: 1px solid #d1d5db; color: #064e3b; font-size: 13px;">
                      ${esc(finalTotalShare1000)}
                    </td>
                    <td style="padding: 9px 10px; text-align: right; background-color: #d1fae5; color: #064e3b; font-size: 13px;">
                      ${esc(finalTotalLand)} <span style="font-size: 10px; color: #065f46; font-weight: 600;">${esc(landUnit)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Adjustment Note (আউল/রদ হলে) -->
            ${adjustmentHtml}

            <!-- Disclaimer Notice -->
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #064e3b; padding: 9px 12px; border-radius: 6px; font-size: 11px; margin-top: 14px;">
              ${esc(DISCLAIMER_TEXT)}
            </div>

            <!-- Signature -->
            <div style="display: flex; padding-top: 50px; font-size: 12px; text-align: center;">
              <div style="width: 45%; border-top: 1px solid #9ca3af; padding-top: 6px;">
                <div style="color: #111827; font-weight: bold; font-size: 13px;">প্রস্তুতকারী</div>
                <div style="color: #6b7280; font-size: 10.5px;">স্বাক্ষর ও তারিখ</div>
              </div>
            </div>
          </div>

          <script>
            // ফন্ট লোড হলে প্রিন্ট জানালা খোলা
            window.addEventListener('load', function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 400);
            });
          </script>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(fullHtml);
      printWindow.document.close();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to open native print viewer:', err);
      setErrorMessage('প্রিন্ট ভিউয়ার খুলতে সমস্যা হয়েছে। অনুগ্রহ করে ব্রাউজারে পপ-আপ অনুমতি দিন।');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/80 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[96vh]">
        {/* ওপরের বোতামের সারি (প্রিন্টে লুকানো) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-stone-200 bg-stone-900 text-white no-print">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <FileText className="w-4 h-4" />
            <span>প্রিন্ট ও PDF রিপোর্ট প্রিভিউ</span>
            {downloadSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full ml-2">
                <CheckCircle2 className="w-3 h-3" />
                সফলভাবে প্রস্তুত হয়েছে!
              </span>
            )}
            {errorMessage && (
              <span className="inline-flex items-center gap-1 text-xs text-rose-300 bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded-full ml-2">
                <AlertCircle className="w-3 h-3" />
                {errorMessage}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenInNativePdfViewer}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="প্রিন্ট করুন বা PDF হিসেবে সংরক্ষণ করুন"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>{isGeneratingPdf ? 'প্রস্তুত হচ্ছে...' : 'PDF ভিউয়ার ও প্রিন্ট'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* রিপোর্টের প্রিভিউ (A4) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-stone-100/60 print:bg-white print:p-0">
          <div
            style={{
              backgroundColor: '#ffffff',
              color: '#111827',
              fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif",
            }}
            className="border border-stone-300 print:border-none p-6 sm:p-10 shadow-sm rounded-xl max-w-[210mm] mx-auto print:shadow-none print:max-w-full"
          >
            {/* ১. শিরোনাম */}
            <div
              style={{ borderBottom: '2px solid #064e3b' }}
              className="text-center pb-3"
            >
              <h1
                style={{ color: '#064e3b' }}
                className="text-2xl sm:text-3xl font-black tracking-tight"
              >
                ভূমিসেবা.বাংলা
              </h1>
              <h2
                style={{ color: '#111827' }}
                className="text-base sm:text-lg font-bold mt-1"
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  style={{ color: '#4b5563' }}
                  className="text-xs mt-0.5 font-medium"
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* ২. রেফারেন্স (ঐচ্ছিক) ও তারিখ */}
            <div
              style={{ borderBottom: '1px solid #e5e7eb', color: '#1f2937' }}
              className="flex items-center justify-between text-xs font-bold py-2.5"
            >
              <div className="flex items-center gap-1">
                <span>রেফারেন্স:</span>
                <input
                  type="text"
                  value={smarakNo}
                  placeholder="ঐচ্ছিক"
                  onChange={(e) => setSmarakNo(e.target.value)}
                  style={{
                    color: '#111827',
                    borderBottom: '1px dashed #9ca3af',
                    backgroundColor: 'transparent',
                  }}
                  className="px-1 py-0.5 font-bold w-56 sm:w-64 focus:outline-none"
                  title="ইচ্ছা হলে রেফারেন্স লিখুন; ফাঁকা থাকলে রিপোর্টে আসবে না"
                />
              </div>

              <div className="flex items-center gap-1">
                <span>তারিখ:</span>
                <input
                  type="text"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  style={{
                    color: '#111827',
                    borderBottom: '1px dashed #9ca3af',
                    backgroundColor: 'transparent',
                  }}
                  className="px-1 py-0.5 font-bold text-right w-36 sm:w-44 focus:outline-none"
                  title="তারিখ পরিবর্তন করতে পারেন"
                />
              </div>
            </div>

            {/* ৩.১ খতিয়ান নম্বর (থাকলে) */}
            {khatianNo && (
              <div className="pt-3 pb-1.5 text-center">
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1.5px solid #a7f3d0',
                    color: '#064e3b',
                  }}
                  className="inline-block px-6 py-1 rounded-lg shadow-2xs"
                >
                  <span className="text-base sm:text-lg font-black tracking-wide">
                    {getKhatianLabel(khatianType, khatianNo)}
                  </span>
                </div>
              </div>
            )}

            {/* ৩.২ ঠিকানা (থাকলে) */}
            {(division || district || upazila || mouza || jlNo) && (
              <div
                style={{
                  backgroundColor: '#f9fafb',
                  borderColor: '#d1d5db',
                  color: '#1f2937',
                }}
                className="mt-1 mb-3.5 p-2 rounded-lg border text-xs font-medium"
              >
                <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 leading-relaxed text-center">
                  {division && (
                    <div>
                      <span style={{ color: '#6b7280' }} className="font-semibold">বিভাগ:</span>{' '}
                      <span style={{ color: '#111827' }} className="font-bold">{division}</span>
                    </div>
                  )}
                  {district && (
                    <>
                      <span style={{ color: '#d1d5db' }} className="hidden sm:inline">•</span>
                      <div>
                        <span style={{ color: '#6b7280' }} className="font-semibold">জেলা:</span>{' '}
                        <span style={{ color: '#111827' }} className="font-bold">{district}</span>
                      </div>
                    </>
                  )}
                  {upazila && (
                    <>
                      <span style={{ color: '#d1d5db' }} className="hidden sm:inline">•</span>
                      <div>
                        <span style={{ color: '#6b7280' }} className="font-semibold">উপজেলা:</span>{' '}
                        <span style={{ color: '#111827' }} className="font-bold">{upazila}</span>
                      </div>
                    </>
                  )}
                  {mouza && mouza !== '—' && (
                    <>
                      <span style={{ color: '#d1d5db' }} className="hidden sm:inline">•</span>
                      <div>
                        <span style={{ color: '#6b7280' }} className="font-semibold">মৌজা:</span>{' '}
                        <span style={{ color: '#111827' }} className="font-bold">{mouza}</span>
                      </div>
                    </>
                  )}
                  {jlNo && (
                    <>
                      <span style={{ color: '#d1d5db' }} className="hidden sm:inline">•</span>
                      <div>
                        <span style={{ color: '#6b7280' }} className="font-semibold">জে.এল. নং:</span>{' '}
                        <span style={{ color: '#111827' }} className="font-bold">{toBengaliDigits(jlNo)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ৪. সারণী */}
            <div
              style={{ borderColor: '#d1d5db' }}
              className="border rounded-lg overflow-hidden my-3.5"
            >
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#111827',
                      borderBottom: '1px solid #d1d5db',
                    }}
                    className="font-bold text-center"
                  >
                    <th
                      style={{ borderRight: '1px solid #d1d5db', width: '56px' }}
                      rowSpan={2}
                      className="py-2.5 px-2 text-center"
                    >
                      ক্রমিক নং
                    </th>
                    <th
                      style={{ borderRight: '1px solid #d1d5db', minWidth: '190px' }}
                      rowSpan={2}
                      className="py-2.5 px-3 text-left"
                    >
                      মালিক পরিচিতি
                    </th>
                    <th
                      style={{
                        borderBottom: '1px solid #d1d5db',
                        borderRight: '1px solid #d1d5db',
                        backgroundColor: '#e5e7eb',
                      }}
                      colSpan={shareColSpan}
                      className="py-1.5 px-2 text-center"
                    >
                      অংশ
                    </th>
                    <th
                      style={{
                        backgroundColor: '#ecfdf5',
                        color: '#064e3b',
                        minWidth: '130px',
                      }}
                      rowSpan={2}
                      className="py-2.5 px-3 text-right"
                    >
                      প্রাপ্ত জমি ({landUnit})
                    </th>
                  </tr>
                  <tr
                    style={{
                      backgroundColor: '#fef3c7',
                      color: '#1f2937',
                      borderBottom: '1px solid #d1d5db',
                    }}
                    className="font-bold text-center"
                  >
                    <th
                      style={{ borderRight: '1px solid #d1d5db', width: '176px' }}
                      className="py-1.5 px-2 text-center"
                    >
                      ১=১৬ আনা
                    </th>
                    {showShare1 && (
                      <th
                        style={{ borderRight: '1px solid #d1d5db', width: '80px' }}
                        className="py-1.5 px-2 text-right pr-3"
                      >
                        ১.০০০
                      </th>
                    )}
                    <th
                      style={{ borderRight: '1px solid #d1d5db', width: '128px' }}
                      className="py-1.5 px-2 text-right pr-3"
                    >
                      {label1000}
                    </th>
                  </tr>
                </thead>
                <tbody style={{ borderColor: '#e5e7eb' }}>
                  {rows.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{ borderBottom: '1px solid #e5e7eb' }}
                      className="hover:bg-stone-50 transition-colors"
                    >
                      <td
                        style={{ borderRight: '1px solid #e5e7eb', color: '#4b5563' }}
                        className="py-2 px-2 text-center font-bold"
                      >
                        {toBengaliDigits(idx + 1)}
                      </td>

                      <td
                        style={{ borderRight: '1px solid #e5e7eb' }}
                        className="py-2 px-3 text-left"
                      >
                        <div
                          style={{ color: '#111827' }}
                          className="font-bold text-[13px]"
                        >
                          {row.name || 'অজ্ঞাত অংশীদার'}
                        </div>
                        {row.parentage && (
                          <div
                            style={{ color: '#4b5563' }}
                            className="text-[10px] font-medium mt-0.5"
                          >
                            {row.parentage}
                          </div>
                        )}
                        {!row.parentage && row.remarks && (
                          <div
                            style={{ color: '#6b7280' }}
                            className="text-[10px] font-medium mt-0.5"
                          >
                            {row.remarks}
                          </div>
                        )}
                      </td>

                      <td
                        style={{ borderRight: '1px solid #e5e7eb', color: '#1f2937' }}
                        className="py-2 px-2.5 text-left font-semibold"
                      >
                        {toBengaliDigits(row.shareFraction)}
                      </td>

                      {showShare1 && (
                        <td
                          style={{ borderRight: '1px solid #e5e7eb', color: '#064e3b' }}
                          className="py-2 px-3 text-right font-bold"
                        >
                          {row.share1 ?? '—'}
                        </td>
                      )}

                      <td
                        style={{ borderRight: '1px solid #e5e7eb', color: '#064e3b' }}
                        className="py-2 px-3 text-right font-bold"
                      >
                        {row.share1000}
                      </td>

                      <td
                        style={{
                          backgroundColor: '#f0fdf4',
                          color: '#064e3b',
                        }}
                        className="py-2 px-3 text-right font-bold"
                      >
                        {row.landAmount !== '—' ? (
                          <div className="flex items-baseline justify-end gap-1">
                            <span>{row.landAmount}</span>
                            <span style={{ color: '#047857' }} className="text-[10px] font-normal">{landUnit}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* সর্বমোট সারি */}
                  <tr
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#111827',
                      borderTop: '2px solid #9ca3af',
                    }}
                    className="font-bold"
                  >
                    <td
                      style={{ borderRight: '1px solid #d1d5db' }}
                      colSpan={2}
                      className="py-2.5 px-3 text-left"
                    >
                      সর্বমোট হিস্যা ও মোট জমি
                    </td>
                    <td
                      style={{ borderRight: '1px solid #d1d5db' }}
                      className="py-2.5 px-2.5 text-left text-xs font-semibold"
                    >
                      {finalTotalTraditional}
                    </td>
                    {showShare1 && (
                      <td
                        style={{ borderRight: '1px solid #d1d5db', color: '#064e3b' }}
                        className="py-2.5 px-3 text-right font-bold text-sm"
                      >
                        {finalTotalShare1}
                      </td>
                    )}
                    <td
                      style={{ borderRight: '1px solid #d1d5db', color: '#064e3b' }}
                      className="py-2.5 px-3 text-right font-bold text-sm"
                    >
                      {finalTotalShare1000}
                    </td>
                    <td
                      style={{
                        backgroundColor: '#d1fae5',
                        color: '#064e3b',
                      }}
                      className="py-2.5 px-3 text-right font-bold text-sm"
                    >
                      <div className="flex items-baseline justify-end gap-1">
                        <span>{finalTotalLand}</span>
                        <span style={{ color: '#065f46' }} className="text-[10px] font-semibold">{landUnit}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ৫. সমন্বয়ের নোট (আউল/রদ হলে) */}
            {adjustmentNote && (
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  borderColor: '#fcd34d',
                  color: '#78350f',
                }}
                className="p-2.5 mb-3 rounded border text-[11px] font-medium leading-relaxed"
              >
                {adjustmentNote}
              </div>
            )}

            {/* ৬. সতর্কবার্তা */}
            <div
              style={{
                backgroundColor: '#ecfdf5',
                borderColor: '#a7f3d0',
                color: '#064e3b',
              }}
              className="p-2.5 rounded border text-[11px] font-medium leading-relaxed"
            >
              {DISCLAIMER_TEXT}
            </div>

            {/* ৭. স্বাক্ষরের ঘর */}
            <div className="grid grid-cols-2 gap-16 pt-12 text-xs">
              <div
                style={{ borderTop: '1px solid #9ca3af' }}
                className="text-center pt-2 space-y-0.5"
              >
                <div style={{ color: '#111827' }} className="font-bold text-sm">প্রস্তুতকারী</div>
                <div style={{ color: '#6b7280' }} className="text-[10px] font-medium">স্বাক্ষর ও তারিখ</div>
              </div>
              <div />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintCertificateModal;
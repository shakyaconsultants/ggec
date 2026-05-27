import { invoiceNumber } from "@/lib/invoice";

const INVOICE_PRINT_STYLES = `
  @page { size: A4 portrait; margin: 12mm; }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff !important;
    color: #111111;
    font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .g-invoice {
    border: 1px solid #d4d4d8;
    border-radius: 0;
    background: #ffffff;
    color: #18181b;
    padding: 0;
    box-shadow: none;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .g-invoice-header { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .g-invoice-brand { margin: 0; font-size: 1.15rem; font-weight: 700; color: #065f46; }
  .g-invoice-sub { margin: 0.2rem 0 0; font-size: 0.78rem; color: #71717a; }
  .g-invoice-meta { text-align: right; }
  .g-invoice-label { margin: 0; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #71717a; }
  .g-invoice-number { margin: 0.15rem 0 0; font-size: 1rem; font-weight: 700; color: #18181b; }
  .g-invoice-date { margin: 0.15rem 0 0; font-size: 0.82rem; color: #52525b; }
  .g-invoice-divider { height: 1px; background: #e4e4e7; margin: 1rem 0; }
  .g-invoice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .g-invoice-section-title { margin: 0; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #71717a; }
  .g-invoice-name { margin: 0.35rem 0 0; font-weight: 700; color: #18181b; }
  .g-invoice-detail { margin: 0.2rem 0 0; font-size: 0.84rem; color: #52525b; }
  .g-invoice-table { width: 100%; border-collapse: collapse; margin-top: 1.1rem; font-size: 0.86rem; }
  .g-invoice-table th, .g-invoice-table td { padding: 0.55rem 0.35rem; text-align: left; border-bottom: 1px solid #e4e4e7; }
  .g-invoice-table th { font-size: 0.72rem; text-transform: uppercase; color: #71717a; background: #f4f4f5; }
  .g-invoice-table th:last-child, .g-invoice-table td:last-child { text-align: right; }
  .g-invoice-subtotal td { color: #52525b; font-size: 0.84rem; }
  .g-invoice-total { font-weight: 700; font-size: 1rem; color: #065f46; }
  .g-invoice-footer { margin: 1rem 0 0; font-size: 0.78rem; color: #71717a; line-height: 1.5; }
  .g-invoice-actions, .g-no-print { display: none !important; }
  .font-display { font-family: Georgia, "Times New Roman", serif; }
`;

function buildPrintHtml(billId: string, invoiceHtml: string): string {
  const title = invoiceNumber(billId);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="color-scheme" content="light" />
  <title>Invoice ${title}</title>
  <style>${INVOICE_PRINT_STYLES}</style>
</head>
<body>${invoiceHtml}</body>
</html>`;
}

/** Print invoice in a hidden iframe — one white page, no new tab, no duplicate pages. */
export function printInvoice(billId: string): boolean {
  const invoiceEl = document.getElementById(`invoice-${billId}`);
  if (!invoiceEl) return false;

  const clone = invoiceEl.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(".g-invoice-actions, .g-no-print").forEach((el) => el.remove());

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.title = "Invoice print";
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    iframe.remove();
    return false;
  }

  doc.open();
  doc.write(buildPrintHtml(billId, clone.outerHTML));
  doc.close();

  let finished = false;
  const cleanup = () => {
    if (finished) return;
    finished = true;
    setTimeout(() => iframe.remove(), 300);
  };

  let printed = false;
  const triggerPrint = () => {
    if (printed || finished) return;
    printed = true;
    win.focus();
    win.print();
    win.onafterprint = cleanup;
    setTimeout(cleanup, 2000);
  };

  iframe.onload = () => {
    requestAnimationFrame(triggerPrint);
  };

  // Fallback if onload already fired during doc.write
  setTimeout(triggerPrint, 400);

  return true;
}

import PDFDocument from "pdfkit";
import { BRAND_FULL_NAME } from "@/lib/brand";
import { getStationLabel, techLineTotal } from "@/lib/catalog";
import { lineTotal } from "@/lib/food";
import { formatDateTime, formatMoney, invoiceNumber } from "@/lib/invoice";
import { formatDuration, GAMING_RATE_LABEL } from "@/lib/pricing";
import type { Bill } from "@/lib/types";

function collectPdfBuffer(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

export async function generateInvoicePdf(bill: Bill): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 48 });
  const bufferPromise = collectPdfBuffer(doc);

  const number = invoiceNumber(bill.id);
  const foodItems = bill.foodItems ?? [];
  const techItems = bill.techItems ?? [];
  const stationLabel = getStationLabel(bill);

  doc.fontSize(20).fillColor("#111111").text(BRAND_FULL_NAME, { continued: false });
  doc.fontSize(10).fillColor("#666666").text("Premium gaming cafe & lounge");
  doc.moveDown(0.5);
  doc.fontSize(14).fillColor("#111111").text(`Invoice ${number}`);
  doc.fontSize(10).fillColor("#666666").text(formatDateTime(bill.endedAt ?? bill.createdAt));
  doc.moveDown(1);

  doc.fontSize(11).fillColor("#111111").text("Billed to", { underline: true });
  doc.fontSize(10).fillColor("#333333");
  doc.text(bill.customerName);
  doc.text(bill.phone);
  if (bill.locality) doc.text(bill.locality);
  doc.moveDown(0.75);

  doc.fontSize(11).fillColor("#111111").text("Session", { underline: true });
  doc.fontSize(10).fillColor("#333333");
  doc.text(stationLabel);
  if (bill.extraSpecs) doc.text(`Notes: ${bill.extraSpecs}`);
  doc.text(`Start: ${formatDateTime(bill.startedAt)}`);
  if (bill.endedAt) doc.text(`End: ${formatDateTime(bill.endedAt)}`);
  doc.text(`Duration: ${formatDuration(bill.durationHours)}`);
  doc.moveDown(1);

  const tableTop = doc.y;
  const colDesc = 48;
  const colQty = 280;
  const colRate = 360;
  const colAmount = 460;

  doc.fontSize(10).fillColor("#111111");
  doc.text("Description", colDesc, tableTop);
  doc.text("Qty / Time", colQty, tableTop);
  doc.text("Rate", colRate, tableTop);
  doc.text("Amount", colAmount, tableTop);
  doc.moveTo(48, tableTop + 14).lineTo(547, tableTop + 14).strokeColor("#cccccc").stroke();

  let rowY = tableTop + 22;
  doc.fontSize(10).fillColor("#333333");
  doc.text(`Gaming — ${stationLabel}`, colDesc, rowY, { width: 220 });
  doc.text(formatDuration(bill.durationHours), colQty, rowY);
  doc.text(GAMING_RATE_LABEL, colRate, rowY);
  doc.text(formatMoney(bill.gamingAmount), colAmount, rowY);
  rowY += 20;

  for (const line of techItems) {
    doc.text(line.name, colDesc, rowY, { width: 220 });
    doc.text(String(line.quantity), colQty, rowY);
    doc.text(formatMoney(line.unitPrice), colRate, rowY);
    doc.text(formatMoney(techLineTotal(line)), colAmount, rowY);
    rowY += 20;
  }

  for (const line of foodItems) {
    doc.text(line.name, colDesc, rowY, { width: 220 });
    doc.text(String(line.quantity), colQty, rowY);
    doc.text(formatMoney(line.unitPrice), colRate, rowY);
    doc.text(formatMoney(lineTotal(line)), colAmount, rowY);
    rowY += 20;
  }

  rowY += 8;
  doc.moveTo(48, rowY).lineTo(547, rowY).strokeColor("#cccccc").stroke();
  rowY += 12;

  if (foodItems.length > 0 || techItems.length > 0) {
    doc.text("Gaming subtotal", colRate, rowY);
    doc.text(formatMoney(bill.gamingAmount), colAmount, rowY);
    rowY += 16;
    if (techItems.length > 0) {
      doc.text("Extras subtotal", colRate, rowY);
      doc.text(formatMoney(bill.techTotal), colAmount, rowY);
      rowY += 16;
    }
    if (foodItems.length > 0) {
      doc.text("Food subtotal", colRate, rowY);
      doc.text(formatMoney(bill.foodTotal), colAmount, rowY);
      rowY += 16;
    }
  }

  doc.fontSize(12).fillColor("#111111").text("Total due", colRate, rowY);
  doc.text(formatMoney(bill.amount), colAmount, rowY);

  doc.moveDown(2);
  doc.fontSize(10).fillColor("#666666").text(
    `Thank you for visiting ${BRAND_FULL_NAME}. We hope to see you again soon!`,
    { align: "center" }
  );

  doc.end();
  return bufferPromise;
}

export function invoicePdfFilename(bill: Bill): string {
  return `${invoiceNumber(bill.id)}.pdf`;
}

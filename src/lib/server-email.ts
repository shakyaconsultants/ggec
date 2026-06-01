import nodemailer from "nodemailer";
import { BRAND_FULL_NAME, BRAND_NAME } from "@/lib/brand";
import { env } from "@/lib/env";
import { lineTotal } from "@/lib/food";
import { formatDateTime, formatMoney, invoiceNumber } from "@/lib/invoice";
import { formatDuration, GAME_LABELS, GAMING_PRICING_SUMMARY } from "@/lib/pricing";
import type { Bill } from "@/lib/types";
type WelcomeEmailInput = {
  name: string;
  email: string;
  phone: string;
  locality: string;
  password: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const EMAIL_PAGE_BG = "#f3f4f6";

function emailDocumentShell(title: string, innerCardHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${EMAIL_PAGE_BG};color:#374151;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${EMAIL_PAGE_BG}" style="background-color:${EMAIL_PAGE_BG};padding:32px 16px;">
    <tr>
      <td align="center" bgcolor="${EMAIL_PAGE_BG}" style="background-color:${EMAIL_PAGE_BG};">
        ${innerCardHtml}
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildWelcomeEmailHtml(input: WelcomeEmailInput): string {
  const loginUrl = `${env.appUrl().replace(/\/$/, "")}/login`;
  const name = escapeHtml(input.name);
  const email = escapeHtml(input.email);
  const phone = escapeHtml(input.phone);
  const locality = escapeHtml(input.locality || "—");
  const password = escapeHtml(input.password);

  return emailDocumentShell(
    `Welcome to ${escapeHtml(BRAND_NAME)}`,
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 20px;background:linear-gradient(135deg,#065f46 0%,#18181b 100%);">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6ee7b7;">${escapeHtml(BRAND_FULL_NAME)}</p>
              <h1 style="margin:0;font-size:28px;line-height:1.2;color:#fafafa;">Welcome, ${name}!</h1>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#d4d4d8;">
                Your player profile has been created. You can sign in anytime to view your stats, session history, and invoices.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;">
              <h2 style="margin:0 0 12px;font-size:16px;color:#fafafa;">Your profile</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #27272a;border-radius:12px;overflow:hidden;">
                <tr><td style="padding:12px 14px;background:#09090b;color:#a1a1aa;width:120px;">Name</td><td style="padding:12px 14px;background:#09090b;color:#fafafa;font-weight:600;">${name}</td></tr>
                <tr><td style="padding:12px 14px;background:#18181b;color:#a1a1aa;">Email</td><td style="padding:12px 14px;background:#18181b;color:#fafafa;font-weight:600;">${email}</td></tr>
                <tr><td style="padding:12px 14px;background:#09090b;color:#a1a1aa;">Phone</td><td style="padding:12px 14px;background:#09090b;color:#fafafa;font-weight:600;">${phone}</td></tr>
                <tr><td style="padding:12px 14px;background:#18181b;color:#a1a1aa;">Locality</td><td style="padding:12px 14px;background:#18181b;color:#fafafa;font-weight:600;">${locality}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;">
              <h2 style="margin:0 0 12px;font-size:16px;color:#fafafa;">Login details</h2>
              <div style="padding:16px;border:1px solid #27272a;border-radius:12px;background:#09090b;">
                <p style="margin:0 0 8px;font-size:14px;color:#a1a1aa;">Email</p>
                <p style="margin:0 0 16px;font-size:15px;color:#fafafa;font-weight:600;">${email}</p>
                <p style="margin:0 0 8px;font-size:14px;color:#a1a1aa;">Temporary password</p>
                <p style="margin:0;font-size:18px;color:#34d399;font-weight:700;letter-spacing:0.04em;">${password}</p>
              </div>
              <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#a1a1aa;">
                For your security, change this password after your first login from your profile page.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;" align="center">
              <a href="${loginUrl}" style="display:inline-block;padding:14px 24px;background:#10b981;color:#022c22;text-decoration:none;font-weight:700;border-radius:999px;font-size:15px;">
                Sign in to ${escapeHtml(BRAND_NAME)}
              </a>
              <p style="margin:16px 0 0;font-size:13px;color:#71717a;">
                Or visit <a href="${loginUrl}" style="color:#34d399;">${escapeHtml(loginUrl)}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid #27272a;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#71717a;text-align:center;">
                ${escapeHtml(BRAND_FULL_NAME)} · This email was sent because an admin created your player profile.
              </p>
            </td>
          </tr>
        </table>`
  );
}

function buildWelcomeEmailText(input: WelcomeEmailInput): string {
  const loginUrl = `${env.appUrl().replace(/\/$/, "")}/login`;

  return [
    `Welcome to ${BRAND_FULL_NAME}, ${input.name}!`,
    "",
    "Your player profile has been created.",
    "",
    "Profile details:",
    `- Name: ${input.name}`,
    `- Email: ${input.email}`,
    `- Phone: ${input.phone}`,
    `- Locality: ${input.locality || "—"}`,
    "",
    "Login details:",
    `- Email: ${input.email}`,
    `- Temporary password: ${input.password}`,
    "",
    "Sign in and change your password from your profile page:",
    loginUrl,
    "",
    BRAND_FULL_NAME,
  ].join("\n");
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: env.smtpHost(),
    port: env.smtpPort(),
    secure: env.smtpSecure(),
    auth: {
      user: env.smtpUser(),
      pass: env.smtpPass(),
    },
  });

  return transporter;
}

export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<void> {
  const transport = getTransporter();
  const subject = `Welcome to ${BRAND_NAME} — your player profile is ready`;

  await transport.sendMail({
    from: env.emailFrom(),
    to: input.email,
    subject,
    text: buildWelcomeEmailText(input),
    html: buildWelcomeEmailHtml(input),
  });
}

type SessionInvoiceEmailInput = {
  bill: Bill;
  email: string;
};

function buildSessionInvoiceEmailHtml(bill: Bill, email: string): string {
  const appUrl = env.appUrl().replace(/\/$/, "");
  const loginUrl = `${appUrl}/login`;
  const profileUrl = `${appUrl}/my-profile`;
  const number = invoiceNumber(bill.id);
  const name = escapeHtml(bill.customerName);
  const customerEmail = escapeHtml(email);
  const foodItems = bill.foodItems ?? [];
  const hasFood = foodItems.length > 0;

  const lineRows = [
    `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #27272a;color:#e4e4e7;">Gaming — ${escapeHtml(GAME_LABELS[bill.gameType])}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #27272a;color:#a1a1aa;">${escapeHtml(formatDuration(bill.durationHours))}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #27272a;color:#a1a1aa;text-align:right;">${escapeHtml(formatMoney(bill.gamingAmount))}</td>
    </tr>`,
    ...foodItems.map(
      (line) => `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #27272a;color:#e4e4e7;">${escapeHtml(line.name)} ×${line.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #27272a;color:#a1a1aa;">${escapeHtml(formatMoney(line.unitPrice))} each</td>
      <td style="padding:10px 12px;border-bottom:1px solid #27272a;color:#a1a1aa;text-align:right;">${escapeHtml(formatMoney(lineTotal(line)))}</td>
    </tr>`
    ),
  ].join("");

  return emailDocumentShell(
    `Invoice ${escapeHtml(number)}`,
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 20px;background:linear-gradient(135deg,#065f46 0%,#18181b 100%);">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6ee7b7;">${escapeHtml(BRAND_FULL_NAME)}</p>
              <h1 style="margin:0;font-size:28px;line-height:1.2;color:#fafafa;">Thank you, ${name}!</h1>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#d4d4d8;">
                Your session has ended. Here is your invoice summary — we loved having you at the cafe.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 12px;">
              <h2 style="margin:0 0 12px;font-size:16px;color:#fafafa;">Invoice summary</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:0 0 12px;">
                    <p style="margin:0;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;">Invoice</p>
                    <p style="margin:4px 0 0;font-size:20px;color:#fafafa;font-weight:700;">${escapeHtml(number)}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#a1a1aa;">${escapeHtml(formatDateTime(bill.endedAt ?? bill.createdAt))}</p>
                  </td>
                  <td style="padding:0 0 12px;text-align:right;">
                    <p style="margin:0;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.08em;">Total</p>
                    <p style="margin:4px 0 0;font-size:24px;color:#34d399;font-weight:700;">${escapeHtml(formatMoney(bill.amount))}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #27272a;border-radius:12px;overflow:hidden;">
                <tr style="background:#111115;">
                  <th align="left" style="padding:10px 12px;font-size:11px;color:#71717a;text-transform:uppercase;">Item</th>
                  <th align="left" style="padding:10px 12px;font-size:11px;color:#71717a;text-transform:uppercase;">Details</th>
                  <th align="right" style="padding:10px 12px;font-size:11px;color:#71717a;text-transform:uppercase;">Amount</th>
                </tr>
                ${lineRows}
                <tr style="background:#09090b;">
                  <td colspan="2" style="padding:12px;font-size:14px;color:#fafafa;font-weight:700;">Total due</td>
                  <td style="padding:12px;font-size:14px;color:#34d399;font-weight:700;text-align:right;">${escapeHtml(formatMoney(bill.amount))}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;">
              <h2 style="margin:0 0 12px;font-size:16px;color:#fafafa;">Session details</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #27272a;border-radius:12px;overflow:hidden;">
                <tr><td style="padding:12px 14px;background:#09090b;color:#a1a1aa;width:120px;">Station</td><td style="padding:12px 14px;background:#09090b;color:#fafafa;font-weight:600;">${escapeHtml(GAME_LABELS[bill.gameType])}</td></tr>
                <tr><td style="padding:12px 14px;background:#18181b;color:#a1a1aa;">Duration</td><td style="padding:12px 14px;background:#18181b;color:#fafafa;font-weight:600;">${escapeHtml(formatDuration(bill.durationHours))}</td></tr>
                <tr><td style="padding:12px 14px;background:#09090b;color:#a1a1aa;">Gaming rate</td><td style="padding:12px 14px;background:#09090b;color:#fafafa;font-weight:600;">${escapeHtml(GAMING_PRICING_SUMMARY)}</td></tr>
                <tr><td style="padding:12px 14px;background:#18181b;color:#a1a1aa;">Gaming subtotal</td><td style="padding:12px 14px;background:#18181b;color:#fafafa;font-weight:600;">${escapeHtml(formatMoney(bill.gamingAmount))}</td></tr>
                ${hasFood ? `<tr><td style="padding:12px 14px;background:#09090b;color:#a1a1aa;">Food total</td><td style="padding:12px 14px;background:#09090b;color:#fafafa;font-weight:600;">${escapeHtml(formatMoney(bill.foodTotal))}</td></tr>` : ""}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;">
              <h2 style="margin:0 0 12px;font-size:16px;color:#fafafa;">Need a PDF invoice?</h2>
              <div style="padding:16px;border:1px solid #27272a;border-radius:12px;background:#09090b;">
                <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#d4d4d8;">
                  Visit our website, sign in with your email and password, and open your profile to view session history and print or save your invoice as a PDF.
                </p>
                <p style="margin:0 0 8px;font-size:14px;color:#a1a1aa;">Website</p>
                <p style="margin:0 0 16px;font-size:15px;color:#34d399;font-weight:600;">
                  <a href="${escapeHtml(appUrl)}" style="color:#34d399;text-decoration:none;">${escapeHtml(appUrl)}</a>
                </p>
                <p style="margin:0 0 8px;font-size:14px;color:#a1a1aa;">Sign in with</p>
                <p style="margin:0;font-size:15px;color:#fafafa;font-weight:600;">${customerEmail}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;" align="center">
              <a href="${loginUrl}" style="display:inline-block;padding:14px 24px;background:#10b981;color:#022c22;text-decoration:none;font-weight:700;border-radius:999px;font-size:15px;">
                Sign in to ${escapeHtml(BRAND_NAME)}
              </a>
              <p style="margin:16px 0 0;font-size:13px;color:#71717a;">
                Or visit <a href="${loginUrl}" style="color:#34d399;">${escapeHtml(loginUrl)}</a>
              </p>
              <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#a1a1aa;text-align:center;">
                Thanks for playing at ${escapeHtml(BRAND_NAME)} — see you for the next session!
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid #27272a;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#71717a;text-align:center;">
                ${escapeHtml(BRAND_FULL_NAME)} · Invoice ${escapeHtml(number)} · <a href="${profileUrl}" style="color:#34d399;">View on website</a>
              </p>
            </td>
          </tr>
        </table>`
  );
}

function buildSessionInvoiceEmailText(bill: Bill, email: string): string {
  const appUrl = env.appUrl().replace(/\/$/, "");
  const loginUrl = `${appUrl}/login`;
  const number = invoiceNumber(bill.id);
  const lines = [
    `Thank you for visiting ${BRAND_FULL_NAME}, ${bill.customerName}!`,
    "",
    "Your session has ended. Here is your invoice summary:",
    "",
    `Invoice: ${number}`,
    `Date: ${formatDateTime(bill.endedAt ?? bill.createdAt)}`,
    `Station: ${GAME_LABELS[bill.gameType]}`,
    `Duration: ${formatDuration(bill.durationHours)}`,
    `Gaming: ${formatMoney(bill.gamingAmount)}`,
  ];

  if (bill.foodItems.length) {
    lines.push(`Food: ${formatMoney(bill.foodTotal)}`);
    for (const item of bill.foodItems) {
      lines.push(`  - ${item.name} ×${item.quantity}: ${formatMoney(lineTotal(item))}`);
    }
  }

  lines.push(
    `Total: ${formatMoney(bill.amount)}`,
    "",
    "Need a PDF invoice?",
    `Visit ${appUrl}, sign in with your email (${email}) and password, then open your profile to view and print your invoice.`,
    "",
    `Sign in: ${loginUrl}`,
    "",
    `We hope to see you again soon at ${BRAND_NAME}!`,
    BRAND_FULL_NAME
  );

  return lines.join("\n");
}

export async function sendSessionInvoiceEmail(input: SessionInvoiceEmailInput): Promise<void> {
  const { bill, email } = input;
  const transport = getTransporter();
  const number = invoiceNumber(bill.id);
  const subject = `Your ${BRAND_NAME} invoice ${number} — thank you!`;

  await transport.sendMail({
    from: env.emailFrom(),
    to: email,
    subject,
    text: buildSessionInvoiceEmailText(bill, email),
    html: buildSessionInvoiceEmailHtml(bill, email),
  });
}

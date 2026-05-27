function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not set. Add it to your .env file.`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

export const env = {
  mongodbUri: () => requireEnv("MONGODB_URI"),
  mongodbDbName: () => optionalEnv("MONGODB_DB_NAME", "ggec"),
  seedStaffEmail: () => requireEnv("SEED_STAFF_EMAIL"),
  seedStaffPassword: () => requireEnv("SEED_STAFF_PASSWORD"),
  defaultUserPassword: () => requireEnv("DEFAULT_USER_PASSWORD"),
  appUrl: () => requireEnv("APP_URL"),
  smtpHost: () => requireEnv("SMTP_HOST"),
  smtpPort: () => Number(optionalEnv("SMTP_PORT", "587")),
  smtpSecure: () => optionalEnv("SMTP_SECURE", "false") === "true",
  smtpUser: () => requireEnv("SMTP_USER"),
  smtpPass: () => requireEnv("SMTP_PASS"),
  emailFrom: () => requireEnv("EMAIL_FROM"),
};

export function getPublicDefaultUserPassword(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_USER_PASSWORD?.trim() ?? "";
}

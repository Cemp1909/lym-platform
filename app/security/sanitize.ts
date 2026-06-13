type SanitizeOptions = {
  maxLength?: number;
  preserveNewLines?: boolean;
};

const invisibleControlChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const htmlTags = /<[^>]*>/g;

export function sanitizeText(value: string, options: SanitizeOptions = {}) {
  const maxLength = options.maxLength ?? 180;
  const whitespace = options.preserveNewLines ? /[^\S\r\n]+/g : /\s+/g;

  return value
    .replace(invisibleControlChars, "")
    .replace(htmlTags, "")
    .replace(whitespace, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeLongText(value: string, maxLength = 600) {
  return sanitizeText(value, { maxLength, preserveNewLines: true });
}

export function sanitizeEmail(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._%+\-@]/g, "")
    .slice(0, 120);
}

export function sanitizePhone(value: string) {
  return value.replace(/[^\d+\s()-]/g, "").replace(/\s+/g, " ").trim().slice(0, 32);
}

export function sanitizeOrderCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 24);
}

export function sanitizeMoneyLike(value: string) {
  return value.replace(/[^\d.,$%\sA-Za-z]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
}

export function sanitizeImagePath(value: string) {
  const cleanValue = value.trim().replace(/\\/g, "/").replace(/[^a-zA-Z0-9/_\-.:%]/g, "");

  if (
    cleanValue.startsWith("/products/") ||
    cleanValue.startsWith("/brand/") ||
    cleanValue.startsWith("blob:") ||
    cleanValue.startsWith("https://")
  ) {
    return cleanValue.slice(0, 260);
  }

  return "/brand/logo.png";
}

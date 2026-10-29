// ─── WhatsApp links ───────────────────────────────────────────────────────────
export const createWhatsAppLink = (
  number: string,
  message: string,
): string | null => {
  if (!/^\d{8,15}$/.test(number)) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

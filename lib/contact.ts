/** Link de WhatsApp com mensagem pronta. `phone` só com dígitos, com DDI (ex.: 5511999999999). */
export function whatsappLink(phone: string, message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${phone.replace(/\D/g, "")}${text}`;
}

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

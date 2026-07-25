// Lógica pura del mensaje de WhatsApp y del formato de precios.
// Está en JS plano para poder testearla con `node --test` sin build ni deps.

export function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0)
}

export function cartTotal(items) {
  return items.reduce((acc, i) => acc + Number(i.price) * i.qty, 0)
}

/** items: [{ name, price, qty }] */
export function buildMessage({ name, city, items }) {
  const lines = items.map(
    (i) => `- ${i.name}${i.qty > 1 ? ` x${i.qty}` : ''} (${formatPrice(i.price * i.qty)})`
  )
  return [
    `Hola! Mi nombre es ${name || '...'},`,
    `soy de: ${city || '...'}`,
    `y me gustaría preguntarte por:`,
    ...lines,
    ``,
    `El total sería: ${formatPrice(cartTotal(items))}`,
  ].join('\n')
}

export function waLink(phone, text) {
  return `https://wa.me/${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}

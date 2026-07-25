// Único lugar para tocar datos del negocio.
export const BRAND = {
  name: 'Luné',
  tagline: 'Beauty',
  // Formato internacional sin +, sin espacios, sin guiones. Ej: 5493511234567
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? '5490000000000',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? 'https://instagram.com/lune.beauty',
  currency: 'ARS',
}

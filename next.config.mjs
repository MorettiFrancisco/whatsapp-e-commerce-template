/** @type {import('next').NextConfig} */
// ponytail: remotePatterns wide open porque las fotos las sube la dueña a Vercel Blob
// o pega URLs de proveedores. Restringir a hosts fijos si algún día importa.
export default {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
}

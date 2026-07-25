/** @type {import('next').NextConfig} */
// ponytail: remotePatterns wide open porque las fotos las sube la dueña a Vercel Blob
// o pega URLs de proveedores. Restringir a hosts fijos si algún día importa.
export default {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  // Las fotos van dentro del server action; el default de 1 MB no alcanza ni para una
  // foto de celular ya reducida. 4 MB es el techo de un request en Vercel.
  experimental: { serverActions: { bodySizeLimit: '4mb' } },
}

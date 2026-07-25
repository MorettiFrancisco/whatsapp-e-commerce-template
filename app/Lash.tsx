// Marca de pestaña dibujada con paths, misma silueta que el logo.
// ponytail: SVG inline en vez de asset — hereda currentColor y no pesa nada.
// Para usar el logo real: reemplazar el contenido por <Image src="/logo.png" .../>.
export function Lash({ size = 100 }: { size?: number }) {
  const lashes = Array.from({ length: 12 }, (_, i) => {
    const t = i / 11
    const x = 12 + t * 74
    const y = 46 - t * 30 - Math.sin(Math.PI * t) * 9 // sobre la línea del párpado
    const len = 8 + Math.sin(Math.PI * t) * 13
    return <path key={i} d={`M${x} ${y} q ${2 + t * 5} ${len * 0.6} ${5 + t * 9} ${len}`} />
  })
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 100 70" fill="none" aria-hidden>
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="1.5">
        <path d="M12 46 C30 20 62 6 88 12 C70 30 40 44 12 46" strokeWidth="2.2" />
        {lashes}
      </g>
    </svg>
  )
}

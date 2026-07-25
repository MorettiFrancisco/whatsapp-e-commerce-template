'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Lash } from './Lash'

// Usa public/logo.jpg (o .png). El logo ya trae el nombre escrito, así que cuando
// la imagen está, el título va oculto para lectores de pantalla y no se duplica.
// ponytail: la existencia del archivo se detecta con onError en el navegador.
// En Vercel el filesystem del server no ve /public, así que un fs.existsSync mentiría.
const SRCS = ['/logo.jpg', '/logo.png']

export function Logo({ name, tagline }: { name: string; tagline: string }) {
  const [i, setI] = useState(0)
  const src = SRCS[i]

  if (src)
    return (
      <>
        <h1 className="sr-only">
          {name} {tagline}
        </h1>
        <div className="hero__logo" style={{ width: 'min(300px, 66vw)' }}>
          {/* next/image lo redimensiona: el archivo original puede ser enorme y el celu baja ~40kB */}
          <Image
            src={src}
            alt={`${name} ${tagline}`}
            width={600}
            height={600}
            sizes="(max-width: 700px) 66vw, 300px"
            priority
            onError={() => setI(i + 1)}
          />
        </div>
      </>
    )

  return (
    <>
      <div className="hero__logo drawn" style={{ width: 132, height: 132 }}>
        <Lash size={82} />
      </div>
      <h1>{name}</h1>
      <p className="tagline">{tagline}</p>
    </>
  )
}

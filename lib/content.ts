import { cache } from 'react'
import { getSettings } from './db'
import { BRAND } from './config'

// Única fuente de verdad de los textos editables: de acá salen los defaults
// que ve el visitante y también los campos del formulario del panel.
export const FIELDS = [
  { key: 'name', label: 'Nombre', def: BRAND.name },
  { key: 'tagline', label: 'Bajada del logo', def: BRAND.tagline },
  { key: 'whatsapp', label: 'WhatsApp (ej: 5492216703791)', def: BRAND.whatsapp },
  { key: 'instagram', label: 'Link de Instagram', def: BRAND.instagram },
  {
    key: 'heroLead',
    label: 'Frase de portada',
    big: true,
    def: 'Insumos profesionales para extensiones de pestañas. Miradas que hablan antes que las palabras.',
  },
  { key: 'heroCta', label: 'Texto del botón principal', def: 'Ver servicios' },
  { key: 'aboutEyebrow', label: 'Título chico de "quiénes somos"', def: 'Quiénes somos' },
  { key: 'aboutTitle', label: 'Título de "quiénes somos"', big: true, def: 'Detrás de cada mirada\nhay un buen insumo.' },
  {
    key: 'aboutText',
    label: 'Texto de "quiénes somos" (dejá un renglón en blanco entre párrafos)',
    big: true,
    def: `Luné nació en la cabina, no en un depósito. Somos lashistas que se cansaron de comprar a ciegas: adhesivos que no retienen, seda que se abre, pinzas que resbalan justo en la fila 3.

Hoy elegimos, probamos y traemos solo lo que usaríamos en nuestras propias clientas. Materiales suaves, livianos y consistentes para que tu trabajo se vea impecable y dure lo que tiene que durar.

Trabajamos con lashistas que arrancan y con profesionales de años. Preguntá lo que necesites: acá siempre hay alguien del otro lado.`,
  },
  {
    key: 'values',
    label: 'Beneficios (uno por línea, con formato "Título | Descripción")',
    big: true,
    def: `Curaduría profesional | Seda, adhesivos y pinzas testeadas en cabina antes de entrar al catálogo.
Todo por WhatsApp | Armás tu pedido acá y nos escribís. Sin registros ni contraseñas.
Envíos a todo el país | Coordinamos por chat el medio que te quede más cómodo.
Asesoría real | Te ayudamos a elegir curvatura, espesor y técnica según tu clienta.`,
  },
  { key: 'ctaTitle', label: 'Título del cierre', def: 'Seda, adhesivos, pinzas y más' },
  {
    key: 'ctaText',
    label: 'Texto del cierre',
    big: true,
    def: 'Filtrá por categoría, armá tu carrito y mandanos el pedido por WhatsApp en un toque.',
  },
] as const

export type Content = Record<(typeof FIELDS)[number]['key'], string>

// cache() = una sola consulta por request aunque la lean layout y página.
export const getContent = cache(async (): Promise<Content> => {
  const saved = await getSettings()
  return Object.fromEntries(FIELDS.map((f) => [f.key, saved[f.key]?.trim() || f.def])) as Content
})

/** "Título | Descripción" por línea */
export function parseValues(raw: string) {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [title, ...rest] = l.split('|')
      return { title: title.trim(), desc: rest.join('|').trim() }
    })
}

export const paragraphs = (raw: string) => raw.split(/\n\s*\n/).filter((p) => p.trim())

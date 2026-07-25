import Link from 'next/link'
import { getContent, paragraphs, parseValues } from '@/lib/content'
import { waLink } from '@/lib/wa'
import { Logo } from './Logo'

export const dynamic = 'force-dynamic' // los textos los edita la dueña desde el panel

export default async function Landing() {
  const t = await getContent()
  const hola = waLink(t.whatsapp, `Hola ${t.name}! Vengo de la web y quería consultarte 💜`)

  return (
    <>
      <header className="hero">
        <div className="wrap">
          <div className="enter">
            <Logo name={t.name} tagline={t.tagline} />
          </div>
          <p className="lead enter enter-2">{t.heroLead}</p>
          <div className="hero__cta enter enter-3">
            <Link href="/catalogo" className="btn light" prefetch>
              {t.heroCta}
            </Link>
            <a className="btn ghost" href={hola} target="_blank" rel="noopener">
              Escribinos
            </a>
          </div>
        </div>
        <div className="scrollhint">{t.aboutEyebrow} ↓</div>
      </header>

      <section className="band" id="nosotras">
        <div className="wrap about">
          <div>
            <p className="eyebrow">{t.aboutEyebrow}</p>
            <h2 style={{ whiteSpace: 'pre-line' }}>{t.aboutTitle}</h2>
            {paragraphs(t.aboutText).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="social">
              <a className="btn" href={t.instagram} target="_blank" rel="noopener">
                Instagram
              </a>
              <a className="btn wa" href={hola} target="_blank" rel="noopener">
                WhatsApp
              </a>
            </div>
          </div>
          <div className="values">
            {parseValues(t.values).map((v) => (
              <div className="value" key={v.title}>
                <strong>{v.title}</strong>
                <span>{v.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band soft">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <p className="eyebrow">Catálogo</p>
          <h2 style={{ fontSize: 'clamp(2rem, 8vw, 2.8rem)', margin: '10px 0 14px' }}>{t.ctaTitle}</h2>
          <p className="muted" style={{ maxWidth: '46ch', margin: '0 auto 26px' }}>
            {t.ctaText}
          </p>
          <Link href="/catalogo" className="btn" prefetch>
            {t.heroCta}
          </Link>
        </div>
      </section>

      <footer className="foot">
        <p className="display" style={{ fontSize: 26, color: '#fff' }}>
          {t.name}
        </p>
        <p style={{ letterSpacing: '0.3em', fontSize: 10, textTransform: 'uppercase', margin: '4px 0 14px' }}>
          {t.tagline}
        </p>
        <p>
          <a href={t.instagram} target="_blank" rel="noopener">
            Instagram
          </a>
          {' · '}
          <a href={hola} target="_blank" rel="noopener">
            WhatsApp
          </a>
          {' · '}
          <Link href="/catalogo">Catálogo</Link>
        </p>
      </footer>
    </>
  )
}

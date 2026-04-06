import { useState, useEffect, useRef } from 'react'

function decodeEntities(str) {
  if (!str) return ''
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

// "- **용어:** 설명" 형식에서 {용어: 설명} 추출
function parseTerms(text) {
  if (!text) return {}
  const terms = {}
  const regex = /\*\*([^*:]+):?\*\*:?\s*(.+)/g
  let match
  while ((match = regex.exec(text)) !== null) {
    const term = match[1].replace(/:$/, '').trim()
    const def = match[2].trim()
    if (term && def) terms[term] = def
  }
  return terms
}

// summary 텍스트를 일반 텍스트/하이라이트 세그먼트로 분할
function splitByTerms(text, terms) {
  const keys = Object.keys(terms)
  if (!text || keys.length === 0) return [{ type: 'text', content: text }]

  const escaped = keys
    .sort((a, b) => b.length - a.length)
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${escaped.join('|')})`, 'g')

  return text.split(pattern).map(part => ({
    type: terms[part] !== undefined ? 'term' : 'text',
    content: part,
    definition: terms[part],
  }))
}

function HighlightedSummary({ text, terms }) {
  const [activeTerm, setActiveTerm] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setActiveTerm(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const segments = splitByTerms(text, terms)

  return (
    <p className="card__text" ref={ref}>
      {segments.map((seg, i) =>
        seg.type === 'term' ? (
          <span
            key={i}
            className={`term-highlight ${activeTerm === i ? 'term-highlight--active' : ''}`}
            onClick={() => setActiveTerm(activeTerm === i ? null : i)}
          >
            {seg.content}
            {activeTerm === i && (
              <span className="term-tooltip">{seg.definition}</span>
            )}
          </span>
        ) : (
          <span key={i}>{seg.content}</span>
        )
      )}
    </p>
  )
}

export default function TopicCard({ topic }) {
  const raw = topic.summaries
  const summary = Array.isArray(raw) ? raw[0] : raw
  const articles = topic.articles || []
  const terms = parseTerms(summary?.term_explanation)

  return (
    <section className="card">
      <h2 className="card__topic">{topic.topic_text}</h2>

      {summary?.summary_text && (
        <div className="card__block">
          <h3 className="card__label">요약</h3>
          <HighlightedSummary text={summary.summary_text} terms={terms} />
        </div>
      )}

      {articles.length > 0 && (
        <div className="card__block">
          <h3 className="card__label">관련 기사</h3>
          <ul className="card__articles">
            {articles.map((a, i) => (
              <li key={i} className="card__article">
                <a href={a.url} target="_blank" rel="noreferrer" className="card__link">
                  {decodeEntities(a.title) || a.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

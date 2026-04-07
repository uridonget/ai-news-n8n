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

// 각 용어의 첫 번째 등장에만 하이라이트 적용
function splitByTerms(text, terms) {
  const keys = Object.keys(terms)
  if (!text || keys.length === 0) return [{ type: 'text', content: text }]

  const seen = new Set()
  const escaped = keys
    .sort((a, b) => b.length - a.length)
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${escaped.join('|')})`, 'g')

  return text.split(pattern).map(part => {
    if (terms[part] !== undefined && !seen.has(part)) {
      seen.add(part)
      return { type: 'term', content: part, definition: terms[part] }
    }
    return { type: 'text', content: part }
  })
}

function TermHighlight({ content, definition }) {
  const [visible, setVisible] = useState(false)
  const spanRef = useRef(null)
  const tooltipRef = useRef(null)

  // 툴팁이 화면 밖으로 벗어나지 않도록 위치 보정
  useEffect(() => {
    if (!visible || !tooltipRef.current) return
    const tooltip = tooltipRef.current
    const rect = tooltip.getBoundingClientRect()
    const vw = window.innerWidth

    tooltip.style.left = ''
    tooltip.style.right = ''
    tooltip.style.transform = 'translateX(-50%)'

    if (rect.right > vw - 8) {
      tooltip.style.left = 'auto'
      tooltip.style.right = '0'
      tooltip.style.transform = 'none'
    } else if (rect.left < 8) {
      tooltip.style.left = '0'
      tooltip.style.transform = 'none'
    }
  }, [visible])

  // 다른 영역 클릭 시 닫기
  useEffect(() => {
    if (!visible) return
    function handleOutside(e) {
      if (spanRef.current && !spanRef.current.contains(e.target)) {
        setVisible(false)
      }
    }
    document.addEventListener('pointerdown', handleOutside)
    return () => document.removeEventListener('pointerdown', handleOutside)
  }, [visible])

  return (
    <span
      ref={spanRef}
      className={`term-highlight ${visible ? 'term-highlight--active' : ''}`}
      onClick={() => setVisible(v => !v)}
    >
      {content}
      {visible && (
        <span ref={tooltipRef} className="term-tooltip">{definition}</span>
      )}
    </span>
  )
}

function HighlightedSummary({ text, terms }) {
  const segments = splitByTerms(text, terms)
  return (
    <p className="card__text">
      {segments.map((seg, i) =>
        seg.type === 'term' ? (
          <TermHighlight key={i} content={seg.content} definition={seg.definition} />
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

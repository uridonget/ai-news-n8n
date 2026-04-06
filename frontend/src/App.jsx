import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import TopicCard from './TopicCard'
import './App.css'

export default function App() {
  const [dates, setDates] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDates() {
      const { data } = await supabase
        .from('dates')
        .select('id, date, period')
        .order('date', { ascending: false })
        .order('period', { ascending: true })
        .limit(10)

      if (data?.length) {
        setDates(data)
        setSelectedId(data[0].id)
      }
      setLoading(false)
    }
    fetchDates()
  }, [])

  useEffect(() => {
    if (!selectedId) return

    async function fetchTopics() {
      setLoading(true)

      const { data: topicsData } = await supabase
        .from('topics')
        .select('id, topic_text, summaries ( summary_text, term_explanation )')
        .eq('date_id', selectedId)
        .order('id', { ascending: true })

      if (!topicsData?.length) {
        setTopics([])
        setLoading(false)
        return
      }

      const topicIds = topicsData.map(t => t.id)
      const { data: articlesData } = await supabase
        .from('articles')
        .select('topic_id, title, url')
        .in('topic_id', topicIds)

      const articlesByTopic = (articlesData || []).reduce((acc, a) => {
        if (!acc[a.topic_id]) acc[a.topic_id] = []
        acc[a.topic_id].push(a)
        return acc
      }, {})

      setTopics(topicsData.map(t => ({
        ...t,
        articles: articlesByTopic[t.id] || []
      })))
      setLoading(false)
    }
    fetchTopics()
  }, [selectedId])

  const selected = dates.find(d => d.id === selectedId)
  const dateLabel = selected
    ? `${new Date(selected.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} ${selected.period}`
    : ''

  return (
    <div className="app">
      <header className="header">
        <h1 className="date-title">{dateLabel || '뉴스 요약'}</h1>
        <div className="date-tabs">
          {dates.map(d => (
            <button
              key={d.id}
              className={`tab ${d.id === selectedId ? 'tab--active' : ''}`}
              onClick={() => setSelectedId(d.id)}
            >
              {new Date(d.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} {d.period}
            </button>
          ))}
        </div>
      </header>

      <main className="main">
        {loading ? (
          <p className="status">불러오는 중...</p>
        ) : topics.length === 0 ? (
          <p className="status">데이터가 없습니다.</p>
        ) : (
          topics.map(topic => (
            <TopicCard key={topic.id} topic={topic} />
          ))
        )}
      </main>
    </div>
  )
}

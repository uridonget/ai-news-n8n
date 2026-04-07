export default function DatePicker({ dates, selectedId, onSelect }) {
  const selected = dates.find(d => d.id === selectedId)

  // 중복 없는 날짜 목록 (내림차순)
  const uniqueDates = [...new Set(dates.map(d => d.date))]
  const currentIdx = uniqueDates.indexOf(selected?.date)

  function navigate(dir) {
    const newDate = uniqueDates[currentIdx + dir]
    if (!newDate) return
    // 같은 시간대 우선, 없으면 첫 번째 항목
    const same = dates.find(d => d.date === newDate && d.period === selected?.period)
    const fallback = dates.find(d => d.date === newDate)
    onSelect((same || fallback).id)
  }

  const periodsForDate = dates
    .filter(d => d.date === selected?.date)
    .sort((a, b) => a.period.localeCompare(b.period))  // 오전 → 오후 순 (left → right)

  const dateLabel = selected
    ? new Date(selected.date).toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
      })
    : ''

  return (
    <div className="datepicker">
      <div className="datepicker__nav">
        <button
          className="datepicker__arrow"
          onClick={() => navigate(1)}
          disabled={currentIdx >= uniqueDates.length - 1}
          aria-label="이전 날짜"
        >
          ‹
        </button>
        <span className="datepicker__date">{dateLabel}</span>
        <button
          className="datepicker__arrow"
          onClick={() => navigate(-1)}
          disabled={currentIdx <= 0}
          aria-label="다음 날짜"
        >
          ›
        </button>
      </div>

      <div className="datepicker__periods">
        {periodsForDate.map(d => (
          <button
            key={d.id}
            className={`datepicker__period ${d.id === selectedId ? 'datepicker__period--active' : ''}`}
            onClick={() => onSelect(d.id)}
          >
            {d.period}
          </button>
        ))}
      </div>
    </div>
  )
}

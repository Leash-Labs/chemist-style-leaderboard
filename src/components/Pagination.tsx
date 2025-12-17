import React from 'react'
export default function Pagination({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (p: number) => void }) {
  const canPrev = page > 1, canNext = page < pageCount
  return (
    <div className="chips">
      <button className="btn" onClick={() => onPage(1)} disabled={!canPrev}>« First</button>
      <button className="btn" onClick={() => onPage(page-1)} disabled={!canPrev}>‹ Prev</button>
      <span className="badge">Page {page} / {pageCount}</span>
      <button className="btn" onClick={() => onPage(page+1)} disabled={!canNext}>Next ›</button>
      <button className="btn" onClick={() => onPage(pageCount)} disabled={!canNext}>Last »</button>
    </div>
  )
}
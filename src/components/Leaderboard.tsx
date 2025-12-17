import React, { useEffect, useMemo, useState, useRef } from 'react'
import type { ChemistRow, LeaderboardData } from '../types'
import { pct, num, score, bits } from '../utils/format'
import ProgressBar from './ProgressBar'
import RowDetails from './RowDetails'
import Pagination from './Pagination'
import Tooltip from './Tooltip'

type SortKey = 'style_score' | 'top5' | 'top10' | 'n_molecules' | 'n_papers' | 'name'
const sortFns: Record<SortKey, (a: ChemistRow, b: ChemistRow) => number> = {
  style_score: (a, b) => (b.style_score - a.style_score) || (b.n_molecules - a.n_molecules),
  top5: (a, b) => (b.top5 - a.top5) || (b.n_molecules - a.n_molecules),
  top10: (a, b) => (b.top10 - a.top10) || (b.n_molecules - a.n_molecules),
  n_molecules: (a, b) => (b.n_molecules - a.n_molecules),
  n_papers: (a, b) => (b.n_papers ?? 0) - (a.n_papers ?? 0),
  name: (a, b) => a.name.localeCompare(b.name)
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardData>([])
  const [q, setQ] = useState('')
  const [minCount, setMinCount] = useState(20)
  const [minScore, setMinScore] = useState(0)
  const [sortBy, setSortBy] = useState<SortKey>('style_score')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const rowRefs = useRef<Record<number, HTMLTableRowElement>>({})

  useEffect(() => {
    fetch('/data/leaderboard.json').then(r => r.json()).then((j: LeaderboardData) => setData(j))
  }, [])

  // First, sort the full dataset to get original rankings
  const sortedData = useMemo(() => {
    return [...data].sort(sortFns[sortBy])
  }, [data, sortBy])

  // Create a map of chemist_id to original rank
  const originalRanks = useMemo(() => {
    const ranks: Record<number, number> = {}
    sortedData.forEach((chemist, index) => {
      ranks[chemist.chemist_id] = index + 1
    })
    return ranks
  }, [sortedData])

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase()
    return sortedData
      .filter(r => r.n_molecules >= minCount)
      .filter(r => r.style_score >= minScore)
      .filter(r => !ql || r.name.toLowerCase().includes(ql))
  }, [sortedData, q, minCount, minScore])

  const pageSize = 50
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize)
  useEffect(() => { setPage(1) }, [q, minCount, minScore, sortBy])

  const toggle = (id: number) => setExpanded(s => ({ ...s, [id]: !s[id] }))

  const navigateToChemist = (chemistName: string) => {
    // Find the chemist by name in the full dataset
    const chemist = data.find(r => r.name === chemistName)
    if (!chemist) return

    // Check if they're in the current filtered results
    const chemistIndex = filtered.findIndex(r => r.chemist_id === chemist.chemist_id)

    if (chemistIndex === -1) {
      // If not in filtered results, clear the search filters and try again
      setQ('') // Clear search query
      setMinCount(0) // Reset minimum molecule count
      setMinScore(0) // Reset minimum style score
      setPage(1) // Reset to first page

      // After clearing filters, navigate to the chemist
      setTimeout(() => {
        // Find the chemist in the newly filtered (unfiltered) results
        const newFiltered = sortedData // This will be the full sorted data after filters are cleared
        const newChemistIndex = newFiltered.findIndex(r => r.chemist_id === chemist.chemist_id)

        if (newChemistIndex !== -1) {
          const targetPage = Math.ceil((newChemistIndex + 1) / pageSize)
          setPage(targetPage)
          setExpanded(s => ({ ...s, [chemist.chemist_id]: true }))

          // Scroll to the chemist row
          setTimeout(() => {
            const rowElement = rowRefs.current[chemist.chemist_id]
            if (rowElement) {
              rowElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              })
            }
          }, 100)
        }
      }, 50) // Small delay to allow state updates
      return
    }

    // Calculate which page this chemist is on
    const targetPage = Math.ceil((chemistIndex + 1) / pageSize)
    setPage(targetPage)

    // Open their details
    setExpanded(s => ({ ...s, [chemist.chemist_id]: true }))

    // Scroll to the chemist row after a short delay to allow for page change and expansion
    setTimeout(() => {
      const rowElement = rowRefs.current[chemist.chemist_id]
      if (rowElement) {
        rowElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        })
      }
    }, 100)
  }

  return (
    <div className="panel">
      <div className="controls">
        <input className="input" placeholder="Search chemist…" value={q} onChange={e => setQ(e.target.value)} />
        <label className="subtle">Min molecules
          <input className="input" type="number" value={minCount} min={0} onChange={e => setMinCount(parseInt(e.target.value || '0'))} />
        </label>
        <label className="subtle">Min style score
          <input className="input" type="number" step="0.01" min="0" max="1" value={minScore} onChange={e => setMinScore(parseFloat(e.target.value || '0'))} />
        </label>
        <label className="subtle">Sort by
          <select className="select" value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}>
            <option value="style_score">Style score</option>
            <option value="top5">Top‑5</option>
            <option value="top10">Top‑10</option>
            <option value="n_molecules"># Molecules</option>
            <option value="n_papers"># Papers</option>
            <option value="name">Name (A→Z)</option>
          </select>
        </label>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="table" role="table" aria-label="Chemist leaderboard">
          <thead>
            <tr>
              <th>#</th><th>Chemist</th>
              <th>
                Style
                <Tooltip text="Normalized distinctiveness score (0-1). Higher values indicate more unique and recognizable molecular designs. 1.0 = perfect distinctiveness, 0.0 = no better than random prediction.">
                  <span
                    style={{
                      marginLeft: '4px',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ?
                  </span>
                </Tooltip>
              </th>
              <th>
                Top‑5
                <Tooltip text="Top-5 accuracy: The percentage of molecules where the model correctly identified this chemist as one of its top 5 predictions. This metric shows how distinctive the chemist's molecular style is when allowing for multiple guesses.">
                  <span
                    style={{
                      marginLeft: '4px',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ?
                  </span>
                </Tooltip>
              </th>
              <th>
                Top‑10
                <Tooltip text="Top-10 accuracy: The percentage of molecules where the model correctly identified this chemist as one of its top 10 predictions. This metric shows how distinctive the chemist's molecular style is when allowing for multiple guesses.">
                  <span
                    style={{
                      marginLeft: '4px',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ?
                  </span>
                </Tooltip>
              </th>
              <th># Mol</th><th># Papers</th><th></th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r, i) => {
              const rank = originalRanks[r.chemist_id] || (page - 1) * pageSize + i + 1
              const open = !!expanded[r.chemist_id]
              return (
                <React.Fragment key={r.chemist_id}>
                  <tr ref={(el) => { if (el) rowRefs.current[r.chemist_id] = el }}>
                    <td>{rank}</td>
                    <td>
                      <button
                        onClick={() => toggle(r.chemist_id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'inherit',
                          cursor: 'pointer',
                          padding: 0,
                          font: 'inherit',
                          textAlign: 'left',
                          width: '100%'
                        }}
                      >
                        {r.name}
                      </button>
                    </td>
                    <td><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span className="badge">{score(r.style_score)}</span><ProgressBar value={r.style_score} max={1} /></div></td>
                    <td><span className="badge">{pct(r.top5)}</span></td>
                    <td><span className="badge">{pct(r.top10)}</span></td>
                    <td>{new Intl.NumberFormat().format(r.n_molecules)}</td>
                    <td>{r.n_papers ? new Intl.NumberFormat().format(r.n_papers) : '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="row-toggle" onClick={() => toggle(r.chemist_id)} aria-expanded={open}>{open ? 'Hide' : 'Show'} details</button>
                    </td>
                  </tr>
                  {open && <tr><td colSpan={7}><RowDetails row={r} onChemistClick={navigateToChemist} /></td></tr>}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="footer">
        <Pagination page={page} pageCount={pageCount} onPage={setPage} />
        <div><span className="kbd">/</span> to focus search • {new Intl.NumberFormat().format(filtered.length)} chemists</div>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import Leaderboard from './components/Leaderboard'
import Quiz from './components/Quiz'

export default function App() {
  const getViewFromLocation = () => {
    if (typeof window === 'undefined') return 'leaderboard'
    if (window.location.hash === '#quiz') return 'quiz'
    const trimmedPath = window.location.pathname.replace(/\/+$/, '')
    return trimmedPath.endsWith('/quiz') ? 'quiz' : 'leaderboard'
  }

  const [view, setView] = useState<'leaderboard' | 'quiz'>(getViewFromLocation)

  useEffect(() => {
    const syncView = () => setView(getViewFromLocation())
    window.addEventListener('hashchange', syncView)
    window.addEventListener('popstate', syncView)
    return () => {
      window.removeEventListener('hashchange', syncView)
      window.removeEventListener('popstate', syncView)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault()
        const el = document.querySelector('input[placeholder="Search chemist…"]') as HTMLInputElement | null
        el?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleViewChange = (next: 'leaderboard' | 'quiz') => {
    setView(next)
    if (next === 'quiz') {
      window.location.hash = 'quiz'
    } else {
      const trimmedPath = window.location.pathname.replace(/\/+$/, '')
      const basePath = trimmedPath.endsWith('/quiz') ? trimmedPath.slice(0, -5) : trimmedPath
      const normalizedBase = basePath ? `${basePath}/` : '/'
      const baseUrl = normalizedBase + window.location.search
      window.history.replaceState(null, '', baseUrl)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <a href="https://www.leash.bio/" style={{ display: 'inline-block', cursor: 'pointer' }}>
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" style={{ height: '48px', width: 'auto' }} />
          </a>
          <div>
            <div className="title">Molecular Distinctiveness Leaderboard</div>
            <div className="subtle">Ranking chemists by the uniqueness of their molecular designs on ChEMBL</div>
          </div>
        </div>
        <div className="tabs" role="tablist" aria-label="Primary navigation">
          <button
            className={`tab ${view === 'leaderboard' ? 'tab-active' : ''}`}
            role="tab"
            aria-selected={view === 'leaderboard'}
            onClick={() => handleViewChange('leaderboard')}
          >
            Leaderboard
          </button>
          <button
            className={`tab ${view === 'quiz' ? 'tab-active' : ''}`}
            role="tab"
            aria-selected={view === 'quiz'}
            onClick={() => handleViewChange('quiz')}
          >
            Quiz
          </button>
        </div>
      </header>

      {view === 'leaderboard' && (
        <>
          <div className="panel" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Methodology</h3>
            <p style={{ margin: '0 0 12px 0', lineHeight: '1.5' }}>
              This leaderboard ranks chemists by the distinctiveness of their molecular designs. We trained a LightGBM model
              with 1,815 classes to predict the author of a molecule based solely on its chemical structure. The dataset
              includes chemists from ChEMBL who have authored at least 30 papers and contributed at least 600 molecules.{' '}
              <a
                href="https://leashbio.substack.com/p/ai-for-chemistry-in-2025-is-like"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0066cc', textDecoration: 'none' }}
              >
                Read more
              </a>
              .
            </p>
          </div>

          <Leaderboard />
        </>
      )}

      {view === 'quiz' && <Quiz />}
    </div>
  )
}

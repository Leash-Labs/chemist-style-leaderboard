import React, { useEffect } from 'react'
import Leaderboard from './components/Leaderboard'

export default function App() {
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
      </header>

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
    </div>
  )
}

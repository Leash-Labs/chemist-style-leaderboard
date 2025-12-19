import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChemistRow, LeaderboardData } from '../types'
import { score, pct, num } from '../utils/format'
import SmilesRenderer from './SmilesRenderer'

type QuizOption = {
  id: string
  smiles: string
  source: 'A' | 'B'
}

type QuizRound = {
  chemistA: ChemistRow
  chemistB: ChemistRow
  options: QuizOption[]
  answerId: string
}

const randomId = () => Math.random().toString(36).slice(2, 9)

const shuffle = <T,>(input: T[]): T[] => {
  const arr = [...input]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const sample = <T,>(input: T[], n: number) => shuffle(input).slice(0, n)

export default function Quiz() {
  const [data, setData] = useState<LeaderboardData>([])
  const [round, setRound] = useState<QuizRound | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [scoreState, setScoreState] = useState({ correct: 0, total: 0 })

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/leaderboard.json`)
      .then(r => r.json())
      .then((j: LeaderboardData) => {
        setData(j)
        setLoading(false)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load data')
        setLoading(false)
      })
  }, [])

  const chemistsWithExamples = useMemo(
    () => data.filter(row => Array.isArray(row.examples) && row.examples.length >= 1),
    [data]
  )

  const startRound = useCallback(() => {
    if (chemistsWithExamples.length < 2) {
      setError('Not enough chemists with example molecules to build the quiz.')
      return
    }

    const primaryCandidates = chemistsWithExamples.filter(row => (row.examples?.length ?? 0) >= 3)
    if (!primaryCandidates.length) {
      setError('Need chemists with at least 3 example molecules to run the quiz.')
      return
    }

    const [chemistA] = sample(primaryCandidates, 1)
    if (!chemistA) {
      setError('Unable to choose chemists for this round.')
      return
    }

    const others = chemistsWithExamples.filter(row => row.chemist_id !== chemistA.chemist_id)
    if (!others.length) {
      setError('Need two distinct chemists with example molecules.')
      return
    }
    const [chemistB] = sample(others, 1)
    if (!chemistB) {
      setError('Unable to choose a challenger chemist.')
      return
    }

    const examplesA = sample(chemistA.examples ?? [], 3)
    const exampleB = sample(chemistB.examples ?? [], 1)

    if (examplesA.length < 3 || exampleB.length < 1) {
      setError('Selected chemists do not have enough molecules for a round.')
      return
    }

    const options: QuizOption[] = [
      ...examplesA.map(smiles => ({ id: randomId(), smiles, source: 'A' as const })),
      { id: randomId(), smiles: exampleB[0], source: 'B' as const }
    ]

    const shuffled = shuffle(options)

    setRound({
      chemistA,
      chemistB,
      options: shuffled,
      answerId: shuffled.find(opt => opt.source === 'B')!.id
    })
    setSelected(null)
    setStatus('idle')
  }, [chemistsWithExamples])

  useEffect(() => {
    if (chemistsWithExamples.length) {
      startRound()
    }
  }, [chemistsWithExamples, startRound])

  const handleSelect = (optionId: string) => {
    if (!round || status !== 'idle') return
    setSelected(optionId)
    const correct = optionId === round.answerId
    setStatus(correct ? 'correct' : 'incorrect')
    setScoreState(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }))
  }

  const handleNext = () => {
    if (status === 'idle') return
    startRound()
  }

  const accuracy = scoreState.total ? ((scoreState.correct / scoreState.total) * 100).toFixed(0) + '%' : '—'
  return (
    <>
      <div className="panel" style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Chemist Style Quiz</h3>
        <p style={{ margin: '0 0 8px 0', lineHeight: 1.5 }}>
          Three molecules below were authored by one chemist. The fourth belongs to another. Pick the outlier to see
          how well you can recognize molecular styles. Each round reveals both chemists so you learn as you go.
        </p>
        <div className="quiz-score">
          <div><span className="label">Rounds played</span><span className="value">{scoreState.total}</span></div>
          <div><span className="label">Correct guesses</span><span className="value">{scoreState.correct}</span></div>
          <div><span className="label">Accuracy</span><span className="value">{accuracy}</span></div>
        </div>
      </div>

      {loading && <div className="panel">Loading quiz data…</div>}
      {error && !loading && <div className="panel" style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && !round && <div className="panel">No quiz rounds available.</div>}

      {round && !loading && !error && (
        <div className="panel" aria-live="polite">
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 4, fontSize: '20px', fontWeight: 700 }}>Which one of these things is not like the others?</div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>
              Which molecule belongs to <span style={{ color: 'var(--accent2)' }}>{round.chemistB.name}</span>? The other
              three were designed by <span style={{ color: 'var(--accent)' }}>{round.chemistA.name}</span>.
            </div>
          </div>

          <div className="quiz-grid">
            {round.options.map(option => {
              const isSelected = selected === option.id
              const isCorrect = option.id === round.answerId
              const reveal = status !== 'idle'
              const stateClass = reveal
                ? isCorrect
                  ? 'quiz-option-correct'
                  : isSelected
                    ? 'quiz-option-incorrect'
                    : ''
                : ''
              return (
                <button
                  key={option.id}
                  className={`quiz-option ${stateClass}`}
                  onClick={() => handleSelect(option.id)}
                  disabled={status !== 'idle'}
                >
                  <SmilesRenderer smiles={option.smiles} width={340} height={340} />
                </button>
              )
            })}
          </div>

          {status !== 'idle' && (
            <div className={`quiz-status ${status}`}>
              {status === 'correct' ? 'Nice work! That molecule belonged to the challenger.' : 'Not quite this time.'}
              <div style={{ marginTop: 4 }}>
                <strong>{round.chemistB.name}</strong> crafted the <span style={{ color: '#059669' }}>highlighted</span> molecule.
              </div>
            </div>
          )}

          <div className="quiz-chems">
            <div className="quiz-chemist-card">
              <div className="label">Primary Chemist</div>
              <div className="quiz-chemist-name">{round.chemistA.name}</div>
              <dl>
                <div><dt>Style Score</dt><dd>{score(round.chemistA.style_score)}</dd></div>
                <div><dt>Top-5</dt><dd>{pct(round.chemistA.top5)}</dd></div>
                <div><dt>Molecules</dt><dd>{num(round.chemistA.n_molecules)}</dd></div>
              </dl>
            </div>
            <div className="quiz-chemist-card">
              <div className="label">Challenger</div>
              <div className="quiz-chemist-name">{round.chemistB.name}</div>
              <dl>
                <div><dt>Style Score</dt><dd>{score(round.chemistB.style_score)}</dd></div>
                <div><dt>Top-5</dt><dd>{pct(round.chemistB.top5)}</dd></div>
                <div><dt>Molecules</dt><dd>{num(round.chemistB.n_molecules)}</dd></div>
              </dl>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button className="btn" onClick={handleNext} disabled={status === 'idle'}>
              Next round
            </button>
          </div>
        </div>
      )}
    </>
  )
}

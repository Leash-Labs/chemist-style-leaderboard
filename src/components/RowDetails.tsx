import React from 'react'
import type { ChemistRow } from '../types'
import { pct, num, bits, score } from '../utils/format'
import Heatmap from './Heatmap'
import SmilesRenderer from './SmilesRenderer'
import Tooltip from './Tooltip'

interface RowDetailsProps {
  row: ChemistRow
  onChemistClick?: (chemistName: string) => void
}

export default function RowDetails({ row, onChemistClick }: RowDetailsProps) {
  return (
    <div className="panel" style={{ marginTop: 8 }}>
      <div className="metrics">
        <div className="metric"><div className="label">Style Score</div><div className="value">{score(row.style_score)}</div></div>
        <div className="metric"><div className="label">Top‑1 / Top‑5 / Top‑10</div><div className="value">{pct(row.acc1)} / {pct(row.top5)} / {pct(row.top10)}</div></div>
        <div className="metric"><div className="label">Molecules</div><div className="value">{num(row.n_molecules)}</div></div>
        <div className="metric"><div className="label">Papers</div><div className="value">{row.n_papers ? num(row.n_papers) : '—'}</div></div>
      </div>

      {/* Side-by-side layout for heatmap and molecules */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginTop: '12px',
        alignItems: 'stretch',
        minHeight: '300px'
      }}>
        {/* Left side: Heatmap */}
        {row.heatmap && (
          <div>
            <div className="label" style={{ marginBottom: 6 }}>
              Confusion Matrix
              <Tooltip text="Shows how often the model misclassifies this chemist's molecules as belonging to other chemists. Darker cells indicate higher confusion rates, revealing molecular design similarities. Click on names to navigate to other chemists.">
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
            </div>
            <Heatmap heatmap={row.heatmap} onChemistClick={onChemistClick} />
          </div>
        )}

        {/* Right side: Molecules in 2x2 grid */}
        {row.examples && row.examples.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            minHeight: '0' // Allow flex shrinking
          }}>
            <div className="label" style={{ marginBottom: 6 }}>
              Representative molecules
              <Tooltip text="Example molecules that are most characteristic of this chemist's design style. These are molecules that the model is most confident belong to this researcher, representing their typical molecular patterns.">
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
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: '12px',
              width: '100%',
              height: '100%',
              minHeight: '300px' // Match typical heatmap height
            }}>
              {row.examples.slice(0, 4).map((smiles, i) => (
                <figure key={i} style={{ margin: 0, height: '100%' }}>
                  <SmilesRenderer smiles={smiles} width={180} height={180} />
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
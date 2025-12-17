import React from 'react'
import type { HeatmapData } from '../types'

interface HeatmapProps {
    heatmap: HeatmapData
    onChemistClick?: (chemistName: string) => void
}

export default function Heatmap({ heatmap, onChemistClick }: HeatmapProps) {
    const { names, matrix } = heatmap

    // Find the max value for color scaling
    const maxValue = Math.max(...matrix.flat())

    // Color function: black to accent to accent2 gradient based on value
    const getColor = (value: number) => {
        if (value === 0) {
            // Zero confusion - white (matches light background)
            return '#ffffff'
        } else {
            // Value-based gradient: white -> accent -> accent2
            const intensity = value / maxValue
            if (intensity < 0.5) {
                // White to accent (light blue)
                const factor = intensity * 2
                return `color-mix(in srgb, #ffffff ${(1 - factor) * 100}%, var(--accent))`
            } else {
                // Accent to accent2 (light blue to light green)
                const factor = (intensity - 0.5) * 2
                return `color-mix(in srgb, var(--accent) ${(1 - factor) * 100}%, var(--accent2))`
            }
        }
    }

    return (
        <div className="heatmap-container">
            <div className="heatmap" style={{
                display: 'grid',
                gridTemplateColumns: `80px repeat(${names.length}, 32px)`,
                gap: '2px',
                fontSize: '10px',
                maxWidth: '100%',
                overflow: 'auto',
                alignContent: 'start'
            }}>
                {/* Header row with chemist names */}
                <div></div> {/* Empty cell for corner */}
                {names.map((name, i) => (
                    <div
                        key={i}
                        className="heatmap-label"
                        style={{
                            padding: '2px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '10px',
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: onChemistClick ? 'pointer' : 'default',
                            transition: 'color 0.2s ease, transform 0.1s ease'
                        }}
                        title={onChemistClick ? `Click to view ${name}` : name}
                        onClick={() => onChemistClick?.(name)}
                        onMouseEnter={(e) => {
                            if (onChemistClick) {
                                e.currentTarget.style.color = 'var(--accent)'
                                e.currentTarget.style.transform = 'scale(1.05)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (onChemistClick) {
                                e.currentTarget.style.color = ''
                                e.currentTarget.style.transform = 'scale(1)'
                            }
                        }}
                    >
                        {name.length > 8 ? name.substring(0, 8) + '...' : name}
                    </div>
                ))}

                {/* Data rows */}
                {matrix.map((row, i) => (
                    <React.Fragment key={i}>
                        {/* Row label */}
                        <div
                            className="heatmap-label"
                            style={{
                                padding: '4px 2px',
                                textAlign: 'right',
                                fontWeight: 'bold',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                width: '80px',
                                cursor: onChemistClick ? 'pointer' : 'default',
                                transition: 'color 0.2s ease, transform 0.1s ease'
                            }}
                            title={onChemistClick ? `Click to view ${names[i]}` : names[i]}
                            onClick={() => onChemistClick?.(names[i])}
                            onMouseEnter={(e) => {
                                if (onChemistClick) {
                                    e.currentTarget.style.color = 'var(--accent)'
                                    e.currentTarget.style.transform = 'scale(1.02)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (onChemistClick) {
                                    e.currentTarget.style.color = ''
                                    e.currentTarget.style.transform = 'scale(1)'
                                }
                            }}
                        >
                            {names[i].length > 10 ? names[i].substring(0, 10) + '...' : names[i]}
                        </div>

                        {/* Row data */}
                        {row.map((value, j) => {
                            const cellColor = getColor(value)
                            const intensity = value / maxValue
                            // Black text for light colors, white text for dark colors
                            const textColor = intensity < 0.3 ? 'black' : 'white'
                            return (
                                <div
                                    key={j}
                                    className="heatmap-cell"
                                    style={{
                                        backgroundColor: cellColor,
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        textAlign: 'center',
                                        color: textColor,
                                        fontSize: '10px',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        aspectRatio: '1',
                                        fontWeight: 'normal',
                                        cursor: 'pointer',
                                        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                                        position: 'relative'
                                    }}
                                    title={`${names[i]} → ${names[j]}: ${(value * 100).toFixed(2)}%`}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.1)'
                                        e.currentTarget.style.boxShadow = '0 0 8px rgba(90, 200, 250, 0.5)'
                                        e.currentTarget.style.zIndex = '10'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)'
                                        e.currentTarget.style.boxShadow = 'none'
                                        e.currentTarget.style.zIndex = '1'
                                    }}
                                >
                                    {value > 0.001 ? (value * 100).toFixed(1) : ''}
                                </div>
                            )
                        })}
                    </React.Fragment>
                ))}
            </div>

            {/* Legend */}
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border)' }}></div>
                    <span>0%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                        width: '80px',
                        height: '12px',
                        background: 'linear-gradient(to right, #ffffff, var(--accent), var(--accent2))',
                        border: '1px solid var(--border)'
                    }}></div>
                    <span>{(maxValue * 100).toFixed(1)}%</span>
                </div>
            </div>
        </div>
    )
}

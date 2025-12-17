import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  text: string
  children: React.ReactNode
}

export default function Tooltip({ text, children }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showOnHover, setShowOnHover] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'top' as 'top' | 'bottom' })
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)

  const updatePosition = () => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const tooltipHeight = tooltipRef.current?.offsetHeight || 100
    const tooltipWidth = tooltipRef.current?.offsetWidth || 250
    const spaceAbove = rect.top
    const spaceBelow = window.innerHeight - rect.bottom

    // Position above by default, but below if not enough space above
    const placement = spaceAbove < tooltipHeight + 20 && spaceBelow > tooltipHeight + 20 ? 'bottom' : 'top'
    
    const top = placement === 'top' 
      ? rect.top - tooltipHeight - 8
      : rect.bottom + 8
    const left = rect.left + rect.width / 2 - tooltipWidth / 2

    setPosition({ top, left, placement })
    
    // If tooltip is rendered, measure and adjust
    if (tooltipRef.current) {
      requestAnimationFrame(() => {
        if (!containerRef.current || !tooltipRef.current) return
        const actualHeight = tooltipRef.current.offsetHeight
        const actualWidth = tooltipRef.current.offsetWidth
        const newRect = containerRef.current.getBoundingClientRect()
        const newSpaceAbove = newRect.top
        const newSpaceBelow = window.innerHeight - newRect.bottom
        const newPlacement = newSpaceAbove < actualHeight + 20 && newSpaceBelow > actualHeight + 20 ? 'bottom' : 'top'
        const newTop = newPlacement === 'top' 
          ? newRect.top - actualHeight - 8
          : newRect.bottom + 8
        const newLeft = newRect.left + newRect.width / 2 - actualWidth / 2
        setPosition({ top: newTop, left: newLeft, placement: newPlacement })
      })
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(prev => !prev)
  }

  const handleMouseEnter = () => {
    // Show quickly on hover (100ms delay instead of browser default ~1s)
    hoverTimeoutRef.current = setTimeout(() => {
      setShowOnHover(true)
    }, 100)
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setShowOnHover(false)
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Update position when tooltip visibility changes
  useEffect(() => {
    if (isOpen || showOnHover) {
      updatePosition()
      const handleResize = () => updatePosition()
      const handleScroll = () => updatePosition()
      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleScroll, true)
      return () => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleScroll, true)
      }
    }
  }, [isOpen, showOnHover])

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const shouldShow = isOpen || showOnHover

  const tooltipContent = shouldShow ? (
    <span
      ref={tooltipRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${Math.max(8, Math.min(position.left, window.innerWidth - 258))}px`,
        padding: '8px 12px',
        backgroundColor: '#111827',
        color: '#ffffff',
        fontSize: '12px',
        lineHeight: '1.4',
        borderRadius: '6px',
        minWidth: '200px',
        maxWidth: '300px',
        whiteSpace: 'normal',
        zIndex: 10000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        pointerEvents: 'none',
        display: 'block'
      }}
    >
      {text}
      <span
        style={{
          position: 'absolute',
          ...(position.placement === 'top' 
            ? { top: '100%', borderTop: '6px solid #111827' }
            : { bottom: '100%', borderBottom: '6px solid #111827' }
          ),
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent'
        }}
      />
    </span>
  ) : null

  return (
    <>
      <span
        ref={containerRef}
        style={{ position: 'relative', display: 'inline-block' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span
          onClick={handleClick}
          style={{
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          {children}
        </span>
      </span>
      {tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  )
}


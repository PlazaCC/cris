import { Check, Copy } from 'lucide-react'
import React, { useRef, useState } from 'react'
import Marquee from 'react-fast-marquee'

export const MarqueeBlock = () => {
  const [copied, setCopied] = useState(false)

  const handleMarqueeClick = () => {
    navigator.clipboard.writeText('cr@unk.cc')
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="bg-dark-black flex w-full flex-col gap-8 overflow-hidden py-32">
      <h3 className="text-off-white w-full text-center text-[28px] font-bold">
        don't be shy, say hello.
      </h3>

      {/* tooltip container */}
      <MarqueeTooltip
        content={
          copied ? (
            <>
              <Check />
              copied to clipboard
            </>
          ) : (
            <>
              <Copy />
              copy to clipboard
            </>
          )
        }
      >
        <div
          className="relative flex cursor-pointer"
          onClick={handleMarqueeClick}
        >
          <Marquee className="overflow-visible!">
            <MarqueeItem />
            <MarqueeItem />
            <MarqueeItem />
            <MarqueeItem />
            <MarqueeItem />
          </Marquee>
          {/* tooltip */}
        </div>
      </MarqueeTooltip>
    </div>
  )
}

export const MarqueeItem = () => {
  return (
    <div className="relative flex h-[123px] items-center overflow-visible pr-16">
      <h2 className="text-off-white pr-16 text-[180px] leading-[180px] font-bold">
        cr@unk.cc
      </h2>
    </div>
  )
}

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
}

export const MarqueeTooltip: React.FC<TooltipProps> = ({
  content,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!containerRef.current || !tooltipRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    let x = e.clientX - containerRect.left
    let y = e.clientY - containerRect.top + 20

    // Ajuste para não sair da tela
    if (x + tooltipRect.width > window.innerWidth) {
      x = window.innerWidth - containerRect.left - tooltipRect.width - 8
    }
    if (x < 0) x = 8
    if (y + tooltipRect.height > window.innerHeight) {
      y = window.innerHeight - containerRect.top - tooltipRect.height - 8
    }
    if (y < 0) y = 8
    tooltipRef.current.style.left = `${x}px`
    tooltipRef.current.style.top = `${y}px`
  }

  const handleMouseEnter = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = '1'
    }
  }

  const handleMouseLeave = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = '0'
    }
  }

  return (
    <div
      ref={containerRef}
      style={{ display: 'inline-block', position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {children}
      <div
        ref={tooltipRef}
        className="text-dark-black pointer-events-none absolute top-0 left-0 z-1000 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold whitespace-nowrap opacity-0 transition-opacity duration-200"
      >
        {content}
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'
import React, { useRef, useState } from 'react'

export const ProjectProgressionBlock = () => {
  const [side, setSide] = useState<'left' | 'right' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x < rect.width / 2) {
      setSide('left')
    } else {
      setSide('right')
    }
  }

  const handleMouseLeave = () => {
    setSide('right')
  }

  return (
    <section className="w-full max-w-[1440px] px-10 py-32">
      <div
        ref={containerRef}
        className="bg-blue flex h-[484px] w-full items-center justify-between rounded-[32px] px-6"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'pointer' }}
      >
        <div
          className={cn(
            'bg-off-white flex w-[360px] -translate-x-[20px] items-center gap-12 rounded-[16px] px-8 py-8 opacity-0 transition-all duration-300',
            side === 'left' && 'translate-x-0 opacity-100'
          )}
        >
          <div className="bg-blue h-8 w-8 rounded-full" />
          <p className="text-dark-black flex-1 text-[48px] leading-[98%] font-bold">
            Previous
            <br />
            Project
          </p>
        </div>
        <div
          className={cn(
            'bg-off-white flex w-[360px] translate-x-[20px] items-center gap-12 rounded-[16px] px-8 py-8 opacity-0 transition-all duration-300',
            side === 'right' && 'translate-x-0 opacity-100'
          )}
        >
          <p className="text-dark-black flex-1 text-[48px] leading-[98%] font-bold">
            Next
            <br />
            Project
          </p>
          <div className="bg-blue h-8 w-8 rounded-full" />
        </div>
      </div>
    </section>
  )
}

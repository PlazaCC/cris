import React, { useRef } from "react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!containerRef.current || !tooltipRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    let x = e.clientX - containerRect.left;
    let y = e.clientY - containerRect.top + 20;

    // Ajuste para não sair da tela
    if (x + tooltipRect.width > window.innerWidth) {
      x = window.innerWidth - containerRect.left - tooltipRect.width - 8;
    }
    if (x < 0) x = 8;
    if (y + tooltipRect.height > window.innerHeight) {
      y = window.innerHeight - containerRect.top - tooltipRect.height - 8;
    }
    if (y < 0) y = 8;
    tooltipRef.current.style.left = `${x}px`;
    tooltipRef.current.style.top = `${y}px`;
  };

  const handleMouseEnter = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = "1";
    }
  };

  const handleMouseLeave = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = "0";
      tooltipRef.current.style.left = `0px`;
      tooltipRef.current.style.top = `0px`;
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ display: "inline-block", position: "relative" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {children}
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.2s",
          background: "rgba(30,30,30,0.95)",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: 6,
          fontSize: 14,
          zIndex: 1000,
          whiteSpace: "nowrap",
        }}
      >
        {content}
      </div>
    </div>
  );
}; 
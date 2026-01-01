import React, { ReactNode, useState, useEffect, useRef } from 'react';

interface InfoTooltipProps {
  content: ReactNode;
  className?: string;
}

export function InfoTooltip({ content, className = '' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div className="group relative" ref={containerRef}>
      <svg
        className="w-4 h-4 text-secondary-400 cursor-help"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        onClick={handleClick}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className={`absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md transition-opacity duration-200 pointer-events-none z-10 ${isVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${className}`}>
        {content}
        <div className="absolute top-full left-3 -mt-1">
          <div className="border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </div>
  );
}

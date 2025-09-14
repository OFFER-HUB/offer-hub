'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  value?: number;
  onChange?: (value: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  value,
  onChange,
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const sizeClass = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  const displayRating = interactive ? (hoveredRating ?? value ?? 0) : rating;
  const isInteractiveMode = interactive && onChange;

  const handleMouseEnter = (starIndex: number) => {
    if (isInteractiveMode) {
      setHoveredRating(starIndex + 1);
    }
  };

  const handleMouseLeave = () => {
    if (isInteractiveMode) {
      setHoveredRating(null);
    }
  };

  const handleClick = (starIndex: number) => {
    if (isInteractiveMode) {
      onChange(starIndex + 1);
    }
  };

  return (
    <div className={`flex ${isInteractiveMode ? 'cursor-pointer' : ''}`}>
      {Array(maxRating)
        .fill(0)
        .map((_, i) => (
          <Star
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={i}
            className={`${sizeClass} ${
              i < displayRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            } ${isInteractiveMode ? 'hover:text-yellow-300 transition-colors' : ''}`}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(i)}
          />
        ))}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Input, Select, Button, Subheading } from '@/components/ui';

export interface FilterOptions {
  startDate: string | null;
  endDate: string | null;
  category: 'all' | 'major' | 'minor' | 'memory';
  privacy_level: 'all' | 'public' | 'friends' | 'private';
}

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export function FilterDropdown({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters
}: FilterDropdownProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Reset filters to current when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      startDate: null,
      endDate: null,
      category: 'all',
      privacy_level: 'all',
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="bg-white rounded-md shadow-lg z-20 border border-secondary-200 fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-20 md:top-auto mt-0 md:mt-2 w-auto md:w-80"
    >
      <div className="p-4">
        <Subheading className="mb-4">Filter Timeline</Subheading>

        {/* Date Range */}
        <div className="mb-4">
          <Input
            type="date"
            label="Events After"
            value={filters.startDate || ''}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value || null })}
          />
        </div>

        <div className="mb-4">
          <Input
            type="date"
            label="Events Before"
            value={filters.endDate || ''}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value || null })}
          />
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <Select
            label="Event Category"
            value={filters.category}
            onChange={(e) => setFilters({
              ...filters,
              category: e.target.value as 'all' | 'major' | 'minor' | 'memory'
            })}
          >
            <option value="all">All Categories</option>
            <option value="major">Major Events</option>
            <option value="minor">Minor Events</option>
            <option value="memory">Memories</option>
          </Select>
        </div>

        {/* Privacy Level Filter */}
        <div className="mb-4">
          <Select
            label="Privacy Level"
            value={filters.privacy_level}
            onChange={(e) => setFilters({
              ...filters,
              privacy_level: e.target.value as 'all' | 'public' | 'friends' | 'private'
            })}
          >
            <option value="all">All Privacy Levels</option>
            <option value="public">Public</option>
            <option value="friends">Friends</option>
            <option value="private">Private</option>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="secondary"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

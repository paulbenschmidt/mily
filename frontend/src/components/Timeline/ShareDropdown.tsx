'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Subheading, SmallText } from '@/components/ui';

interface ShareDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isPublic: boolean;
  onTogglePublic: (isPublic: boolean) => void;
  isUpdating?: boolean;
  userHandle?: string;
}

export function ShareDropdown({
  isOpen,
  onClose,
  isPublic,
  onTogglePublic,
  isUpdating = false,
  userHandle,
}: ShareDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localIsPublic, setLocalIsPublic] = useState(isPublic);
  const [copied, setCopied] = useState(false);

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

  // Sync local state with prop when it changes
  useEffect(() => {
    setLocalIsPublic(isPublic);
  }, [isPublic]);

  const handleToggle = () => {
    const newValue = !localIsPublic;
    setLocalIsPublic(newValue);
    onTogglePublic(newValue);
  };

  const handleCopyLink = async () => {
    if (!userHandle) return;
    const link = `https://mily.bio/timeline/${userHandle}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="bg-white rounded-md shadow-lg z-20 border border-secondary-200 fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-20 md:top-auto mt-0 md:mt-2 w-auto md:w-80"
    >
      <div className="p-4">
        <Subheading className="mb-3">Share Timeline</Subheading>

        {/* Copyable Link */}
        {userHandle && (
            <div className="mt-3">
            <label className="block text-xs font-medium text-secondary-700 mb-1">
                Share Link
            </label>
            <div className="flex gap-2">
                <input
                type="text"
                readOnly
                value={`https://mily.bio/timeline/${userHandle}`}
                className="flex-1 px-3 py-2 text-xs border border-secondary-300 rounded-md bg-secondary-50 text-secondary-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                onClick={(e) => e.currentTarget.select()}
                />
                <button
                onClick={handleCopyLink}
                className="px-3 py-2 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                {copied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                )}
                </button>
            </div>
            </div>
        )}

        {/* Share with Friends */}
        <div className="mt-3 mb-3 p-3 border border-secondary-200 rounded-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-secondary-900 text-sm mb-1">Share with Friends</p>
            </div>
            <Link
              href="/app/sharing"
              className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 whitespace-nowrap"
            >
              Manage
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-md">
          <div>
            <p className="font-medium text-secondary-900 text-sm">Make Timeline Public</p>
            <p className="text-xs text-secondary-600 mt-0.5">
              {localIsPublic ? 'Anyone can view' : 'Only invited friends can view'}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              localIsPublic ? 'bg-primary-600' : 'bg-secondary-300'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            role="switch"
            aria-checked={localIsPublic}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localIsPublic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {localIsPublic && (
          <>
            {/* Note */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Individual event privacy settings still apply. Only events marked as "Public" will be visible to others.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

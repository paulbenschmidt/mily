'use client';

import { useState, useEffect } from 'react';
import { Button, Input, PageHeading, SmallText } from '@/components/ui';
import { ShareTimelineModal, RemoveShareModal } from '@/components/Shares';
import { authApiClient } from '@/utils/auth-api';

interface Share {
  id: string;
  shared_with_email: string;
  invitation_sent_at: string;
}

export default function SharingPage() {
  const [shares, setShares] = useState<Share[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareTimelineModalOpen, setIsShareTimelineModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareToRemove, setShareToRemove] = useState<Share | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Fetch shares on mount
  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await authApiClient.getShares();
      // Handle paginated response - extract results array
      if (data && typeof data === 'object' && 'results' in data) {
        setShares(Array.isArray(data.results) ? data.results : []);
      } else if (Array.isArray(data)) {
        setShares(data);
      } else {
        setShares([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shares');
      console.error('Error fetching shares:', err);
      setShares([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareTimeline = () => {
    setIsShareTimelineModalOpen(true);
  };

  const handleInviteSent = () => {
    // Show success message and refresh shares list
    setShowSuccessMessage(true);
    fetchShares();
  };

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const handleRemoveClick = (share: Share) => {
    setShareToRemove(share);
  };

  const handleConfirmRemove = async () => {
    if (!shareToRemove) return;

    try {
      setIsRemoving(true);
      await authApiClient.deleteShare(shareToRemove.id);
      // Remove from local state
      setShares(shares.filter(s => s.id !== shareToRemove.id));
      setShareToRemove(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove share');
      console.error('Error removing share:', err);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCancelRemove = () => {
    setShareToRemove(null);
  };

  const filteredShares = shares.filter(share => {
    const email = share.shared_with_email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return email.includes(query);
  });

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <PageHeading className="mb-2">Shared With</PageHeading>

          {/* Search and Share Timeline - only show if there are shares */}
          {shares.length > 0 && (
            <div className="flex gap-3 mt-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleShareTimeline}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Share Timeline
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-secondary-600">Loading shares...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">{error}</p>
            <Button onClick={fetchShares} variant="text" size="sm" className="mt-2">
              Try Again
            </Button>
          </div>
        ) : shares.length > 0 ? (
          /* Shares List */
          <div className="space-y-4">
            {filteredShares.length > 0 ? (
              filteredShares.map((share) => (
                <div
                  key={share.id}
                  className="bg-white rounded-lg border border-secondary-200 p-4 flex items-center justify-between hover:border-secondary-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                      {getInitials(share.shared_with_email)}
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-semibold text-secondary-900">
                        {share.shared_with_email}
                      </h3>
                      <p className="text-xs text-secondary-500">
                        Shared on {formatDate(share.invitation_sent_at)}
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveClick(share)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-secondary-600">No shares match your search.</p>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-lg border border-secondary-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">No one yet</h3>
              <p className="text-secondary-600 mb-6">
                Share your timeline with friends and family
              </p>
              <Button onClick={handleShareTimeline}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Share Timeline
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Share Timeline Modal */}
      <ShareTimelineModal
        isOpen={isShareTimelineModalOpen}
        onClose={() => setIsShareTimelineModalOpen(false)}
        onInviteSent={handleInviteSent}
      />

      {/* Remove Share Modal */}
      <RemoveShareModal
        isOpen={shareToRemove !== null}
        onClose={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        email={shareToRemove?.shared_with_email || ''}
        isRemoving={isRemoving}
      />

      {/* Success message */}
      {showSuccessMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <SmallText className="text-white">
            Invitation sent successfully!
          </SmallText>
        </div>
      )}
    </div>
  );
}

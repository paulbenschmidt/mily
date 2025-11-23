'use client';

import { useState, useEffect } from 'react';
import { Button, Input, PageHeading, SmallText } from '@/components/ui';
import { ShareTimelineModal, RemoveShareModal } from '@/components/Shares';
import { authApiClient } from '@/utils/auth-api';

interface Share {
  id: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    handle: string;
    profile_picture: string;
  };
  shared_with_email: string;
  shared_with_user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    handle: string;
    profile_picture: string;
  } | null;
  is_accepted: boolean;
  accepted_at: string | null;
  invitation_sent_at: string;
}

interface SharedWithMe {
  id: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    handle: string;
  };
  shared_with_email: string;
  shared_with_user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    handle: string;
    profile_picture: string;
  } | null;
  is_accepted: boolean;
  accepted_at: string | null;
  invitation_sent_at: string;
}

type TabType = 'shared-by-you' | 'shared-with-you';

export default function SharingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('shared-by-you');
  const [sharedByYou, setSharedByYou] = useState<Share[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<SharedWithMe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareTimelineModalOpen, setIsShareTimelineModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareToRemove, setShareToRemove] = useState<Share | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [processingShareId, setProcessingShareId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [isUpdatingPublic, setIsUpdatingPublic] = useState(false);

  // Fetch shares and public status on mount
  useEffect(() => {
    fetchSharedByYou();
    fetchSharedWithMe();
    fetchPublicStatus();
  }, []);

  const fetchPublicStatus = async () => {
    try {
      const user = await authApiClient.getCurrentUser();
      setIsPublic(user.is_public || false);
    } catch (err) {
      console.error('Failed to fetch public status');
    }
  };

  const fetchSharedByYou = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await authApiClient.getSharedByYou();
      if (data && typeof data === 'object' && 'results' in data) {
        setSharedByYou(Array.isArray(data.results) ? data.results : []);
      } else {
        setSharedByYou([]);
      }
    } catch (err) {
      setError('Failed to load shares');
      setSharedByYou([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSharedWithMe = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await authApiClient.getSharedWithMe();
      // Backend returns array directly, not paginated
      if (Array.isArray(data)) {
        setSharedWithMe(data);
      } else {
        setSharedWithMe([]);
      }
    } catch (err) {
      setError('Failed to load shared timelines');
      setSharedWithMe([]);
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
    fetchSharedByYou();
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
      setSharedByYou(sharedByYou.filter(s => s.id !== shareToRemove.id));
      setShareToRemove(null);
    } catch (err) {
      alert('Failed to remove share');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCancelRemove = () => {
    setShareToRemove(null);
  };

  const handleAcceptInvitation = async (share: SharedWithMe) => {
    try {
      setProcessingShareId(share.id);
      await authApiClient.acceptShareInvitation(share.id);
      // Update local state
      setSharedWithMe(sharedWithMe.map(s =>
        s.id === share.id ? { ...s, is_accepted: true } : s
      ));
    } catch (err) {
      alert('Failed to accept invitation');
    } finally {
      setProcessingShareId(null);
    }
  };

  const handleRejectInvitation = async (share: SharedWithMe) => {
    try {
      setProcessingShareId(share.id);
      await authApiClient.rejectShareInvitation(share.id);
      // Remove from local state
      setSharedWithMe(sharedWithMe.filter(s => s.id !== share.id));
    } catch (err) {
      alert('Failed to reject invitation');
    } finally {
      setProcessingShareId(null);
    }
  };

  const handleTogglePublic = async (newIsPublic: boolean) => {
    try {
      setIsUpdatingPublic(true);
      await authApiClient.updateUser({ is_public: newIsPublic });
      setIsPublic(newIsPublic);
    } catch (err) {
      console.error('Failed to update public status:', err);
      alert('Failed to update timeline visibility');
      // Revert on error
      setIsPublic(!newIsPublic);
    } finally {
      setIsUpdatingPublic(false);
    }
  };

  const filteredSharedByYou = sharedByYou.filter(share => {
    const email = share.shared_with_email.toLowerCase();
    const query = searchQuery.toLowerCase();

    // If accepted and user exists, also search by name
    if (share.is_accepted && share.shared_with_user) {
      const name = `${share.shared_with_user.first_name} ${share.shared_with_user.last_name}`.toLowerCase();
      return email.includes(query) || name.includes(query);
    }

    return email.includes(query);
  });

  const filteredSharedWithMe = sharedWithMe.filter(share => {
    const name = `${share.user.first_name} ${share.user.last_name}`.toLowerCase();
    const email = share.user.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const getInitials = (text: string) => {
    // If it's an email, just return first letter
    if (text.includes('@')) {
      return text.charAt(0).toUpperCase();
    }

    // Otherwise, assume it's a name and get first letter of each word
    const words = text.trim().split(/\s+/);
    if (words.length >= 2) {
      // First and last name
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
    // Single word, return first letter
    return text.charAt(0).toUpperCase();
  };

  const getDisplayName = (user: SharedWithMe['user'] | Share['shared_with_user']) => {
    if (!user) return '';
    const fullName = `${user.first_name} ${user.last_name}`.trim();
    return fullName || user.email;
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
          <PageHeading className="mb-2">Timeline Sharing</PageHeading>

          {/* Public Toggle */}
          <div className="bg-white rounded-lg border border-secondary-200 p-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary-900 text-sm">Make Timeline Public</p>
                <p className="text-xs text-secondary-600 mt-0.5">
                  {isPublic ? 'Anyone can view' : 'Only invited friends can view'}
                </p>
              </div>
              <button
                onClick={() => handleTogglePublic(!isPublic)}
                disabled={isUpdatingPublic}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  isPublic ? 'bg-primary-600' : 'bg-secondary-300'
                } ${isUpdatingPublic ? 'opacity-50 cursor-not-allowed' : ''}`}
                role="switch"
                aria-checked={isPublic}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 mb-4 border-b border-secondary-200">
            <button
              onClick={() => setActiveTab('shared-by-you')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === 'shared-by-you'
                  ? 'text-primary-600'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Shared by You
              {activeTab === 'shared-by-you' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('shared-with-you')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === 'shared-with-you'
                  ? 'text-primary-600'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Shared with You
              {activeTab === 'shared-with-you' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
          </div>

          {/* Search and Share Timeline - only show if there are shares */}
          {((activeTab === 'shared-by-you' && sharedByYou.length > 0) || (activeTab === 'shared-with-you' && sharedWithMe.length > 0)) && (
            <div className="flex gap-3 mt-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={activeTab === 'shared-by-you' ? 'Search by email...' : 'Search by name or email...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {activeTab === 'shared-by-you' && (
                <Button onClick={handleShareTimeline}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Share Timeline
                </Button>
              )}
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
            <Button onClick={fetchSharedByYou} variant="text" size="sm" className="mt-2">
              Try Again
            </Button>
          </div>
        ) : activeTab === 'shared-by-you' && sharedByYou.length > 0 ? (
          /* Shares List */
          <div className="space-y-4">
            {filteredSharedByYou.length > 0 ? (
              filteredSharedByYou.map((share) => (
                <div
                  key={share.id}
                  className="bg-white rounded-lg border border-secondary-200 p-4 flex items-center justify-between gap-4 hover:border-secondary-300 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {share.is_accepted && share.shared_with_user
                          ? getInitials(getDisplayName(share.shared_with_user))
                          : getInitials(share.shared_with_email)}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-secondary-900 truncate">
                        {share.is_accepted && share.shared_with_user
                          ? getDisplayName(share.shared_with_user)
                          : share.shared_with_email}
                      </h3>
                      <p className="text-xs text-secondary-500">
                        {share.is_accepted && share.shared_with_user ? (
                          <span className="text-green-600">Accepted • {formatDate(share.invitation_sent_at)}</span>
                        ) : (
                          <span>Pending • {formatDate(share.invitation_sent_at)}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveClick(share)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
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
        ) : activeTab === 'shared-with-you' && sharedWithMe.length > 0 ? (
          /* Shared With Me List */
          <div className="space-y-4">
            {filteredSharedWithMe.length > 0 ? (
              filteredSharedWithMe.map((share) => (
                <div
                  key={share.id}
                  className="bg-white rounded-lg border border-secondary-200 p-4 flex items-center justify-between gap-4 hover:border-secondary-300 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Avatar */}
                    {/* TODO: Return profile picture if invite accepted, otherwise use initials */}
                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {getInitials(getDisplayName(share.user))}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-secondary-900 truncate">
                        {getDisplayName(share.user)}
                      </h3>
                      <p className="text-xs text-secondary-500">
                        Shared on {formatDate(share.invitation_sent_at)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {share.is_accepted ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = `/timeline/${share.user.handle}`}
                      className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 flex-shrink-0"
                    >
                      View
                    </Button>
                  ) : (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRejectInvitation(share)}
                        disabled={processingShareId === share.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAcceptInvitation(share)}
                        disabled={processingShareId === share.id}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 font-semibold"
                      >
                        {processingShareId === share.id ? 'Processing...' : 'Accept'}
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-secondary-600">No shared timelines match your search.</p>
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
              {activeTab === 'shared-by-you' ? (
                <>
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
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">No timelines yet</h3>
                  <p className="text-secondary-600">
                    When friends share their timelines with you, they&apos;ll appear here
                  </p>
                </>
              )}
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

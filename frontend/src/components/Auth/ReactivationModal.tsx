'use client';

import React, { useState } from 'react';

interface ReactivationModalProps {
  userName: string;
  onReactivate: () => Promise<void>;
  onCancel: () => void;
}

export const ReactivationModal: React.FC<ReactivationModalProps> = ({
  userName,
  onReactivate,
  onCancel,
}) => {
  const [isReactivating, setIsReactivating] = useState(false);

  const handleReactivate = async () => {
    setIsReactivating(true);
    try {
      await onReactivate();
    } catch (error) {
      console.error('Reactivation failed:', error);
      setIsReactivating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Account Deactivated
        </h2>

        <p className="text-gray-700 mb-6">
          Hi {userName}, your account has been deactivated and is being processed for removal.
          Would you like to reactivate it?
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isReactivating}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            No, keep it deactivated
          </button>

          <button
            onClick={handleReactivate}
            disabled={isReactivating}
            className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isReactivating ? 'Reactivating...' : 'Yes, reactivate my account'}
          </button>
        </div>
      </div>
    </div>
  );
};

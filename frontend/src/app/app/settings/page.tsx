'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApiClient } from '@/utils/auth-api';
import { PageHeading, SectionHeading, BodyText, Caption, Button, Alert } from '@/components/ui';

export default function SettingsPage() {
  const { user, logout, checkAuth } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Account info edit state
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [handle, setHandle] = useState(user?.handle || '');
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState(false);
  const [accountError, setAccountError] = useState('');

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleExportEvents = async () => {
    setIsExporting(true);
    setError('');
    setExportSuccess(false);

    try {
      const events = await authApiClient.getEvents();

      // Convert events to CSV format
      const headers = ['Date', 'Title', 'Category', 'Description', 'Notes', 'Privacy'];
      const csvRows = [
        headers.join(','),
        ...events.map(event => [
          event.event_date,
          `"${event.title.replace(/"/g, '""')}"`,
          event.category,
          `"${(event.description || '').replace(/"/g, '""')}"`,
          `"${(event.notes || '').replace(/"/g, '""')}"`,
          event.privacy_level
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `mily_timeline_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      setError('Failed to export events. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await authApiClient.changePassword(currentPassword, newPassword);

      // Success - clear form and show success message
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      setPasswordSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveAccountInfo = async () => {
    setAccountError('');
    setAccountSuccess(false);

    // Validation
    if (!firstName.trim() || !lastName.trim() || !handle.trim()) {
      setAccountError('All fields are required.');
      return;
    }

    // Handle validation - alphanumeric and underscores only, 3-30 characters
    const handleRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!handleRegex.test(handle)) {
      setAccountError('Handle must be 3-30 characters and contain only letters, numbers, and underscores.');
      return;
    }

    setIsSavingAccount(true);

    try {
      await authApiClient.updateUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        handle: handle.trim(),
      });

      // Success - refresh user data from backend
      await checkAuth();

      // Exit edit mode and show success message
      setIsEditingAccount(false);
      setAccountSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => setAccountSuccess(false), 5000);
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Failed to update account information. Please try again.');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion.');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      // Call delete account API endpoint
      await authApiClient.deleteAccount();

      // Logout and redirect to home
      await logout();
      window.location.href = '/';
    } catch (err) {
      setError('Failed to delete account. Please try again or contact support.');
      setIsDeleting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <PageHeading className="mb-8">Settings</PageHeading>

        {/* Account Information */}
        <section className="bg-white rounded-lg border border-secondary-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <SectionHeading>Account Information</SectionHeading>
            {!isEditingAccount && (
              <Button
                onClick={() => {
                  setIsEditingAccount(true);
                  setFirstName(user.first_name);
                  setLastName(user.last_name);
                  setHandle(user.handle);
                }}
                variant="secondary"
                size="sm"
              >
                Edit
              </Button>
            )}
          </div>

          {accountSuccess && (
            <Alert variant="success" className="mb-4">
              Account information updated successfully!
            </Alert>
          )}

          {!isEditingAccount ? (
            <div className="space-y-3">
              <div>
                <BodyText className="text-secondary-600 text-sm">Email</BodyText>
                <BodyText className="font-medium">{user.email}</BodyText>
              </div>
              <div>
                <BodyText className="text-secondary-600 text-sm">Name</BodyText>
                <BodyText className="font-medium">{user.first_name} {user.last_name}</BodyText>
              </div>
              <div>
                <BodyText className="text-secondary-600 text-sm">Handle</BodyText>
                <BodyText className="font-medium">@{user.handle}</BodyText>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <BodyText className="text-secondary-600 text-sm mb-1">Email</BodyText>
                <BodyText className="font-medium text-secondary-400">{user.email}</BodyText>
              </div>

              <div>
                <label htmlFor="first-name" className="block mb-2">
                  <BodyText className="font-medium">First Name</BodyText>
                </label>
                <input
                  id="first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label htmlFor="last-name" className="block mb-2">
                  <BodyText className="font-medium">Last Name</BodyText>
                </label>
                <input
                  id="last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label htmlFor="handle" className="block mb-2">
                  <BodyText className="font-medium">Handle</BodyText>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-secondary-600">@</span>
                  <input
                    id="handle"
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="Enter handle"
                  />
                </div>
                <Caption className="text-secondary-500 text-xs mt-1">
                  3-30 characters, letters, numbers, and underscores only
                </Caption>
              </div>

              {accountError && (
                <Alert variant="error">{accountError}</Alert>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSaveAccountInfo}
                  disabled={isSavingAccount}
                  variant="primary"
                  size="md"
                >
                  {isSavingAccount ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingAccount(false);
                    setFirstName(user.first_name);
                    setLastName(user.last_name);
                    setHandle(user.handle);
                    setAccountError('');
                  }}
                  variant="secondary"
                  size="md"
                  disabled={isSavingAccount}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Password Change */}
        <section className="bg-white rounded-lg border border-secondary-200 p-6 mb-6">
          <SectionHeading className="mb-2">Password</SectionHeading>
          <BodyText className="text-secondary-600 mb-4">
            Change your account password. You&apos;ll receive an email confirmation after updating.
          </BodyText>

          {passwordSuccess && (
            <Alert variant="success" className="mb-4">
              Password changed successfully! A confirmation email has been sent to {user.email}.
            </Alert>
          )}

          {!showPasswordChange ? (
            <div className="flex items-center gap-4">
              <BodyText className="font-medium">Password: •••••••••</BodyText>
              <Button
                onClick={() => setShowPasswordChange(true)}
                variant="secondary"
                size="sm"
              >
                Change Password
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block mb-2">
                  <BodyText className="font-medium">Current Password</BodyText>
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block mb-2">
                  <BodyText className="font-medium">New Password</BodyText>
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block mb-2">
                  <BodyText className="font-medium">Confirm New Password</BodyText>
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && (
                <Alert variant="error">{passwordError}</Alert>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  variant="primary"
                  size="md"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </Button>
                <Button
                  onClick={() => {
                    setShowPasswordChange(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  variant="secondary"
                  size="md"
                  disabled={isChangingPassword}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Data Export */}
        <section className="bg-white rounded-lg border border-secondary-200 p-6 mb-6">
          <SectionHeading className="mb-2">Export Your Data</SectionHeading>
          <BodyText className="text-secondary-600 mb-4">
            Download all your timeline events as a CSV file. This includes event dates, titles, notes, and other details.
          </BodyText>
          {exportSuccess && (
            <Alert variant="success" className="mb-4">
              Your timeline has been exported successfully!
            </Alert>
          )}
          <Button
            onClick={handleExportEvents}
            disabled={isExporting}
            variant="secondary"
            size="md"
          >
            {isExporting ? 'Exporting...' : 'Export Timeline as CSV'}
          </Button>
        </section>

        {/* Privacy Settings */}
        <section className="bg-white rounded-lg border border-secondary-200 p-6 mb-6">
          <SectionHeading className="mb-2">Privacy</SectionHeading>
          <BodyText className="text-secondary-600 mb-4">
            Your timeline is private by default. You can control visibility for individual events and share your timeline with specific people.
          </BodyText>
          <BodyText className="text-secondary-600">
            Manage event privacy settings from your timeline by editing individual events.
          </BodyText>
        </section>

        {/* Notifications */}
        {/* <section className="bg-white rounded-lg border border-secondary-200 p-6 mb-6">
          <SectionHeading className="mb-2">Notifications</SectionHeading>
          <BodyText className="text-secondary-600 mb-4">
            Email notifications for timeline activity and reminders.
          </BodyText>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="mr-3 h-4 w-4 rounded border-secondary-300 text-brand focus:ring-brand"
              />
              <BodyText>Email me when someone views my shared timeline</BodyText>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="mr-3 h-4 w-4 rounded border-secondary-300 text-brand focus:ring-brand"
              />
              <BodyText>Send me monthly reflection reminders</BodyText>
            </label>
          </div>
        </section> */}

        {/* Delete Account */}
        <section className="bg-white rounded-lg border-3 border-danger-400 p-6">
          <SectionHeading className="mb-2 text-danger-600">Delete Account</SectionHeading>
          <BodyText className="text-secondary-600 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </BodyText>

          {!showDeleteConfirm ? (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="secondary"
              size="md"
              className="bg-danger-600 hover:bg-danger-700 text-secondary-600 border-danger-600"
            >
              Delete My Account
            </Button>
          ) : (
            <div className="space-y-4">
              <Alert variant="error">
                <strong>Warning:</strong> This will permanently delete your account, timeline, and all events. This action cannot be undone.
              </Alert>
              <div>
                <BodyText className="mb-2">
                  Type <strong>DELETE</strong> to confirm:
                </BodyText>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Type DELETE"
                />
              </div>
              {error && (
                <Alert variant="error">{error}</Alert>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                  variant="secondary"
                  size="md"
                  className="bg-danger-600 hover:bg-danger-700 text-secondary-700 border-danger-600 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete Account'}
                </Button>
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                    setError('');
                  }}
                  variant="secondary"
                  size="md"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

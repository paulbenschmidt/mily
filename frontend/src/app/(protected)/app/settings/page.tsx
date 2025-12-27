'use client';

import { useState, useRef } from 'react';
import NextImage from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { authApiClient } from '@/utils/auth-api';
import { PageHeading, SectionHeading, BodyText, Caption, Button, Alert, Input } from '@/components/ui';

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

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setPasswordError('Failed to change password. Please try again.');
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
      setAccountError('Failed to update account information. Please try again.');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const resizeImage = (file: File, maxSize: number = 256): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');

          // Make canvas square
          canvas.width = maxSize;
          canvas.height = maxSize;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate dimensions to crop to square (center crop)
          const size = Math.min(img.width, img.height);
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;

          // Draw cropped square image scaled to canvas size
          ctx.drawImage(
            img,
            x, y, size, size,  // Source rectangle (crop to square)
            0, 0, maxSize, maxSize  // Destination rectangle (scale to canvas)
          );

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            },
            file.type,
            0.9
          );
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');
    setAvatarSuccess(false);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (10MB - generous limit before client-side resize)
    if (file.size > 10 * 1024 * 1024) {
      setAvatarError('Image must be under 10MB.');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Resize image to 256x256
      const resizedFile = await resizeImage(file, 256);

      // Upload to S3 and update user record
      await authApiClient.uploadAvatar(resizedFile);

      // Refresh user data to get new avatar URL
      await checkAuth();

      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 5000);
    } catch (err) {
      setAvatarError('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

        {/* Avatar Section */}
        <section className="bg-white rounded-lg border border-secondary-200 p-6 mb-6">
          <SectionHeading className="mb-4">Profile Picture</SectionHeading>

          {avatarSuccess && (
            <Alert variant="success" className="mb-4">
              Avatar updated successfully!
            </Alert>
          )}

          {avatarError && (
            <Alert variant="error" className="mb-4">
              {avatarError}
            </Alert>
          )}

          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-secondary-100 flex-shrink-0">
              {user.avatar_url ? (
                <NextImage
                  src={user.avatar_url}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover rounded-full border border-secondary-300"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-secondary-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                size="sm"
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
              </Button>
            </div>
          </div>
        </section>

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

              <Input
                id="first-name"
                label="First Name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />

              <Input
                id="last-name"
                label="Last Name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />

              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label htmlFor="handle" className="block text-sm font-medium text-secondary-700">
                    Handle
                  </label>
                  <div className="group relative">
                    <svg className="w-4 h-4 text-secondary-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-secondary-900 text-white text-xs rounded shadow-lg z-20">
                      Your handle defines your timeline&apos;s unique URL when sharing (e.g., {process.env.NEXT_PUBLIC_FRONTEND_URL}/timeline/{handle})
                    </div>
                  </div>
                </div>
                <Input
                  id="handle"
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="yourhandle"
                />
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

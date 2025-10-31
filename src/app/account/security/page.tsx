"use client";
import * as React from 'react';
import { useToast } from '../../../lib/context';
import AccountLayout from '../../../components/account/AccountLayout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useForm } from '../../../lib/hooks';
import { validators, formatters } from '../../../lib/utils';
import { authApi, SecuritySession } from '../../../lib/api';

interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SecurityPage(): React.JSX.Element {
  const { addToast } = useToast();
  const [sessions, setSessions] = React.useState<SecuritySession[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSecurityData = async () => {
      setLoading(true);
      try {
        const fetchedSessions = await authApi.getSessions();
        setSessions(fetchedSessions);
      } catch (error) {
        console.error('Error fetching security data:', error);
        addToast({
          type: 'error',
          title: 'Failed to load sessions',
          message: 'Could not fetch your active sessions. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityData();
  }, [addToast]);

  const initialPasswordData: PasswordChangeFormData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const validatePasswordForm = (values: PasswordChangeFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Current password validation
    const currentPasswordError = validators.required(values['currentPassword'], 'currentPassword');
    if (currentPasswordError) errors['currentPassword'] = currentPasswordError.message;

    // New password validation
    const newPasswordRequiredError = validators.required(values['newPassword'], 'newPassword');
    if (newPasswordRequiredError) {
      errors['newPassword'] = newPasswordRequiredError.message;
    } else {
      const passwordError = validators.password(values['newPassword']);
      if (passwordError) errors['newPassword'] = passwordError.message;
    }

    // Confirm password validation
    const confirmPasswordError = validators.required(values['confirmPassword'], 'confirmPassword');
    if (confirmPasswordError) {
      errors['confirmPassword'] = confirmPasswordError.message;
    } else if (values['newPassword'] !== values['confirmPassword']) {
      errors['confirmPassword'] = 'Passwords do not match';
    }

    // Check if new password is different from current
    if (values['currentPassword'] && values['newPassword'] && values['currentPassword'] === values['newPassword']) {
      errors['newPassword'] = 'New password must be different from current password';
    }

    return errors;
  };

  const handlePasswordSubmit = async (values: PasswordChangeFormData) => {
    try {
      // TODO: Implement actual password change API call
      console.log('Changing password:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form on success
      passwordForm.resetForm();
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Password change error:', error);
    }
  };

  const passwordForm = useForm<PasswordChangeFormData>({
    initialValues: initialPasswordData,
    validate: validatePasswordForm,
    onSubmit: handlePasswordSubmit,
    validateOnBlur: true,
  });

  const handleTerminateSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to terminate this session?')) {
      try {
        await authApi.terminateSession(sessionId);
        setSessions(prev => prev.filter(session => session._id !== sessionId));
        addToast({
          type: 'success',
          title: 'Session terminated',
          message: 'The session has been terminated successfully.'
        });
      } catch (error) {
        console.error('Error terminating session:', error);
        addToast({
          type: 'error',
          title: 'Failed to terminate session',
          message: 'Could not terminate the session. Please try again.'
        });
      }
    }
  };

  const handleTerminateAllSessions = async () => {
    if (window.confirm('This will sign you out of all devices except this one. Continue?')) {
      try {
        const result = await authApi.terminateAllSessions();
        setSessions(prev => prev.filter(session => session.isCurrent));
        addToast({
          type: 'success',
          title: 'Sessions terminated',
          message: `Terminated ${result.deletedCount || 0} session(s) successfully.`
        });
      } catch (error) {
        console.error('Error terminating sessions:', error);
        addToast({
          type: 'error',
          title: 'Failed to terminate sessions',
          message: 'Could not terminate sessions. Please try again.'
        });
      }
    }
  };

  if (loading) {
    return (
      <AccountLayout>
        <SecurityPageSkeleton />
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
          <p className="text-gray-600 mt-1">
            Manage your account security and privacy settings
          </p>
        </div>

        {/* Password Change Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-600 mt-1">
                Update your password to keep your account secure
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShieldIcon className="w-4 h-4" />
              <span>Last changed: {formatters.formatRelativeTime('2024-01-01T00:00:00Z')}</span>
            </div>
          </div>

          <form onSubmit={passwordForm.handleSubmit} className="max-w-md space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password *
              </label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordForm.values.currentPassword}
                onChange={passwordForm.handleChange}
                onBlur={() => passwordForm.handleBlur('currentPassword')}
                error={passwordForm.touched['currentPassword'] && passwordForm.errors['currentPassword'] ? passwordForm.errors['currentPassword'] : ''}
                fullWidth
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password *
              </label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordForm.values.newPassword}
                onChange={passwordForm.handleChange}
                onBlur={() => passwordForm.handleBlur('newPassword')}
                error={passwordForm.touched['newPassword'] && passwordForm.errors['newPassword'] ? passwordForm.errors['newPassword'] : ''}
                helperText="Must be at least 8 characters with uppercase, lowercase, and number"
                fullWidth
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordForm.values.confirmPassword}
                onChange={passwordForm.handleChange}
                onBlur={() => passwordForm.handleBlur('confirmPassword')}
                error={passwordForm.touched['confirmPassword'] && passwordForm.errors['confirmPassword'] ? passwordForm.errors['confirmPassword'] : ''}
                fullWidth
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                loading={passwordForm.isSubmitting}
                disabled={!passwordForm.isValid}
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>

        {/* Active Sessions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage devices that are signed into your account
              </p>
            </div>
            {sessions.filter(s => !s.isCurrent).length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTerminateAllSessions}
              >
                Sign Out All Devices
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active sessions found.</p>
            ) : (
              sessions.map((session) => (
                <div key={session._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <DeviceIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{session.device}</p>
                      {session.isCurrent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Current Session
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{session.browser} • {session.location}</p>
                      <p>IP: {session.ipAddress} • Last active: {formatters.formatRelativeTime(session.lastActive)}</p>
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTerminateSession(session._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Sign Out
                  </Button>
                )}
              </div>
              ))
            )}
          </div>
        </div>

        {/* Account Security Tips */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Security Tips</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Use a unique, strong password that you don't use elsewhere</li>
                <li>• Regularly review your active sessions and sign out unused devices</li>
                <li>• Never share your login credentials with anyone</li>
                <li>• Keep your browser and devices up to date</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-800 mb-4">
                These actions are permanent and cannot be undone.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900">Delete Account</p>
                    <p className="text-sm text-red-700">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="danger" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}

function SecurityPageSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>

      {/* Sections Skeleton */}
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, itemIndex) => (
              <div key={itemIndex} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Icon Components
function ShieldIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function DeviceIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

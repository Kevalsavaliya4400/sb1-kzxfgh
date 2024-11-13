import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { format } from 'date-fns';
import { Mail, Calendar, Shield, Edit2, Check, X } from 'lucide-react';
import { auth } from '../lib/firebase';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';

interface ProfileProps {
  user: User;
}

export function Profile({ user }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [email, setEmail] = useState(user.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');

      if (displayName !== user.displayName) {
        await updateProfile(auth.currentUser!, { displayName });
      }

      if (email !== user.email) {
        await updateEmail(auth.currentUser!, email);
      }

      if (newPassword) {
        await updatePassword(auth.currentUser!, newPassword);
      }

      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
        <div className="px-6 py-8">
          <div className="flex flex-col items-center -mt-20 mb-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">
                    {(user.email?.[0] || '?').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {isEditing ? (
              <div className="mt-4 w-full max-w-xs">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field text-center"
                  placeholder="Display Name"
                />
              </div>
            ) : (
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                {user.displayName || 'User'}
              </h2>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-green-700 text-center">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-5 h-5" />
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field flex-1"
                />
              ) : (
                <span>{user.email}</span>
              )}
            </div>
            {isEditing && (
              <div className="flex items-center gap-3 text-gray-600">
                <Shield className="w-5 h-5" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field flex-1"
                  placeholder="New Password (optional)"
                />
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>
                Joined {format(new Date(user.metadata.creationTime || ''), 'MMMM yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Shield className="w-5 h-5" />
              <span>Email {user.emailVerified ? 'verified' : 'not verified'}</span>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="btn-success"
                >
                  <Check size={20} />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(user.displayName || '');
                    setEmail(user.email || '');
                    setNewPassword('');
                  }}
                  className="btn-primary"
                >
                  <X size={20} />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                <Edit2 size={20} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
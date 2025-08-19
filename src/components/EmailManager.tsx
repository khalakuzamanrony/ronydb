import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, Shield, Mail, Lock } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import CryptoJS from 'crypto-js';
import { encryptUserData, decryptUserData } from '../utils/encryption';

interface AllowedEmail {
  id: string;
  email: string;
  password_hash: string;
  name?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface EmailManagerProps {
  className?: string;
}

const EmailManager: React.FC<EmailManagerProps> = ({ className = '' }) => {
  const [emails, setEmails] = useState<AllowedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [showFormPasswords, setShowFormPasswords] = useState<{ [key: string]: boolean }>({});

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user'
  });

  // Load allowed emails
  const loadEmails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('allowed_emails')
        .select('id, email, name, role, created_at, updated_at, password_hash')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Decrypt the data and sanitize for display
      const decryptedData = (data || []).map(email => {
        const decrypted = decryptUserData(email);
        return {
          ...decrypted,
          password_hash: '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'
        };
      });
      setEmails(decryptedData);
    } catch (err: any) {
      setError(`Failed to load emails: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add new email
  const addEmail = async () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      const hashedPassword = CryptoJS.SHA256(formData.password).toString();
      
      // Prepare user data for encryption
      const userData = {
        email: formData.email.toLowerCase(),
        password_hash: hashedPassword,
        name: formData.name || null,
        role: formData.role
      };
      
      // Encrypt sensitive data before saving to database
      const encryptedData = encryptUserData(userData);
      
      const { error } = await supabase
        .from('allowed_emails')
        .insert([encryptedData]);

      if (error) throw error;
      
      setFormData({ email: '', password: '', name: '', role: 'user' });
      setSuccess('Email added successfully!');
      loadEmails();
    } catch (err: any) {
      setError(`Failed to add email: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update email
  const updateEmail = async (id: string) => {
    if (!formData.email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      
      const updateData: any = {
        email: formData.email.toLowerCase(),
        name: formData.name || null,
        role: formData.role
      };
      
      // Only update password if provided
      if (formData.password) {
        updateData.password_hash = CryptoJS.SHA256(formData.password).toString();
      }
      
      // Encrypt the update data before sending to database
      const encryptedUpdateData = encryptUserData(updateData);
      
      const { error } = await supabase
        .from('allowed_emails')
        .update(encryptedUpdateData)
        .eq('id', id);

      if (error) throw error;
      
      setFormData({ email: '', password: '', name: '', role: 'user' });
      setEditingId(null);
      setSuccess('Email updated successfully!');
      loadEmails();
    } catch (err: any) {
      setError(`Failed to update email: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete email
  const deleteEmail = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('allowed_emails')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSuccess('Email deleted successfully!');
      await loadEmails();
    } catch (err: any) {
      setError(`Failed to delete email: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const startEdit = (email: AllowedEmail) => {
    setEditingId(email.id);
    setFormData({
      email: email.email,
      password: '', // Don't pre-fill password for security
      name: email.name || '',
      role: email.role
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ email: '', password: '', name: '', role: 'user' });
  };

  // Toggle password visibility
  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    loadEmails();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Mail className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-text">Email Management</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Email</span>
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded">
          {success}
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="mt-6 bg-card rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-text mb-4">
            {editingId ? 'Edit Email' : 'Add New Email'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Password {editingId && '(leave empty to keep current)'}
              </label>
              <div className="relative">
                <input
                  type={showFormPasswords[editingId || 'add'] ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
                  required={!editingId}
                />
                <button
                  type="button"
                  onClick={() => setShowFormPasswords(prev => ({
                    ...prev,
                    [editingId || 'add']: !prev[editingId || 'add']
                  }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showFormPasswords[editingId || 'add'] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingId ? () => updateEmail(editingId) : addEmail}
              disabled={loading}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{editingId ? 'Update Email' : 'Add Email'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Email List */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-8">
            <div className="text-muted">Loading emails...</div>
          </div>
        )}
        {emails.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No emails found</div>
        ) : (
          <div className="bg-card rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-row">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Password</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {emails.map((email) => (
                    <tr key={email.id} className="hover:bg-row">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text">{email.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text">{email.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          email.role === 'admin' 
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {email.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs bg-row px-2 py-1 rounded">
                            {showPasswords[email.id] ? email.password_hash : '••••••••••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(email.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPasswords[email.id] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEdit(email)}
                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteEmail(email.id, email.email)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailManager;
